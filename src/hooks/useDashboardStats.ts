import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export interface DashboardStats {
    totalBookings: number;
    pendingQuotations: number;
    activeProperties: number;
    totalConsultants: number;
    topProperties: {
        name: string;
        bookings: number;
        value: number;
    }[];
    monthlyRevenue: { name: string; total: number }[];
    loading: boolean;
    error: string | null;
}

export function useDashboardStats() {
    const [stats, setStats] = useState<DashboardStats>({
        totalBookings: 0,
        pendingQuotations: 0,
        activeProperties: 0,
        totalConsultants: 0,
        topProperties: [],
        monthlyRevenue: [],
        loading: true,
        error: null,
    });

    useEffect(() => {
        async function fetchStats() {
            try {
                // Parallel fetching for counts
                const [
                    { count: bookingsCount, error: bookingsError },
                    { count: quotationsCount, error: quotationsError },
                    { count: propertiesCount, error: propertiesError },
                    { count: consultantsCount, error: consultantsError },
                ] = await Promise.all([
                    supabase.from('booking_vouchers').select('*', { count: 'exact', head: true }),
                    supabase.from('quotation_vouchers').select('*', { count: 'exact', head: true }).eq('booking_status', 'Tentative'),
                    supabase.from('properties').select('*', { count: 'exact', head: true }),
                    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'consultant'),
                ]);

                if (bookingsError) throw bookingsError;
                if (quotationsError) throw quotationsError;
                if (propertiesError) throw propertiesError;
                if (consultantsError) throw consultantsError;

                // Fetch data for Top Properties (limit 100 recent)
                const { data: recentBookings, error: recentBookingsError } = await supabase
                    .from('booking_vouchers')
                    .select('property_name')
                    .order('created_at', { ascending: false })
                    .limit(100);

                if (recentBookingsError) throw recentBookingsError;

                // Fetch data for Monthly Revenue (issued bookings only)
                // We fetch specific columns to minimize data transfer
                const { data: revenueData, error: revenueError } = await supabase
                    .from('booking_vouchers')
                    .select('created_at, quotation_price')
                    .eq('status', 'issued')
                    .not('quotation_price', 'is', null);

                if (revenueError) throw revenueError;

                // Process Top Properties
                const propertyCounts: Record<string, number> = {};
                recentBookings?.forEach((booking) => {
                    const name = booking.property_name;
                    propertyCounts[name] = (propertyCounts[name] || 0) + 1;
                });

                const topProperties = Object.entries(propertyCounts)
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 3)
                    .map(([name, count]) => ({
                        name,
                        bookings: count,
                        value: 0,
                    }));

                // Process Monthly Revenue
                const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                const revenueByMonth = new Array(12).fill(0);

                revenueData?.forEach((booking) => {
                    if (booking.created_at && booking.quotation_price) {
                        const date = new Date(booking.created_at);
                        const monthIndex = date.getMonth(); // 0-11
                        // Check if it's current year? Or just all time aggregated by month?
                        // Usually dashboard shows current year or last 12 months. 
                        // For simplicity let's do all time aggregated by month if not specified, 
                        // OR we can filter for current year. Let's filter for current year to be cleaner.
                        if (date.getFullYear() === new Date().getFullYear()) {
                            revenueByMonth[monthIndex] += Number(booking.quotation_price);
                        }
                    }
                });

                const monthlyRevenue = monthNames.map((name, index) => ({
                    name,
                    total: revenueByMonth[index]
                }));

                setStats({
                    totalBookings: bookingsCount || 0,
                    pendingQuotations: quotationsCount || 0,
                    activeProperties: propertiesCount || 0,
                    totalConsultants: consultantsCount || 0,
                    topProperties,
                    monthlyRevenue,
                    loading: false,
                    error: null,
                });
            } catch (err: any) {
                console.error('Error fetching dashboard stats:', err);
                setStats((prev) => ({ ...prev, loading: false, error: err.message }));
            }
        }

        fetchStats();
    }, []);

    return stats;
}

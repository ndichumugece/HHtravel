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
        value: number; // Placeholder for now as value isn't in schema
    }[];
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

                // Fetch aggregation for top properties
                // Since we don't have a backend aggregation function, we'll fetch basic info to aggregate locally
                // Limit to 100 recent bookings to avoid heavy load
                const { data: recentBookings, error: recentBookingsError } = await supabase
                    .from('booking_vouchers')
                    .select('property_name')
                    .order('created_at', { ascending: false })
                    .limit(100);

                if (recentBookingsError) throw recentBookingsError;

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
                        value: 0, // No value in schema
                    }));

                setStats({
                    totalBookings: bookingsCount || 0,
                    pendingQuotations: quotationsCount || 0,
                    activeProperties: propertiesCount || 0,
                    totalConsultants: consultantsCount || 0,
                    topProperties,
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

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export interface DashboardStats {
    totalBookings: number;
    lastYearBookings: number;
    totalRevenue: number;
    lastYearRevenue: number;
    pendingQuotations: number;
    activeProperties: number;
    totalConsultants: number;
    topProperties: {
        name: string;
        bookings: number;
        value: number;
    }[];
    monthlyRevenue: { name: string; total: number }[];
    monthlyBookings: { name: string; count: number }[];
    leadSourceData: { name: string; value: number }[];
    loading: boolean;
    error: string | null;
}

export function useDashboardStats() {
    const [stats, setStats] = useState<DashboardStats>({
        totalBookings: 0,
        lastYearBookings: 0,
        totalRevenue: 0,
        lastYearRevenue: 0,
        pendingQuotations: 0,
        activeProperties: 0,
        totalConsultants: 0,
        topProperties: [],
        monthlyRevenue: [],
        monthlyBookings: [],
        leadSourceData: [],
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

                // Fetch data for Monthly Analytics (Revenue & Bookings)
                let monthlyRevenue: { name: string; total: number }[] = [];
                let monthlyBookings: { name: string; count: number }[] = [];

                try {
                    const { data: allBookingsData, error: analyticsError } = await supabase
                        .from('booking_vouchers')
                        .select('created_at, quotation_price, status');

                    if (analyticsError) {
                        console.warn('Analytics fetch error:', analyticsError);
                    } else {
                        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                        const revenueByMonth = new Array(12).fill(0);
                        const bookingsByMonth = new Array(12).fill(0);

                        allBookingsData?.forEach((booking) => {
                            if (booking.created_at) {
                                const date = new Date(booking.created_at);
                                const monthIndex = date.getMonth(); // 0-11
                                if (date.getFullYear() === new Date().getFullYear()) {
                                    // Count bookings
                                    bookingsByMonth[monthIndex]++;

                                    // Calc Revenue (only issued)
                                    if (booking.status === 'issued' && booking.quotation_price) {
                                        const priceStr = String(booking.quotation_price).replace(/[^0-9.]/g, '');
                                        const price = parseFloat(priceStr) || 0;
                                        revenueByMonth[monthIndex] += price;
                                    }
                                }
                            }
                        });

                        monthlyRevenue = monthNames.map((name, index) => ({
                            name,
                            total: revenueByMonth[index]
                        }));

                        monthlyBookings = monthNames.map((name, index) => ({
                            name,
                            count: bookingsByMonth[index]
                        }));
                    }
                } catch (e) {
                    console.warn('Failed to process analytics data', e);
                }

                // Process Lead Source Data
                const leadSourceCounts: Record<string, number> = {
                    'Unknown': 0,
                    'Repeat Clients': 0,
                    'Office Walk-in': 0
                };

                // Let's fetch all lead sources for analytics (lightweight query)
                const { data: leadData, error: leadError } = await supabase
                    .from('booking_vouchers')
                    .select('lead_source');

                if (!leadError && leadData) {
                    leadData.forEach((booking) => {
                        const source = booking.lead_source || 'Unknown';
                        // Normalize specific variations if needed, or just count exact matches
                        // For now, we trust the database values or map 'null' to 'Unknown'
                        leadSourceCounts[source] = (leadSourceCounts[source] || 0) + 1;
                    });
                }

                const leadSourceData = Object.entries(leadSourceCounts)
                    .map(([name, value]) => ({ name, value }))
                    .sort((a, b) => b.value - a.value);

                // Fetch last year's bookings for comparison & revenue
                const lastYearStart = new Date(new Date().getFullYear() - 1, 0, 1).toISOString();
                const lastYearEnd = new Date(new Date().getFullYear() - 1, 11, 31).toISOString();

                // Get count for last year
                const { count: lastYearCount, error: lastYearError } = await supabase
                    .from('booking_vouchers')
                    .select('*', { count: 'exact', head: true })
                    .gte('created_at', lastYearStart)
                    .lte('created_at', lastYearEnd);

                // Get revenue for last year (separate query for simplicity, or could combine)
                const { data: lastYearRevenueData, error: lastYearRevenueError } = await supabase
                    .from('booking_vouchers')
                    .select('quotation_price, status')
                    .gte('created_at', lastYearStart)
                    .lte('created_at', lastYearEnd)
                    .eq('status', 'issued');

                let totalRevenue = 0;
                let lastYearRevenue = 0;

                // Calculate current year revenue from monthly data
                totalRevenue = monthlyRevenue.reduce((sum, item) => sum + item.total, 0);

                // Calculate last year revenue
                if (lastYearRevenueData) {
                    lastYearRevenue = lastYearRevenueData.reduce((sum, booking) => {
                        const priceStr = String(booking.quotation_price).replace(/[^0-9.]/g, '');
                        const price = parseFloat(priceStr) || 0;
                        return sum + price;
                    }, 0);
                }

                if (lastYearError) console.warn('Error fetching last year bookings:', lastYearError);
                if (lastYearRevenueError) console.warn('Error fetching last year revenue:', lastYearRevenueError);

                setStats({
                    totalBookings: bookingsCount || 0,
                    lastYearBookings: lastYearCount || 0,
                    totalRevenue,
                    lastYearRevenue,
                    pendingQuotations: quotationsCount || 0,
                    activeProperties: propertiesCount || 0,
                    totalConsultants: consultantsCount || 0,
                    topProperties,
                    monthlyRevenue,
                    leadSourceData,
                    monthlyBookings,
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

import { useEffect, useState, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { 
    subDays, 
    subMonths, 
    subYears, 
    startOfDay, 
    endOfDay, 
    isWithinInterval, 
    eachDayOfInterval, 
    format, 
    startOfMonth, 
    endOfMonth,
    startOfYear,
    endOfYear,
    eachMonthOfInterval
} from 'date-fns';

export type TimePeriod = 'week' | 'month' | 'year';

export interface DashboardStats {
    totalBookings: number;
    comparisonBookings: number;
    totalRevenue: number;
    comparisonRevenue: number;
    pendingQuotations: number;
    activeProperties: number;
    totalConsultants: number;
    topProperties: {
        name: string;
        bookings: number;
        value: number;
    }[];
    chartData: { name: string; count: number; total: number }[];
    leadSourceData: { name: string; value: number }[];
    userSalesData: { name: string; total: number; count: number }[];
    loading: boolean;
    error: string | null;
}

export function useDashboardStats(period: TimePeriod = 'year') {
    const [rawData, setRawData] = useState<any[]>([]);
    const [counts, setCounts] = useState({
        bookingsCount: 0,
        quotationsCount: 0,
        propertiesCount: 0,
        consultantsCount: 0
    });
    const [profilesMap, setProfilesMap] = useState<Record<string, string>>({});
    const [topProperties, setTopProperties] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchBaseData() {
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

                setCounts({
                    bookingsCount: bookingsCount || 0,
                    quotationsCount: quotationsCount || 0,
                    propertiesCount: propertiesCount || 0,
                    consultantsCount: consultantsCount || 0
                });

                // Fetch all profiles for name mapping
                const { data: profiles, error: profilesError } = await supabase
                    .from('profiles')
                    .select('id, full_name');
                
                if (profilesError) throw profilesError;
                const mapping: Record<string, string> = {};
                profiles?.forEach(p => {
                    mapping[p.id] = p.full_name || 'Unknown';
                });
                setProfilesMap(mapping);

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

                const processedTopProperties = Object.entries(propertyCounts)
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 3)
                    .map(([name, count]) => ({
                        name,
                        bookings: count,
                        value: 0,
                    }));
                
                setTopProperties(processedTopProperties);

                // Fetch all bookings for analytics
                const { data: allBookings, error: analyticsError } = await supabase
                    .from('booking_vouchers')
                    .select('created_at, quotation_price, status, lead_source, consultant_id');

                if (analyticsError) throw analyticsError;
                setRawData(allBookings || []);
                setLoading(false);
            } catch (err: any) {
                console.error('Error fetching dashboard stats:', err);
                setError(err.message);
                setLoading(false);
            }
        }

        fetchBaseData();
    }, []);

    const stats = useMemo(() => {
        const now = new Date();
        let currentInterval: { start: Date; end: Date };
        let lastInterval: { start: Date; end: Date };
        let chartIntervals: Date[] = [];
        let dateFormat = 'MMM';

        if (period === 'week') {
            currentInterval = { start: startOfDay(subDays(now, 6)), end: endOfDay(now) };
            lastInterval = { start: startOfDay(subDays(now, 13)), end: endOfDay(subDays(now, 7)) };
            chartIntervals = eachDayOfInterval(currentInterval);
            dateFormat = 'EEE';
        } else if (period === 'month') {
            currentInterval = { start: startOfMonth(now), end: endOfMonth(now) };
            lastInterval = { start: startOfMonth(subMonths(now, 1)), end: endOfMonth(subMonths(now, 1)) };
            chartIntervals = eachDayOfInterval(currentInterval);
            dateFormat = 'd';
        } else {
            currentInterval = { start: startOfYear(now), end: endOfYear(now) };
            lastInterval = { start: startOfYear(subYears(now, 1)), end: endOfYear(subYears(now, 1)) };
            chartIntervals = eachMonthOfInterval(currentInterval);
            dateFormat = 'MMM';
        }

        let totalBookings = 0;
        let comparisonBookings = 0;
        let totalRevenue = 0;
        let comparisonRevenue = 0;

        const chartDataMap = new Map<string, { name: string; count: number; total: number }>();
        chartIntervals.forEach(date => {
            const key = format(date, dateFormat);
            chartDataMap.set(key, { name: key, count: 0, total: 0 });
        });

        rawData.forEach(booking => {
            if (!booking.created_at) return;
            const date = new Date(booking.created_at);
            const priceStr = String(booking.quotation_price || '0').replace(/[^0-9.]/g, '');
            const price = parseFloat(priceStr) || 0;

            if (isWithinInterval(date, currentInterval)) {
                totalBookings++;
                if (booking.status === 'issued') {
                    totalRevenue += price;
                }

                // Add to chart data
                const key = format(date, dateFormat);
                if (chartDataMap.has(key)) {
                    const existing = chartDataMap.get(key)!;
                    existing.count++;
                    if (booking.status === 'issued') {
                        existing.total += price;
                    }
                }
            } else if (isWithinInterval(date, lastInterval)) {
                comparisonBookings++;
                if (booking.status === 'issued') {
                    comparisonRevenue += price;
                }
            }
        });

        // Process User Sales Data (for current period)
        const userSalesMap = new Map<string, { name: string; total: number; count: number }>();
        rawData.forEach(booking => {
            if (!booking.created_at) return;
            const date = new Date(booking.created_at);
            if (!isWithinInterval(date, currentInterval)) return;

            const priceStr = String(booking.quotation_price || '0').replace(/[^0-9.]/g, '');
            const price = parseFloat(priceStr) || 0;
            const consultantName = profilesMap[booking.consultant_id] || 'Unknown';

            if (!userSalesMap.has(consultantName)) {
                userSalesMap.set(consultantName, { name: consultantName, total: 0, count: 0 });
            }
            const userData = userSalesMap.get(consultantName)!;
            userData.count++;
            if (booking.status === 'issued') {
                userData.total += price;
            }
        });

        const userSalesData = Array.from(userSalesMap.values()).sort((a, b) => b.total - a.total);

        // Process Lead Source Data from rawData
        const leadSourceCounts: Record<string, number> = {
            'Unknown': 0,
            'Repeat Clients': 0,
            'Office Walk-in': 0
        };
        rawData.forEach(booking => {
            const source = booking.lead_source || 'Unknown';
            leadSourceCounts[source] = (leadSourceCounts[source] || 0) + 1;
        });
        const leadSourceData = Object.entries(leadSourceCounts)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);

        return {
            totalBookings,
            comparisonBookings,
            totalRevenue,
            comparisonRevenue,
            pendingQuotations: counts.quotationsCount,
            activeProperties: counts.propertiesCount,
            totalConsultants: counts.consultantsCount,
            topProperties,
            chartData: Array.from(chartDataMap.values()),
            leadSourceData,
            userSalesData,
            loading,
            error
        };
    }, [rawData, period, counts, topProperties, loading, error]);

    return stats;
}

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { FileText, TrendingUp } from 'lucide-react';

export default function AdminReports() {
    const [stats, setStats] = useState({
        totalBookings: 0,
        totalQuotations: 0,
        totalRevenue: 0, // Placeholder as we don't have price in booking voucher schema strictly defined as number
        topConsultants: [] as any[],
        topProperties: [] as any[]
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            // Mocking some aggregation or doing simple client side aggregation
            // In real app, use Database Views or RPC
            const { data: bookings } = await supabase.from('booking_vouchers').select('property_name, consultant_id');
            const { count: quoteCount } = await supabase.from('quotation_vouchers').select('*', { count: 'exact', head: true });
            const { data: profiles } = await supabase.from('profiles').select('id, full_name, email');

            // Agency consultant map
            const consultantMap = new Map();
            profiles?.forEach(p => consultantMap.set(p.id, p.full_name || p.email));

            // Aggregating
            const propertyCounts: Record<string, number> = {};
            const consultantCounts: Record<string, number> = {};

            bookings?.forEach(b => {
                propertyCounts[b.property_name] = (propertyCounts[b.property_name] || 0) + 1;
                const cName = consultantMap.get(b.consultant_id) || 'Unknown';
                consultantCounts[cName] = (consultantCounts[cName] || 0) + 1;
            });

            const topProperties = Object.entries(propertyCounts)
                .map(([name, count]) => ({ name, count }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 5);

            const topConsultants = Object.entries(consultantCounts)
                .map(([name, bookings]) => ({ name, bookings }))
                .sort((a, b) => b.bookings - a.bookings)
                .slice(0, 5);

            setStats({
                totalBookings: bookings?.length || 0,
                totalQuotations: quoteCount || 0,
                totalRevenue: 0,
                topConsultants,
                topProperties
            });

        } catch (error) {
            console.error("Error fetching stats", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div>Loading analytics...</div>;

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Analytics & Insights</h1>

            {/* Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center">
                    <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
                        <FileText className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-gray-500 text-sm">Total Bookings</p>
                        <p className="text-2xl font-bold">{stats.totalBookings}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center">
                    <div className="p-3 rounded-full bg-purple-100 text-purple-600 mr-4">
                        <FileText className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-gray-500 text-sm">Total Quotations</p>
                        <p className="text-2xl font-bold">{stats.totalQuotations}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center">
                    <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
                        <TrendingUp className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-gray-500 text-sm">Conversion Rate</p>
                        <p className="text-2xl font-bold">
                            {stats.totalQuotations > 0 ? ((stats.totalBookings / stats.totalQuotations) * 100).toFixed(1) : 0}%
                        </p>
                    </div>
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Properties */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <h3 className="text-lg font-medium text-gray-900 mb-6">Top Selling Properties</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats.topProperties} layout="vertical" margin={{ left: 40 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                                <XAxis type="number" />
                                <YAxis dataKey="name" type="category" width={100} style={{ fontSize: '10px' }} />
                                <Tooltip />
                                <Bar dataKey="count" fill="#0ea5e9" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Consultant Performance */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <h3 className="text-lg font-medium text-gray-900 mb-6">Consultant Performance (Bookings)</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats.topConsultants}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" style={{ fontSize: '10px' }} />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="bookings" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { FileText, TrendingUp, TrendingDown, BookOpen } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { cn } from '../../lib/utils';

export default function AdminReports() {
    const [stats, setStats] = useState({
        totalBookings: 0,
        totalQuotations: 0,
        totalRevenue: 0,
        topConsultants: [] as any[],
        topProperties: [] as any[]
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const { data: bookings } = await supabase.from('booking_vouchers').select('property_name, consultant_id');
            const { count: quoteCount } = await supabase.from('quotation_vouchers').select('*', { count: 'exact', head: true });
            const { data: profiles } = await supabase.from('profiles').select('id, full_name, email');

            const consultantMap = new Map();
            profiles?.forEach(p => consultantMap.set(p.id, p.full_name || p.email));

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

    if (loading) return (
        <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
    );

    const statCards = [
        {
            title: "Total Bookings",
            value: stats.totalBookings,
            icon: FileText,
            trend: "+12%", // Dummy trend for now
            trendUp: true
        },
        {
            title: "Total Quotations",
            value: stats.totalQuotations,
            icon: BookOpen,
            trend: "+5%",
            trendUp: true
        },
        {
            title: "Conversion Rate",
            value: `${stats.totalQuotations > 0 ? ((stats.totalBookings / stats.totalQuotations) * 100).toFixed(1) : 0}%`,
            icon: TrendingUp,
            trend: stats.totalQuotations > 0 && (stats.totalBookings / stats.totalQuotations) > 0.2 ? "+2.4%" : "-1.2%",
            trendUp: stats.totalQuotations > 0 && (stats.totalBookings / stats.totalQuotations) > 0.2
        }
    ];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Analytics & Insights</h1>
                <p className="text-muted-foreground mt-2">Detailed metrics and performance tracking.</p>
            </div>

            {/* Cards */}
            <div className="grid gap-6 md:grid-cols-3">
                {statCards.map((card, index) => (
                    <Card key={index} className="border shadow-sm hover:shadow-md transition-shadow duration-200 bg-white dark:bg-card">
                        <CardContent className="p-6">
                            <div className="flex flex-col space-y-2">
                                <div className="flex items-center space-x-2 text-muted-foreground">
                                    <card.icon className="h-4 w-4" />
                                    <span className="text-sm font-medium">{card.title}</span>
                                </div>
                                <div className="flex items-baseline space-x-2">
                                    <h3 className="text-2xl font-bold text-foreground">{card.value}</h3>
                                    <div className={cn("flex items-center text-xs font-medium", card.trendUp ? "text-emerald-500" : "text-rose-500")}>
                                        {card.trendUp ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                                        {card.trend}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {/* Top Properties */}
                <Card className="border-none shadow-sm bg-white dark:bg-card">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold">Top Selling Properties</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-6">
                        <div className="h-[350px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stats.topProperties} layout="vertical" margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="hsl(var(--border))" />
                                    <XAxis type="number" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis dataKey="name" type="category" width={100} stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                                    <Tooltip
                                        cursor={{ fill: 'transparent' }}
                                        contentStyle={{
                                            backgroundColor: 'hsl(var(--card))',
                                            border: '1px solid hsl(var(--border))',
                                            borderRadius: '8px',
                                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                        }}
                                    />
                                    <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} maxBarSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Consultant Performance */}
                <Card className="border-none shadow-sm bg-white dark:bg-card">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold">Consultant Performance (Bookings)</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-6">
                        <div className="h-[350px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stats.topConsultants} margin={{ top: 30, right: 30, left: 20, bottom: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                                    <XAxis dataKey="name" stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                                    <Tooltip
                                        cursor={{ fill: 'transparent' }}
                                        contentStyle={{
                                            backgroundColor: 'hsl(var(--card))',
                                            border: '1px solid hsl(var(--border))',
                                            borderRadius: '8px',
                                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                        }}
                                    />
                                    <Bar dataKey="bookings" fill="#8b5cf6" radius={[4, 4, 0, 0]} maxBarSize={50} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

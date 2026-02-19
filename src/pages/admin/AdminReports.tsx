import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { AreaChart, Area, BarChart, Bar, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Users, MoreVertical, ArrowUpRight, TrendingUp } from 'lucide-react';

export default function AdminReports() {
    const [stats, setStats] = useState({
        totalBookings: 0,
        totalQuotations: 0,
        totalRevenue: 0,
        topConsultants: [] as any[],
        topProperties: [] as any[],
        recentQuotations: [] as any[]
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const { data: bookings } = await supabase.from('booking_vouchers').select('property_name, consultant_id, created_at');
            const { data: quotations } = await supabase.from('quotation_vouchers').select('*').order('created_at', { ascending: false }).limit(5);
            const { count: quoteCount } = await supabase.from('quotation_vouchers').select('*', { count: 'exact', head: true });
            const { data: profiles } = await supabase.from('profiles').select('id, full_name, email');

            const consultantMap = new Map();
            profiles?.forEach(p => consultantMap.set(p.id, p.full_name || p.email));

            const propertyCounts: Record<string, number> = {};
            const consultantCounts: Record<string, number> = {};

            bookings?.forEach(b => {
                if (b.property_name) propertyCounts[b.property_name] = (propertyCounts[b.property_name] || 0) + 1;
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
                totalRevenue: 0, // Placeholder
                topConsultants,
                topProperties,
                recentQuotations: quotations || []
            });

        } catch (error) {
            console.error("Error fetching stats", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center h-[calc(100vh-100px)]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
    );

    return (
        <div className="p-4 md:p-6 space-y-6 max-w-[1600px] mx-auto animate-fade-in">
            <div className="flex items-center justify-between mb-2">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Overview</h1>
                    <p className="text-muted-foreground mt-1">Welcome back! Here's what's happening today.</p>
                </div>
                <div className="hidden md:flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-sm border text-sm font-medium">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    Live Updates
                </div>
            </div>

            {/* Bento Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left Column (Main Stats) */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Dark Sales Card */}
                    <div className="bg-slate-900 text-white rounded-[2.5rem] p-8 relative overflow-hidden shadow-xl min-h-[320px] flex flex-col justify-between group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[80px] -mr-16 -mt-16 pointer-events-none transition-all duration-700 group-hover:bg-primary/30"></div>

                        <div className="flex justify-between items-start z-10">
                            <div>
                                <h3 className="text-lg font-medium text-slate-300">Total Bookings</h3>
                                <p className="text-sm text-slate-400 mt-1">Updated just now</p>
                            </div>
                            <div className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-xs font-medium border border-white/10">
                                This Month
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end z-10 mt-8">
                            <div>
                                <h2 className="text-6xl font-bold tracking-tighter mb-2">{stats.totalBookings.toLocaleString()}</h2>
                                <div className="flex items-center text-emerald-400 text-sm font-medium bg-emerald-400/10 w-fit px-2 py-1 rounded-lg">
                                    <ArrowUpRight className="w-4 h-4 mr-1" />
                                    <span>+12.5%</span>
                                    <span className="text-slate-400 ml-1 font-normal">vs last month</span>
                                </div>
                            </div>

                            {/* Mini Chart for Properties */}
                            <div className="h-32 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={stats.topProperties}>
                                        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                                            {stats.topProperties.map((_, index) => (
                                                <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#4ade80' : '#818cf8'} />
                                            ))}
                                        </Bar>
                                        <Tooltip
                                            cursor={{ fill: 'transparent' }}
                                            contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                                <p className="text-xs text-right text-slate-400 mt-2">Top Properties Performance</p>
                            </div>
                        </div>
                    </div>

                    {/* Green Revenue Card + Small Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Revenue Card (Green) */}
                        <div className="bg-primary/10 rounded-[2.5rem] p-8 relative overflow-hidden border border-primary/20 flex flex-col justify-between min-h-[280px]">
                            <div className="flex justify-between items-start">
                                <div className="p-3 bg-white rounded-2xl shadow-sm">
                                    <TrendingUp className="w-6 h-6 text-primary" />
                                </div>
                                <div className="flex gap-2">
                                    <button className="w-8 h-8 rounded-full border border-primary/20 flex items-center justify-center hover:bg-white/50 transition-colors">
                                        <ArrowUpRight className="w-4 h-4 text-primary" />
                                    </button>
                                </div>
                            </div>

                            <div className="mt-8">
                                <h3 className="text-4xl font-bold text-foreground tracking-tight">
                                    {stats.totalQuotations}
                                </h3>
                                <p className="text-muted-foreground font-medium mt-1">Quotations Generated</p>

                                <div className="h-16 mt-4 -mx-2">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={stats.recentQuotations}>
                                            <Area type="monotone" dataKey="net_amount" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} strokeWidth={2} />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>

                        {/* Conversion Stat */}
                        <div className="bg-white dark:bg-card rounded-[2.5rem] p-8 border shadow-sm flex flex-col justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-foreground">Conversion Rate</h3>
                                <div className="mt-4 flex items-baseline gap-2">
                                    <span className="text-5xl font-bold tracking-tighter">
                                        {stats.totalQuotations > 0 ? ((stats.totalBookings / stats.totalQuotations) * 100).toFixed(0) : 0}%
                                    </span>
                                    <span className="text-sm font-medium text-emerald-500">+2.1%</span>
                                </div>
                                <p className="text-sm text-muted-foreground mt-2">Bookings from quotations</p>
                            </div>

                            <div className="mt-6 w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden">
                                <div
                                    className="bg-primary h-full rounded-full transition-all duration-1000 ease-out"
                                    style={{ width: `${stats.totalQuotations > 0 ? Math.min((stats.totalBookings / stats.totalQuotations) * 100, 100) : 0}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column (Lists & Secondary Stats) */}
                <div className="space-y-6">
                    {/* Recent Card */}
                    <div className="bg-white dark:bg-card rounded-[2rem] p-6 shadow-sm border min-h-[200px]">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl">
                                    <Users className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                                </div>
                                <h3 className="font-semibold text-foreground">Top Consultants</h3>
                            </div>
                            <MoreVertical className="w-5 h-5 text-muted-foreground cursor-pointer" />
                        </div>

                        <div className="space-y-4">
                            {stats.topConsultants.map((consultant, i) => (
                                <div key={i} className="flex items-center justify-between group cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 p-2 rounded-xl transition-colors -mx-2">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                                            {consultant.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-foreground">{consultant.name}</p>
                                            <p className="text-xs text-muted-foreground">Sales Rep</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold">{consultant.bookings}</p>
                                        <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Bookings</p>
                                    </div>
                                </div>
                            ))}
                            {stats.topConsultants.length === 0 && (
                                <p className="text-sm text-muted-foreground text-center py-4">No data available</p>
                            )}
                        </div>
                    </div>

                    {/* Forecast / List Card */}
                    <div className="bg-slate-50 dark:bg-slate-900/50 rounded-[2rem] p-6 border border-slate-200 dark:border-slate-800 flex flex-col h-full min-h-[300px]">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="font-semibold text-foreground">Top Properties</h3>
                                <p className="text-xs text-muted-foreground mt-0.5">Most popular destinations</p>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center">
                                <ArrowUpRight className="w-4 h-4 text-emerald-500" />
                            </div>
                        </div>

                        <div className="space-y-6 relative pl-4 border-l-2 border-slate-200 dark:border-slate-800 ml-2">
                            {stats.topProperties.slice(0, 4).map((prop, i) => (
                                <div key={i} className="relative pl-6">
                                    <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 border-white dark:border-slate-900 ${i === 0 ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-700'}`}></div>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-sm font-medium text-foreground line-clamp-1">{prop.name}</p>
                                            <p className="text-xs text-muted-foreground mt-0.5">High demand</p>
                                        </div>
                                        <span className="text-sm font-bold text-foreground">{prop.count}</span>
                                    </div>
                                    {/* Mini progress bar */}
                                    <div className="mt-2 w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                                        <div
                                            className="bg-primary h-full rounded-full"
                                            style={{ width: `${(prop.count / (stats.topProperties[0]?.count || 1)) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-auto pt-6">
                            <div className="bg-white dark:bg-card p-4 rounded-2xl shadow-sm border flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-muted-foreground">Market Forecast</p>
                                    <p className="text-lg font-bold text-foreground mt-1">Positive</p>
                                </div>
                                <div className="h-8 w-20">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={[{ v: 10 }, { v: 15 }, { v: 30 }, { v: 25 }, { v: 40 }, { v: 50 }, { v: 60 }]}>
                                            <Area type="monotone" dataKey="v" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.2} strokeWidth={2} />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

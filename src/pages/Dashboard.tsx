import { BarChart, Bar, ResponsiveContainer, Tooltip, Cell, AreaChart, Area } from 'recharts';
import { useDashboardStats } from '../hooks/useDashboardStats';
import { ArrowUpRight, Users, MoreVertical, CreditCard, Activity, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
    const stats = useDashboardStats();
    const { profile } = useAuth();

    // Calculate total revenue from monthly revenue for display
    const totalRevenue = stats.monthlyRevenue.reduce((acc, curr) => acc + curr.total, 0);

    if (stats.loading) return (
        <div className="flex items-center justify-center h-[calc(100vh-100px)]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
    );

    return (
        <div className="p-4 md:p-6 space-y-6 max-w-[1600px] mx-auto animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">
                        Hello, {profile?.full_name?.split(' ')[0] || 'Travel Agent'}
                    </h1>
                    <p className="text-muted-foreground mt-1">Overview of your travel business performance.</p>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-muted-foreground">{format(new Date(), 'd MMM, yyyy')}</span>
                    <div className="p-2 bg-white dark:bg-card rounded-full shadow-sm border">
                        <Calendar className="w-5 h-5 text-foreground" />
                    </div>
                </div>
            </div>

            {/* Bento Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left Column (Main Stats) */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Dark Sales Card (Bookings) */}
                    <div className="bg-slate-900 text-white rounded-[2.5rem] p-8 relative overflow-hidden shadow-xl min-h-[320px] flex flex-col justify-between group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[80px] -mr-16 -mt-16 pointer-events-none transition-all duration-700 group-hover:bg-primary/30"></div>

                        <div className="flex justify-between items-start z-10">
                            <div>
                                <h3 className="text-lg font-medium text-slate-300">Total Bookings</h3>
                                <p className="text-sm text-slate-400 mt-1">All time</p>
                            </div>
                            <div className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-xs font-medium border border-white/10">
                                {new Date().getFullYear()}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end z-10 mt-8">
                            <div>
                                <h2 className="text-6xl font-bold tracking-tighter mb-2">{stats.totalBookings.toLocaleString()}</h2>
                                <div className="flex items-center text-emerald-400 text-sm font-medium bg-emerald-400/10 w-fit px-2 py-1 rounded-lg">
                                    <ArrowUpRight className="w-4 h-4 mr-1" />
                                    <span>+12%</span>
                                    <span className="text-slate-400 ml-1 font-normal">trending up</span>
                                </div>
                            </div>

                            {/* Monthly Revenue Chart (Mini) */}
                            <div className="h-32 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={stats.monthlyRevenue}>
                                        <Bar dataKey="total" radius={[4, 4, 0, 0]}>
                                            {stats.monthlyRevenue.map((_, index) => (
                                                <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#4ade80' : '#818cf8'} />
                                            ))}
                                        </Bar>
                                        <Tooltip
                                            cursor={{ fill: 'transparent' }}
                                            contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                                            formatter={(value: number | undefined) => [`Ksh ${(value || 0).toLocaleString()}`, 'Revenue']}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                                <p className="text-xs text-right text-slate-400 mt-2">Monthly Revenue Trend</p>
                            </div>
                        </div>
                    </div>

                    {/* Green Revenue Card + Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Revenue Card (Green) */}
                        <div className="bg-primary/10 rounded-[2.5rem] p-8 relative overflow-hidden border border-primary/20 flex flex-col justify-between min-h-[280px]">
                            <div className="flex justify-between items-start">
                                <div className="p-3 bg-white rounded-2xl shadow-sm">
                                    <CreditCard className="w-6 h-6 text-primary" />
                                </div>
                                <div className="flex gap-2">
                                    <button className="w-8 h-8 rounded-full border border-primary/20 flex items-center justify-center hover:bg-white/50 transition-colors">
                                        <ArrowUpRight className="w-4 h-4 text-primary" />
                                    </button>
                                </div>
                            </div>

                            <div className="mt-8">
                                <h3 className="text-4xl font-bold text-foreground tracking-tight">
                                    Ksh {(totalRevenue / 1000).toFixed(0)}k
                                </h3>
                                <p className="text-muted-foreground font-medium mt-1">YTD Revenue</p>

                                <div className="h-16 mt-4 -mx-2">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={stats.monthlyRevenue}>
                                            <Area type="monotone" dataKey="total" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} strokeWidth={2} />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>

                        {/* Pending Quotations Stat */}
                        <div className="bg-white dark:bg-card rounded-[2.5rem] p-8 border shadow-sm flex flex-col justify-between">
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-foreground">Pending Quotes</h3>
                                    <Activity className="h-5 w-5 text-muted-foreground" />
                                </div>
                                <div className="mt-4 flex items-baseline gap-2">
                                    <span className="text-5xl font-bold tracking-tighter">
                                        {stats.pendingQuotations}
                                    </span>
                                    <span className="text-sm font-medium text-orange-500">Action Needed</span>
                                </div>
                                <p className="text-sm text-muted-foreground mt-2">Quotations awaiting confirmation.</p>
                            </div>

                            <div className="mt-6 w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden">
                                {/* Visualize pending vs total bookings roughly (mock ratio for visuals) */}
                                <div
                                    className="bg-orange-400 h-full rounded-full transition-all duration-1000 ease-out"
                                    style={{ width: `${Math.min((stats.pendingQuotations / (stats.totalBookings || 1)) * 100, 100)}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column (Lists) */}
                <div className="space-y-6">
                    {/* Lead Sources Card */}
                    <div className="bg-white dark:bg-card rounded-[2rem] p-6 shadow-sm border min-h-[200px]">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl">
                                    <Users className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                                </div>
                                <h3 className="font-semibold text-foreground">Lead Sources</h3>
                            </div>
                            <MoreVertical className="w-5 h-5 text-muted-foreground cursor-pointer" />
                        </div>

                        <div className="space-y-4">
                            {stats.leadSourceData?.map((source, i) => (
                                <div key={i} className="flex items-center justify-between group cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 p-2 rounded-xl transition-colors -mx-2">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                                            {source.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-foreground">{source.name}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold">{source.value}</p>
                                        <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Leads</p>
                                    </div>
                                </div>
                            ))}
                            {(!stats.leadSourceData || stats.leadSourceData.length === 0) && (
                                <p className="text-sm text-muted-foreground text-center py-4">No data available</p>
                            )}
                        </div>
                    </div>

                    {/* Top Properties List */}
                    <div className="bg-slate-50 dark:bg-slate-900/50 rounded-[2rem] p-6 border border-slate-200 dark:border-slate-800 flex flex-col h-full min-h-[300px]">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="font-semibold text-foreground">Top Properties</h3>
                                <p className="text-xs text-muted-foreground mt-0.5">Most booked destinations</p>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center">
                                <ArrowUpRight className="w-4 h-4 text-emerald-500" />
                            </div>
                        </div>

                        <div className="space-y-6 relative pl-4 border-l-2 border-slate-200 dark:border-slate-800 ml-2">
                            {stats.topProperties.map((prop, i) => (
                                <div key={i} className="relative pl-6">
                                    <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 border-white dark:border-slate-900 ${i === 0 ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-700'}`}></div>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-sm font-medium text-foreground line-clamp-1">{prop.name}</p>
                                            <p className="text-xs text-muted-foreground mt-0.5">Popular</p>
                                        </div>
                                        <span className="text-sm font-bold text-foreground">{prop.bookings}</span>
                                    </div>
                                    {/* Mini progress bar */}
                                    <div className="mt-2 w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                                        <div
                                            className="bg-primary h-full rounded-full"
                                            style={{ width: `${(prop.bookings / (stats.topProperties[0]?.bookings || 1)) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

import { useState } from 'react';
import { Bar, ResponsiveContainer, Tooltip, ComposedChart, Line, XAxis } from 'recharts';
import { useDashboardStats, type TimePeriod } from '../hooks/useDashboardStats';
import { ArrowUpRight, Users, Activity, Calendar, Award } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
    const [period, setPeriod] = useState<TimePeriod>('year');
    const stats = useDashboardStats(period);
    const { profile } = useAuth();

    if (stats.loading) return (
        <div className="flex items-center justify-center h-[calc(100vh-100px)]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
    );

    const periodLabel = period === 'week' ? 'week' : period === 'month' ? 'month' : 'year';

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
                    {/* Redesigned Total Bookings Card (Income Tracker Style) */}
                    <div className="bg-white dark:bg-card rounded-[2.5rem] p-8 shadow-sm border min-h-[380px] flex flex-col justify-between">
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl">
                                    <Activity className="w-6 h-6 text-slate-600 dark:text-slate-300" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-medium text-foreground">Total Bookings</h3>
                                    <p className="text-sm text-muted-foreground">Track volume over this {periodLabel}</p>
                                </div>
                            </div>
                            
                            <div className="flex bg-slate-100/80 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700/50">
                                {(['week', 'month', 'year'] as TimePeriod[]).map((p) => (
                                    <button
                                        key={p}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setPeriod(p);
                                        }}
                                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all duration-200 ${
                                            period === p 
                                            ? 'bg-white dark:bg-slate-700 shadow-sm text-primary' 
                                            : 'text-muted-foreground hover:text-foreground'
                                        }`}
                                    >
                                        {p.toUpperCase()}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex flex-col md:flex-row gap-8 items-end h-full">
                            <div className="md:w-1/3 space-y-2 mb-4 md:mb-0 pb-4">
                                <h2 className="text-5xl font-medium tracking-tighter text-foreground">
                                    {stats.comparisonBookings > 0
                                        ? `${((stats.totalBookings - stats.comparisonBookings) / stats.comparisonBookings * 100) > 0 ? '+' : ''}${Math.round(((stats.totalBookings - stats.comparisonBookings) / stats.comparisonBookings) * 100)}%`
                                        : `+${stats.totalBookings > 0 ? '100' : '0'}%`
                                    }
                                </h2>
                                <p className="text-sm text-muted-foreground leading-tight">
                                    This {periodLabel}'s bookings are {stats.totalBookings >= stats.comparisonBookings ? 'higher' : 'lower'} than last {periodLabel}'s.
                                </p>
                            </div>

                            <div className="flex-1 h-64 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <ComposedChart data={stats.chartData} margin={{ top: 20, right: 10, bottom: 20, left: 10 }}>
                                        <XAxis
                                            dataKey="name"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={({ x, y, payload }) => {
                                                const currentLabel = period === 'year' ? format(new Date(), 'MMM') : 
                                                                    period === 'month' ? format(new Date(), 'd') :
                                                                    format(new Date(), 'EEE');
                                                const isCurrent = payload.value === currentLabel;
                                                return (
                                                    <g transform={`translate(${x},${y})`}>
                                                        {isCurrent && (
                                                            <rect
                                                                x={-14}
                                                                y={8}
                                                                width={28}
                                                                height={28}
                                                                rx={14}
                                                                fill="#1e293b"
                                                                className="dark:fill-slate-100"
                                                            />
                                                        )}
                                                        <text
                                                            x={0}
                                                            y={27}
                                                            textAnchor="middle"
                                                            fill={isCurrent ? "#ffffff" : "#94a3b8"}
                                                            fontSize={10}
                                                            fontWeight={isCurrent ? "600" : "400"}
                                                            className={isCurrent ? "dark:fill-slate-900" : ""}
                                                        >
                                                            {payload.value}
                                                        </text>
                                                    </g>
                                                );
                                            }}
                                            interval={period === 'month' ? 4 : 0}
                                        />
                                        <Tooltip
                                            cursor={{ fill: 'transparent', stroke: 'transparent' }}
                                            content={({ active, payload }) => {
                                                if (active && payload && payload.length) {
                                                    return (
                                                        <div className="bg-slate-900 text-white text-xs rounded-lg py-2 px-3 shadow-xl border border-slate-700">
                                                            <p className="font-semibold mb-1">{payload[0].payload.name}</p>
                                                            <p>Bookings: {payload[0].value}</p>
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            }}
                                        />
                                        <Bar dataKey="count" barSize={2} fill="#cbd5e1" radius={[10, 10, 0, 0]} activeBar={false} />
                                        <Line
                                            type="monotone"
                                            dataKey="count"
                                            stroke="#10b981"
                                            strokeWidth={2}
                                            dot={(props) => {
                                                const { cx, cy, payload } = props;
                                                const currentLabel = period === 'year' ? format(new Date(), 'MMM') : 
                                                                    period === 'month' ? format(new Date(), 'd') :
                                                                    format(new Date(), 'EEE');
                                                const isCurrent = payload.name === currentLabel;
                                                return (
                                                    <circle
                                                        cx={cx}
                                                        cy={cy}
                                                        r={isCurrent ? 5 : 3}
                                                        fill={isCurrent ? "#10b981" : "#64748b"}
                                                        strokeWidth={0}
                                                    />
                                                );
                                            }}
                                            activeDot={{ r: 6, fill: '#10b981' }}
                                        />
                                    </ComposedChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* Green Revenue Card + Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Revenue Card (Redesigned) */}
                        <div className="bg-white dark:bg-card rounded-[2.5rem] p-8 shadow-sm border min-h-[280px] flex flex-col justify-between relative overflow-hidden">
                            <div className="relative z-10 flex flex-col h-full justify-between">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="text-lg font-bold text-foreground">Total Revenue</h3>
                                        <div className="group relative">
                                            <div className="w-5 h-5 rounded-full border border-slate-300 dark:border-slate-600 flex items-center justify-center text-xs text-slate-400 cursor-help">?</div>
                                            <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-48 p-2 bg-slate-800 text-white text-xs rounded-lg z-50">
                                                Total revenue from issued bookings.
                                            </div>
                                        </div>
                                    </div>
                                    <h2 className="text-2xl font-bold tracking-tighter text-foreground mt-2">
                                        KES {stats.totalRevenue.toLocaleString()}
                                    </h2>
                                </div>

                                <div className="flex items-center mt-4">
                                    <div className="flex items-center gap-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 px-3 py-1.5 rounded-xl text-sm font-semibold">
                                        <ArrowUpRight className="w-4 h-4" />
                                        <span>
                                            {stats.comparisonRevenue > 0
                                                ? `${Math.round(((stats.totalRevenue - stats.comparisonRevenue) / stats.comparisonRevenue) * 100)}%`
                                                : '100%'}
                                        </span>
                                    </div>
                                    <span className="text-muted-foreground ml-3 text-sm font-medium">vs last {periodLabel}</span>
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

                    {/* Consultant Sales Performance Section */}
                    <div className="bg-white dark:bg-card rounded-[2.5rem] p-8 border shadow-sm">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-xl font-bold text-foreground">Consultant Sales Performance</h3>
                                <p className="text-sm text-muted-foreground mt-1">Total revenue generated by each team member this {periodLabel}.</p>
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl">
                                <Users className="w-4 h-4 text-primary" />
                                <span className="text-sm font-bold text-primary">{stats.userSalesData.length} Agents</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-6">
                            {stats.userSalesData.length === 0 ? (
                                <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-3xl">
                                    No sales data found for this period.
                                </div>
                            ) : (
                                stats.userSalesData.map((user, index) => (
                                    <div key={user.name} className="group relative">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-4">
                                                <div className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold ${
                                                    index === 0 ? 'bg-amber-100 text-amber-700' : 
                                                    index === 1 ? 'bg-slate-100 text-slate-700' :
                                                    index === 2 ? 'bg-orange-50 text-orange-700' :
                                                    'bg-slate-50 text-slate-500'
                                                }`}>
                                                    #{index + 1}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-foreground group-hover:text-primary transition-colors">{user.name}</p>
                                                    <p className="text-xs text-muted-foreground">{user.count} total bookings</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-lg font-bold text-foreground">KES {user.total.toLocaleString()}</p>
                                                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Total Sales</p>
                                            </div>
                                        </div>
                                        <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                                            <div 
                                                className={`h-full rounded-full transition-all duration-1000 ease-out ${
                                                    index === 0 ? 'bg-primary' : 'bg-primary/60'
                                                }`}
                                                style={{ width: `${(user.total / (stats.userSalesData[0]?.total || 1)) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                ))
                            )}
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
                            <Link to="/reports/leads" className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800 shadow-sm flex items-center justify-center hover:bg-primary/10 transition-colors group">
                                <ArrowUpRight className="w-4 h-4 text-brand-500 group-hover:scale-110 transition-transform" />
                            </Link>
                        </div>

                        <div className="space-y-4">
                            {stats.leadSourceData?.slice(0, 4).map((source, i) => {
                                const colors = [
                                    { bg: 'bg-brand-50 dark:bg-brand-500/10', text: 'text-brand-700 dark:text-brand-300' },
                                    { bg: 'bg-emerald-50 dark:bg-emerald-500/10', text: 'text-emerald-700 dark:text-emerald-300' },
                                    { bg: 'bg-amber-50 dark:bg-amber-500/10', text: 'text-amber-700 dark:text-amber-300' },
                                    { bg: 'bg-rose-50 dark:bg-rose-500/10', text: 'text-rose-700 dark:text-rose-300' },
                                ];
                                const color = colors[i % colors.length];

                                return (
                                    <div key={i} className={`flex items-center justify-between group cursor-pointer p-3 rounded-xl transition-all hover:scale-[1.02] ${color.bg}`}>
                                        <div className="flex items-center gap-3">
                                            <div>
                                                <p className={`text-sm font-semibold ${color.text}`}>{source.name}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className={`text-sm font-bold ${color.text}`}>{source.value}</p>
                                            <p className={`text-[10px] uppercase tracking-wide opacity-70 ${color.text}`}>Leads</p>
                                        </div>
                                    </div>
                                );
                            })}
                            {(!stats.leadSourceData || stats.leadSourceData.length === 0) && (
                                <p className="text-sm text-muted-foreground text-center py-4">No data available</p>
                            )}
                        </div>
                    </div>

                    {/* Top Properties List */}
                    <div className="bg-slate-50 dark:bg-slate-900/50 rounded-[2rem] p-6 border border-slate-200 dark:border-slate-800 flex flex-col h-fit">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="font-semibold text-foreground">Top Properties</h3>
                                <p className="text-xs text-muted-foreground mt-0.5">Most booked destinations</p>
                            </div>
                            <Link to="/properties/top" className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center hover:bg-primary/10 transition-colors group">
                                <ArrowUpRight className="w-4 h-4 text-emerald-500 group-hover:scale-110 transition-transform" />
                            </Link>
                        </div>

                        <div className="space-y-6 relative border-l-2 border-slate-200 dark:border-slate-800 ml-6">
                            {stats.topProperties.slice(0, 5).map((prop, i) => (
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
                    {/* Top Clients List */}
                    <div className="bg-white dark:bg-card rounded-[2rem] p-6 shadow-sm border min-h-[200px] transition-all hover:shadow-md animate-fade-in">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-brand-50 rounded-xl">
                                    <Award className="w-5 h-5 text-brand-600" />
                                </div>
                                <h3 className="font-semibold text-foreground">Top Clients</h3>
                            </div>
                            <Link to="/reports/clients" className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800 shadow-sm flex items-center justify-center hover:bg-primary/10 transition-colors group">
                                <ArrowUpRight className="w-4 h-4 text-brand-500 group-hover:scale-110 transition-transform" />
                            </Link>
                        </div>

                        <div className="space-y-4">
                            {stats.topClients?.map((client, i) => (
                                <div key={i} className="flex items-center justify-between group cursor-pointer p-2 rounded-xl transition-all hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-xs uppercase">
                                            {client.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-foreground uppercase truncate max-w-[120px]">{client.name}</p>
                                            <p className="text-[10px] text-muted-foreground italic">Repeat Guest</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold text-brand-600">{client.count}</p>
                                        <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Bookings</p>
                                    </div>
                                </div>
                            ))}
                            {(!stats.topClients || stats.topClients.length === 0) && (
                                <p className="text-sm text-muted-foreground text-center py-4">No data available</p>
                            )}
                        </div>
                    </div>
                </div>
            </div >
        </div >
    );
}

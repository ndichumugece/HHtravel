import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Activity, CreditCard, Users, Building2, TrendingUp, TrendingDown, ArrowUpRight } from 'lucide-react';
import { useDashboardStats } from '../hooks/useDashboardStats';
import { BookingAnalytics } from '../components/dashboard/BookingAnalytics';
import { LeadSourceAnalytics } from '../components/dashboard/LeadSourceAnalytics';
import { cn } from '../lib/utils';

export default function Dashboard() {
    const stats = useDashboardStats();

    const statCards = [
        {
            title: "Total Bookings",
            value: stats.totalBookings,
            icon: CreditCard,
            trend: "+12%",
            trendUp: true,
            desc: "Lifetime bookings"
        },
        {
            title: "Pending Quotations",
            value: stats.pendingQuotations,
            icon: Activity,
            trend: "+4",
            trendUp: true,
            desc: "Awaiting confirmation"
        },
        {
            title: "Active Properties",
            value: stats.activeProperties,
            icon: Building2,
            trend: "+2",
            trendUp: true,
            desc: "Partners"
        },
        {
            title: "Total Consultants",
            value: stats.totalConsultants,
            icon: Users,
            trend: "0",
            trendUp: true,
            desc: "Team members"
        }
    ];

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
                    <p className="text-muted-foreground mt-1">Overview of your travel business performance.</p>
                </div>
                {/* Optional: Add a date picker or action button here */}
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
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

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                {/* Analytics Chart */}
                <BookingAnalytics data={stats.monthlyRevenue || []} />

                {/* Lead Source Analytics */}
                <LeadSourceAnalytics data={stats.leadSourceData || []} />

                {/* Top Properties */}
                <Card className="col-span-3 border-none shadow-sm bg-white dark:bg-card">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold">Top Properties</CardTitle>
                        <p className="text-sm text-muted-foreground">Most booked properties this month.</p>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {stats.topProperties.length > 0 ? (
                                stats.topProperties.map((property, i) => (
                                    <div key={i} className="flex items-center">
                                        <div className={cn(
                                            "flex items-center justify-center h-10 w-10 rounded-full font-bold text-sm",
                                            i === 0 ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400" :
                                                i === 1 ? "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400" :
                                                    "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400"
                                        )}>
                                            {i + 1}
                                        </div>
                                        <div className="ml-4 space-y-1">
                                            <p className="text-sm font-medium leading-none truncate max-w-[150px]" title={property.name}>{property.name}</p>
                                            <p className="text-xs text-muted-foreground">{property.bookings} bookings</p>
                                        </div>
                                        <div className="ml-auto font-medium text-sm text-muted-foreground">
                                            <ArrowUpRight className="h-4 w-4" />
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-muted-foreground p-4 text-center">No bookings data available yet.</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

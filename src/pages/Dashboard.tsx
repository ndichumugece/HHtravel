import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Activity, CreditCard, Users, Building2 } from 'lucide-react';

export default function Dashboard() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
                <p className="text-muted-foreground mt-2">Overview of your travel business performance.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card className="hover:shadow-levitate transition-shadow duration-200">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Bookings</CardTitle>
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">124</div>
                        <p className="text-xs text-muted-foreground mt-1 text-emerald-600 font-medium">+12% from last month</p>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-levitate transition-shadow duration-200">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Pending Quotations</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">45</div>
                        <p className="text-xs text-muted-foreground mt-1 text-emerald-600 font-medium">+4 new today</p>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-levitate transition-shadow duration-200">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Properties</CardTitle>
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">86</div>
                        <p className="text-xs text-muted-foreground mt-1">Active partners</p>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-levitate transition-shadow duration-200">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Consultants</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">12</div>
                        <p className="text-xs text-muted-foreground mt-1">Active team members</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm border border-dashed rounded-md bg-muted/20">
                            Chart Placeholder (Recharts)
                        </div>
                    </CardContent>
                </Card>
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Top Properties</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex items-center">
                                    <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                        P{i}
                                    </div>
                                    <div className="ml-4 space-y-1">
                                        <p className="text-sm font-medium leading-none">Luxury Safari Lodge</p>
                                        <p className="text-xs text-muted-foreground">Masai Mara, Kenya</p>
                                    </div>
                                    <div className="ml-auto font-medium text-sm">
                                        $24,000
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

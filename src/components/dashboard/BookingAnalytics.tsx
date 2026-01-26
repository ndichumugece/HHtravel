import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";

interface BookingAnalyticsProps {
    data: { name: string; total: number }[];
}

export function BookingAnalytics({ data }: BookingAnalyticsProps) {
    return (
        <Card className="col-span-4 border-none shadow-sm bg-white dark:bg-card">
            <CardHeader>
                <CardTitle className="text-lg font-bold">Booking Analytics</CardTitle>
                <p className="text-sm text-muted-foreground">Monthly revenue from validated bookings.</p>
            </CardHeader>
            <CardContent className="pl-2">
                <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis
                            dataKey="name"
                            stroke="#888888"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis
                            stroke="#888888"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => `KSH ${value}`}
                        />
                        <Tooltip
                            cursor={{ fill: 'transparent' }}
                            formatter={(value: any) => [`KSH ${value}`, 'Revenue']}
                            contentStyle={{
                                backgroundColor: 'hsl(var(--card))',
                                border: '1px solid hsl(var(--border))',
                                borderRadius: '8px',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                            }}
                        />
                        <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} maxBarSize={40} />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}

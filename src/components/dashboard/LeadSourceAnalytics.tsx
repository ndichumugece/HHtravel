import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';

interface LeadSourceAnalyticsProps {
    data: { name: string; value: number }[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, value, name }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
        <g>
            <rect x={x - 30} y={y - 15} width={60} height={35} rx={8} ry={8} fill="white" stroke="#e2e8f0" strokeWidth={1} />
            <text x={x} y={y - 2} fill="#1e293b" textAnchor="middle" dominantBaseline="central" style={{ fontSize: '12px', fontWeight: 'bold' }}>
                {value}
            </text>
            <text x={x} y={y + 12} fill="#64748b" textAnchor="middle" dominantBaseline="central" style={{ fontSize: '10px' }}>
                {`${(percent * 100).toFixed(1)}%`}
            </text>
        </g>
    );
};

export function LeadSourceAnalytics({ data }: LeadSourceAnalyticsProps) {
    // Filter out 0 values if any, though our aggregation logic shouldn't produce them
    const validData = data.filter(item => item.value > 0);

    return (
        <Card className="col-span-3 border-none shadow-sm bg-white dark:bg-card">
            <CardHeader>
                <CardTitle className="text-lg font-bold">Lead Sources</CardTitle>
                <p className="text-sm text-muted-foreground">Traffic sources for your bookings.</p>
            </CardHeader>
            <CardContent>
                <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={validData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={renderCustomizedLabel}
                                outerRadius={120}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {validData.map((_entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend verticalAlign="top" height={36} iconType="circle" />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}

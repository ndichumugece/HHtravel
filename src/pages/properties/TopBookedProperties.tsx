import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../lib/supabase';
import { ArrowLeft, Search, Hotel, TrendingUp, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { format, subDays, subMonths, subYears, isWithinInterval, startOfDay, endOfDay } from 'date-fns';

type TimePeriod = 'week' | 'month' | 'year' | 'all';

interface PropertyStat {
    name: string;
    bookings: number;
    lastBooked?: string;
}

export default function TopBookedProperties() {
    const navigate = useNavigate();
    const [period, setPeriod] = useState<TimePeriod>('year');
    const [searchTerm, setSearchTerm] = useState('');
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('booking_vouchers')
                .select('property_name, created_at')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setBookings(data || []);
        } catch (error) {
            console.error('Error fetching bookings:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredStats = useMemo(() => {
        const now = new Date();
        let interval: { start: Date; end: Date } | null = null;

        if (period === 'week') {
            interval = { start: startOfDay(subDays(now, 6)), end: endOfDay(now) };
        } else if (period === 'month') {
            interval = { start: startOfDay(subMonths(now, 1)), end: endOfDay(now) };
        } else if (period === 'year') {
            interval = { start: startOfDay(subYears(now, 1)), end: endOfDay(now) };
        }

        const counts: Record<string, PropertyStat> = {};

        bookings.forEach(b => {
            if (!b.property_name) return;
            const date = new Date(b.created_at);
            
            if (interval && !isWithinInterval(date, interval)) return;

            if (!counts[b.property_name]) {
                counts[b.property_name] = {
                    name: b.property_name,
                    bookings: 0,
                    lastBooked: b.created_at
                };
            }
            counts[b.property_name].bookings++;
        });

        return Object.values(counts)
            .filter(stat => stat.name.toLowerCase().includes(searchTerm.toLowerCase()))
            .sort((a, b) => b.bookings - a.bookings);
    }, [bookings, period, searchTerm]);

    if (loading) return (
        <div className="flex items-center justify-center h-[calc(100vh-100px)]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
    );

    return (
        <div className="p-4 md:p-6 space-y-6 max-w-[1200px] mx-auto animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">Top Booked Properties</h1>
                        <p className="text-xs text-muted-foreground mt-1">Ranking of properties by booking volume.</p>
                    </div>
                </div>

                <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border">
                    {(['week', 'month', 'year', 'all'] as TimePeriod[]).map((p) => (
                        <button
                            key={p}
                            onClick={() => setPeriod(p)}
                            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${
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

            <Card className="border-none shadow-sm bg-white dark:bg-slate-900 overflow-hidden">
                <CardHeader className="pb-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-primary" />
                            Performance Ranking
                        </CardTitle>
                        <div className="relative w-full sm:w-72">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search property name..."
                                className="pl-9 h-10 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                        {filteredStats.length === 0 ? (
                            <div className="py-20 text-center">
                                <Hotel className="w-12 h-12 text-slate-200 dark:text-slate-800 mx-auto mb-4" />
                                <p className="text-muted-foreground">No property data found for this period.</p>
                            </div>
                        ) : (
                            filteredStats.map((stat, index) => (
                                <div 
                                    key={stat.name} 
                                    className="p-6 flex flex-col md:flex-row md:items-center gap-6 group hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                                >
                                    <div className="flex items-center gap-4 flex-1">
                                        <div className={`flex items-center justify-center w-12 h-12 rounded-2xl text-lg font-bold shadow-sm ${
                                            index === 0 ? 'bg-amber-100 text-amber-700 ring-4 ring-amber-50' : 
                                            index === 1 ? 'bg-slate-100 text-slate-700 ring-4 ring-slate-50' :
                                            index === 2 ? 'bg-orange-50 text-orange-700 ring-4 ring-orange-50' :
                                            'bg-slate-50 dark:bg-slate-800 text-slate-500'
                                        }`}>
                                            {index + 1}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <h4 className="text-base font-bold text-foreground truncate group-hover:text-primary transition-colors">
                                                    {stat.name}
                                                </h4>
                                                {index < 3 && (
                                                    <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider">
                                                        Top Performer
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-4 mt-1">
                                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                    <Calendar className="w-3.5 h-3.5" />
                                                    Last booked {stat.lastBooked ? format(new Date(stat.lastBooked), 'MMM d, yyyy') : 'N/A'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="w-full md:w-64 space-y-2">
                                        <div className="flex justify-between items-end">
                                            <div>
                                                <span className="text-xl font-black text-foreground">{stat.bookings}</span>
                                                <span className="text-[10px] uppercase tracking-wider text-muted-foreground ml-1 font-bold">Bookings</span>
                                            </div>
                                            <span className="text-xs font-bold text-muted-foreground">
                                                {Math.round((stat.bookings / (filteredStats[0]?.bookings || 1)) * 100)}%
                                            </span>
                                        </div>
                                        <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
                                            <div 
                                                className={`h-full rounded-full transition-all duration-1000 ease-out ${
                                                    index === 0 ? 'bg-primary' : 
                                                    index === 1 ? 'bg-primary/80' : 
                                                    index === 2 ? 'bg-primary/60' : 
                                                    'bg-primary/40'
                                                }`}
                                                style={{ width: `${(stat.bookings / (filteredStats[0]?.bookings || 1)) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

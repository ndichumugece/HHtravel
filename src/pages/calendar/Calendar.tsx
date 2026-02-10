import { useState, useEffect } from 'react';
import {
    format,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameMonth,
    addMonths,
    subMonths,
    addWeeks,
    subWeeks,
    isToday,
    isBefore,
    startOfDay
} from 'date-fns';
import { ChevronLeft, ChevronRight, Loader2, MapPin, Plane, Car, Bus, Plus, Train } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import type { BookingVoucher } from '../../types';
import SlideOver from '../../components/ui/SlideOver';
import BookingDetailsPanel from './BookingDetailsPanel';

export default function Calendar() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [bookings, setBookings] = useState<BookingVoucher[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedBooking, setSelectedBooking] = useState<BookingVoucher | null>(null);

    const [view, setView] = useState<'month' | 'week'>('month');

    const nextPeriod = () => {
        if (view === 'month') {
            setCurrentDate(addMonths(currentDate, 1));
        } else {
            setCurrentDate(addWeeks(currentDate, 1));
        }
    };

    const prevPeriod = () => {
        if (view === 'month') {
            setCurrentDate(subMonths(currentDate, 1));
        } else {
            setCurrentDate(subWeeks(currentDate, 1));
        }
    };

    useEffect(() => {
        fetchBookings();
    }, [currentDate, view]);

    const fetchBookings = async () => {
        setLoading(true);
        try {
            let start, end;

            if (view === 'month') {
                start = startOfMonth(currentDate);
                end = endOfMonth(currentDate);
            } else {
                start = startOfWeek(currentDate);
                end = endOfWeek(currentDate);
            }

            const startStr = format(start, 'yyyy-MM-dd');
            const endStr = format(end, 'yyyy-MM-dd');

            // Fetch bookings for the current view
            const { data, error } = await supabase
                .from('booking_vouchers')
                .select('*')
                .gte('check_in_date', startStr)
                .lte('check_in_date', endStr);

            if (error) {
                console.error('Error fetching bookings:', error);
                throw error;
            } else {
                setBookings(data || []);
            }
        } catch (error) {
            console.error('Failed to fetch bookings:', error);
        } finally {
            setLoading(false);
        }
    };

    const days = eachDayOfInterval({
        start: view === 'month' ? startOfWeek(startOfMonth(currentDate)) : startOfWeek(currentDate),
        end: view === 'month' ? endOfWeek(endOfMonth(currentDate)) : endOfWeek(currentDate)
    });

    const getDayBookings = (date: Date) => {
        // If the date is in the past (before today), don't show bookings
        if (isBefore(date, startOfDay(new Date()))) {
            return [];
        }

        const formattedDate = format(date, 'yyyy-MM-dd');
        return bookings.filter(booking => {
            const bookingDate = booking.check_in_date.split('T')[0];
            return bookingDate === formattedDate;
        });
    };

    const getTransportIcon = (mode: string | undefined) => {
        if (!mode) return null;
        const lower = mode.toLowerCase();
        if (lower.includes('flight') || lower.includes('air')) return <Plane className="h-3 w-3" />;
        if (lower.includes('transfer') || lower.includes('car') || lower.includes('taxi')) return <Car className="h-3 w-3" />;
        if (lower.includes('bus') || lower.includes('shuttle')) return <Bus className="h-3 w-3" />;
        if (lower.includes('train') || lower.includes('rail')) return <Train className="h-3 w-3" />;
        return null;
    };

    // Helper to generate consistent colors based on property name string
    const getEventColor = (str: string) => {
        const colors = [
            'bg-blue-50 text-blue-700 border-blue-100 hover:bg-blue-100',
            'bg-green-50 text-green-700 border-green-100 hover:bg-green-100',
            'bg-purple-50 text-purple-700 border-purple-100 hover:bg-purple-100',
            'bg-amber-50 text-amber-700 border-amber-100 hover:bg-amber-100',
            'bg-rose-50 text-rose-700 border-rose-100 hover:bg-rose-100',
            'bg-indigo-50 text-indigo-700 border-indigo-100 hover:bg-indigo-100',
        ];
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        return colors[Math.abs(hash) % colors.length];
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Calendar</h1>
                    <p className="text-muted-foreground mt-1">Manage bookings and track guest arrivals.</p>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                    {/* View Toggle */}
                    <div className="flex items-center bg-gray-100 rounded-lg p-1 border border-gray-200">
                        <button
                            onClick={() => setView('month')}
                            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${view === 'month'
                                ? 'bg-white text-primary shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Month
                        </button>
                        <button
                            onClick={() => setView('week')}
                            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${view === 'week'
                                ? 'bg-white text-primary shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Week
                        </button>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <div className="flex items-center bg-white rounded-lg border border-gray-200 shadow-sm p-1">
                            <button
                                onClick={prevPeriod}
                                disabled={view === 'month' ? isSameMonth(currentDate, new Date()) : isSameMonth(currentDate, new Date()) /* Simplified for week view to avoid complexity, or check if startOfWeek is in past */}
                                className="p-1.5 hover:bg-gray-50 rounded-md text-gray-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                <ChevronLeft className="h-5 w-5" />
                            </button>
                            <span className="px-3 py-1.5 text-sm font-semibold text-gray-900 border-x border-transparent mx-1 min-w-[140px] text-center select-none">
                                {view === 'month'
                                    ? format(currentDate, 'MMMM yyyy')
                                    : `${format(startOfWeek(currentDate), 'MMM d')} - ${format(endOfWeek(currentDate), 'MMM d, yyyy')}`
                                }
                            </span>
                            <button onClick={nextPeriod} className="p-1.5 hover:bg-gray-50 rounded-md text-gray-500 transition-colors">
                                <ChevronRight className="h-5 w-5" />
                            </button>
                        </div>
                        <Link
                            to="/bookings/new"
                            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm ml-auto sm:ml-0"
                        >
                            <Plus className="h-4 w-4" />
                            Add Booking
                        </Link>
                    </div>
                </div>
            </div>

            {/* Calendar Grid Container */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden min-h-[700px] flex flex-col">
                {/* Loading Overlay */}
                {loading && (
                    <div className="absolute inset-0 bg-white/60 z-50 flex items-center justify-center backdrop-blur-[2px] rounded-xl">
                        <div className="flex flex-col items-center gap-3 bg-white p-6 rounded-2xl shadow-xl border border-gray-100">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <p className="text-sm font-medium text-gray-500">Syncing calendar...</p>
                        </div>
                    </div>
                )}

                {/* Calendar Header (Month/Year & Days) */}
                <div className="border-b border-gray-200">
                    <div className="flex items-center justify-between px-6 py-4">
                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            {view === 'month' ? (
                                <>
                                    {format(currentDate, 'MMMM')}
                                    <span className="text-gray-400 font-normal">{format(currentDate, 'yyyy')}</span>
                                </>
                            ) : (
                                <>
                                    {format(startOfWeek(currentDate), 'MMM d')} - {format(endOfWeek(currentDate), 'MMM d, yyyy')}
                                </>
                            )}
                        </h2>
                    </div>
                    <div className="grid grid-cols-7 border-t border-gray-200 bg-gray-50/50">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                            <div key={day} className="py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                {day}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Days Grid */}
                <div className="grid grid-cols-7 flex-1 auto-rows-fr bg-gray-200 gap-px">
                    {days.map((day) => {
                        const dayBookings = getDayBookings(day);
                        const isCurrentMonth = isSameMonth(day, currentDate);
                        const isTodayDate = isToday(day);

                        return (
                            <div
                                key={day.toISOString()}
                                className={`bg-white p-2 relative transition-colors hover:bg-gray-50/50 flex flex-col gap-1 ${view === 'week' ? 'min-h-[500px]' : 'min-h-[140px]'
                                    } ${!isCurrentMonth && view === 'month' ? 'bg-gray-50/30' : ''}`}
                            >
                                {/* Date Number */}
                                <div className="flex justify-between items-start">
                                    <time
                                        dateTime={format(day, 'yyyy-MM-dd')}
                                        className={`flex h-7 w-7 items-center justify-center rounded-full text-sm font-medium transition-all ${isTodayDate
                                            ? 'bg-primary text-white shadow-md shadow-primary/20 transform scale-105'
                                            : isCurrentMonth ? 'text-gray-700' : 'text-gray-400'
                                            }`}
                                    >
                                        {format(day, 'd')}
                                    </time>
                                    {dayBookings.length > 0 && (
                                        <span className="text-[10px] font-medium text-gray-400 px-1.5 py-0.5 bg-gray-100 rounded-full">
                                            {dayBookings.length}
                                        </span>
                                    )}
                                </div>

                                {/* Events List */}
                                <div className="flex-1 flex flex-col gap-1.5 mt-1 overflow-y-auto custom-scrollbar pr-1">
                                    {dayBookings.map((booking) => {
                                        const colorClass = getEventColor(booking.property_name || 'default');
                                        return (
                                            <div
                                                key={booking.id}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedBooking(booking);
                                                }}
                                                className={`group flex flex-col gap-0.5 rounded-md px-2 py-1.5 text-xs border transition-all hover:shadow-md cursor-pointer relative z-10 ${colorClass}`}
                                            >
                                                <div className="flex items-center justify-between gap-1">
                                                    <span className="font-semibold truncate leading-tight">{booking.guest_name}</span>
                                                    {booking.arrival_time && (
                                                        <span className="opacity-75 text-[10px] whitespace-nowrap">{booking.arrival_time}</span>
                                                    )}
                                                </div>

                                                <div className="flex items-center gap-1 opacity-90 truncate text-[10px] pr-1">
                                                    <MapPin className="h-2.5 w-2.5 shrink-0" />
                                                    <span className="truncate">{booking.property_name}</span>
                                                </div>

                                                {(booking.mode_of_transport || booking.flight_details) && (
                                                    <div className="flex items-center gap-1 opacity-75 truncate text-[10px] mt-0.5 pt-0.5 border-t border-black/5">
                                                        {getTransportIcon(booking.mode_of_transport)}
                                                        <span className="truncate">
                                                            {booking.mode_of_transport || booking.flight_details}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* SlideOver for Booking Details */}
            <SlideOver
                open={selectedBooking !== null}
                onClose={() => setSelectedBooking(null)}
                title="Booking Details"
            >
                {selectedBooking && <BookingDetailsPanel booking={selectedBooking} />}
            </SlideOver>
        </div>
    );
}

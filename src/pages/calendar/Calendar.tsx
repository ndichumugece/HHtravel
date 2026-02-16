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
    startOfDay,
    parseISO,
    isSameDay
} from 'date-fns';
import { ChevronLeft, ChevronRight, Loader2, MapPin, Plane, Car, Bus, Plus, Train, Calendar as CalendarIcon, List as ListIcon } from 'lucide-react';
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

    const [view, setView] = useState<'month' | 'week' | 'list'>('month');

    const nextPeriod = () => {
        if (view === 'month') {
            setCurrentDate(addMonths(currentDate, 1));
        } else if (view === 'week') {
            setCurrentDate(addWeeks(currentDate, 1));
        }
        // No action for list view (shows all upcoming)
    };

    const prevPeriod = () => {
        if (view === 'month') {
            setCurrentDate(subMonths(currentDate, 1));
        } else if (view === 'week') {
            setCurrentDate(subWeeks(currentDate, 1));
        }
        // No action for list view
    };

    useEffect(() => {
        fetchBookings();
    }, [currentDate, view]);

    const fetchBookings = async () => {
        setLoading(true);
        try {
            let startStr, endStr;

            if (view === 'list') {
                // For list view, fetch from today onwards (next 6 months)
                const start = startOfDay(new Date());
                const end = addMonths(start, 6);
                startStr = format(start, 'yyyy-MM-dd');
                endStr = format(end, 'yyyy-MM-dd');
            } else {
                let start, end;
                if (view === 'month') {
                    start = startOfMonth(currentDate);
                    end = endOfMonth(currentDate);
                } else {
                    start = startOfWeek(currentDate);
                    end = endOfWeek(currentDate);
                }
                startStr = format(start, 'yyyy-MM-dd');
                endStr = format(end, 'yyyy-MM-dd');
            }

            // Fetch bookings for the current view
            const { data, error } = await supabase
                .from('booking_vouchers')
                .select('*, profiles(color, full_name)')
                .gte('check_in_date', startStr)
                .lte('check_in_date', endStr)
                .order('check_in_date', { ascending: true }); // Important for list view

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

    const days = view !== 'list' ? eachDayOfInterval({
        start: view === 'month' ? startOfWeek(startOfMonth(currentDate)) : startOfWeek(currentDate),
        end: view === 'month' ? endOfWeek(endOfMonth(currentDate)) : endOfWeek(currentDate)
    }) : [];

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

    // Helper to generate consistent colors based on profile color OR property name string fallback
    const getEventStyle = (booking: BookingVoucher) => {
        // Check for profile color first
        const profile = Array.isArray(booking.profiles) ? booking.profiles[0] : booking.profiles;
        const customColor = profile?.color;

        if (customColor) {
            return {
                style: {
                    backgroundColor: `${customColor}15`, // ~8% opacity
                    color: customColor,
                    borderColor: `${customColor}30`, // ~20% opacity
                },
                className: ''
            };
        }

        // Fallback to property hash
        const str = booking.property_name || 'default';
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
        return {
            className: colors[Math.abs(hash) % colors.length],
            style: {}
        };
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
                            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all flex items-center gap-2 ${view === 'month'
                                ? 'bg-white text-primary shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            <CalendarIcon className="h-4 w-4" />
                            <span className="hidden sm:inline">Month</span>
                        </button>
                        <button
                            onClick={() => setView('week')}
                            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all flex items-center gap-2 ${view === 'week'
                                ? 'bg-white text-primary shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            <CalendarIcon className="h-4 w-4" />
                            <span className="hidden sm:inline">Week</span>
                        </button>
                        <button
                            onClick={() => setView('list')}
                            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all flex items-center gap-2 ${view === 'list'
                                ? 'bg-white text-primary shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            <ListIcon className="h-4 w-4" />
                            <span className="hidden sm:inline">List</span>
                        </button>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        {view !== 'list' && (
                            <div className="flex items-center bg-white rounded-lg border border-gray-200 shadow-sm p-1">
                                <button
                                    onClick={prevPeriod}
                                    disabled={view === 'month' ? isSameMonth(currentDate, new Date()) : isSameMonth(currentDate, new Date())}
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
                        )}
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

            {/* Calendar/List Container */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden min-h-[500px] flex flex-col relative">
                {/* Loading Overlay */}
                {loading && (
                    <div className="absolute inset-0 bg-white/60 z-50 flex items-center justify-center backdrop-blur-[2px] rounded-xl">
                        <div className="flex flex-col items-center gap-3 bg-white p-6 rounded-2xl shadow-xl border border-gray-100">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <p className="text-sm font-medium text-gray-500">Syncing calendar...</p>
                        </div>
                    </div>
                )}

                {view === 'list' ? (
                    // List View
                    <div className="divide-y divide-gray-100">
                        {bookings.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                                <CalendarIcon className="h-12 w-12 mb-2 text-gray-300" />
                                <p>No upcoming bookings found.</p>
                            </div>
                        ) : (
                            // Group bookings by date if needed, or simple list
                            <div className="bg-white">
                                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                                    <h3 className="font-semibold text-gray-900">Upcoming Events</h3>
                                    <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded border">
                                        Next 6 Months
                                    </span>
                                </div>
                                <div className="divide-y divide-gray-100">
                                    {bookings.map((booking) => {
                                        const date = parseISO(booking.check_in_date);
                                        const isTodayEvent = isSameDay(date, new Date());
                                        const { className, style } = getEventStyle(booking);

                                        return (
                                            <div
                                                key={booking.id}
                                                onClick={() => setSelectedBooking(booking)}
                                                className={`flex items-center gap-4 p-4 hover:bg-gray-50 cursor-pointer transition-colors group ${className}`}
                                                style={style ? { ...style, borderLeftWidth: '4px' } : {}}
                                            >
                                                {/* Date Box */}
                                                <div className={`flex flex-col items-center justify-center w-14 h-14 rounded-lg border ${isTodayEvent ? 'bg-primary/10 border-primary/20 text-primary' : 'bg-gray-50 border-gray-200 text-gray-500'}`}>
                                                    <span className="text-xs font-semibold uppercase">{format(date, 'MMM')}</span>
                                                    <span className="text-xl font-bold leading-none">{format(date, 'd')}</span>
                                                </div>

                                                {/* Event Details */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="font-semibold text-gray-900 truncate">{booking.guest_name}</span>
                                                        {booking.arrival_time && (
                                                            <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                                                                {booking.arrival_time}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-3 text-sm text-gray-500">
                                                        <div className="flex items-center gap-1.5">
                                                            <MapPin className="h-3.5 w-3.5" />
                                                            <span className="truncate">{booking.property_name}</span>
                                                        </div>
                                                        {(booking.mode_of_transport || booking.flight_details) && (
                                                            <div className="flex items-center gap-1.5 border-l border-gray-200 pl-3">
                                                                {getTransportIcon(booking.mode_of_transport)}
                                                                <span className="truncate max-w-[200px]">
                                                                    {booking.mode_of_transport || booking.flight_details}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="hidden sm:block">
                                                    <ChevronRight className="h-5 w-5 text-gray-300 group-hover:text-gray-400" />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <>
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
                                                const { className, style } = getEventStyle(booking);
                                                return (
                                                    <div
                                                        key={booking.id}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setSelectedBooking(booking);
                                                        }}
                                                        className={`group flex flex-col gap-0.5 rounded-md px-2 py-1.5 text-xs border transition-all hover:shadow-md cursor-pointer relative z-10 ${className}`}
                                                        style={style}
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
                    </>
                )}
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

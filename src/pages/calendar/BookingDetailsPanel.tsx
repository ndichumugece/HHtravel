import type { BookingVoucher } from '../../types';
import { MapPin, Calendar, Users, Plane, Clock, User, Briefcase } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';

interface BookingDetailsPanelProps {
    booking: BookingVoucher;
}

export default function BookingDetailsPanel({ booking }: BookingDetailsPanelProps) {
    const formatDate = (dateStr: string) => {
        try {
            return format(new Date(dateStr), 'MMM d, yyyy');
        } catch (e) {
            return dateStr;
        }
    };

    const nights = booking.number_of_nights || (booking.check_in_date && booking.check_out_date
        ? differenceInDays(new Date(booking.check_out_date), new Date(booking.check_in_date))
        : 0);

    const roomTypeDisplay = booking.room_details?.length
        ? booking.room_details.map(r => r.room_type).filter(Boolean).join(', ')
        : booking.room_type || 'N/A';

    return (
        <div className="space-y-8 pb-10">
            {/* Header / Guest Info */}
            <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                        {booking.guest_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-gray-900">{booking.guest_name}</h3>
                        {booking.guest_nationality && (
                            <p className="text-sm text-gray-500">From {booking.guest_nationality}</p>
                        )}
                    </div>
                </div>
                <div className="mt-3 flex items-center gap-2">
                    <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${booking.status === 'cancelled'
                        ? 'bg-red-50 text-red-700 ring-red-600/10'
                        : 'bg-green-50 text-green-700 ring-green-600/10'
                        }`}>
                        {booking.status === 'cancelled' ? 'Cancelled' : 'Confirmed'}
                    </span>
                    <span className="text-xs text-gray-400">Ref: {booking.reference_number || 'N/A'}</span>
                </div>
            </div>

            {/* Stay Details */}
            <div className="border-t border-gray-100 pt-6">
                <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-4">
                    <MapPin className="h-4 w-4 text-primary" /> Stay Information
                </h4>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div>
                        <p className="text-xs font-medium text-gray-500 uppercase">Property</p>
                        <p className="text-base font-medium text-gray-900">{booking.property_name}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-xs font-medium text-gray-500 uppercase">Room Type</p>
                            <p className="text-sm text-gray-900 line-clamp-2" title={roomTypeDisplay}>{roomTypeDisplay}</p>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-gray-500 uppercase">Meal Plan</p>
                            <p className="text-sm text-gray-900">{booking.meal_plan || 'N/A'}</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-200/50">
                        <div>
                            <p className="text-xs font-medium text-gray-500 uppercase">Check In</p>
                            <div className="flex items-center gap-1.5 text-sm text-gray-900 mt-0.5">
                                <Calendar className="h-3.5 w-3.5 text-gray-400" />
                                {formatDate(booking.check_in_date)}
                            </div>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-gray-500 uppercase">Check Out</p>
                            <div className="flex items-center gap-1.5 text-sm text-gray-900 mt-0.5">
                                <Calendar className="h-3.5 w-3.5 text-gray-400" />
                                {formatDate(booking.check_out_date)}
                            </div>
                        </div>
                    </div>
                    <p className="text-xs text-right text-gray-400 italic">
                        {nights} Night{nights !== 1 ? 's' : ''}
                    </p>
                </div>
            </div>

            {/* Guest Composition */}
            <div className="border-t border-gray-100 pt-6">
                <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-4">
                    <Users className="h-4 w-4 text-primary" /> Guests & Rooms
                </h4>
                <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-white border border-gray-100 rounded-lg shadow-sm">
                        <p className="text-2xl font-bold text-gray-900">{booking.number_of_adults}</p>
                        <p className="text-xs text-gray-500">Adults</p>
                    </div>
                    <div className="text-center p-3 bg-white border border-gray-100 rounded-lg shadow-sm">
                        <p className="text-2xl font-bold text-gray-900">{booking.number_of_children}</p>
                        <p className="text-xs text-gray-500">Children</p>
                    </div>
                    <div className="text-center p-3 bg-white border border-gray-100 rounded-lg shadow-sm">
                        <p className="text-2xl font-bold text-gray-900">{booking.number_of_rooms}</p>
                        <p className="text-xs text-gray-500">Rooms</p>
                    </div>
                </div>
            </div>

            {/* Transport */}
            <div className="border-t border-gray-100 pt-6">
                <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-4">
                    <Plane className="h-4 w-4 text-primary" /> Arrival & Transport
                </h4>
                <div className="space-y-4">
                    <div className="flex items-start gap-3">
                        <Clock className="h-5 w-5 text-gray-400 mt-0.5" />
                        <div>
                            <p className="text-sm font-medium text-gray-900">Arrival Time</p>
                            <p className="text-sm text-gray-600">{booking.arrival_time || 'Not specified'}</p>
                        </div>
                    </div>
                    {(booking.mode_of_transport || booking.flight_details) && (
                        <div className="flex items-start gap-3">
                            <Briefcase className="h-5 w-5 text-gray-400 mt-0.5" />
                            <div>
                                <p className="text-sm font-medium text-gray-900">Transport Details</p>
                                <p className="text-sm text-gray-600">{booking.mode_of_transport}</p>
                                {booking.flight_details && (
                                    <p className="text-sm text-gray-500">{booking.flight_details}</p>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>



            {/* Driver Contact */}
            {booking.driver_contact && (
                <div className="border-t border-gray-100 pt-6">
                    <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-4">
                        <User className="h-4 w-4 text-primary" /> Driver Contact
                    </h4>
                    <p className="text-sm text-gray-600">{booking.driver_contact}</p>
                </div>
            )}
        </div>
    );
}

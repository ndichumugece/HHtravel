import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, useWatch } from 'react-hook-form';
import { supabase } from '../../lib/supabase';
import type { Property, BookingVoucher, CompanySettings } from '../../types';
import { PDFDownloadLink } from '@react-pdf/renderer';
import BookingPDF from '../../components/pdf/BookingPDF';
import { ArrowLeft, Save, FileDown, Loader2, Eye, Plus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { AddPropertyModal } from '../../components/properties/AddPropertyModal';
import { Input } from '../../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { format } from 'date-fns';
import QRCode from 'qrcode';

const AIRLINES = [
    "Jambojet",
    "Safarilink",
    "Airkenya",
    "Kenya Airways",
    "Governor's Aviation",
    "Fly ALS",
    "Skyward Airline",
    "Precision Air",
    "Auric Air",
    "Flight Link",
    "Regional Air",
    "Air Tanzania",
    "Mombasa Air",
    "Scenic Air Safaris"
];

const LEAD_SOURCES = [
    'TikTok',
    'Instagram',
    'Facebook',
    'Website',
    'Twitter/X',
    'Referral',
    'Other'
];


export default function BookingForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [properties, setProperties] = useState<Property[]>([]);
    const [settings, setSettings] = useState<CompanySettings>();
    const [loading, setLoading] = useState(false);
    const isEditMode = !!id;
    const [isPropertyModalOpen, setIsPropertyModalOpen] = useState(false);

    // Dynamic Options State
    const [mealPlans, setMealPlans] = useState<{ id: string, name: string }[]>([]);
    const [roomTypes, setRoomTypes] = useState<{ id: string, name: string }[]>([]); // For the dynamic rows
    const [bedTypes, setBedTypes] = useState<{ id: string, name: string }[]>([]);
    const [qrCodeUrl, setQrCodeUrl] = useState<string>('');

    // Room Details State
    const [roomDetails, setRoomDetails] = useState<{ id: string, room_type: string, bed_type: string, adults: number, children: number, child_ages?: number[] }[]>([
        { id: '1', room_type: '', bed_type: '', adults: 2, children: 0, child_ages: [] }
    ]);

    const { register, handleSubmit, setValue, control } = useForm<Partial<BookingVoucher>>({
        defaultValues: {
            status: 'issued',
            number_of_rooms: 1,
            number_of_adults: 2,
            number_of_children: 0
        }
    });

    const formValues = useWatch({ control });

    useEffect(() => {
        fetchProperties();
        fetchSettings();
        fetchDynamicOptions();
        if (id) {
            fetchVoucher(id);
            // Generate QR Code for the specific booking URL
            // Ensure we use the production domain
            const productionUrl = `https://portal.hhtravel.co${window.location.pathname}`;
            QRCode.toDataURL(productionUrl)
                .then(url => setQrCodeUrl(url))
                .catch(err => console.error('QR Code error', err));
        } else if (user) {
            fetchUserProfile(user.id);
            generateReference();
        }
    }, [id, user]);

    useEffect(() => {
        const count = parseInt(String(formValues.number_of_rooms || 0), 10);
        if (count > 0 && count !== roomDetails.length) {
            setRoomDetails(prev => {
                if (count > prev.length) {
                    const newRooms = Array(count - prev.length).fill(null).map(() => ({
                        id: crypto.randomUUID(),
                        room_type: '',
                        bed_type: '',
                        adults: 2,
                        children: 0,
                        child_ages: []
                    }));
                    return [...prev, ...newRooms];
                } else {
                    return prev.slice(0, count);
                }
            });
        }
    }, [formValues.number_of_rooms]);

    // Auto-set flight/train date to check-in date if not set (Arrival)
    useEffect(() => {
        if ((formValues.mode_of_transport === 'Flying' || formValues.mode_of_transport === 'Train') && formValues.check_in_date && !formValues.flight_arrival_date) {
            setValue('flight_arrival_date', formValues.check_in_date);
        }
    }, [formValues.mode_of_transport, formValues.check_in_date, formValues.flight_arrival_date, setValue]);

    // Auto-set flight/train date to check-out date if not set (Departure)
    useEffect(() => {
        if ((formValues.departure_mode_of_transport === 'Flying' || formValues.departure_mode_of_transport === 'Train') && formValues.check_out_date && !formValues.flight_departure_date) {
            setValue('flight_departure_date', formValues.check_out_date);
        }
    }, [formValues.departure_mode_of_transport, formValues.check_out_date, formValues.flight_departure_date, setValue]);

    const fetchDynamicOptions = async () => {
        const { data: meals } = await supabase.from('meal_plans').select('id, name').order('name');
        if (meals) setMealPlans(meals);

        // Fetch room types for the dynamic rows
        const { data: rooms } = await supabase.from('room_types').select('id, name').order('name');
        if (rooms) setRoomTypes(rooms);

        const { data: beds } = await supabase.from('bed_types').select('id, name').order('name');
        if (beds) setBedTypes(beds);
    };

    const generateReference = () => {
        const random = Math.floor(1000 + Math.random() * 9000);
        setValue('reference_number', `BV-${random}`);
    };

    const fetchProperties = async () => {
        const { data } = await supabase.from('properties').select('*').order('name');
        setProperties(data || []);
    };

    const fetchSettings = async () => {
        const { data } = await supabase.from('company_settings').select('*').single();
        if (data) setSettings(data);
    };

    const fetchUserProfile = async (userId: string) => {
        const { data } = await supabase.from('profiles').select('full_name').eq('id', userId).single();
        if (data && data.full_name) {
            setValue('profiles', { full_name: data.full_name });
        }
    };

    const fetchVoucher = async (voucherId: string) => {
        const { data } = await supabase.from('booking_vouchers').select('*, profiles:consultant_id(full_name)').eq('id', voucherId).single();
        if (data) {
            Object.entries(data).forEach(([key, value]) => {
                setValue(key as any, value);
            });
            if (data.room_details && Array.isArray(data.room_details)) {
                setRoomDetails(data.room_details);
            }
        }
    };

    const onSubmit = async (data: Partial<BookingVoucher>) => {
        setLoading(true);
        try {
            const payload = {
                ...data,
                consultant_id: user?.id,
                room_details: roomDetails,
            };

            // Remove joined fields that are not columns in the booking_vouchers table
            delete (payload as any).profiles;

            if (isEditMode && id) {
                const { error } = await supabase.from('booking_vouchers').update(payload).eq('id', id);
                if (error) throw error;
                // Optional: fetchVoucher(id); // The form data is already local, usually no need to re-fetch immediately unless triggers change data
                alert('Voucher updated successfully');
            } else {
                const { data: newVoucher, error } = await supabase.from('booking_vouchers').insert(payload).select().single();
                if (error) throw error;
                if (newVoucher) {
                    navigate(`/bookings/${newVoucher.id}/edit`, { replace: true });
                    alert('Voucher created successfully');
                }
            }
        } catch (error) {
            console.error('Error saving voucher:', error);
            alert('Failed to save voucher');
        } finally {
            setLoading(false);
        }
    };

    const getVoucherFileName = () => {
        if (!formValues.reference_number) return 'voucher.pdf';

        const parts = [
            formValues.reference_number,
            formValues.guest_name || 'Guest',
        ];

        // Add formatted dates
        if (formValues.check_in_date && formValues.check_out_date) {
            try {
                const checkIn = new Date(formValues.check_in_date);
                const checkOut = new Date(formValues.check_out_date);

                // Format: 15th-16th January
                const startDay = format(checkIn, 'do');
                const endDay = format(checkOut, 'do');
                const month = format(checkIn, 'MMMM');

                // If months are different, include both: 30th Jan-2nd Feb
                if (checkIn.getMonth() !== checkOut.getMonth()) {
                    const endMonth = format(checkOut, 'MMMM');
                    parts.push(`${startDay} ${month}-${endDay} ${endMonth}`);
                } else {
                    parts.push(`${startDay}-${endDay} ${month}`);
                }
            } catch (e) {
                // Fallback if date parsing fails
                parts.push('Dates');
            }
        }

        if (formValues.property_name) {
            parts.push(formValues.property_name);
        }

        // Clean up filename (remove illegal chars) and join
        return `${parts.join('-')}.pdf`.replace(/[^a-zA-Z0-9\-\.\s]/g, '');
    };

    return (
        <div className="max-w-5xl mx-auto pb-20 space-y-6">
            {/* Header */}
            {/* Header */}
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 border-b pb-4">
                <div className="flex items-center space-x-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate('/bookings')}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">
                            {isEditMode ? 'Edit Voucher' : 'New Booking'}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            {isEditMode ? `Ref: ${formValues.reference_number}` : 'Create a new reservation voucher'}
                        </p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto">
                    <Button
                        variant="outline"
                        onClick={async () => {
                            const { pdf } = await import('@react-pdf/renderer');
                            const blob = await pdf(
                                <BookingPDF voucher={formValues as BookingVoucher} settings={settings} qrCodeUrl={qrCodeUrl} />
                            ).toBlob();
                            const url = URL.createObjectURL(blob);
                            window.open(url, '_blank');
                        }}
                        className="w-full sm:w-auto"
                    >
                        <Eye className="h-4 w-4 mr-2" />
                        Preview PDF
                    </Button>
                    <PDFDownloadLink
                        document={<BookingPDF voucher={formValues as BookingVoucher} settings={settings} qrCodeUrl={qrCodeUrl} />}
                        fileName={getVoucherFileName()}
                        className="w-full sm:w-auto"
                    >
                        {({ loading: pdfLoading }) => (
                            <Button variant="outline" disabled={pdfLoading} className="w-full sm:w-auto">
                                {pdfLoading ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                    <FileDown className="h-4 w-4 mr-2" />
                                )}
                                Download PDF
                            </Button>
                        )}
                    </PDFDownloadLink>
                    <Button onClick={handleSubmit(onSubmit)} disabled={loading} className="w-full sm:w-auto">
                        {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        {!loading && <Save className="h-4 w-4 mr-2" />}
                        Save Voucher
                    </Button>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Column */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Guest Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Guest Information</CardTitle>
                            <CardDescription>Primary contact details for the reservation.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-6 sm:grid-cols-2">
                            <div className="col-span-2">
                                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Guest Name</label>
                                <Input {...register('guest_name', { required: true })} className="mt-2" placeholder="e.g. John Doe" />
                            </div>
                            <div>
                                <label className="text-sm font-medium leading-none">Nationality</label>
                                <select
                                    {...register('guest_nationality')}
                                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-2"
                                >
                                    <option value="">Select Nationality</option>
                                    <option value="Resident">Resident</option>
                                    <option value="East Africa Resident">East Africa Resident</option>
                                    <option value="Non-resident">Non-resident</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-sm font-medium leading-none">Contact Info</label>
                                <Input {...register('guest_contact')} className="mt-2" placeholder="Phone or Email" />
                            </div>
                            <div className="col-span-2">
                                <label className="text-sm font-medium leading-none">Additional Guest Information</label>
                                <textarea
                                    {...register('additional_guest_info')}
                                    rows={3}
                                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-2"
                                    placeholder="Any additional details about the guest..."
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Stay Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Stay Details</CardTitle>
                            <CardDescription>Property, dates, and room configuration.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-6 sm:grid-cols-2">
                            <div className="col-span-2">
                                <label className="text-sm font-medium leading-none">Property</label>
                                <div className="flex gap-2 items-center mt-2">
                                    <select
                                        {...register('property_name', { required: true })}
                                        className="flex h-10 flex-1 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        <option value="">Select a property</option>
                                        {formValues.property_name && !properties.some(p => p.name === formValues.property_name) && (
                                            <option value={formValues.property_name}>{formValues.property_name}</option>
                                        )}
                                        {properties.map(p => (
                                            <option key={p.id} value={p.name}>{p.name}</option>
                                        ))}
                                    </select>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        className="shrink-0"
                                        onClick={() => setIsPropertyModalOpen(true)}
                                        title="Add New Property"
                                    >
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 col-span-2">
                                <div>
                                    <label className="text-sm font-medium leading-none">Check In</label>
                                    <Input type="date" {...register('check_in_date', { required: true })} className="mt-2" />
                                </div>
                                <div>
                                    <label className="text-sm font-medium leading-none">Check Out</label>
                                    <Input type="date" {...register('check_out_date', { required: true })} className="mt-2" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 col-span-2">
                                <div>
                                    <label className="text-sm font-medium leading-none">Package Type</label>
                                    <select
                                        {...register('package_type')}
                                        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-2"
                                    >
                                        <option value="">Select Package Type</option>
                                        <option value="Full Board">Full Board</option>
                                        <option value="Ground Package">Ground Package</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm font-medium leading-none">Meal Plan</label>
                                    <select
                                        {...register('meal_plan')}
                                        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-2"
                                    >
                                        <option value="">Select Meal Plan</option>
                                        {mealPlans.map(mp => (
                                            <option key={mp.id} value={mp.name}>{mp.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="col-span-2">
                                <div>
                                    <label className="text-sm font-medium leading-none">Number of Rooms</label>
                                    <Input type="number" {...register('number_of_rooms')} className="mt-2" placeholder="e.g. 1" min={1} />
                                </div>
                            </div>

                            {/* Dynamic Room Details Rows */}
                            <div className="col-span-2 space-y-4 pt-4 border-t mt-4">
                                <label className="text-sm font-semibold">Room Configuration</label>
                                {roomDetails.map((room, index) => (
                                    <div key={room.id} className="p-4 border rounded-lg bg-muted/20 relative space-y-4">
                                        <div className="absolute top-2 right-2 text-xs font-bold text-muted-foreground bg-muted px-2 py-1 rounded w-6 h-6 flex items-center justify-center">
                                            {index + 1}
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                                            {/* 1. Room Type */}
                                            <div className="md:col-span-1">
                                                <label className="text-sm font-medium leading-none">Room Type</label>
                                                <select
                                                    value={room.room_type}
                                                    onChange={(e) => {
                                                        const newDetails = [...roomDetails];
                                                        newDetails[index].room_type = e.target.value;
                                                        setRoomDetails(newDetails);
                                                    }}
                                                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 mt-2"
                                                >
                                                    <option value="">Select Room Type</option>
                                                    {roomTypes.map(rt => (
                                                        <option key={rt.id} value={rt.name}>{rt.name}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            {/* 2. Adults */}
                                            <div className="flex flex-col items-center justify-center border p-2 rounded bg-background h-full">
                                                <span className="text-sm font-medium mb-1">Adults</span>
                                                <div className="flex items-center gap-2">
                                                    <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={() => {
                                                        const newDetails = [...roomDetails];
                                                        if (newDetails[index].adults > 0) newDetails[index].adults--;
                                                        setRoomDetails(newDetails);
                                                    }}>-</Button>
                                                    <span className="w-4 text-center">{room.adults}</span>
                                                    <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={() => {
                                                        const newDetails = [...roomDetails];
                                                        newDetails[index].adults++;
                                                        setRoomDetails(newDetails);
                                                    }}>+</Button>
                                                </div>
                                            </div>

                                            {/* 3. Children */}
                                            <div className="flex flex-col items-center justify-center border p-2 rounded bg-background h-full">
                                                <span className="text-sm font-medium mb-1">Children</span>
                                                <div className="flex items-center gap-2">
                                                    <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={() => {
                                                        const newDetails = [...roomDetails];
                                                        if (newDetails[index].children > 0) {
                                                            newDetails[index].children--;
                                                            // Remove last age slot
                                                            const currentAges = newDetails[index].child_ages || [];
                                                            newDetails[index].child_ages = currentAges.slice(0, -1);
                                                            setRoomDetails(newDetails);
                                                        }
                                                    }}>-</Button>
                                                    <span className="w-4 text-center">{room.children}</span>
                                                    <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={() => {
                                                        const newDetails = [...roomDetails];
                                                        newDetails[index].children++;
                                                        // Add age slot (default 0 or empty)
                                                        const currentAges = newDetails[index].child_ages || [];
                                                        newDetails[index].child_ages = [...currentAges, 0];
                                                        setRoomDetails(newDetails);
                                                    }}>+</Button>
                                                </div>
                                            </div>

                                            {/* 4. Bed Type */}
                                            <div className="md:col-span-1">
                                                <label className="text-sm font-medium leading-none">Bed Type</label>
                                                <select
                                                    value={room.bed_type}
                                                    onChange={(e) => {
                                                        const newDetails = [...roomDetails];
                                                        newDetails[index].bed_type = e.target.value;
                                                        setRoomDetails(newDetails);
                                                    }}
                                                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 mt-2"
                                                >
                                                    <option value="">Select Bed Type</option>
                                                    {bedTypes.map(bt => (
                                                        <option key={bt.id} value={bt.name}>{bt.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        {/* Child Ages Section */}
                                        {room.children > 0 && (
                                            <div className="w-full pt-2">
                                                <div className="text-center mb-2">
                                                    <em className="text-muted-foreground">Child age at time of travel</em>
                                                </div>
                                                <div className="flex flex-wrap gap-4 justify-center">
                                                    {(room.child_ages || []).map((age, ageIndex) => (
                                                        <select
                                                            key={ageIndex}
                                                            value={age || ''}
                                                            onChange={(e) => {
                                                                const newDetails = [...roomDetails];
                                                                const newAges = [...(newDetails[index].child_ages || [])];
                                                                newAges[ageIndex] = parseInt(e.target.value, 10);
                                                                newDetails[index].child_ages = newAges;
                                                                setRoomDetails(newDetails);
                                                            }}
                                                            className="flex h-10 px-3 py-2 bg-background border border-input rounded-md text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-red-300"
                                                        >
                                                            <option value="">Select Child {ageIndex + 1} Age</option>
                                                            {Array.from({ length: 18 }, (_, i) => i).map((num) => (
                                                                <option key={num} value={num}>{num} yrs</option>
                                                            ))}
                                                        </select>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                        </CardContent>
                    </Card>

                    {/* Transport Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Transport Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-8">
                            {/* Arrival Section */}
                            <div>
                                <h3 className="text-sm font-semibold mb-4">Arrival Transfer</h3>
                                <div className="grid gap-6 sm:grid-cols-2">
                                    <div className="sm:col-span-2">
                                        <label className="text-sm font-medium leading-none">Mode of Transport</label>
                                        <select
                                            {...register('mode_of_transport')}
                                            className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-2"
                                        >
                                            <option value="">Select Transport</option>
                                            <option value="Self Drive">Self Drive</option>
                                            <option value="Train">Train</option>
                                            <option value="Flying">Flying</option>
                                            <option value="H&H Road Package">H&H Road Package</option>
                                        </select>
                                    </div>

                                    {formValues.mode_of_transport === 'Flying' && (
                                        <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
                                            <div>
                                                <label className="text-sm font-medium leading-none">Airline</label>
                                                <select
                                                    {...register('airline')}
                                                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-2"
                                                >
                                                    <option value="">Select Airline</option>
                                                    {AIRLINES.map(airline => (
                                                        <option key={airline} value={airline}>{airline}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium leading-none">Date</label>
                                                <Input type="date" {...register('flight_arrival_date')} className="mt-2" />
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium leading-none">Estimate Arrival Time (EAT)</label>
                                                <Input type="time" {...register('arrival_time')} className="mt-2" />
                                            </div>
                                        </div>
                                    )}

                                    {formValues.mode_of_transport === 'Train' && (
                                        <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
                                            <div>
                                                <label className="text-sm font-medium leading-none">Train</label>
                                                <div className="mt-2 flex h-10 w-full items-center rounded-md border border-input bg-muted px-3 py-2 text-sm text-muted-foreground cursor-not-allowed">
                                                    Madaraka Express
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium leading-none">Date</label>
                                                <Input type="date" {...register('flight_arrival_date')} className="mt-2" />
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium leading-none">Estimate Arrival Time (EAT)</label>
                                                <Input type="time" {...register('arrival_time')} className="mt-2" />
                                            </div>
                                        </div>
                                    )}

                                    {(formValues.mode_of_transport === 'Self Drive' || formValues.mode_of_transport === 'H&H Road Package') && (
                                        <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-sm font-medium leading-none">Estimate Arrival Time (EAT)</label>
                                                <Input type="time" {...register('arrival_time')} className="mt-2" />
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium leading-none">Contact Person</label>
                                                <Input type="text" {...register('driver_contact')} placeholder="Client/Driver Number" className="mt-2" />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Departure Section */}
                            <div>
                                <h3 className="text-sm font-semibold mb-4">Departure Transfer</h3>
                                <div className="grid gap-6 sm:grid-cols-2">
                                    <div className="sm:col-span-2">
                                        <label className="text-sm font-medium leading-none">Mode of Transport</label>
                                        <select
                                            {...register('departure_mode_of_transport')}
                                            className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-2"
                                        >
                                            <option value="">Select Transport</option>
                                            <option value="Self Drive">Self Drive</option>
                                            <option value="Train">Train</option>
                                            <option value="Flying">Flying</option>
                                            <option value="H&H Road Package">H&H Road Package</option>
                                        </select>
                                    </div>

                                    {formValues.departure_mode_of_transport === 'Flying' && (
                                        <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
                                            <div>
                                                <label className="text-sm font-medium leading-none">Airline</label>
                                                <select
                                                    {...register('departure_airline')}
                                                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-2"
                                                >
                                                    <option value="">Select Airline</option>
                                                    {AIRLINES.map(airline => (
                                                        <option key={airline} value={airline}>{airline}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium leading-none">Date</label>
                                                <Input type="date" {...register('flight_departure_date')} className="mt-2" />
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium leading-none">Estimate Departure Time (EDT)</label>
                                                <Input type="time" {...register('departure_time')} className="mt-2" />
                                            </div>
                                        </div>
                                    )}

                                    {formValues.departure_mode_of_transport === 'Train' && (
                                        <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
                                            <div>
                                                <label className="text-sm font-medium leading-none">Train</label>
                                                <div className="mt-2 flex h-10 w-full items-center rounded-md border border-input bg-muted px-3 py-2 text-sm text-muted-foreground cursor-not-allowed">
                                                    Madaraka Express
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium leading-none">Date</label>
                                                <Input type="date" {...register('flight_departure_date')} className="mt-2" />
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium leading-none">Estimate Departure Time (EDT)</label>
                                                <Input type="time" {...register('departure_time')} className="mt-2" />
                                            </div>
                                        </div>
                                    )}

                                    {(formValues.departure_mode_of_transport === 'Self Drive' || formValues.departure_mode_of_transport === 'H&H Road Package') && (
                                        <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-sm font-medium leading-none">Estimate Departure Time (EDT)</label>
                                                <Input type="time" {...register('departure_time')} className="mt-2" />
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium leading-none">Contact Person</label>
                                                <Input type="text" {...register('driver_contact')} placeholder="Client/Driver Number" className="mt-2" />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Special Transport Note */}
                            <div className="mt-6">
                                <label className="text-sm font-medium leading-none">Special Transport Note</label>
                                <textarea
                                    {...register('special_transport_note')}
                                    rows={3}
                                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-2"
                                    placeholder="Add any special instructions or notes for transport..."
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Additional Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Additional Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="text-sm font-medium leading-none">Dietary Requests</label>
                                <textarea
                                    {...register('dietary_requirements')}
                                    rows={3}
                                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-2"
                                    placeholder="Vegetarian, Gluten-free, Allergies, etc."
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium leading-none">Special Requests</label>
                                <textarea
                                    {...register('special_requests')}
                                    rows={2}
                                    className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-2"
                                    placeholder="Occasion, Room preference, etc."
                                />
                            </div>
                        </CardContent>
                    </Card >
                </div >

                {/* Sidebar Column */}
                < div className="space-y-6" >
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Voucher Settings</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="text-sm font-medium leading-none text-muted-foreground">Reference</label>
                                <div className="mt-1.5 font-mono text-sm bg-muted/40 p-2 rounded border">{formValues.reference_number || '...'}</div>
                            </div>
                            <div>
                                <label className="text-sm font-medium leading-none">Status</label>
                                <select
                                    {...register('status')}
                                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-2"
                                >
                                    <option value="issued">Issued</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Internal Details</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div>
                                <label className="text-sm font-medium leading-none">Quotation Price (KSH)</label>
                                <Input
                                    type="number"
                                    {...register('quotation_price')}
                                    className="mt-2"
                                    placeholder="e.g. 50000"
                                />
                                <p className="text-xs text-muted-foreground mt-1">
                                    For analytics only. Hidden from PDF.
                                </p>
                            </div>
                            <div className="mt-4">
                                <label className="text-sm font-medium leading-none">Lead Source</label>
                                <select
                                    {...register('lead_source')}
                                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-2"
                                >
                                    <option value="">Select Source</option>
                                    {LEAD_SOURCES.map(source => (
                                        <option key={source} value={source}>{source}</option>
                                    ))}
                                </select>
                            </div>
                        </CardContent>
                    </Card>
                </div >
            </form >

            <AddPropertyModal
                isOpen={isPropertyModalOpen}
                onClose={() => setIsPropertyModalOpen(false)}
                onSuccess={(newProperty) => {
                    setProperties(prev => [...prev, newProperty].sort((a, b) => a.name.localeCompare(b.name)));
                    setValue('property_name', newProperty.name);
                }}
            />
        </div >
    );
}

import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, useWatch } from 'react-hook-form';
import { supabase } from '../../lib/supabase';
import type { Property, BookingVoucher, CompanySettings } from '../../types';
import { PDFDownloadLink, BlobProvider } from '@react-pdf/renderer';
import BookingPDF from '../../components/pdf/BookingPDF';
import { ArrowLeft, Save, FileDown, Loader2, Eye } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { format } from 'date-fns';

export default function BookingForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [properties, setProperties] = useState<Property[]>([]);
    const [settings, setSettings] = useState<CompanySettings>();
    const [loading, setLoading] = useState(false);
    const [isEditMode] = useState(!!id);

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
        if (id) {
            fetchVoucher(id);
        } else {
            generateReference();
        }
    }, [id]);

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

    const fetchVoucher = async (voucherId: string) => {
        const { data } = await supabase.from('booking_vouchers').select('*').eq('id', voucherId).single();
        if (data) {
            Object.entries(data).forEach(([key, value]) => {
                setValue(key as any, value);
            });
        }
    };

    const onSubmit = async (data: Partial<BookingVoucher>) => {
        setLoading(true);
        try {
            const payload = {
                ...data,
                consultant_id: user?.id
            };

            if (isEditMode && id) {
                const { error } = await supabase.from('booking_vouchers').update(payload).eq('id', id);
                if (error) throw error;
            } else {
                const { error } = await supabase.from('booking_vouchers').insert(payload);
                if (error) throw error;
            }
            navigate('/bookings');
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
                    {(() => {
                        const selectedProperty = properties.find(p => p.name === formValues.property_name);
                        return (
                            <>
                                <BlobProvider document={<BookingPDF voucher={formValues as BookingVoucher} settings={settings} property={selectedProperty} />}>
                                    {({ url, loading: pdfLoading }) => (
                                        <Button
                                            variant="outline"
                                            disabled={pdfLoading}
                                            onClick={() => url && window.open(url, '_blank')}
                                            className="w-full sm:w-auto"
                                        >
                                            {pdfLoading ? (
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            ) : (
                                                <Eye className="h-4 w-4 mr-2" />
                                            )}
                                            Preview PDF
                                        </Button>
                                    )}
                                </BlobProvider>
                                <PDFDownloadLink
                                    document={<BookingPDF voucher={formValues as BookingVoucher} settings={settings} property={selectedProperty} />}
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
                            </>
                        );
                    })()}
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
                                <Input {...register('guest_nationality')} className="mt-2" placeholder="e.g. American" />
                            </div>
                            <div>
                                <label className="text-sm font-medium leading-none">Contact Info</label>
                                <Input {...register('guest_contact')} className="mt-2" placeholder="Phone or Email" />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Stay Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Stay Details</CardTitle>
                            <CardDescription>Property, dates, and room configuration.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-6 is-grid-cols-2">
                            <div className="col-span-2">
                                <label className="text-sm font-medium leading-none">Property</label>
                                <select
                                    {...register('property_name', { required: true })}
                                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-2"
                                    onChange={(e) => setValue('property_name', e.target.value)}
                                >
                                    <option value="">Select a property</option>
                                    {properties.map(p => (
                                        <option key={p.id} value={p.name}>{p.name}</option>
                                    ))}
                                </select>
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
                                    <label className="text-sm font-medium leading-none">Room Type</label>
                                    <Input {...register('room_type')} className="mt-2" placeholder="e.g. Deluxe Room" />
                                </div>
                                <div>
                                    <label className="text-sm font-medium leading-none">Meal Plan</label>
                                    <Input {...register('meal_plan')} className="mt-2" placeholder="e.g. Full Board" />
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4 col-span-2">
                                <div>
                                    <label className="text-sm font-medium leading-none">Rooms</label>
                                    <Input type="number" {...register('number_of_rooms')} className="mt-2" />
                                </div>
                                <div>
                                    <label className="text-sm font-medium leading-none">Adults</label>
                                    <Input type="number" {...register('number_of_adults')} className="mt-2" />
                                </div>
                                <div>
                                    <label className="text-sm font-medium leading-none">Children</label>
                                    <Input type="number" {...register('number_of_children')} className="mt-2" />
                                </div>
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
                                <label className="text-sm font-medium leading-none">Special Requests</label>
                                <textarea
                                    {...register('special_requests')}
                                    rows={3}
                                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-2"
                                    placeholder="Dietary requirements, occasion, etc."
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium leading-none">Flight Details</label>
                                <textarea
                                    {...register('flight_details')}
                                    rows={2}
                                    className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-2"
                                    placeholder="Arrival/Departure times and flight numbers"
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar Column */}
                <div className="space-y-6">
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
                </div>
            </form>
        </div>
    );
}

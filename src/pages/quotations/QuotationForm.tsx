import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import { supabase } from '../../lib/supabase';
import type { Property, QuotationVoucher, CompanySettings } from '../../types';
import { PDFDownloadLink, BlobProvider } from '@react-pdf/renderer';
import QuotationPDF from '../../components/pdf/QuotationPDF';
import { ArrowLeft, Save, FileDown, Plus, Trash2, Loader2, Eye } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';

export default function QuotationForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [properties, setProperties] = useState<Property[]>([]);
    const [settings, setSettings] = useState<CompanySettings>();
    const [loading, setLoading] = useState(false);
    const [isEditMode] = useState(!!id);

    const { register, handleSubmit, control, setValue } = useForm<Partial<QuotationVoucher>>({
        defaultValues: {
            booking_status: 'Tentative',
            hotel_comparison: [{ property_name: '', meal_plan: '', single_price: '', double_price: '' }],
            // Pre-fill terms if needed
            terms_and_conditions: "1. Rates are subject to availability.\n2. Standard cancellation policy applies.\n3. Payment due 14 days before travel."
        }
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "hotel_comparison",
    });

    // Watch for PDF
    const formValues = useWatch({ control });

    useEffect(() => {
        fetchProperties();
        fetchSettings();
        if (id) {
            fetchQuotation(id);
        } else {
            generateReference();
        }
    }, [id]);

    const generateReference = () => {
        const random = Math.floor(1000 + Math.random() * 9000);
        setValue('reference_number', `QV-${random}`);
    };

    const fetchProperties = async () => {
        const { data } = await supabase.from('properties').select('*').order('name');
        setProperties(data || []);
    };

    const fetchSettings = async () => {
        const { data } = await supabase.from('company_settings').select('*').single();
        if (data) setSettings(data);
    };

    const fetchQuotation = async (quoteId: string) => {
        const { data } = await supabase.from('quotation_vouchers').select('*').eq('id', quoteId).single();
        if (data) {
            Object.entries(data).forEach(([key, value]) => {
                setValue(key as any, value);
            });
        }
    };

    const onSubmit = async (data: Partial<QuotationVoucher>) => {
        setLoading(true);
        try {
            const payload = {
                ...data,
                consultant_id: user?.id
            };

            if (isEditMode && id) {
                const { error } = await supabase.from('quotation_vouchers').update(payload).eq('id', id);
                if (error) throw error;
            } else {
                const { error } = await supabase.from('quotation_vouchers').insert(payload);
                if (error) throw error;
            }
            navigate('/quotations');
        } catch (error) {
            console.error('Error saving quotation:', error);
            alert('Failed to save quotation');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto pb-20 space-y-6">
            {/* Header */}
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 border-b pb-4">
                <div className="flex items-center space-x-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate('/quotations')}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">
                            {isEditMode ? 'Edit Quotation' : 'New Quotation'}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            {isEditMode ? `Ref: ${formValues.reference_number}` : 'Create a new travel quotation'}
                        </p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto">
                    <BlobProvider document={<QuotationPDF voucher={formValues as QuotationVoucher} settings={settings} />}>
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
                        document={<QuotationPDF voucher={formValues as QuotationVoucher} settings={settings} />}
                        fileName={`${formValues.reference_number || 'quotation'}.pdf`}
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
                        Save Quotation
                    </Button>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Column */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Client Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Client Details</CardTitle>
                            <CardDescription>Primary client information for this quote.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-6 sm:grid-cols-2">
                            <div className="col-span-2">
                                <label className="text-sm font-medium leading-none">Client Name</label>
                                <Input {...register('client_name', { required: true })} className="mt-2" placeholder="e.g. Jane Smith" />
                            </div>
                            <div>
                                <label className="text-sm font-medium leading-none">Package Type</label>
                                <Input {...register('package_type')} className="mt-2" placeholder="e.g. Honeymoon Special" />
                            </div>
                            <div>
                                <label className="text-sm font-medium leading-none">Guests</label>
                                <Input {...register('number_of_guests')} className="mt-2" placeholder="e.g. 2 Adults, 1 Child" />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Stay Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Stay Information</CardTitle>
                            <CardDescription>Proposed travel dates.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-6 sm:grid-cols-3">
                            <div>
                                <label className="text-sm font-medium leading-none">Check In</label>
                                <Input type="date" {...register('check_in_date')} className="mt-2" />
                            </div>
                            <div>
                                <label className="text-sm font-medium leading-none">Check Out</label>
                                <Input type="date" {...register('check_out_date')} className="mt-2" />
                            </div>
                            <div>
                                <label className="text-sm font-medium leading-none">Nights</label>
                                <Input type="number" {...register('number_of_nights')} className="mt-2" />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Hotel Comparison */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0">
                            <div>
                                <CardTitle>Hotel Comparison</CardTitle>
                                <CardDescription className="mt-1.5">Add multiple property options for the client to review.</CardDescription>
                            </div>
                            <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                onClick={() => append({ property_name: '', meal_plan: '', single_price: '', double_price: '' })}
                            >
                                <Plus className="h-3.5 w-3.5 mr-2" /> Add Option
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {fields.map((item, index) => (
                                <div key={item.id} className="relative grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-lg bg-muted/30 border border-border/50 transition-all hover:bg-muted/50">
                                    <div className="md:col-span-2 flex justify-between items-start">
                                        <label className="text-xs font-semibold uppercase text-muted-foreground tracking-wider mb-1">Option {index + 1}</label>
                                        <button
                                            type="button"
                                            onClick={() => remove(index)}
                                            className="text-muted-foreground hover:text-destructive transition-colors p-1"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="text-sm font-medium leading-none">Property</label>
                                        <select
                                            {...register(`hotel_comparison.${index}.property_name` as const)}
                                            className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-2"
                                        >
                                            <option value="">Select Property</option>
                                            {properties.map(p => (
                                                <option key={p.id} value={p.name}>{p.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium leading-none">Meal Plan</label>
                                        <Input {...register(`hotel_comparison.${index}.meal_plan` as const)} className="mt-2" placeholder="e.g. All Inclusive" />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium leading-none">Price (Double)</label>
                                        <Input {...register(`hotel_comparison.${index}.double_price` as const)} className="mt-2" placeholder="$" />
                                    </div>
                                </div>
                            ))}
                            {fields.length === 0 && (
                                <div className="text-center py-8 text-muted-foreground text-sm border-2 border-dashed rounded-lg">
                                    No options added. Click "Add Option" to compare hotels.
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Terms */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Terms & Conditions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="text-sm font-medium leading-none">Meal Plan Explanation</label>
                                <textarea
                                    {...register('meal_plan_explanation')}
                                    rows={2}
                                    className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-2"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium leading-none">Terms & Conditions</label>
                                <textarea
                                    {...register('terms_and_conditions')}
                                    rows={6}
                                    className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-2 font-mono"
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar Column */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Quotation Settings</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="text-sm font-medium leading-none text-muted-foreground">Reference</label>
                                <div className="mt-1.5 font-mono text-sm bg-muted/40 p-2 rounded border">{formValues.reference_number || '...'}</div>
                            </div>
                            <div>
                                <label className="text-sm font-medium leading-none">Status</label>
                                <select
                                    {...register('booking_status')}
                                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-2"
                                >
                                    <option value="Tentative">Tentative</option>
                                    <option value="Confirmed">Confirmed</option>
                                </select>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </form>
        </div>
    );
}

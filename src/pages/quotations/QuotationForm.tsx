import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import { supabase } from '../../lib/supabase';
import type { Property, QuotationVoucher, CompanySettings } from '../../types';
import { BlobProvider } from '@react-pdf/renderer';
import QuotationPDF from '../../components/pdf/QuotationPDF';
import { ArrowLeft, Save, FileDown, Plus, Trash2, Loader2, Eye } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import InclusionExclusionSelector from '../../components/quotations/InclusionExclusionSelector';

import { useDebounce } from '../../hooks/useDebounce';

export default function QuotationForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [properties, setProperties] = useState<Property[]>([]);
    const [settings, setSettings] = useState<CompanySettings>();
    const [loading, setLoading] = useState(false);
    const [isEditMode] = useState(!!id);
    const [consultantName, setConsultantName] = useState<string>('');
    const [optionsMap, setOptionsMap] = useState<Record<string, string>>({});

    const { register, handleSubmit, control, setValue } = useForm<Partial<QuotationVoucher>>({
        defaultValues: {
            booking_status: 'Tentative',
            hotel_comparison: [{ property_name: '', meal_plan: '', single_price: '', double_price: '' }],
            inclusions: [],
            exclusions: [],
            terms_and_conditions: "1. Rates are subject to availability.\n2. Standard cancellation policy applies.\n3. Payment due 14 days before travel."
        }
    });

    // ... (existing code)

    // Watch for PDF
    const formValues = useWatch({ control });
    const debouncedFormValues = useDebounce(formValues, 1000);

    // ...

    const { fields, append, remove } = useFieldArray({
        control,
        name: "hotel_comparison",
    });

    useEffect(() => {
        fetchProperties();
        fetchSettings();
        fetchOptions();
        if (id) {
            fetchQuotation(id);
        } else {
            generateBookingId();
            if (user?.user_metadata?.full_name) {
                setConsultantName(user.user_metadata.full_name);
            }
        }
    }, [id, user]);

    // ... (existing functions: generateBookingId, fetchProperties, fetchSettings, fetchQuotation, onSubmit)

    const fetchOptions = async () => {
        const [incRes, excRes] = await Promise.all([
            supabase.from('inclusions').select('name, icon_url'),
            supabase.from('exclusions').select('name, icon_url')
        ]);

        const map: Record<string, string> = {};

        incRes.data?.forEach((item: any) => {
            if (item.name && item.icon_url) {
                map[item.name] = item.icon_url;
            }
        });

        excRes.data?.forEach((item: any) => {
            if (item.name && item.icon_url) {
                map[item.name] = item.icon_url;
            }
        });

        console.log('Fetched Options Map:', map);
        setOptionsMap(map);
    };

    const generateBookingId = () => {
        // Generate random 10-digit Booking ID
        const bookingId = Math.floor(1000000000 + Math.random() * 9000000000).toString();
        setValue('booking_id', bookingId);
        // We don't generate reference_number here to avoid gaps/skips in the sequence if the user doesn't save.
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
        const { data, error } = await supabase
            .from('quotation_vouchers')
            .select('*, profiles(full_name)')
            .eq('id', quoteId)
            .single();

        if (error) {
            console.error('Error fetching quotation:', error);
            return;
        }

        if (data) {
            // Flatten profiles data if needed or keep it as is. 
            // For now, react-hook-form handles flat values best, but we can pass the whole object if we typed it correctly.
            // Let's just set the form values.
            if (data.profiles && (data.profiles as any).full_name) {
                setConsultantName((data.profiles as any).full_name);
            }
            Object.entries(data).forEach(([key, value]) => {
                if (key !== 'profiles') {
                    setValue(key as any, value);
                }
            });
        }
    };

    const onSubmit = async (data: Partial<QuotationVoucher>) => {
        setLoading(true);
        try {
            let finalData = { ...data };

            // If creating new and no reference number, fetch it now
            if (!isEditMode && !id && !finalData.reference_number) {
                const { data: refNum, error: refError } = await supabase.rpc('get_next_quotation_ref');
                if (refNum && !refError) {
                    finalData.reference_number = refNum;
                } else {
                    // Fallback
                    const random = Math.floor(1000 + Math.random() * 9000);
                    finalData.reference_number = `QV-${random}`;
                }
            }

            const payload = {
                ...finalData,
                number_of_nights: finalData.number_of_nights ? Number(finalData.number_of_nights) : null,
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
                    <BlobProvider document={<QuotationPDF voucher={debouncedFormValues as QuotationVoucher} settings={settings} consultantName={consultantName} optionsMap={optionsMap} />}>
                        {({ url, loading: pdfLoading }) => {
                            const isLoading = pdfLoading; // || !url; // URL might be null initially?
                            return (
                                <>
                                    <Button
                                        variant="outline"
                                        disabled={isLoading || !url}
                                        onClick={() => url && window.open(url, '_blank')}
                                        className="w-full sm:w-auto"
                                    >
                                        {isLoading ? (
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        ) : (
                                            <Eye className="h-4 w-4 mr-2" />
                                        )}
                                        Preview PDF
                                    </Button>
                                    <Button
                                        variant="outline"
                                        disabled={isLoading || !url}
                                        className="w-full sm:w-auto"
                                        onClick={() => {
                                            if (url) {
                                                const link = document.createElement('a');
                                                link.href = url;
                                                link.download = `${formValues.reference_number || 'quotation'}.pdf`;
                                                document.body.appendChild(link);
                                                link.click();
                                                document.body.removeChild(link);
                                            }
                                        }}
                                    >
                                        {isLoading ? (
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        ) : (
                                            <FileDown className="h-4 w-4 mr-2" />
                                        )}
                                        Download PDF
                                    </Button>
                                </>
                            );
                        }}
                    </BlobProvider>
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

                    {/* Inclusions & Exclusions */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Inclusions & Exclusions</CardTitle>
                            <CardDescription>Select what is included and excluded in this quotation.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div>
                                <label className="text-sm font-medium leading-none mb-2 block">Inclusions</label>
                                <InclusionExclusionSelector
                                    type="inclusions"
                                    selectedItems={formValues.inclusions || []}
                                    onChange={(items) => setValue('inclusions', items)}
                                />
                            </div>
                            <div className="pt-4 border-t">
                                <label className="text-sm font-medium leading-none mb-2 block">Exclusions</label>
                                <InclusionExclusionSelector
                                    type="exclusions"
                                    selectedItems={formValues.exclusions || []}
                                    onChange={(items) => setValue('exclusions', items)}
                                />
                            </div>
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
                                <label className="text-sm font-medium leading-none text-muted-foreground">Booking ID</label>
                                <div className="mt-1.5 font-mono text-sm bg-muted/40 p-2 rounded border">{formValues.booking_id || '...'}</div>
                            </div>
                            <div>
                                <label className="text-sm font-medium leading-none text-muted-foreground">Reference</label>
                                <div className="mt-1.5 font-mono text-sm bg-muted/40 p-2 rounded border">{formValues.reference_number || (isEditMode ? '...' : 'Generated on Save')}</div>
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

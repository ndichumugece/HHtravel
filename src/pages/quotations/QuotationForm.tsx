import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, useFieldArray, useWatch, Controller } from 'react-hook-form';
import { supabase } from '../../lib/supabase';
import type { Property, QuotationVoucher, CompanySettings } from '../../types';
import { pdf } from '@react-pdf/renderer';
import QuotationPDF from '../../components/pdf/QuotationPDF';
import { ArrowLeft, Save, FileDown, Plus, Trash2, Loader2, Eye } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Switch } from '../../components/ui/Switch';
import { Label } from '../../components/ui/Label';
import { Combobox } from '../../components/ui/Combobox';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import InclusionExclusionSelector from '../../components/quotations/InclusionExclusionSelector';
import RichTextEditor from '../../components/ui/RichTextEditor';

import { differenceInCalendarDays, parseISO } from 'date-fns';

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
    const [mealPlans, setMealPlans] = useState<{ id: string; name: string }[]>([]);

    const { register, handleSubmit, control, setValue } = useForm<Partial<QuotationVoucher>>({
        defaultValues: {
            booking_status: 'Tentative',
            number_of_adults: 1,
            number_of_children: 0,
            number_of_rooms: 1,
            show_hotel_comparison: true,
            show_inclusions_exclusions: true,
            hotel_comparison: [{ property_name: '', meal_plan: '', single_price: '', double_price: '' }],
            inclusions: [],
            exclusions: [],
            terms_and_conditions: "1. Rates are subject to availability.\n2. Standard cancellation policy applies.\n3. Payment due 14 days before travel."
        }
    });

    // ... (existing code)

    // Watch for PDF and Date Calculation
    const formValues = useWatch({ control });
    const { check_in_date, check_out_date } = formValues;

    useEffect(() => {
        if (check_in_date && check_out_date) {
            const start = parseISO(check_in_date);
            const end = parseISO(check_out_date);
            const nights = differenceInCalendarDays(end, start);

            if (nights > 0) {
                setValue('number_of_nights', nights);
            } else {
                setValue('number_of_nights', 0);
            }
        }
    }, [check_in_date, check_out_date, setValue]);



    // ...

    const { fields, append, remove } = useFieldArray({
        control,
        name: "hotel_comparison",
    });

    useEffect(() => {
        fetchProperties();
        fetchSettings();
        fetchOptions();
        fetchMealPlans();
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
        if (data) {
            setSettings(data);
            // Set default terms if creating new quotation
            if (!id && data.terms_and_conditions) {
                setValue('terms_and_conditions', data.terms_and_conditions);
            }
        }
    };

    const fetchMealPlans = async () => {
        const { data } = await supabase.from('meal_plans').select('*').order('name');
        setMealPlans(data || []);
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

            const payload: any = {
                ...finalData,
                number_of_nights: finalData.number_of_nights ? Number(finalData.number_of_nights) : null,
            };

            // Only set consultant_id on creation
            if (!isEditMode) {
                payload.consultant_id = user?.id;
            }

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
                    <Button
                        variant="outline"
                        onClick={async () => {
                            const blob = await pdf(<QuotationPDF voucher={formValues as QuotationVoucher} settings={settings} consultantName={consultantName} optionsMap={optionsMap} />).toBlob();
                            const url = URL.createObjectURL(blob);
                            window.open(url, '_blank');
                        }}
                        className="w-full sm:w-auto"
                    >
                        <Eye className="h-4 w-4 mr-2" />
                        Preview PDF
                    </Button>
                    <Button
                        variant="outline"
                        className="w-full sm:w-auto"
                        onClick={async () => {
                            const blob = await pdf(<QuotationPDF voucher={formValues as QuotationVoucher} settings={settings} consultantName={consultantName} optionsMap={optionsMap} />).toBlob();
                            const url = URL.createObjectURL(blob);
                            const link = document.createElement('a');
                            link.href = url;
                            link.download = `${formValues.reference_number || 'quotation'}.pdf`;
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                        }}
                    >
                        <FileDown className="h-4 w-4 mr-2" />
                        Download PDF
                    </Button>
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
                                <Input {...register('package_type')} className="mt-2" placeholder="e.g. Flying package" />
                            </div>
                            <div>
                                <label className="text-sm font-medium leading-none">Adults</label>
                                <Input type="number" {...register('number_of_adults')} className="mt-2" placeholder="1" />
                            </div>
                            <div>
                                <label className="text-sm font-medium leading-none">Children</label>
                                <Input type="number" {...register('number_of_children')} className="mt-2" placeholder="0" />
                            </div>
                            <div>
                                <label className="text-sm font-medium leading-none">Rooms</label>
                                <Input type="number" {...register('number_of_rooms')} className="mt-2" placeholder="1" />
                            </div>
                            <div className="col-span-2">
                                <label className="text-sm font-medium leading-none">Room Arrangements</label>
                                <textarea
                                    {...register('room_arrangements')}
                                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-2"
                                    placeholder="e.g. 1 Double Room, 2 Twin Rooms..."
                                />
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
                    {formValues.show_hotel_comparison && (
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
                                            <div className="mt-2">
                                                <Controller
                                                    control={control}
                                                    name={`hotel_comparison.${index}.property_name` as const}
                                                    render={({ field }) => (
                                                        <Combobox
                                                            options={properties.map(p => ({ label: p.name, value: p.name }))}
                                                            value={field.value}
                                                            onChange={field.onChange}
                                                            placeholder="Select Property"
                                                            className="w-full"
                                                        />
                                                    )}
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium leading-none">Meal Plan</label>
                                            <select
                                                {...register(`hotel_comparison.${index}.meal_plan` as const)}
                                                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-2"
                                            >
                                                <option value="">Select Meal Plan</option>
                                                {mealPlans.map(plan => (
                                                    <option key={plan.id} value={plan.name}>{plan.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium leading-none">Price</label>
                                            <Input {...register(`hotel_comparison.${index}.double_price` as const)} className="mt-2" placeholder="$" />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="text-sm font-medium leading-none">More Info / Description</label>
                                            <textarea
                                                {...register(`hotel_comparison.${index}.description` as const)}
                                                rows={2}
                                                className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-2"
                                                placeholder="Add details about this option..."
                                            />
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
                    )}

                    {/* Inclusions & Exclusions */}
                    {formValues.show_inclusions_exclusions && (
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
                    )}

                    {/* Additional Notes (Rich Text) */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Additional Notes</CardTitle>
                            <CardDescription>Add distinct notes, tables, or formatted text (e.g. from Word).</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Controller
                                control={control}
                                name="rich_text_notes"
                                render={({ field }) => (
                                    <RichTextEditor
                                        value={field.value || ''}
                                        onChange={field.onChange}
                                        className="min-h-[400px] mb-12" // Allow it to grow, set a healthy minimum
                                        placeholder="Paste your content here..."
                                    />
                                )}
                            />
                        </CardContent>
                    </Card>



                    {/* Disabled Sections Container */}
                    {(!formValues.show_hotel_comparison || !formValues.show_inclusions_exclusions) && (
                        <div className="mt-12 pt-12 border-t-2 border-dashed border-slate-200 dark:border-slate-800">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800"></div>
                                <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] whitespace-nowrap">Optional Sections (Disabled in PDF)</h3>
                                <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800"></div>
                            </div>
                            
                            <div className="space-y-6">
                                {!formValues.show_hotel_comparison && (
                                    <div className="opacity-60 hover:opacity-100 transition-opacity">
                                        <Card className="border-dashed bg-slate-50/50 dark:bg-slate-900/50">
                                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                                <CardTitle className="text-sm font-semibold text-muted-foreground">Hotel Comparison</CardTitle>
                                                <span className="text-[10px] font-bold bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded text-muted-foreground">HIDDEN IN PDF</span>
                                            </CardHeader>
                                            <CardContent>
                                                <p className="text-xs text-muted-foreground italic mb-4">This section is currently hidden from the PDF. You can still manage it below, but it won't be visible to the client.</p>
                                                <div className="pointer-events-auto">
                                                    {/* Re-rendering the actual form content here if we want them to stay editable at bottom */}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                )}
                                {!formValues.show_inclusions_exclusions && (
                                    <div className="opacity-60 hover:opacity-100 transition-opacity">
                                        <Card className="border-dashed bg-slate-50/50 dark:bg-slate-900/50">
                                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                                <CardTitle className="text-sm font-semibold text-muted-foreground">Inclusions & Exclusions</CardTitle>
                                                <span className="text-[10px] font-bold bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded text-muted-foreground">HIDDEN IN PDF</span>
                                            </CardHeader>
                                            <CardContent>
                                                <p className="text-xs text-muted-foreground italic mb-4">This section is currently hidden from the PDF. You can still manage it below, but it won't be visible to the client.</p>
                                            </CardContent>
                                        </Card>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
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

                            <div className="pt-4 border-t space-y-4">
                                <Label className="text-xs font-bold uppercase text-muted-foreground tracking-widest">Section Visibility</Label>
                                
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="show_hotel_comparison" className="text-sm">Hotel Comparison</Label>
                                        <p className="text-[10px] text-muted-foreground">Show comparison table in PDF</p>
                                    </div>
                                    <Controller
                                        control={control}
                                        name="show_hotel_comparison"
                                        render={({ field }) => (
                                            <Switch
                                                id="show_hotel_comparison"
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        )}
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="show_inclusions_exclusions" className="text-sm">Inclusions & Exclusions</Label>
                                        <p className="text-[10px] text-muted-foreground">Show inclusions in PDF</p>
                                    </div>
                                    <Controller
                                        control={control}
                                        name="show_inclusions_exclusions"
                                        render={({ field }) => (
                                            <Switch
                                                id="show_inclusions_exclusions"
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        )}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </form >
        </div >
    );
}

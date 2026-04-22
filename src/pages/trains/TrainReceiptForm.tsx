import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import { supabase } from '../../lib/supabase';
import type { TrainReceipt, CompanySettings } from '../../types';
import { pdf } from '@react-pdf/renderer';
import TrainReceiptPDF from '../../components/pdf/TrainReceiptPDF';
import { ArrowLeft, Save, FileDown, Plus, Trash2, Loader2, Eye, TrainFront } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Switch } from '../../components/ui/Switch';
import { Label } from '../../components/ui/Label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';

const TRAIN_TYPES = ['Inter county', 'Express', 'Suswa train'];
const STATIONS = [
    'Nairobi Terminus',
    'Mombasa',
    'Voi',
    'Mtito Andei',
    'Mariakani',
    'Athi River'
];

export default function TrainReceiptForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, profile } = useAuth();
    const [settings, setSettings] = useState<CompanySettings>();
    const [loading, setLoading] = useState(false);
    const [consultantName, setConsultantName] = useState<string>('');
    const isEditMode = !!id;

    const { register, handleSubmit, control, setValue, reset } = useForm<Partial<TrainReceipt>>({
        defaultValues: {
            train_type: 'Express',
            from_station: 'Nairobi Terminus',
            to_station: 'Mombasa',
            has_return_journey: false,
            return_train_type: 'Express',
            guests: [{ name: '', coach_no: '', seat_no: '' }],
            return_guests: []
        }
    });

    const hasReturnJourney = useWatch({ control, name: 'has_return_journey' });

    const { fields: departureFields, append: appendDeparture, remove: removeDeparture } = useFieldArray({
        control,
        name: "guests"
    });

    const { fields: returnFields, append: appendReturn, remove: removeReturn, replace: replaceReturn } = useFieldArray({
        control,
        name: "return_guests"
    });

    const formValues = useWatch({ control });

    useEffect(() => {
        fetchSettings();
        if (id) {
            fetchReceipt(id);
        } else if (profile?.full_name) {
            setConsultantName(profile.full_name);
        } else if (user) {
            const name = user.user_metadata?.full_name || user.email || 'N/A';
            setConsultantName(name);
        }
    }, [id, user, profile]);

    const fetchSettings = async () => {
        const { data } = await supabase.from('company_settings').select('*').single();
        if (data) setSettings(data);
    };

    const fetchReceipt = async (receiptId: string) => {
        const { data, error } = await supabase
            .from('train_receipts')
            .select('*, profiles(full_name)')
            .eq('id', receiptId)
            .single();

        if (error) {
            console.error('Error fetching receipt:', error);
            return;
        }

        if (data) {
            if (data.profiles && (data.profiles as any).full_name) {
                setConsultantName((data.profiles as any).full_name);
            }
            reset(data);
        }
    };

    const onSubmit = async (data: Partial<TrainReceipt>) => {
        setLoading(true);
        try {
            let finalData = { ...data };

            if (!isEditMode && !finalData.reference_number) {
                const { data: refNum, error: refError } = await supabase.rpc('get_next_train_receipt_ref');
                if (refNum && !refError) {
                    finalData.reference_number = refNum;
                } else {
                    const random = Math.floor(1000 + Math.random() * 9000);
                    finalData.reference_number = `TR-${random}`;
                }
            }

            const payload: any = {
                ...finalData,
                consultant_id: isEditMode ? finalData.consultant_id : user?.id,
            };

            // Remove profiles if it exists in data to avoid Supabase error on insert/update
            delete payload.profiles;

            if (isEditMode && id) {
                const { error } = await supabase.from('train_receipts').update(payload).eq('id', id);
                if (error) throw error;
            } else {
                const { error } = await supabase.from('train_receipts').insert(payload);
                if (error) throw error;
            }
            navigate('/trains');
        } catch (error) {
            console.error('Error saving receipt:', error);
            alert('Failed to save receipt');
        } finally {
            setLoading(false);
        }
    };

    const copyGuestsToReturn = () => {
        const departureGuests = control._formValues.guests || [];
        // Map to new objects to avoid reference issues
        const copied = departureGuests.map((g: any) => ({
            name: g.name,
            coach_no: '',
            seat_no: ''
        }));
        replaceReturn(copied);
    };

    const previewPDF = async () => {
        try {
            // Create a preview version of the receipt with a temporary reference if needed
            const previewReceipt = {
                ...formValues,
                reference_number: formValues.reference_number || 'TR-PENDING'
            } as TrainReceipt;

            const doc = (
                <TrainReceiptPDF 
                    receipt={previewReceipt} 
                    settings={settings} 
                    consultantName={consultantName} 
                />
            );
            const blob = await pdf(doc).toBlob();
            const url = URL.createObjectURL(blob);
            window.open(url, '_blank');
        } catch (error) {
            console.error('Error generating PDF preview:', error);
            alert(`Could not generate PDF preview. Please ensure all required fields are filled correctly. Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    };

    const downloadPDF = async () => {
        try {
            // Create a preview version of the receipt with a temporary reference if needed
            const previewReceipt = {
                ...formValues,
                reference_number: formValues.reference_number || 'TR-PENDING'
            } as TrainReceipt;

            const doc = (
                <TrainReceiptPDF 
                    receipt={previewReceipt} 
                    settings={settings} 
                    consultantName={consultantName} 
                />
            );
            const blob = await pdf(doc).toBlob();
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            const today = format(new Date(), 'yyyy-MM-dd');
            const clientNameSanitized = (formValues.client_name || 'Client').replace(/[^a-z0-9]/gi, '_');
            const reference = formValues.reference_number || 'Draft';
            link.download = `TrainTicket_${reference}_${clientNameSanitized}_${today}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('Error downloading PDF:', error);
            alert(`Could not download PDF. Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    };

    return (
        <div className="max-w-5xl mx-auto pb-20 space-y-6">
            {/* Header */}
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 border-b pb-4">
                <div className="flex items-center space-x-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate('/trains')}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                            <TrainFront className="h-6 w-6 text-brand-600" />
                            {isEditMode ? 'Edit Train Ticket' : 'New Train Ticket'}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            {isEditMode ? `Ref: ${formValues.reference_number}` : 'Generate a new train travel ticket'}
                        </p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto">
                    <Button variant="outline" onClick={previewPDF} className="w-full sm:w-auto">
                        <Eye className="h-4 w-4 mr-2" />
                        Preview PDF
                    </Button>
                    <Button variant="outline" onClick={downloadPDF} className="w-full sm:w-auto">
                        <FileDown className="h-4 w-4 mr-2" />
                        Download PDF
                    </Button>
                    <Button onClick={handleSubmit(onSubmit)} disabled={loading} className="w-full sm:w-auto">
                        {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                        Save Ticket
                    </Button>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    {/* Client & Journey Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Client & Journey Information</CardTitle>
                            <CardDescription>Enter the primary traveler and train details.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-6 sm:grid-cols-2">
                            <div className="sm:col-span-2">
                                <label className="text-sm font-medium">Client Name</label>
                                <Input {...register('client_name', { required: true })} className="mt-1.5" placeholder="Full name" />
                            </div>
                            <div>
                                <label className="text-sm font-medium">Mobile Number</label>
                                <Input {...register('mobile_number')} className="mt-1.5" placeholder="e.g. 0712345678" />
                            </div>
                            <div>
                                <label className="text-sm font-medium">Ticket Number</label>
                                <Input {...register('ticket_number')} className="mt-1.5" placeholder="Optional" />
                            </div>
                            <div>
                                <label className="text-sm font-medium">Train Type</label>
                                <select {...register('train_type')} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1.5">
                                    {TRAIN_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-sm font-medium">Departure Date</label>
                                <Input type="date" {...register('departure_date', { required: true })} className="mt-1.5" />
                            </div>
                            <div>
                                <label className="text-sm font-medium">From Station</label>
                                <select {...register('from_station')} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1.5">
                                    {STATIONS.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-sm font-medium">To Station</label>
                                <select {...register('to_station')} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1.5">
                                    {STATIONS.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-sm font-medium">Departure Time</label>
                                <Input type="time" {...register('departure_time')} className="mt-1.5" />
                            </div>
                            <div>
                                <label className="text-sm font-medium">Arrival Time</label>
                                <Input type="time" {...register('arrival_time')} className="mt-1.5" />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Travelling Guests (Departure) */}
                    <Card>
                        <CardHeader className="space-y-4">
                            <div className="flex flex-col gap-1">
                                <CardTitle>Travelling Guests (Departure)</CardTitle>
                                <CardDescription>Add multiple guests with their coach and seat assignments for the departure trip.</CardDescription>
                            </div>
                            <div className="flex justify-start">
                                <Button type="button" variant="secondary" size="sm" onClick={() => appendDeparture({ name: '', coach_no: '', seat_no: '' })}>
                                    <Plus className="h-4 w-4 mr-2" /> Add Guest
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {departureFields.map((item, index) => (
                                <div key={item.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 rounded-lg bg-muted/30 border items-end">
                                    <div className="md:col-span-5">
                                        <label className="text-xs font-semibold uppercase text-muted-foreground pb-1 block">Guest Name</label>
                                        <Input {...register(`guests.${index}.name` as const)} placeholder="Guest Name" />
                                    </div>
                                    <div className="md:col-span-3">
                                        <label className="text-xs font-semibold uppercase text-muted-foreground pb-1 block">Coach No</label>
                                        <Input {...register(`guests.${index}.coach_no` as const)} placeholder="e.g. 5" />
                                    </div>
                                    <div className="md:col-span-3">
                                        <label className="text-xs font-semibold uppercase text-muted-foreground pb-1 block">Seat No</label>
                                        <Input {...register(`guests.${index}.seat_no` as const)} placeholder="e.g. 42" />
                                    </div>
                                    <div className="md:col-span-1 flex justify-center pb-2">
                                        <button type="button" onClick={() => removeDeparture(index)} className="text-muted-foreground hover:text-destructive transition-colors">
                                            <Trash2 className="h-5 w-5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {departureFields.length === 0 && (
                                <div className="text-center py-6 text-muted-foreground border-2 border-dashed rounded-lg">
                                    No guests added. Click "Add Guest" to begin.
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Return Journey Details */}
                    <Card className={!hasReturnJourney ? 'opacity-60 transition-opacity' : 'transition-opacity'}>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <div>
                                <CardTitle className="text-lg">Return Journey Details</CardTitle>
                                <CardDescription>Include return trip information if applicable.</CardDescription>
                            </div>
                            <div className="flex items-center space-x-2 bg-muted/80 px-3 py-1.5 rounded-lg border shadow-sm">
                                <Switch 
                                    id="has_return" 
                                    checked={!!hasReturnJourney}
                                    onCheckedChange={(val) => {
                                        setValue('has_return_journey', val);
                                        if (val) {
                                            // Get current values to reverse
                                            const from = control._formValues.from_station;
                                            const to = control._formValues.to_station;
                                            setValue('return_from_station', to);
                                            setValue('return_to_station', from);
                                            
                                            // If return guests are empty, maybe offer to copy? 
                                            // We'll just provide the manual button for now to avoid side effects.
                                        }
                                    }}
                                />
                                <Label htmlFor="has_return" className="text-xs font-bold uppercase cursor-pointer selection:bg-transparent">Add Return</Label>
                            </div>
                        </CardHeader>
                        {hasReturnJourney ? (
                            <CardContent className="grid gap-6 sm:grid-cols-2 pt-4 border-t mt-2">
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Return Train Type</label>
                                    <select {...register('return_train_type')} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1.5 focus:ring-2 focus:ring-brand-500 transition-all outline-none">
                                        {TRAIN_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Return Ticket Number</label>
                                    <Input {...register('return_ticket_number')} className="mt-1.5" placeholder="Optional handle" />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Return Date</label>
                                    <Input type="date" {...register('return_departure_date')} className="mt-1.5" />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Return From</label>
                                    <select {...register('return_from_station')} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1.5 focus:ring-2 focus:ring-brand-500 transition-all outline-none">
                                        {STATIONS.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Return To</label>
                                    <select {...register('return_to_station')} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1.5 focus:ring-2 focus:ring-brand-500 transition-all outline-none">
                                        {STATIONS.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Dep. Time</label>
                                        <Input type="time" {...register('return_departure_time')} className="mt-1.5" />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Arr. Time</label>
                                        <Input type="time" {...register('return_arrival_time')} className="mt-1.5" />
                                    </div>
                                </div>
                            </CardContent>
                        ) : (
                            <CardContent className="py-8 text-center bg-muted/10 rounded-b-lg border-t mt-2">
                                <p className="text-sm text-muted-foreground italic">
                                    Return journey is currently disabled. Toggle the switch to add return details.
                                </p>
                            </CardContent>
                        )}
                    </Card>

                    {/* Travelling Guests (Return) */}
                    {hasReturnJourney && (
                        <Card>
                            <CardHeader className="space-y-4">
                                <div className="flex flex-col gap-1">
                                    <CardTitle>Travelling Guests (Return)</CardTitle>
                                    <CardDescription>Add guests with their coach and seat assignments for the return trip.</CardDescription>
                                </div>
                                <div className="flex flex-wrap gap-3">
                                    <Button type="button" variant="outline" size="sm" onClick={copyGuestsToReturn}>
                                        Copy Departure Names
                                    </Button>
                                    <Button type="button" variant="secondary" size="sm" onClick={() => appendReturn({ name: '', coach_no: '', seat_no: '' })}>
                                        <Plus className="h-4 w-4 mr-2" /> Add Guest
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {returnFields.map((item, index) => (
                                    <div key={item.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 rounded-lg bg-muted/30 border items-end">
                                        <div className="md:col-span-5">
                                            <label className="text-xs font-semibold uppercase text-muted-foreground pb-1 block">Guest Name</label>
                                            <Input {...register(`return_guests.${index}.name` as const)} placeholder="Guest Name" />
                                        </div>
                                        <div className="md:col-span-3">
                                            <label className="text-xs font-semibold uppercase text-muted-foreground pb-1 block">Coach No</label>
                                            <Input {...register(`return_guests.${index}.coach_no` as const)} placeholder="e.g. 5" />
                                        </div>
                                        <div className="md:col-span-3">
                                            <label className="text-xs font-semibold uppercase text-muted-foreground pb-1 block">Seat No</label>
                                            <Input {...register(`return_guests.${index}.seat_no` as const)} placeholder="e.g. 42" />
                                        </div>
                                        <div className="md:col-span-1 flex justify-center pb-2">
                                            <button type="button" onClick={() => removeReturn(index)} className="text-muted-foreground hover:text-destructive transition-colors">
                                                <Trash2 className="h-5 w-5" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {returnFields.length === 0 && (
                                    <div className="text-center py-6 text-muted-foreground border-2 border-dashed rounded-lg">
                                        No return guests added. Click "Add Guest" or "Copy Departure Names" to begin.
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Document Info</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="text-xs font-bold uppercase text-muted-foreground tracking-widest">Reference No</label>
                                <div className="mt-1.5 font-mono text-sm bg-muted/40 p-2 rounded border">{formValues.reference_number || (isEditMode ? '...' : 'Generated on Save')}</div>
                            </div>
                            <div>
                                <label className="text-xs font-bold uppercase text-muted-foreground tracking-widest">Travel Consultant</label>
                                <div className="mt-1.5 text-sm bg-muted/40 p-2 rounded border">{consultantName || '...'}</div>
                            </div>
                            <div className="pt-4 border-t">
                                <p className="text-[10px] text-muted-foreground leading-relaxed italic">
                                    The disclaimer about this being an auto-generated ticket will be automatically included at the bottom of the generated PDF.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </form>
        </div>
    );
}

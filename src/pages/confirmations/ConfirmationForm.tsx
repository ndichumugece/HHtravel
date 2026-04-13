import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, useWatch, Controller } from 'react-hook-form';
import { supabase } from '../../lib/supabase';
import type { Property, ConfirmationVoucher, CompanySettings } from '../../types';
import { 
    ArrowLeft, 
    Save, 
    FileDown, 
    Loader2, 
    Plus, 
    Trash2, 
    Settings2, 
    Eye,
    CheckCircle2,
    Clock,
    Ban
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { format } from 'date-fns';
import { Combobox } from '../../components/ui/Combobox';
import { DatePicker } from '../../components/ui/DatePicker';
import { cn } from '../../lib/utils';
import { Switch } from '../../components/ui/Switch';
import { Label } from '../../components/ui/Label';

export default function ConfirmationForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [properties, setProperties] = useState<Property[]>([]);
    const [settings, setSettings] = useState<CompanySettings>();
    const [loading, setLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const isEditMode = !!id;

    // Room Details State (Sync with table)
    const [roomDetails, setRoomDetails] = useState<any[]>([
        { id: '1', room_type: '', adults: 2, children: 0 }
    ]);
    const [roomTypes, setRoomTypes] = useState<{ id: string, name: string }[]>([]);

    const { register, handleSubmit, setValue, control } = useForm<Partial<ConfirmationVoucher>>({
        defaultValues: {
            status: 'draft',
            number_of_rooms: 1,
            number_of_adults: 2,
            number_of_children: 0,
            show_flight_details: true,
            show_special_requests: true
        }
    });

    const formValues = useWatch({ control });

    useEffect(() => {
        fetchProperties();
        fetchSettings();
        fetchRoomTypes();
        if (id) fetchVoucher(id);
        else generateReference();
    }, [id]);

    const fetchRoomTypes = async () => {
        const { data } = await supabase.from('room_types').select('*').order('name');
        if (data) setRoomTypes(data);
    };

    const generateReference = async () => {
        const { data: lastOne } = await supabase
            .from('confirmation_vouchers')
            .select('reference_number')
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        let num = 1001;
        if (lastOne) {
            const match = lastOne.reference_number.match(/\d+/);
            if (match) num = parseInt(match[0], 10) + 1;
        }
        setValue('reference_number', `CV-${num}`);
    };

    const fetchProperties = async () => {
        const { data } = await supabase.from('properties').select('*').order('name');
        setProperties(data || []);
    };

    const fetchSettings = async () => {
        const { data } = await supabase.from('company_settings').select('*').single();
        if (data) setSettings(data);
    };

    const fetchVoucher = async (vid: string) => {
        setLoading(true);
        const { data } = await supabase.from('confirmation_vouchers').select('*').eq('id', vid).single();
        if (data) {
            Object.entries(data).forEach(([key, val]) => setValue(key as any, val));
            if (data.room_details) setRoomDetails(data.room_details);
        }
        setLoading(false);
    };

    const handleCreateRoomType = async (name: string) => {
        try {
            const { data, error } = await supabase.from('room_types').insert([{ name }]).select().single();
            if (error) throw error;
            if (data) {
                setRoomTypes(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
                return data.name;
            }
        } catch (err) { console.error(err); }
    };

    const handleCreateBedType = async (name: string) => {
        try {
            const { data, error } = await supabase.from('bed_types').insert([{ name }]).select().single();
            if (error) throw error;
            return data?.name;
        } catch (err) { console.error(err); }
    };

    const handleCreateMealPlan = async (name: string) => {
        try {
            const { data, error } = await supabase.from('meal_plans').insert([{ name }]).select().single();
            if (error) throw error;
            if (data) setValue('meal_plan' as any, data.name);
        } catch (err) { console.error(err); }
    };

    const handleCreateProperty = async (name: string) => {
        try {
            const { data, error } = await supabase.from('properties').insert([{ name, location: 'Unknown' }]).select().single();
            if (error) throw error;
            if (data) {
                setProperties(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
                setValue('property_name', data.name);
            }
        } catch (err) { console.error(err); }
    };

    const onSubmit = async (data: Partial<ConfirmationVoucher>) => {
        if (!user) return;
        setIsSaving(true);
        try {
            const payload = {
                ...data,
                consultant_id: user.id,
                room_details: roomDetails,
            };

            const { error } = isEditMode 
                ? await supabase.from('confirmation_vouchers').update(payload).eq('id', id)
                : await supabase.from('confirmation_vouchers').insert([payload]);

            if (error) throw error;
            navigate('/confirmations');
        } catch (err: any) {
            alert(err.message);
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) return <div className="p-8 text-center">Loading voucher...</div>;

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="max-w-7xl mx-auto space-y-6 pb-20">
            {/* Header */}
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Button type="button" variant="ghost" size="icon" onClick={() => navigate('/confirmations')}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            {isEditMode ? 'Edit Confirmation' : 'New Confirmation Voucher'}
                        </h1>
                        <p className="text-sm text-muted-foreground font-mono">
                            {formValues.reference_number || 'CV-XXXX'}
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                {/* Main Content (Left) */}
                <div className="lg:col-span-2 space-y-6">
                    {/* 1. Client Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Client Details</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Guest Name</Label>
                                <Input {...register('guest_name', { required: true })} placeholder="Full Name" />
                            </div>
                            <div className="space-y-2">
                                <Label>Nationality</Label>
                                <Input {...register('guest_nationality')} placeholder="e.g. American" />
                            </div>
                            <div className="md:col-span-2 space-y-2">
                                <Label>Contact Info</Label>
                                <Input {...register('guest_contact')} placeholder="Phone or Email" />
                            </div>
                        </CardContent>
                    </Card>

                    {/* 2. Property & Stay */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Stay Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Property</Label>
                                    <Combobox
                                        options={properties.map(p => ({ label: p.name, value: p.name }))}
                                        value={formValues.property_name}
                                        onChange={(val) => setValue('property_name', val)}
                                        onCreate={handleCreateProperty}
                                        placeholder="Select Property"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="space-y-2">
                                        <Label>Check-in</Label>
                                        <DatePicker
                                            date={formValues.check_in_date ? new Date(formValues.check_in_date) : undefined}
                                            setDate={(d) => setValue('check_in_date', d ? format(d, 'yyyy-MM-dd') : '')}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Check-out</Label>
                                        <DatePicker
                                            date={formValues.check_out_date ? new Date(formValues.check_out_date) : undefined}
                                            setDate={(d) => setValue('check_out_date', d ? format(d, 'yyyy-MM-dd') : '')}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Room Configuration Block */}
                            <div className="pt-4 border-t space-y-4">
                                <div className="flex items-center justify-between">
                                    <Label className="font-semibold underline">Room Configuration</Label>
                                    <Button type="button" variant="outline" size="sm" onClick={() => {
                                        setRoomDetails([...roomDetails, { id: Math.random().toString(), room_type: '', adults: 2, children: 0 }]);
                                    }}>
                                        <Plus className="h-4 w-4 mr-1" /> Add Room
                                    </Button>
                                </div>
                                {roomDetails.map((room, idx) => (
                                    <div key={room.id} className="flex flex-wrap gap-4 p-4 bg-muted/20 border rounded-lg relative">
                                        <div className="flex-1 min-w-[200px] space-y-2">
                                            <Label className="text-xs">Room Type</Label>
                                            <Combobox
                                                options={roomTypes.map(rt => ({ label: rt.name, value: rt.name }))}
                                                value={room.room_type}
                                                onChange={(val) => {
                                                    const newD = [...roomDetails];
                                                    newD[idx].room_type = val;
                                                    setRoomDetails(newD);
                                                }}
                                                onCreate={async (val) => {
                                                    const created = await handleCreateRoomType(val);
                                                    if (created) {
                                                        const newD = [...roomDetails];
                                                        newD[idx].room_type = created;
                                                        setRoomDetails(newD);
                                                    }
                                                }}
                                                placeholder="Select Type"
                                            />
                                        </div>
                                        <div className="w-20 space-y-2">
                                            <Label className="text-xs">Adults</Label>
                                            <Input type="number" value={room.adults} onChange={(e) => {
                                                const newD = [...roomDetails];
                                                newD[idx].adults = parseInt(e.target.value);
                                                setRoomDetails(newD);
                                            }} />
                                        </div>
                                        <div className="w-20 space-y-2">
                                            <Label className="text-xs">Children</Label>
                                            <Input type="number" value={room.children} onChange={(e) => {
                                                const newD = [...roomDetails];
                                                newD[idx].children = parseInt(e.target.value);
                                                setRoomDetails(newD);
                                            }} />
                                        </div>
                                        <Button type="button" variant="ghost" size="icon" className="mt-8 text-destructive" onClick={() => {
                                            setRoomDetails(roomDetails.filter((_, i) => i !== idx));
                                        }}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* 3. Additional Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Additional Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Flight Details</Label>
                                    <Input {...register('flight_details')} placeholder="e.g. Flight KQ100" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Arrival/Departure Times</Label>
                                    <div className="flex gap-2">
                                        <Input {...register('arrival_time')} placeholder="Arrival" />
                                        <Input {...register('departure_time')} placeholder="Departure" />
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Special Requests</Label>
                                <textarea
                                    {...register('special_requests')}
                                    className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    placeholder="Enter any special notes..."
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar Menu Column (Right) */}
                <div className="space-y-6">
                    {/* Sidebar Card 1: Voucher Status */}
                    <Card className="border-primary/20 shadow-sm overflow-hidden">
                        <div className="bg-primary/5 px-6 py-3 border-b border-primary/10">
                            <h3 className="text-sm font-semibold text-primary flex items-center gap-2">
                                <Settings2 className="h-4 w-4" />
                                Voucher Settings
                            </h3>
                        </div>
                        <CardContent className="p-6 space-y-6">
                            <div className="space-y-3">
                                <Label className="text-xs uppercase text-muted-foreground font-bold letter-spacing-wide">Status</Label>
                                <div className="grid grid-cols-1 gap-2">
                                    <Button
                                        type="button"
                                        variant={formValues.status === 'confirmed' ? 'default' : 'outline'}
                                        className={cn("justify-start gap-2 h-11", formValues.status === 'confirmed' && "bg-green-600 hover:bg-green-700")}
                                        onClick={() => setValue('status', 'confirmed')}
                                    >
                                        <CheckCircle2 className="h-4 w-4" />
                                        Confirmed
                                    </Button>
                                    <Button
                                        type="button"
                                        variant={formValues.status === 'draft' ? 'secondary' : 'outline'}
                                        className="justify-start gap-2 h-11"
                                        onClick={() => setValue('status', 'draft')}
                                    >
                                        <Clock className="h-4 w-4" />
                                        Draft
                                    </Button>
                                    <Button
                                        type="button"
                                        variant={formValues.status === 'cancelled' ? 'destructive' : 'outline'}
                                        className="justify-start gap-2 h-11"
                                        onClick={() => setValue('status', 'cancelled')}
                                    >
                                        <Ban className="h-4 w-4" />
                                        Cancelled
                                    </Button>
                                </div>
                            </div>

                            <div className="pt-4 border-t space-y-4 text-xs">
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground font-medium">Reference:</span>
                                    <span className="font-mono font-bold text-foreground bg-muted px-2 py-0.5 rounded">
                                        {formValues.reference_number}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground font-medium">Created:</span>
                                    <span className="text-foreground">
                                        {formValues.created_at ? format(new Date(formValues.created_at), 'MMM d, yyyy') : 'Today'}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Sidebar Card 2: PDF Settings & Quick Actions */}
                    <Card className="overflow-hidden">
                        <div className="px-6 py-4 border-b">
                            <CardTitle className="text-sm">Quick Actions</CardTitle>
                        </div>
                        <CardContent className="p-6 space-y-6">
                            <div className="space-y-4 font-medium">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="show_flight" className="cursor-pointer text-sm">Show Flight Info</Label>
                                    <Switch
                                        id="show_flight"
                                        checked={formValues.show_flight_details}
                                        onCheckedChange={(val) => setValue('show_flight_details', val)}
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="show_requests" className="cursor-pointer text-sm">Show Special Req.</Label>
                                    <Switch
                                        id="show_requests"
                                        checked={formValues.show_special_requests}
                                        onCheckedChange={(val) => setValue('show_special_requests', val)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-3 pt-6 border-t font-semibold">
                                <Button
                                    type="submit"
                                    disabled={isSaving}
                                    className="w-full gap-2 h-11 shadow-sm"
                                >
                                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                    Save Changes
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full gap-2 h-11 border-primary/20 hover:bg-primary/5 text-primary"
                                    onClick={() => alert('PDF generation is coming soon')}
                                >
                                    <FileDown className="h-4 w-4" />
                                    Download PDF
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                    
                    <p className="text-[10px] text-center text-muted-foreground px-4">
                        All changes are saved to the cloud. You can continue editing this voucher later.
                    </p>
                </div>
            </div>
        </form>
    );
}

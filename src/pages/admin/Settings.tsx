import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { CompanySettings } from '../../types';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card';
import { Loader2, Save, Trash2 } from 'lucide-react';

export default function Settings() {
    const [activeTab, setActiveTab] = useState<'branding' | 'configurations'>('branding');
    const [loading, setLoading] = useState(false);

    // Branding State
    const [settings, setSettings] = useState<Partial<CompanySettings>>({});

    useEffect(() => {
        fetchSettings();
    }, []);

    // --- Branding Functions ---
    const fetchSettings = async () => {
        setLoading(true);
        const { data } = await supabase.from('company_settings').select('*').single();
        if (data) {
            setSettings(data);
        }
        setLoading(false);
    };

    const handleSaveSettings = async () => {
        setLoading(true);
        try {
            // Check if exists
            const { data: existing } = await supabase.from('company_settings').select('id').single();

            if (existing) {
                const { error } = await supabase.from('company_settings').update(settings).eq('id', existing.id);
                if (error) throw error;
            } else {
                const { error } = await supabase.from('company_settings').insert(settings);
                if (error) throw error;
            }
            alert('Settings saved successfully');
        } catch (error) {
            console.error('Error saving settings:', error);
            alert('Failed to save settings');
        } finally {
            setLoading(false);
        }
    };

    // --- Configurations Functions ---
    const [mealPlans, setMealPlans] = useState<{ id: string; name: string }[]>([]);
    const [newMealPlan, setNewMealPlan] = useState('');

    const fetchMealPlans = async () => {
        const { data } = await supabase.from('meal_plans').select('*').order('name');
        setMealPlans(data || []);
    };

    const handleAddMealPlan = async () => {
        if (!newMealPlan.trim()) return;
        try {
            const { error } = await supabase.from('meal_plans').insert({ name: newMealPlan.trim() });
            if (error) throw error;
            setNewMealPlan('');
            fetchMealPlans();
        } catch (error) {
            console.error('Error adding meal plan:', error);
            alert('Failed to add meal plan');
        }
    };

    const handleDeleteMealPlan = async (id: string) => {
        if (!confirm('Are you sure you want to delete this meal plan?')) return;
        try {
            const { error } = await supabase.from('meal_plans').delete().eq('id', id);
            if (error) throw error;
            fetchMealPlans();
        } catch (error) {
            console.error('Error deleting meal plan:', error);
            alert('Failed to delete meal plan');
        }
    };

    useEffect(() => {
        if (activeTab === 'configurations') {
            fetchMealPlans();
        }
    }, [activeTab]);

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Settings</h1>
                <p className="text-muted-foreground mt-2">Manage your team and company branding.</p>
            </div>

            {/* Tabs */}
            <div className="flex space-x-1 bg-muted/20 p-1 rounded-lg w-fit">
                <button
                    onClick={() => setActiveTab('branding')}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'branding'
                        ? 'bg-white text-primary shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                        }`}
                >
                    Branding & PDF
                </button>
                <button
                    onClick={() => setActiveTab('configurations')}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'configurations'
                        ? 'bg-white text-primary shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                        }`}
                >
                    Configurations
                </button>
            </div>

            {activeTab === 'branding' && (
                <div className="space-y-6 animate-fade-in">
                    <Card>
                        <CardHeader>
                            <CardTitle>Company Details</CardTitle>
                            <CardDescription>These details will appear on your generated PDFs.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="text-sm font-medium mb-2 block">Company Name</label>
                                    <Input
                                        value={settings.company_name || ''}
                                        onChange={(e) => setSettings({ ...settings, company_name: e.target.value })}
                                        placeholder="H&H Travel"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-2 block">Website</label>
                                    <Input
                                        value={settings.company_website || ''}
                                        onChange={(e) => setSettings({ ...settings, company_website: e.target.value })}
                                        placeholder="www.hhtravel.com"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-2 block">Email Address</label>
                                    <Input
                                        value={settings.company_email || ''}
                                        onChange={(e) => setSettings({ ...settings, company_email: e.target.value })}
                                        placeholder="bookings@hhtravel.com"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-2 block">Logo Image</label>
                                    <div className="flex items-center gap-4">
                                        {settings.logo_url && (
                                            <img
                                                src={settings.logo_url}
                                                alt="Company Logo"
                                                className="h-12 w-12 object-contain border rounded p-1 bg-white"
                                            />
                                        )}
                                        <div className="flex-1">
                                            <Input
                                                type="file"
                                                accept="image/*"
                                                onChange={async (e) => {
                                                    const file = e.target.files?.[0];
                                                    if (!file) return;

                                                    try {
                                                        setLoading(true);
                                                        const fileExt = file.name.split('.').pop();
                                                        const fileName = `logo-${Date.now()}.${fileExt}`;
                                                        const { error: uploadError } = await supabase.storage
                                                            .from('company_assets')
                                                            .upload(fileName, file);

                                                        if (uploadError) throw uploadError;

                                                        const { data: { publicUrl } } = supabase.storage
                                                            .from('company_assets')
                                                            .getPublicUrl(fileName);

                                                        setSettings({ ...settings, logo_url: publicUrl });
                                                    } catch (error) {
                                                        console.error('Error uploading logo:', error);
                                                        alert('Failed to upload logo. Ensure "company_assets" bucket exists.');
                                                    } finally {
                                                        setLoading(false);
                                                    }
                                                }}
                                            />
                                            <p className="text-xs text-muted-foreground mt-1">Upload a PNG or JPG (Max 2MB).</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-2 block">Company Address</label>
                                <textarea
                                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    value={settings.company_address || ''}
                                    onChange={(e) => setSettings({ ...settings, company_address: e.target.value })}
                                    placeholder="123 Safari Way..."
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>PDF Appearance</CardTitle>
                            <CardDescription>Customize the footer and legal text on your documents.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div>
                                <label className="text-sm font-medium mb-2 block">Footer Text</label>
                                <textarea
                                    className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    value={settings.pdf_footer_text || ''}
                                    onChange={(e) => setSettings({ ...settings, pdf_footer_text: e.target.value })}
                                    placeholder="Thank you for traveling with us."
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-2 block">Footer Image</label>
                                <div className="flex items-center gap-4">
                                    {settings.pdf_footer_image_url && (
                                        <div className="relative group">
                                            <img
                                                src={settings.pdf_footer_image_url}
                                                alt="Footer Image"
                                                className="h-16 object-contain border rounded p-1 bg-white"
                                            />
                                            <button
                                                onClick={() => setSettings({ ...settings, pdf_footer_image_url: undefined })}
                                                className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                title="Remove image"
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </button>
                                        </div>
                                    )}
                                    <div className="flex-1">
                                        <Input
                                            type="file"
                                            accept="image/*"
                                            onChange={async (e) => {
                                                const file = e.target.files?.[0];
                                                if (!file) return;

                                                try {
                                                    setLoading(true);
                                                    const fileExt = file.name.split('.').pop();
                                                    const fileName = `footer-${Date.now()}.${fileExt}`;
                                                    const { error: uploadError } = await supabase.storage
                                                        .from('company_assets')
                                                        .upload(fileName, file);

                                                    if (uploadError) throw uploadError;

                                                    const { data: { publicUrl } } = supabase.storage
                                                        .from('company_assets')
                                                        .getPublicUrl(fileName);

                                                    setSettings({ ...settings, pdf_footer_image_url: publicUrl });
                                                } catch (error) {
                                                    console.error('Error uploading footer image:', error);
                                                    alert('Failed to upload image. Ensure "company_assets" bucket exists.');
                                                } finally {
                                                    setLoading(false);
                                                }
                                            }}
                                        />
                                        <p className="text-xs text-muted-foreground mt-1">Upload an image to appear at the bottom of every page (e.g. Safari Animals).</p>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-2 block">Footer Image (Right Side)</label>
                                    <div className="flex items-center gap-4">
                                        {settings.pdf_footer_image_right_url && (
                                            <div className="relative group">
                                                <img
                                                    src={settings.pdf_footer_image_right_url}
                                                    alt="Footer Image Right"
                                                    className="h-16 object-contain border rounded p-1 bg-white"
                                                />
                                                <button
                                                    onClick={() => setSettings({ ...settings, pdf_footer_image_right_url: undefined })}
                                                    className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    title="Remove image"
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </button>
                                            </div>
                                        )}
                                        <div className="flex-1">
                                            <Input
                                                type="file"
                                                accept="image/*"
                                                onChange={async (e) => {
                                                    const file = e.target.files?.[0];
                                                    if (!file) return;

                                                    try {
                                                        setLoading(true);
                                                        const fileExt = file.name.split('.').pop();
                                                        const fileName = `footer-right-${Date.now()}.${fileExt}`;
                                                        const { error: uploadError } = await supabase.storage
                                                            .from('company_assets')
                                                            .upload(fileName, file);

                                                        if (uploadError) throw uploadError;

                                                        const { data: { publicUrl } } = supabase.storage
                                                            .from('company_assets')
                                                            .getPublicUrl(fileName);

                                                        setSettings({ ...settings, pdf_footer_image_right_url: publicUrl });
                                                    } catch (error) {
                                                        console.error('Error uploading right footer image:', error);
                                                        alert('Failed to upload image. Ensure "company_assets" bucket exists.');
                                                    } finally {
                                                        setLoading(false);
                                                    }
                                                }}
                                            />
                                            <p className="text-xs text-muted-foreground mt-1">Upload an image to appear at the bottom right of every page.</p>
                                        </div>
                                    </div>
                                </div>

                            </div>

                        </CardContent>
                    </Card>

                    <div className="flex justify-end">
                        <Button onClick={handleSaveSettings} disabled={loading}>
                            {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                            Save Changes
                        </Button>
                    </div>
                </div>
            )}

            {activeTab === 'configurations' && (
                <div className="space-y-6 animate-fade-in">
                    <Card>
                        <CardHeader>
                            <CardTitle>Meal Plans</CardTitle>
                            <CardDescription>Manage available meal plans for quotations.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Add new meal plan..."
                                    value={newMealPlan}
                                    onChange={(e) => setNewMealPlan(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAddMealPlan()}
                                />
                                <Button onClick={handleAddMealPlan}>Add</Button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                {mealPlans.map((plan) => (
                                    <div key={plan.id} className="flex items-center justify-between p-3 rounded-md border bg-muted/20">
                                        <span className="font-medium">{plan.name}</span>
                                        <button
                                            onClick={() => handleDeleteMealPlan(plan.id)}
                                            className="text-muted-foreground hover:text-destructive transition-colors"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}

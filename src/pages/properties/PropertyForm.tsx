import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { supabase } from '../../lib/supabase';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/ui/Card';

interface PropertyFormData {
    name: string;
}

export default function PropertyForm() {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const isEditing = Boolean(id);
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(false);

    const { register, handleSubmit, reset, formState: { errors } } = useForm<PropertyFormData>();

    useEffect(() => {
        if (isEditing) {
            fetchProperty();
        }
    }, [id]);

    const fetchProperty = async () => {
        if (!id) return;
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('properties')
                .select('name') // Only fetch name
                .eq('id', id)
                .single();

            if (error) throw error;
            if (data) {
                reset({
                    name: data.name
                });
            }
        } catch (error) {
            console.error('Error fetching property:', error);
            alert('Failed to load property details');
            navigate('/properties');
        } finally {
            setLoading(false);
        }
    };

    const onSubmit = async (data: PropertyFormData) => {
        setSaving(true);
        try {
            const propertyData = {
                name: data.name
                // implicit: ignoring other fields or letting them stay as is in DB if partial update, 
                // but for insert we need to respect schema if non-nullable. 
                // Checks: location etc are likely nullable or have default? 
                // Modal insert used empty strings.
            };

            let error;
            if (isEditing && id) {
                const { error: updateError } = await supabase
                    .from('properties')
                    .update(propertyData)
                    .eq('id', id);
                error = updateError;
            } else {
                const { error: insertError } = await supabase
                    .from('properties')
                    .insert({
                        ...propertyData,
                        location: '',
                        contact_info: { phone: '', email: '', website: '' },
                        images: []
                    });
                error = insertError;
            }

            if (error) throw error;
            navigate('/properties');
        } catch (error) {
            console.error('Error saving property:', error);
            alert('Failed to save property');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8 h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center space-x-4">
                <Button variant="ghost" size="icon" onClick={() => navigate('/properties')}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">{isEditing ? 'Edit Property' : 'Add New Property'}</h1>
                    <p className="text-sm text-muted-foreground">{isEditing ? 'Update property details' : 'Create a new property'}</p>
                </div>
            </div>

            <Card>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <CardHeader>
                        <CardTitle>Property Details</CardTitle>
                        <CardDescription>Enter the name of the property.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none">Property Name</label>
                            <Input
                                {...register('name', { required: 'Property name is required' })}
                                placeholder="e.g. Sarova Stanley"
                                className={errors.name ? 'border-red-500' : ''}
                            />
                            {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-end space-x-2 border-t pt-6">
                        <Button type="button" variant="ghost" onClick={() => navigate('/properties')}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={saving}>
                            {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            {!saving && <Save className="h-4 w-4 mr-2" />}
                            {saving ? 'Saving...' : 'Save Property'}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}

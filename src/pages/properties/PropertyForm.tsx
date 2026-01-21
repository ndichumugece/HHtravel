import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { supabase } from '../../lib/supabase';
import { ArrowLeft, Save } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { Property } from '../../types';

interface PropertyFormData {
    name: string;
    location: string;
    phone: string;
    email: string;
    website: string;
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
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;
            if (data) {
                reset({
                    name: data.name,
                    location: data.location || '',
                    phone: data.contact_info?.phone || '',
                    email: data.contact_info?.email || '',
                    website: data.contact_info?.website || ''
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
                name: data.name,
                location: data.location,
                contact_info: {
                    phone: data.phone,
                    email: data.email,
                    website: data.website
                },
                // Preserve existing images if editing, or initialize empty
                // In a real app we'd fetch current images first to append/modify, 
                // but since we aren't editing images here yet, we should be careful not to overwrite with empty array if update
                // For now, let's just not update images on edit, only on create.
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
                    .insert({ ...propertyData, images: [] });
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
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto">
            <div className="flex items-center mb-6">
                <button
                    onClick={() => navigate('/properties')}
                    className="mr-4 p-2 rounded-full hover:bg-gray-100 text-gray-600"
                >
                    <ArrowLeft className="h-5 w-5" />
                </button>
                <h1 className="text-2xl font-bold text-gray-900">{isEditing ? 'Edit Property' : 'Add New Property'}</h1>
            </div>

            <div className="bg-white shadow rounded-lg overflow-hidden">
                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">

                    <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                        <div className="sm:col-span-6">
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Property Name</label>
                            <div className="mt-1">
                                <input
                                    type="text"
                                    id="name"
                                    {...register('name', { required: 'Property name is required' })}
                                    className={cn(
                                        "shadow-sm focus:ring-brand-500 focus:border-brand-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border",
                                        errors.name && "border-red-300 focus:ring-red-500 focus:border-red-500"
                                    )}
                                />
                                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
                            </div>
                        </div>

                        <div className="sm:col-span-6">
                            <label htmlFor="location" className="block text-sm font-medium text-gray-700">Address / Location</label>
                            <div className="mt-1">
                                <input
                                    type="text"
                                    id="location"
                                    {...register('location')}
                                    className="shadow-sm focus:ring-brand-500 focus:border-brand-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                                />
                            </div>
                        </div>

                        <div className="sm:col-span-3">
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone</label>
                            <div className="mt-1">
                                <input
                                    type="text"
                                    id="phone"
                                    {...register('phone')}
                                    className="shadow-sm focus:ring-brand-500 focus:border-brand-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                                />
                            </div>
                        </div>

                        <div className="sm:col-span-3">
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                            <div className="mt-1">
                                <input
                                    type="email"
                                    id="email"
                                    {...register('email')}
                                    className="shadow-sm focus:ring-brand-500 focus:border-brand-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                                />
                            </div>
                        </div>

                        <div className="sm:col-span-6">
                            <label htmlFor="website" className="block text-sm font-medium text-gray-700">Website</label>
                            <div className="mt-1">
                                <input
                                    type="text"
                                    id="website"
                                    {...register('website')}
                                    className="shadow-sm focus:ring-brand-500 focus:border-brand-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                                    placeholder="https://"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-5 border-t border-gray-200 flex justify-end">
                        <button
                            type="button"
                            onClick={() => navigate('/properties')}
                            className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 disabled:opacity-50"
                        >
                            <Save className="h-4 w-4 mr-2" />
                            {saving ? 'Saving...' : 'Save Property'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

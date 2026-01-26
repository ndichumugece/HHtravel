import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from '../../lib/supabase';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Loader2, Plus } from 'lucide-react';
import type { Property } from '../../types';

interface AddPropertyModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (property: Property) => void;
}

interface PropertyFormData {
    name: string;
}

export function AddPropertyModal({ isOpen, onClose, onSuccess }: AddPropertyModalProps) {
    const [loading, setLoading] = useState(false);
    const { register, handleSubmit, reset, formState: { errors } } = useForm<PropertyFormData>();

    const onSubmit = async (data: PropertyFormData) => {
        setLoading(true);
        try {
            const { data: newProperty, error } = await supabase
                .from('properties')
                .insert({
                    name: data.name,
                    location: '',
                    contact_info: { phone: '', email: '', website: '' },
                    images: []
                })
                .select()
                .single();

            if (error) throw error;

            if (newProperty) {
                onSuccess(newProperty as Property);
                reset();
                onClose();
            }
        } catch (error) {
            console.error('Error adding property:', error);
            alert('Failed to add property');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add New Property</DialogTitle>
                    <DialogDescription>
                        Create a new property to use in your bookings.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium leading-none">Property Name *</label>
                        <Input
                            {...register('name', { required: 'Name is required' })}
                            className={errors.name ? 'border-red-500' : ''}
                            placeholder="e.g. Sarova Stanley"
                        />
                        {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
                    </div>

                    <div className="flex justify-end space-x-2 pt-4">
                        <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            {!loading && <Plus className="h-4 w-4 mr-2" />}
                            Create Property
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

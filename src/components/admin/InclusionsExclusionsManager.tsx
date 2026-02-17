import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import type { Inclusion } from '../../types';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import { Loader2, Plus, Save, Trash2, Search, Image as ImageIcon, CheckCircle, XCircle } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useDebounce } from '../../hooks/useDebounce';

type ItemType = 'inclusions' | 'exclusions';

interface Item extends Inclusion { } // Reuse interface as they are identical structure

interface InclusionsExclusionsManagerProps {
    type: ItemType;
}

export default function InclusionsExclusionsManager({ type }: InclusionsExclusionsManagerProps) {
    // const [activeType, setActiveType] = useState<ItemType>(initialTab); // Removed state
    const [items, setItems] = useState<Item[]>([]);
    const [filteredItems, setFilteredItems] = useState<Item[]>([]);
    const [selectedItem, setSelectedItem] = useState<Item | null>(null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const debouncedSearch = useDebounce(searchQuery, 300);

    // Form State
    const [formData, setFormData] = useState<Partial<Item>>({});

    useEffect(() => {
        fetchItems();
        setSelectedItem(null);
        setFormData({});
        setSearchQuery('');
    }, [type]); // Depend on prop

    useEffect(() => {
        if (!searchQuery) {
            setFilteredItems(items);
        } else {
            const lowerQuery = searchQuery.toLowerCase();
            setFilteredItems(items.filter(item =>
                item.name.toLowerCase().includes(lowerQuery) ||
                item.slug?.toLowerCase().includes(lowerQuery)
            ));
        }
    }, [debouncedSearch, items]);

    const fetchItems = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from(type) // Use prop
            .select('*')
            .order('name');

        if (error) {
            console.error(`Error fetching ${type}:`, error);
        } else {
            setItems(data as Item[] || []);
            setFilteredItems(data as Item[] || []);
        }
        setLoading(false);
    };

    const handleSelect = (item: Item) => {
        setSelectedItem(item);
        setFormData(item);
    };

    const handleCreateNew = () => {
        const newItem: Partial<Item> = {
            name: '',
            slug: '',
            is_published: true,
            icon_url: ''
        };
        setSelectedItem(null);
        setFormData(newItem);
    };

    const generateSlug = (name: string) => {
        return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    };

    const handleNameChange = (name: string) => {
        const updates: any = { name };
        // Always auto-generate slug since manual input is removed
        updates.slug = generateSlug(name);
        setFormData(prev => ({ ...prev, ...updates }));
    };

    const handleSave = async () => {
        if (!formData.name) return;
        setSaving(true);

        try {
            const payload = {
                name: formData.name,
                slug: formData.slug || generateSlug(formData.name),
                icon_url: formData.icon_url,
                is_published: formData.is_published
            };

            let error;
            if (selectedItem?.id) {
                // Update
                const { error: updateError } = await supabase
                    .from(type) // Use prop
                    .update(payload)
                    .eq('id', selectedItem.id);
                error = updateError;
            } else {
                // Create
                const { error: insertError } = await supabase
                    .from(type) // Use prop
                    .insert([payload]);
                error = insertError;
            }

            if (error) throw error;

            await fetchItems();

            // Re-select the item or clear form
            if (selectedItem) {
                // Updated
                const updated = items.find(i => i.id === selectedItem.id);
                if (updated) handleSelect({ ...updated, ...payload } as Item); // Optimistic-ish
            } else {
                // Created - clear form to allow another
                handleCreateNew();
                // removed alert for smoother UX
            }

        } catch (error: any) {
            console.error('Error saving item:', error);
            alert(`Failed to save: ${error.message}`);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this item?')) return;

        try {
            const { error } = await supabase.from(type).delete().eq('id', id); // Use prop
            if (error) throw error;

            fetchItems();
            if (selectedItem?.id === id) {
                handleCreateNew();
            }
        } catch (error: any) {
            console.error('Error deleting item:', error);
            alert('Failed to delete item.');
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setSaving(true);
            const fileExt = file.name.split('.').pop();
            const fileName = `${type}-${Date.now()}.${fileExt}`; // Use prop
            const { error: uploadError } = await supabase.storage
                .from('company_assets')
                .upload(fileName, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('company_assets')
                .getPublicUrl(fileName);

            setFormData(prev => ({ ...prev, icon_url: publicUrl }));
        } catch (error: any) {
            console.error('Error uploading icon:', error);
            alert('Failed to upload icon.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-[600px]">
            {/* Sidebar List */}
            <div className="md:col-span-4 flex flex-col h-full border rounded-lg bg-background overflow-hidden">
                <div className="p-4 border-b bg-muted/20 space-y-3">
                    {/* Tabs Removed */}

                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder={`Search ${type}...`}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 h-9"
                        />
                    </div>
                    <Button onClick={handleCreateNew} size="sm" className="w-full" variant="outline">
                        <Plus className="h-4 w-4 mr-2" /> Add New
                    </Button>
                </div>

                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {loading ? (
                        <div className="flex justify-center p-4"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
                    ) : filteredItems.length === 0 ? (
                        <div className="text-center p-4 text-sm text-muted-foreground">No items found.</div>
                    ) : (
                        filteredItems.map(item => (
                            <div
                                key={item.id}
                                onClick={() => handleSelect(item)}
                                className={cn(
                                    "flex items-center justify-between px-3 py-2 rounded-md cursor-pointer text-sm transition-colors group",
                                    selectedItem?.id === item.id
                                        ? "bg-primary/10 text-primary font-medium"
                                        : "hover:bg-muted text-foreground"
                                )}
                            >
                                <span className="truncate">{item.name}</span>
                                <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    {item.is_published ?
                                        <CheckCircle className="h-3 w-3 text-green-500 mr-2" /> :
                                        <XCircle className="h-3 w-3 text-gray-400 mr-2" />
                                    }
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Main Detail View */}
            <div className="md:col-span-8 h-full">
                <Card className="h-full flex flex-col">
                    <CardHeader className="border-b pb-4">
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle>{selectedItem ? 'Edit Item' : 'Create New Item'}</CardTitle>
                                <CardDescription>
                                    {selectedItem ? `Manage details for this ${type === 'inclusions' ? 'inclusion' : 'exclusion'}.` : `Add a new ${type === 'inclusions' ? 'inclusion' : 'exclusion'} to the list.`}
                                </CardDescription>
                            </div>
                            {selectedItem && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-muted-foreground hover:text-destructive"
                                    onClick={() => handleDelete(selectedItem.id)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-y-auto p-6 space-y-6">
                        <div className="space-y-4">
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Name</label>
                                <Input
                                    value={formData.name || ''}
                                    onChange={(e) => handleNameChange(e.target.value)}
                                    placeholder="e.g. Airport Transfers"
                                />
                            </div>

                        </div>

                        {/* Slug removed from UI as per request */}

                        <div className="grid gap-2">

                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Status</label>
                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={() => setFormData(prev => ({ ...prev, is_published: !prev.is_published }))}
                                        className={cn(
                                            "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                                            formData.is_published ? "bg-primary" : "bg-input"
                                        )}
                                    >
                                        <span
                                            className={cn(
                                                "inline-block h-4 w-4 transform rounded-full bg-background transition-transform",
                                                formData.is_published ? "translate-x-6" : "translate-x-1"
                                            )}
                                        />
                                    </button>
                                    <span className="text-sm text-foreground">{formData.is_published ? 'Published' : 'Draft'}</span>
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Icon (Optional)</label>
                                <div className="flex items-start space-x-4 p-4 border rounded-lg bg-muted/10">
                                    {formData.icon_url ? (
                                        <div className="relative group">
                                            <img
                                                src={formData.icon_url}
                                                alt="Icon"
                                                className="h-16 w-16 object-contain bg-white rounded-md border p-1"
                                            />
                                            <button
                                                onClick={() => setFormData(prev => ({ ...prev, icon_url: '' }))}
                                                className="absolute -top-2 -right-2 bg-destructive text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="h-16 w-16 rounded-md border-2 border-dashed border-muted-foreground/25 flex items-center justify-center bg-muted/20">
                                            <ImageIcon className="h-6 w-6 text-muted-foreground/50" />
                                        </div>
                                    )}
                                    <div className="flex-1 space-y-2">
                                        <Input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileUpload}
                                            className="text-xs"
                                        />
                                        <p className="text-[10px] text-muted-foreground">Recommended: 64x64px PNG or SVG.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                    <div className="p-4 border-t bg-muted/10 flex justify-end">
                        <Button onClick={handleSave} disabled={saving || !formData.name}>
                            {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            <Save className="h-4 w-4 mr-2" />
                            Save {type === 'inclusions' ? 'Inclusion' : 'Exclusion'}
                        </Button>
                    </div>
                </Card>
            </div>
        </div>
    );
}

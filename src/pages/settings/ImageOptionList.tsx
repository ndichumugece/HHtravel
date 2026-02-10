import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Plus, Trash2, Loader2, Pencil, Save, X, ImageIcon } from 'lucide-react';
import ImageUpload from '../../components/ui/ImageUpload';
import { DEFAULT_INCLUSIONS, DEFAULT_EXCLUSIONS } from '../../constants/defaults';

interface ImageOption {
    id: string;
    name: string;
    icon_url?: string | null;
    created_at: string;
}

interface ImageOptionListProps {
    title: string;
    tableName: string;
    bucketName?: string;
}

export default function ImageOptionList({ title, tableName, bucketName = 'company_assets' }: ImageOptionListProps) {
    const [options, setOptions] = useState<ImageOption[]>([]);
    const [loading, setLoading] = useState(true);

    // Add State
    const [newName, setNewName] = useState('');
    const [newIcon, setNewIcon] = useState<string | null>(null);
    const [adding, setAdding] = useState(false);

    // Edit State
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState('');
    const [editIcon, setEditIcon] = useState<string | null>(null);



    useEffect(() => {
        fetchOptions();
    }, [tableName]);

    const fetchOptions = async () => {
        setLoading(true);

        const { data, error: dbError } = await supabase
            .from(tableName)
            .select('*')
            .order('name');

        if (dbError) {
            console.error('Error fetching options:', dbError);
            console.error('Error fetching options:', dbError);
            // setError(`Failed to load data. Error: ${dbError.message}`);
        } else {
            const items = data || [];
            setOptions(items);

            // Auto-populate if empty and matches default tables
            if (items.length === 0 && (tableName === 'inclusions' || tableName === 'exclusions')) {
                populateDefaultsSilent();
            }
        }
        setLoading(false);
    };

    const populateDefaultsSilent = async () => {
        const defaults = tableName === 'inclusions' ? DEFAULT_INCLUSIONS :
            tableName === 'exclusions' ? DEFAULT_EXCLUSIONS : [];

        if (defaults.length === 0) return;

        for (const name of defaults) {
            const { data: existing } = await supabase.from(tableName).select('id').eq('name', name).single();
            if (!existing) {
                await supabase.from(tableName).insert({ name });
            }
        }

        const { data } = await supabase.from(tableName).select('*').order('name');
        if (data) setOptions(data);
    };

    const handlePopulateDefaults = async () => {
        if (!confirm(`This will add default ${title.toLowerCase()} to the list. Are you sure?`)) return;

        setLoading(true);

        const defaults = tableName === 'inclusions' ? DEFAULT_INCLUSIONS :
            tableName === 'exclusions' ? DEFAULT_EXCLUSIONS : [];

        if (defaults.length === 0) {
            setLoading(false);
            return;
        }

        let successCount = 0;
        let failCount = 0;

        for (const name of defaults) {
            const { data: existing } = await supabase.from(tableName).select('id').eq('name', name).single();
            if (!existing) {
                const { error } = await supabase.from(tableName).insert({ name });
                if (!error) successCount++;
                else failCount++;
            }
        }

        alert(`Population complete. Added: ${successCount}. Skipped/Failed: ${defaults.length - successCount}`);
        fetchOptions();
    };

    const handleAdd = async () => {
        if (!newName.trim()) return;
        setAdding(true);


        const { error } = await supabase
            .from(tableName)
            .insert([{
                name: newName.trim(),
                icon_url: newIcon
            }]);

        if (error) {
            console.error('Error adding option:', error);
            alert('Failed to add option. Ensure name is unique.');
        } else {
            setNewName('');
            setNewIcon(null);
            fetchOptions();
        }
        setAdding(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this option?')) return;

        const { error } = await supabase
            .from(tableName)
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting option:', error);
            alert('Failed to delete option.');
        } else {
            fetchOptions();
        }
    };

    const startEditing = (option: ImageOption) => {
        setEditingId(option.id);
        setEditName(option.name);
        setEditIcon(option.icon_url || null);
    };

    const cancelEditing = () => {
        setEditingId(null);
        setEditName('');
        setEditIcon(null);
    };

    const saveEditing = async (id: string) => {
        if (!editName.trim()) return;

        const { error } = await supabase
            .from(tableName)
            .update({
                name: editName.trim(),
                icon_url: editIcon
            })
            .eq('id', id);

        if (error) {
            console.error('Error updating option:', error);
            alert('Failed to update option.');
        } else {
            setEditingId(null);
            fetchOptions();
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-20">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
                {/* Add button here if list is empty */}
                {options.length === 0 && !loading && (tableName === 'inclusions' || tableName === 'exclusions') && (
                    <Button variant="outline" onClick={handlePopulateDefaults} className="ml-auto">
                        <Plus className="h-4 w-4 mr-2" />
                        Populate Defaults
                    </Button>
                )}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Manage {title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Add New Form */}
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end border-b pb-6">
                        <div className="flex-1 w-full">
                            <label className="text-sm font-medium mb-1.5 block">Name</label>
                            <Input
                                placeholder={`New ${title.slice(0, -1).toLowerCase()} name...`}
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                            />
                        </div>
                        <div className="sm:max-w-[200px]">
                            <label className="text-sm font-medium mb-1.5 block">Icon (Optional)</label>
                            <ImageUpload
                                bucketName={bucketName}
                                folderPath={`${tableName}/icons`}
                                value={newIcon}
                                onChange={setNewIcon}
                            />
                        </div>
                        <div className="sm:pb-0.5">
                            <Button onClick={handleAdd} disabled={!newName.trim() || adding}>
                                {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                                <span className="ml-2">Add</span>
                            </Button>
                        </div>
                    </div>

                    {/* List */}
                    <div className="space-y-2">
                        {loading ? (
                            <div className="p-12 text-center text-muted-foreground flex flex-col items-center">
                                <Loader2 className="h-8 w-8 animate-spin mb-2" />
                                Loading...
                            </div>
                        ) : options.length === 0 ? (
                            <div className="p-12 text-center text-muted-foreground border border-dashed rounded-lg bg-gray-50/50">
                                No options found. Add one above to get started.
                            </div>
                        ) : (
                            <div className="grid gap-2">
                                {options.map((option) => (
                                    <div
                                        key={option.id}
                                        className={`p-3 rounded-lg border transition-all ${editingId === option.id ? 'bg-blue-50/50 border-blue-200' : 'hover:bg-gray-50 border-gray-100'
                                            }`}
                                    >
                                        {editingId === option.id ? (
                                            <div className="flex flex-col sm:flex-row gap-4 items-center">
                                                <div className="relative group shrink-0">
                                                    {editIcon ? (
                                                        <img src={editIcon} className="h-10 w-10 object-contain bg-white rounded border p-1" />
                                                    ) : (
                                                        <div className="h-10 w-10 flex items-center justify-center bg-gray-100 rounded border text-gray-400">
                                                            <ImageIcon className="h-5 w-5" />
                                                        </div>
                                                    )}
                                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center">
                                                        <ImageUpload
                                                            bucketName={bucketName}
                                                            folderPath={`${tableName}/icons`}
                                                            value={editIcon}
                                                            onChange={setEditIcon}
                                                            className="scale-75 origin-center" // Hacky quick style
                                                        />
                                                    </div>
                                                </div>

                                                <div className="flex-1 w-full">
                                                    <Input
                                                        value={editName}
                                                        onChange={(e) => setEditName(e.target.value)}
                                                        className="bg-white"
                                                    />
                                                </div>

                                                <div className="flex gap-2 self-end sm:self-center">
                                                    <Button size="sm" onClick={() => saveEditing(option.id)}>
                                                        <Save className="h-4 w-4 mr-1" /> Save
                                                    </Button>
                                                    <Button size="sm" variant="ghost" onClick={cancelEditing}>
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-between gap-4">
                                                <div className="flex items-center gap-3 overflow-hidden">
                                                    <div className="shrink-0 h-10 w-10 rounded-md bg-gray-100 flex items-center justify-center border border-gray-200">
                                                        {option.icon_url ? (
                                                            <img
                                                                src={option.icon_url}
                                                                alt={option.name}
                                                                className="h-8 w-8 object-contain"
                                                            />
                                                        ) : (
                                                            <ImageIcon className="h-5 w-5 text-gray-400" />
                                                        )}
                                                    </div>
                                                    <span className="font-medium truncate">{option.name}</span>
                                                </div>

                                                <div className="flex items-center gap-1 shrink-0">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-muted-foreground hover:text-primary"
                                                        onClick={() => startEditing(option)}
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                                        onClick={() => handleDelete(option.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

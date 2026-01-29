import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Plus, Trash2, Loader2 } from 'lucide-react';

interface Option {
    id: string;
    name: string;
    created_at: string;
}

interface OptionsListProps {
    title: string;
    tableName: string;
}

export default function OptionsList({ title, tableName }: OptionsListProps) {
    const [options, setOptions] = useState<Option[]>([]);
    const [loading, setLoading] = useState(true);
    const [newOption, setNewOption] = useState('');
    const [adding, setAdding] = useState(false);

    useEffect(() => {
        fetchOptions();
    }, [tableName]);

    const fetchOptions = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from(tableName)
            .select('*')
            .order('name');

        if (error) {
            console.error('Error fetching options:', error);
        } else {
            setOptions(data || []);
        }
        setLoading(false);
    };

    const handleAdd = async () => {
        if (!newOption.trim()) return;
        setAdding(true);

        const { error } = await supabase
            .from(tableName)
            .insert([{ name: newOption.trim() }]);

        if (error) {
            console.error('Error adding option:', error);
            alert('Failed to add option. Ensure it is unique.');
        } else {
            setNewOption('');
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

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Manage {title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex gap-4">
                        <Input
                            placeholder={`Add new ${title.slice(0, -1).toLowerCase()}...`}
                            value={newOption}
                            onChange={(e) => setNewOption(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                        />
                        <Button onClick={handleAdd} disabled={!newOption.trim() || adding}>
                            {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                            <span className="ml-2 hidden sm:inline">Add</span>
                        </Button>
                    </div>

                    <div className="border rounded-md divide-y">
                        {loading ? (
                            <div className="p-8 text-center text-muted-foreground">Loading...</div>
                        ) : options.length === 0 ? (
                            <div className="p-8 text-center text-muted-foreground">No options found. Add one above.</div>
                        ) : (
                            options.map((option) => (
                                <div key={option.id} className="p-4 flex justify-between items-center hover:bg-muted/50 transition-colors">
                                    <span className="font-medium">{option.name}</span>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                        onClick={() => handleDelete(option.id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

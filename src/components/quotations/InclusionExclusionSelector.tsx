import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Check, Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils'; // Assuming cn utility exists, otherwise use template literals


interface InclusionExclusionSelectorProps {
    type: 'inclusions' | 'exclusions';
    selectedItems: string[];
    onChange: (items: string[]) => void;
}

export default function InclusionExclusionSelector({ type, selectedItems, onChange }: InclusionExclusionSelectorProps) {
    const [items, setItems] = useState<{ id: string; name: string }[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchItems();
    }, [type]);

    const fetchItems = async () => {
        try {
            const { data, error } = await supabase.from(type).select('id, name').order('name');
            if (error) throw error;
            setItems(data || []);
        } catch (error) {
            console.error(`Error fetching ${type}:`, error);
        } finally {
            setLoading(false);
        }
    };

    const toggleItem = (name: string) => {
        const newSelected = selectedItems.includes(name)
            ? selectedItems.filter(item => item !== name)
            : [...selectedItems, name];
        onChange(newSelected);
    };

    if (loading) {
        return <div className="flex items-center text-sm text-muted-foreground"><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Loading options...</div>;
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
            {items.map((item) => {
                const isSelected = selectedItems.includes(item.name);
                return (
                    <div
                        key={item.id}
                        onClick={() => toggleItem(item.name)}
                        className={cn(
                            "flex items-center p-3 rounded-md border cursor-pointer transition-colors text-sm",
                            isSelected
                                ? "bg-primary/10 border-primary text-primary font-medium"
                                : "bg-background border-input hover:bg-muted"
                        )}
                    >
                        <div className={cn(
                            "h-4 w-4 mr-3 rounded border flex items-center justify-center shrink-0",
                            isSelected ? "bg-primary border-primary text-primary-foreground" : "border-muted-foreground"
                        )}>
                            {isSelected && <Check className="h-3 w-3" />}
                        </div>
                        {item.name}
                    </div>
                );
            })}
            {items.length === 0 && (
                <div className="text-sm text-muted-foreground col-span-2">No options found. Add them in Settings.</div>
            )}
        </div>
    );
}

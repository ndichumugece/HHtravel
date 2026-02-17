import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

export default function DebugIcons() {
    const [inclusions, setInclusions] = useState<any[]>([]);
    const [exclusions, setExclusions] = useState<any[]>([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        const { data: inc } = await supabase.from('inclusions').select('*');
        const { data: exc } = await supabase.from('exclusions').select('*');
        setInclusions(inc || []);
        setExclusions(exc || []);
    };

    return (
        <div className="p-8 space-y-8">
            <h1 className="text-2xl font-bold">Debug Icons</h1>

            <section>
                <h2 className="text-xl font-semibold mb-4">Inclusions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {inclusions.map(item => (
                        <div key={item.id} className="border p-4 rounded flex items-center space-x-4">
                            <div className="w-16 h-16 bg-gray-100 flex items-center justify-center border">
                                {item.icon_url ? (
                                    <img src={item.icon_url} alt={item.name} className="max-w-full max-h-full" />
                                ) : (
                                    <span className="text-xs text-gray-500">No Image</span>
                                )}
                            </div>
                            <div>
                                <p className="font-bold">{item.name}</p>
                                <p className="text-xs text-blue-500 break-all">{item.icon_url || 'NULL'}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <section>
                <h2 className="text-xl font-semibold mb-4">Exclusions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {exclusions.map(item => (
                        <div key={item.id} className="border p-4 rounded flex items-center space-x-4">
                            <div className="w-16 h-16 bg-gray-100 flex items-center justify-center border">
                                {item.icon_url ? (
                                    <img src={item.icon_url} alt={item.name} className="max-w-full max-h-full" />
                                ) : (
                                    <span className="text-xs text-gray-500">No Image</span>
                                )}
                            </div>
                            <div>
                                <p className="font-bold">{item.name}</p>
                                <p className="text-xs text-blue-500 break-all">{item.icon_url || 'NULL'}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}

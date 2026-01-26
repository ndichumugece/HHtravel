import { useEffect, useState } from 'react';
import { WifiOff } from 'lucide-react';

export function OfflineNotice() {
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    if (isOnline) return null;

    return (
        <div className="bg-amber-100 border-l-4 border-amber-500 text-amber-700 p-4 sticky top-0 z-50 animate-in slide-in-from-top duration-300">
            <div className="flex items-center">
                <WifiOff className="h-5 w-5 mr-3" />
                <p className="font-medium">You are currently offline. Changes may not be saved.</p>
            </div>
        </div>
    );
}

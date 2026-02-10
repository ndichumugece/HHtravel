import { useRegisterSW } from 'virtual:pwa-register/react';
import { Button } from './Button';
import { RotateCw, X } from 'lucide-react';

export function ReloadPrompt() {
    const {
        offlineReady: [offlineReady, setOfflineReady],
        needRefresh: [needRefresh, setNeedRefresh],
        updateServiceWorker,
    } = useRegisterSW({
        onRegistered(r) {
            // eslint-disable-next-line no-console
            // console.log('SW Registered: ' + r);
        },
        onRegisterError(error) {
            // eslint-disable-next-line no-console
            // console.log('SW registration error', error);
        },
    });

    const close = () => {
        setOfflineReady(false);
        setNeedRefresh(false);
    };

    if (!offlineReady && !needRefresh) {
        return null;
    }

    return (
        <div className="fixed bottom-0 right-0 p-4 mx-auto w-full md:w-auto z-[100]">
            <div className="bg-card border border-border text-card-foreground p-4 rounded-lg shadow-lg flex flex-col gap-3 animate-in slide-in-from-bottom duration-300 md:min-w-[350px]">
                <div className="flex items-start justify-between">
                    <div>
                        <h3 className="font-semibold text-sm">
                            {offlineReady ? 'App ready to work offline' : 'New content available'}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1">
                            {offlineReady
                                ? 'You can now use this app without an internet connection.'
                                : 'A new version of the app is available. Click reload to update.'}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2 justify-end">
                    {needRefresh && (
                        <Button size="sm" onClick={() => updateServiceWorker(true)}>
                            <RotateCw className="h-3 w-3 mr-2" />
                            Reload
                        </Button>
                    )}
                    <Button size="sm" variant="outline" onClick={close} className="h-9 w-9 p-0">
                        <X className="h-4 w-4" />
                        <span className="sr-only">Close</span>
                    </Button>
                </div>
            </div>
        </div>
    );
}

import { X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface SlideOverProps {
    open: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
}

export default function SlideOver({ open, onClose, title, children }: SlideOverProps) {
    const [isVisible, setIsVisible] = useState(false);

    // Handle animation sequencing
    useEffect(() => {
        if (open) {
            setIsVisible(true);
        } else {
            const timer = setTimeout(() => setIsVisible(false), 300); // Match transition duration
            return () => clearTimeout(timer);
        }
    }, [open]);

    if (!isVisible) return null;

    return createPortal(
        <div className="relative z-50">
            {/* Backdrop */}
            <div
                className={`fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity duration-300 ease-in-out ${open ? 'opacity-100' : 'opacity-0'
                    }`}
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Panel */}
            <div className="fixed inset-0 overflow-hidden">
                <div className="absolute inset-0 overflow-hidden">
                    <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16">
                        <div
                            className={`pointer-events-auto w-screen max-w-md transform transition ease-in-out duration-300 sm:duration-300 ${open ? 'translate-x-0' : 'translate-x-full'
                                }`}
                        >
                            <div className="flex h-full flex-col overflow-y-scroll bg-white shadow-xl">
                                <div className="px-4 py-6 sm:px-6 border-b border-gray-100">
                                    <div className="flex items-start justify-between">
                                        <h2 className="text-lg font-semibold leading-6 text-gray-900" id="slide-over-title">
                                            {title}
                                        </h2>
                                        <div className="ml-3 flex h-7 items-center">
                                            <button
                                                type="button"
                                                className="relative rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                                                onClick={onClose}
                                            >
                                                <span className="absolute -inset-2.5" />
                                                <span className="sr-only">Close panel</span>
                                                <X className="h-6 w-6" aria-hidden="true" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div className="relative mt-2 flex-1 px-4 sm:px-6 py-4">
                                    {children}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}

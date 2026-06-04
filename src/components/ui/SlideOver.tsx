import { X } from 'lucide-react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { drawerVariants } from '../../lib/motion';

interface SlideOverProps {
    open: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
}

export default function SlideOver({ open, onClose, title, children }: SlideOverProps) {
    return createPortal(
        <AnimatePresence>
            {open && (
                <div className="relative z-50">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 bg-black/25 backdrop-blur-[4px]"
                        onClick={onClose}
                        aria-hidden="true"
                    />

                    {/* Panel Container */}
                    <div className="fixed inset-0 overflow-hidden pointer-events-none">
                        <div className="absolute inset-0 overflow-hidden">
                            <div className="fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16">
                                <motion.div
                                    variants={drawerVariants}
                                    initial="initial"
                                    animate="animate"
                                    exit="exit"
                                    className="pointer-events-auto w-screen max-w-md"
                                >
                                    <div className="flex h-full flex-col overflow-y-scroll bg-white/70 backdrop-blur-xl border-l border-white/20 shadow-2xl">
                                        <div className="px-4 py-6 sm:px-6 border-b border-gray-200/50">
                                            <div className="flex items-start justify-between">
                                                <h2 className="text-lg font-semibold leading-6 text-gray-900" id="slide-over-title">
                                                    {title}
                                                </h2>
                                                <div className="ml-3 flex h-7 items-center">
                                                    <button
                                                        type="button"
                                                        className="relative rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary"
                                                        onClick={onClose}
                                                    >
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
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AnimatePresence>,
        document.body
    );
}

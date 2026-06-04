import * as React from "react"
import { createPortal } from "react-dom"
import { motion, AnimatePresence } from "framer-motion"
import type { HTMLMotionProps } from "framer-motion"
import { cn } from "../../lib/utils"
import { modalVariants } from "../../lib/motion"

const Dialog = ({
    open,
    onOpenChange,
    children,
}: {
    open?: boolean
    onOpenChange?: (open: boolean) => void
    children: React.ReactNode
}) => {
    return createPortal(
        <AnimatePresence>
            {open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 bg-black/40 backdrop-blur-[6px]"
                        onClick={() => onOpenChange?.(false)}
                    />
                    {/* Dialog Wrapper */}
                    <div className="z-50 w-full max-w-lg">{children}</div>
                </div>
            )}
        </AnimatePresence>,
        document.body
    )
}

const DialogContent = React.forwardRef<
    HTMLDivElement,
    HTMLMotionProps<"div">
>(({ className, children, ...props }, ref) => (
    <motion.div
        ref={ref}
        variants={modalVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className={cn(
            "relative z-50 grid w-full max-w-lg gap-4 rounded-2xl glass-modal p-6 shadow-2xl overflow-hidden",
            className
        )}
        {...props}
    >
        {children}
    </motion.div>
))
DialogContent.displayName = "DialogContent"

const DialogHeader = ({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
    <div
        className={cn(
            "flex flex-col space-y-1.5 text-center sm:text-left",
            className
        )}
        {...props}
    />
)
DialogHeader.displayName = "DialogHeader"

const DialogTitle = React.forwardRef<
    HTMLParagraphElement,
    React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
    <h2
        ref={ref}
        className={cn(
            "text-lg font-semibold leading-none tracking-tight",
            className
        )}
        {...props}
    />
))
DialogTitle.displayName = "DialogTitle"

const DialogDescription = React.forwardRef<
    HTMLParagraphElement,
    React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
    <p
        ref={ref}
        className={cn("text-sm text-muted-foreground", className)}
        {...props}
    />
))
DialogDescription.displayName = "DialogDescription"

export {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
}

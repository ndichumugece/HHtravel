import * as React from "react"
import { motion } from "framer-motion"
import type { HTMLMotionProps } from "framer-motion"
import { cn } from "../../lib/utils"

export interface InputProps extends HTMLMotionProps<"input"> { }

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, ...props }, ref) => {
        return (
            <motion.input
                ref={ref}
                type={type}
                whileFocus={{ scale: 1.005 }}
                transition={{ duration: 0.15 }}
                className={cn(
                    "flex h-10 w-full rounded-xl border border-white/20 bg-white/10 backdrop-blur-sm px-3 py-2 text-sm shadow-sm transition-all file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-transparent focus-visible:bg-white/20 disabled:cursor-not-allowed disabled:opacity-50",
                    className
                )}
                onClick={(e) => {
                    if (['date', 'month', 'week', 'time', 'datetime-local'].includes(type || '')) {
                        try {
                            // @ts-ignore - showPicker is not yet in all TS definitions
                            e.currentTarget.showPicker?.();
                        } catch (error) {
                            // Ignore errors if showPicker is not supported or fails
                        }
                    }
                    props.onClick?.(e as any);
                }}
                {...props}
            />
        )
    }
)
Input.displayName = "Input"

export { Input }

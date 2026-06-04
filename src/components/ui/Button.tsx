import * as React from "react"
import { motion } from "framer-motion"
import type { HTMLMotionProps } from "framer-motion"
import { cn } from "../../lib/utils"

export interface ButtonProps extends HTMLMotionProps<"button"> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive'
    size?: 'sm' | 'md' | 'lg' | 'icon'
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
        return (
            <motion.button
                ref={ref}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 500, damping: 15 }}
                className={cn(
                    "inline-flex items-center justify-center rounded-xl text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 shadow-sm",
                    // Variants
                    variant === 'primary' && "bg-primary text-primary-foreground hover:bg-primary/95",
                    variant === 'secondary' && "bg-secondary text-secondary-foreground hover:bg-secondary/90",
                    variant === 'outline' && "border border-white/20 bg-white/20 backdrop-blur-md hover:bg-white/30 text-foreground",
                    variant === 'ghost' && "hover:bg-accent/40 text-foreground shadow-none",
                    variant === 'destructive' && "bg-destructive/10 text-destructive hover:bg-destructive/20",

                    // Sizes
                    size === 'sm' && "h-8 px-3 text-xs",
                    size === 'md' && "h-10 px-4 py-2",
                    size === 'lg' && "h-12 px-8 text-base",
                    size === 'icon' && "h-10 w-10",
                    className
                )}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"

export { Button }

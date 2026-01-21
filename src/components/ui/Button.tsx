import * as React from "react"
import { cn } from "../../lib/utils"

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive'
    size?: 'sm' | 'md' | 'lg' | 'icon'
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
        return (
            <button
                ref={ref}
                className={cn(
                    "inline-flex items-center justify-center rounded-md text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
                    // Variants
                    variant === 'primary' && "bg-primary text-primary-foreground shadow-sm hover:translate-y-[-1px] hover:shadow-md active:translate-y-[0px]",
                    variant === 'secondary' && "bg-secondary text-secondary-foreground hover:bg-secondary/80",
                    variant === 'outline' && "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
                    variant === 'ghost' && "hover:bg-accent hover:text-accent-foreground",
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

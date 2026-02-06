import * as React from "react"
import { format, startOfDay, isBefore } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { cn } from "../../lib/utils"
import { Calendar } from "./Calendar"

interface DatePickerProps {
    value?: Date
    onChange: (date: Date) => void
    placeholder?: string
    className?: string
    disabled?: boolean
    minDate?: Date
}

export function DatePicker({
    value,
    onChange,
    placeholder = "Pick a date",
    className,
    disabled = false,
    minDate
}: DatePickerProps) {
    const [open, setOpen] = React.useState(false)
    const wrapperRef = React.useRef<HTMLDivElement>(null)

    // Handle clicking outside to close
    React.useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [])

    return (
        <div ref={wrapperRef} className={cn("relative", className)}>
            <div
                className={cn(
                    "flex h-10 w-full items-center justify-start text-left font-normal rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer",
                    !value && "text-muted-foreground",
                    disabled && "opacity-50 cursor-not-allowed"
                )}
                onClick={() => !disabled && setOpen(!open)}
            >
                <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
                {value ? format(value, "PPP") : <span>{placeholder}</span>}
            </div>
            {open && (
                <div className="absolute top-0 left-0 z-50 p-2 rounded-md border bg-white shadow-md mt-12 animate-in fade-in-0 zoom-in-95">
                    <Calendar
                        selected={value}
                        onSelect={(date) => {
                            onChange(date)
                            setOpen(false)
                        }}
                        disabled={(date) => {
                            // If minDate is provided, disable dates before it.
                            // We normalize to start of day to avoid time comparison issues.
                            if (minDate) {
                                return isBefore(startOfDay(date), startOfDay(minDate))
                            }
                            return false
                        }}
                    />
                </div>
            )}
        </div>
    )
}

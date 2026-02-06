import * as React from "react"
import { Clock } from "lucide-react"
import { cn } from "../../lib/utils"

interface TimePickerProps {
    value?: string // HH:mm format (24h)
    onChange: (time: string) => void
    className?: string
    disabled?: boolean
}

export function TimePicker({
    value,
    onChange,
    className,
    disabled = false,
}: TimePickerProps) {
    const [open, setOpen] = React.useState(false)
    const wrapperRef = React.useRef<HTMLDivElement>(null)

    // Scroll refs to center numeric items
    const hoursRef = React.useRef<HTMLDivElement>(null)
    const minutesRef = React.useRef<HTMLDivElement>(null)
    const periodRef = React.useRef<HTMLDivElement>(null)

    // Internal state for selection
    // Default to current time if no value
    const [selectedHour, setSelectedHour] = React.useState(12)
    const [selectedMinute, setSelectedMinute] = React.useState(0)
    const [selectedPeriod, setSelectedPeriod] = React.useState<"AM" | "PM">("AM")

    React.useEffect(() => {
        if (value) {
            const [h, m] = value.split(':').map(Number)
            if (!isNaN(h) && !isNaN(m)) {
                let period: "AM" | "PM" = "AM"
                let hour12 = h

                if (h >= 12) {
                    period = "PM"
                    if (h > 12) hour12 = h - 12
                }
                if (h === 0) hour12 = 12

                setSelectedHour(hour12)
                setSelectedMinute(m)
                setSelectedPeriod(period)
            }
        }
    }, [value])

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

    const hours = Array.from({ length: 12 }, (_, i) => i + 1)
    const minutes = Array.from({ length: 60 }, (_, i) => i)

    const handleTimeChange = (h: number, m: number, p: "AM" | "PM") => {
        setSelectedHour(h)
        setSelectedMinute(m)
        setSelectedPeriod(p)

        // Convert back to 24h string
        let hour24 = h
        if (p === "PM" && h !== 12) hour24 = h + 12
        if (p === "AM" && h === 12) hour24 = 0

        const timeStr = `${hour24.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
        onChange(timeStr)
    }

    // Scroll helpers
    const scrollToSelected = () => {
        // Simple timeout to allow render
        setTimeout(() => {
            if (hoursRef.current) {
                const selectedEl = hoursRef.current.querySelector(`[data-value="${selectedHour}"]`) as HTMLElement
                if (selectedEl) {
                    hoursRef.current.scrollTop = selectedEl.offsetTop - hoursRef.current.clientHeight / 2 + selectedEl.clientHeight / 2
                }
            }
            if (minutesRef.current) {
                const selectedEl = minutesRef.current.querySelector(`[data-value="${selectedMinute}"]`) as HTMLElement
                if (selectedEl) {
                    minutesRef.current.scrollTop = selectedEl.offsetTop - minutesRef.current.clientHeight / 2 + selectedEl.clientHeight / 2
                }
            }
        }, 0)
    }

    React.useEffect(() => {
        if (open) {
            scrollToSelected()
        }
    }, [open])


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
                <Clock className="mr-2 h-4 w-4 opacity-50" />
                {value ? (
                    <span>
                        {selectedHour.toString().padStart(2, '0')}:
                        {selectedMinute.toString().padStart(2, '0')} {selectedPeriod}
                    </span>
                ) : (
                    <span>--:-- --</span>
                )}
            </div>
            {open && (
                <div className="absolute top-0 left-0 z-50 p-4 rounded-md border bg-white shadow-xl mt-12 animate-in fade-in-0 zoom-in-95 w-[280px]">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-semibold mx-auto">Select time</span>
                    </div>

                    {/* Columns Container */}
                    <div className="flex h-48 overflow-hidden rounded-lg bg-slate-50 relative mask-gradient">
                        {/* Selection Highlight Bar */}
                        <div className="absolute top-1/2 left-0 right-0 h-10 -mt-5 bg-white border-y border-slate-200 pointer-events-none z-0" />

                        {/* Hours */}
                        <div ref={hoursRef} className="flex-1 overflow-y-auto scrollbar-hide py-[76px] z-10 text-center snap-y snap-mandatory">
                            {hours.map((h) => (
                                <div
                                    key={h}
                                    data-value={h}
                                    className={cn(
                                        "h-10 flex items-center justify-center text-sm cursor-pointer transition-colors select-none snap-center",
                                        h === selectedHour ? "font-bold text-black" : "text-slate-400"
                                    )}
                                    onClick={() => handleTimeChange(h, selectedMinute, selectedPeriod)}
                                >
                                    {h.toString().padStart(2, '0')}
                                </div>
                            ))}
                        </div>

                        {/* Separator */}
                        <div className="flex items-center justify-center text-slate-400 z-10 pb-1">:</div>

                        {/* Minutes */}
                        <div ref={minutesRef} className="flex-1 overflow-y-auto scrollbar-hide py-[76px] z-10 text-center snap-y snap-mandatory">
                            {minutes.map((m) => (
                                <div
                                    key={m}
                                    data-value={m}
                                    className={cn(
                                        "h-10 flex items-center justify-center text-sm cursor-pointer transition-colors select-none snap-center",
                                        m === selectedMinute ? "font-bold text-black" : "text-slate-400"
                                    )}
                                    onClick={() => handleTimeChange(selectedHour, m, selectedPeriod)}
                                >
                                    {m.toString().padStart(2, '0')}
                                </div>
                            ))}
                        </div>

                        {/* Period */}
                        <div ref={periodRef} className="flex-1 overflow-y-auto scrollbar-hide py-[76px] z-10 text-center snap-y snap-mandatory">
                            {(["AM", "PM"] as const).map((p) => (
                                <div
                                    key={p}
                                    data-item={p}
                                    className={cn(
                                        "h-10 flex items-center justify-center text-sm cursor-pointer transition-colors select-none snap-center",
                                        p === selectedPeriod ? "font-bold text-black" : "text-slate-400"
                                    )}
                                    onClick={() => handleTimeChange(selectedHour, selectedMinute, p)}
                                >
                                    {p}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-4 flex justify-end gap-2">
                        <button
                            className="text-sm font-semibold text-slate-900 hover:bg-slate-100 px-3 py-1.5 rounded"
                            onClick={() => setOpen(false)}
                        >
                            Done
                        </button>
                    </div>
                </div>
            )}
            <style>{`
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                .mask-gradient {
                    mask-image: linear-gradient(to bottom, transparent, black 15%, black 85%, transparent);
                    -webkit-mask-image: linear-gradient(to bottom, transparent, black 15%, black 85%, transparent);
                }
            `}</style>
        </div>
    )
}

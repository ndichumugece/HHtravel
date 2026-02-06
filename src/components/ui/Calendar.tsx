import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import {
    addMonths,
    eachDayOfInterval,
    endOfMonth,
    endOfWeek,
    format,
    isSameDay,
    isSameMonth,
    startOfMonth,
    startOfWeek,
    subMonths,
} from "date-fns"
import { cn } from "../../lib/utils"

interface CalendarProps {
    className?: string
    selected?: Date
    onSelect?: (date: Date) => void
    disabled?: (date: Date) => boolean
}

export function Calendar({
    className,
    selected,
    onSelect,
    disabled,
}: CalendarProps) {
    const [currentMonth, setCurrentMonth] = React.useState(selected || new Date())

    // Update internal state if selected date changes externally to a different month
    React.useEffect(() => {
        if (selected && !isSameMonth(selected, currentMonth)) {
            setCurrentMonth(selected)
        }
    }, [selected])

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1))
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1))

    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(monthStart)
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }) // Start on Monday
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 })

    const dateFormat = "d"
    const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

    // Generate days
    const calendarDays = eachDayOfInterval({
        start: startDate,
        end: endDate,
    })

    return (
        <div className={cn("p-3 bg-white w-[300px]", className)}>
            {/* Header */}
            <div className="flex items-center justify-between mb-4 px-2">
                <button
                    onClick={prevMonth}
                    type="button"
                    className="p-1 hover:bg-slate-100 rounded-full transition-colors"
                >
                    <ChevronLeft className="h-5 w-5 text-slate-700" />
                </button>
                <div className="text-base font-bold text-slate-900">
                    {format(currentMonth, "MMMM yyyy")}
                </div>
                <button
                    onClick={nextMonth}
                    type="button"
                    className="p-1 hover:bg-slate-100 rounded-full transition-colors"
                >
                    <ChevronRight className="h-5 w-5 text-slate-700" />
                </button>
            </div>

            {/* Days Header */}
            <div className="grid grid-cols-7 mb-2">
                {weekDays.map((d) => (
                    <div key={d} className="text-center text-xs font-semibold text-slate-500 py-1">
                        {d}
                    </div>
                ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((dayItem) => {
                    const isDisabled = disabled ? disabled(dayItem) : false
                    const isSelected = selected ? isSameDay(dayItem, selected) : false
                    const isCurrentMonth = isSameMonth(dayItem, currentMonth)

                    return (
                        <div
                            key={dayItem.toString()}
                            className={cn(
                                "flex items-center justify-center p-2 text-sm rounded-full cursor-pointer transition-colors w-8 h-8 mx-auto",
                                !isCurrentMonth && "text-slate-300",
                                isCurrentMonth && !isDisabled && !isSelected && "text-slate-700 hover:bg-slate-100",
                                isSelected && "bg-orange-500 text-white hover:bg-orange-600 font-medium shadow-sm",
                                isDisabled && "text-slate-300 cursor-not-allowed hover:bg-transparent"
                            )}
                            onClick={() => {
                                if (!isDisabled && onSelect) {
                                    onSelect(dayItem)
                                }
                            }}
                        >
                            {format(dayItem, dateFormat)}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

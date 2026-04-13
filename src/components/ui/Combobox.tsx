import * as React from "react"
import { Check, ChevronsUpDown, Plus } from "lucide-react"
import { cn } from "../../lib/utils"

export interface ComboboxOption {
    value: string
    label: string
}

interface ComboboxProps {
    options: ComboboxOption[]
    value?: string
    onChange: (value: string) => void
    placeholder?: string
    className?: string
    disabled?: boolean
    onCreate?: (value: string) => void
}

export function Combobox({
    options,
    value,
    onChange,
    placeholder = "Select option...",
    className,
    disabled = false,
    onCreate,
}: ComboboxProps) {
    const [open, setOpen] = React.useState(false)
    const [searchQuery, setSearchQuery] = React.useState("")
    const wrapperRef = React.useRef<HTMLDivElement>(null)

    // Filter options based on search query
    const filteredOptions = React.useMemo(() => {
        if (!searchQuery) return options
        return options.filter((option) =>
            option.label.toLowerCase().includes(searchQuery.toLowerCase())
        )
    }, [options, searchQuery])

    const exactMatch = React.useMemo(() => {
        return options.find(opt => opt.label.toLowerCase() === searchQuery.toLowerCase())
    }, [options, searchQuery])

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

    const selectedLabel = options.find((opt) => opt.value === value)?.label

    return (
        <div ref={wrapperRef} className={cn("relative", className)}>
            <div
                className={cn(
                    "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer",
                    disabled && "opacity-50 cursor-not-allowed"
                )}
                onClick={() => !disabled && setOpen(!open)}
            >
                <div className={cn("truncate", !value && "text-muted-foreground")}>
                    {selectedLabel || placeholder}
                </div>
                <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
            </div>

            {open && (
                <div className="absolute z-50 mt-1 max-h-60 min-w-full w-max max-w-[400px] overflow-auto rounded-md border bg-white text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95">
                    <div className="sticky top-0 z-10 bg-white p-1">
                        <input
                            className="flex h-8 w-full rounded-md border border-slate-200 bg-transparent px-3 py-1 text-sm outline-none placeholder:text-slate-400 focus:border-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking input
                            autoFocus
                        />
                    </div>
                    <div className="p-1">
                        {filteredOptions.length === 0 && !onCreate && (
                            <div className="py-2 text-center text-sm text-muted-foreground">
                                No results found.
                            </div>
                        )}
                        
                        {filteredOptions.map((option) => (
                            <div
                                key={option.value}
                                className={cn(
                                    "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-slate-100 hover:text-slate-900",
                                    value === option.value && "bg-slate-100"
                                )}
                                onClick={() => {
                                    onChange(option.value)
                                    setOpen(false)
                                    setSearchQuery("")
                                }}
                            >
                                <Check
                                    className={cn(
                                        "mr-2 h-4 w-4",
                                        value === option.value ? "opacity-100" : "opacity-0"
                                    )}
                                />
                                {option.label}
                            </div>
                        ))}

                        {onCreate && searchQuery && !exactMatch && (
                            <div
                                className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-slate-100 text-blue-600 font-medium"
                                onClick={() => {
                                    onCreate(searchQuery)
                                    setOpen(false)
                                    setSearchQuery("")
                                }}
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                Create "{searchQuery}"
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

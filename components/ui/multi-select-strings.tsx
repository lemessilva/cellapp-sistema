"use client"

import * as React from "react"
import { X, Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

interface MultiSelectProps {
  options: { label: string; value: string }[]
  selected: string[]
  onChange: (value: string[]) => void
  placeholder?: string
  className?: string
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = "Selecione as opções...",
  className,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false)
  const containerRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleToggle = React.useCallback(
    (e: React.MouseEvent, value: string) => {
      e.preventDefault()
      e.stopPropagation()
      const newSelected = selected.includes(value)
        ? selected.filter((item) => item !== value)
        : [...selected, value]
      onChange(newSelected)
    },
    [selected, onChange]
  )

  const handleUnselect = React.useCallback(
    (e: React.MouseEvent, item: string) => {
      e.preventDefault()
      e.stopPropagation()
      onChange(selected.filter((i) => i !== item))
    },
    [selected, onChange]
  )

  return (
    <div className={cn("relative w-full", className)} ref={containerRef}>
      <div
        onClick={() => setOpen(!open)}
        className={cn(
          "flex min-h-[44px] w-full cursor-pointer items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm transition-all focus-within:ring-2 focus-within:ring-indigo-500",
          open && "ring-2 ring-indigo-500 border-indigo-500"
        )}
      >
        <div className="flex flex-wrap gap-1.5">
          {selected.length > 0 ? (
            selected.map((item) => {
              const option = options.find((o) => o.value === item)
              return (
                <Badge
                  key={item}
                  variant="indigo"
                  className="flex items-center gap-1 py-1"
                >
                  {option?.label || item}
                  <X
                    className="h-3 w-3 cursor-pointer hover:text-indigo-900"
                    onClick={(e) => handleUnselect(e, item)}
                  />
                </Badge>
              )
            })
          ) : (
            <span className="text-slate-400">{placeholder}</span>
          )}
        </div>
        <ChevronsUpDown className="h-4 w-4 shrink-0 text-slate-400" />
      </div>

      {open && (
        <div className="absolute z-50 mt-2 max-h-60 w-full overflow-auto rounded-xl border border-slate-200 bg-white p-1 shadow-xl animate-in fade-in zoom-in-95 duration-100">
          <div className="p-1">
            {options.map((option) => {
              const isSelected = selected.includes(option.value)
              return (
                <div
                          key={option.value}
                          onClick={(e) => handleToggle(e, option.value)}
                          className={cn(
                            "flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors hover:bg-slate-50",
                            isSelected && "bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                          )}
                        >
                  <span>{option.label}</span>
                  {isSelected && <Check className="h-4 w-4" />}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

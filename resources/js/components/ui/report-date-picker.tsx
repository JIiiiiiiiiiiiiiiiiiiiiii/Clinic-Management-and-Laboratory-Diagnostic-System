"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { SelectSingleEventHandler } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface ReportDatePickerProps {
  date: Date | undefined
  onDateChange: (date: Date | undefined) => void
  filter: 'daily' | 'monthly' | 'yearly'
  placeholder?: string
  disabled?: boolean
}

export function ReportDatePicker({
  date,
  onDateChange,
  filter,
  placeholder = "Pick a date",
  disabled = false,
}: ReportDatePickerProps) {
  const [open, setOpen] = React.useState(false)

  const handleSelect: SelectSingleEventHandler = (selectedDate) => {
    if (selectedDate) {
      let processedDate = selectedDate
      
      // Adjust date based on filter type
      switch (filter) {
        case 'monthly':
          // Set to first day of the month
          processedDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1)
          break
        case 'yearly':
          // Set to first day of the year
          processedDate = new Date(selectedDate.getFullYear(), 0, 1)
          break
        case 'daily':
        default:
          // Use the selected date as-is
          break
      }
      
      onDateChange(processedDate)
    }
    setOpen(false)
  }

  const formatDisplay = () => {
    if (!date) return placeholder

    switch (filter) {
      case 'daily':
        return format(date, "PPP") // "January 1, 2025"
      case 'monthly':
        return format(date, "MMMM yyyy") // "January 2025"
      case 'yearly':
        return format(date, "yyyy") // "2025"
      default:
        return format(date, "PPP")
    }
  }

  const getCalendarProps = () => {
    const baseProps = {
      mode: "single" as const,
      selected: date,
      onSelect: handleSelect,
      initialFocus: true,
    }

    switch (filter) {
      case 'monthly':
        return {
          ...baseProps,
          captionLayout: "dropdown" as const,
          fromYear: 2020,
          toYear: 2030,
        }
      case 'yearly':
        return {
          ...baseProps,
          captionLayout: "dropdown" as const,
          fromYear: 2020,
          toYear: 2030,
        }
      case 'daily':
      default:
        return {
          ...baseProps,
          captionLayout: "label" as const,
        }
    }
  }

  const renderYearSelector = () => {
    const currentYear = new Date().getFullYear()
    const years = Array.from({ length: 20 }, (_, i) => currentYear - 10 + i)
    
    return (
      <div className="p-6">
        <div className="text-lg font-semibold mb-4 text-center">Select Year</div>
        <div className="grid grid-cols-4 gap-3">
          {years.map((year) => (
            <Button
              key={year}
              variant={date && date.getFullYear() === year ? "default" : "outline"}
              className="h-12 text-base font-medium"
              onClick={() => {
                const processedDate = new Date(year, 0, 1)
                onDateChange(processedDate)
                setOpen(false)
              }}
            >
              {year}
            </Button>
          ))}
        </div>
      </div>
    )
  }

  const renderCalendarContent = () => {
    switch (filter) {
      case 'yearly':
        return renderYearSelector()
      case 'monthly':
      case 'daily':
      default:
        return (
          <Calendar
            {...getCalendarProps()}
            className={cn(
              "rounded-md border",
              (filter === 'daily' || filter === 'monthly') && "p-4" // Add more padding for daily and monthly calendars
            )}
            classNames={(filter === 'daily' || filter === 'monthly') ? {
              // Make daily and monthly calendars larger with better spacing
              cell: "h-12 w-12 text-center text-sm p-0 relative",
              day: "h-12 w-12 p-0 font-normal aria-selected:opacity-100 text-base",
              head_cell: "text-muted-foreground rounded-md w-12 font-normal text-sm",
              weekday: "text-muted-foreground flex-1 select-none rounded-md text-sm font-normal",
            } : undefined}
          />
        )
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "h-12 w-full justify-start text-left font-normal",
            !date && "text-muted-foreground",
            disabled && "opacity-50 cursor-not-allowed"
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {formatDisplay()}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        {renderCalendarContent()}
      </PopoverContent>
    </Popover>
  )
}

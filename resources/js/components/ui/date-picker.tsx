"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export function DatePickerDemo() {
  const [date, setDate] = React.useState<Date>()

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          data-empty={!date}
          className={cn(
            "w-[280px] justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP") : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}

export function DatePickerWithInput() {
  const [open, setOpen] = React.useState(false)
  const [date, setDate] = React.useState<Date | undefined>(
    new Date("2025-06-01")
  )
  const [month, setMonth] = React.useState<Date | undefined>(date)
  const [value, setValue] = React.useState(formatDate(date))

  function formatDate(date: Date | undefined) {
    if (!date) {
      return ""
    }

    return date.toLocaleDateString("en-US", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    })
  }

  function isValidDate(date: Date | undefined) {
    if (!date) {
      return false
    }
    return !isNaN(date.getTime())
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="relative flex gap-2">
        <input
          value={value}
          placeholder="June 01, 2025"
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 bg-background pr-10"
          onChange={(e) => {
            const date = new Date(e.target.value)
            setValue(e.target.value)
            if (isValidDate(date)) {
              setDate(date)
              setMonth(date)
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault()
              setOpen(true)
            }
          }}
        />
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              className="absolute top-1/2 right-2 size-6 -translate-y-1/2"
            >
              <CalendarIcon className="size-3.5" />
              <span className="sr-only">Select date</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-auto overflow-hidden p-0"
            align="end"
            alignOffset={-8}
            sideOffset={10}
          >
            <Calendar
              mode="single"
              selected={date}
              captionLayout="dropdown"
              month={month}
              onMonthChange={setMonth}
              onSelect={(date) => {
                setDate(date)
                setValue(formatDate(date))
                setOpen(false)
              }}
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}

export function DatePickerWithLabel({ 
  label, 
  placeholder = "Pick a date", 
  date, 
  setDate 
}: { 
  label: string; 
  placeholder?: string;
  date?: Date;
  setDate?: (date: Date | undefined) => void;
}) {
  const [internalDate, setInternalDate] = React.useState<Date>()
  
  const currentDate = date !== undefined ? date : internalDate;
  const currentSetDate = setDate || setInternalDate;

  return (
    <div className="flex flex-col gap-3">
      <label className="px-1 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
        {label}
      </label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            data-empty={!currentDate}
            className={cn(
              "w-[280px] justify-start text-left font-normal",
              !currentDate && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {currentDate ? format(currentDate, "PPP") : <span>{placeholder}</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={currentDate}
            onSelect={currentSetDate}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}

// Export CustomDatePicker as an alias for DatePickerWithLabel for backward compatibility
export const CustomDatePicker = DatePickerWithLabel;
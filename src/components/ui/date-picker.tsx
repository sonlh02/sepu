'use client'

import * as React from "react"
import { format } from "date-fns"
import ReactDatePicker from "react-datepicker"

import "react-datepicker/dist/react-datepicker.css"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { CalendarIcon } from "lucide-react"

export interface DatePickerProps {
  date: Date
  setDate: (date: Date) => void
}

export function DatePicker({ date, setDate }: DatePickerProps) {
  return (
    <div className="relative">
      <ReactDatePicker
        selected={date}
        onChange={(date: Date) => setDate(date)}
        dateFormat="dd/MM/yyyy"
        customInput={
          <Button variant="outline" className="w-full justify-start text-left font-normal">
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "dd/MM/yyyy") : <span>Pick a date</span>}
          </Button>
        }
      />
    </div>
  )
}
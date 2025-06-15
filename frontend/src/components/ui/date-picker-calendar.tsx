"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type DatePickerCalendarProps = React.ComponentProps<typeof DayPicker>

function DatePickerCalendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: DatePickerCalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-4", className)}
      classNames={{
        months: "flex space-x-4",
        month: "space-y-4",
        caption: "flex justify-center relative items-center h-9",
        caption_label: "text-[13px] font-medium text-[#111827]",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 hover:bg-[#F3F4F6]"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse",
        head_row: "flex",
        head_cell: "text-[13px] font-medium text-[#6B7280] w-9 h-9 flex items-center justify-center",
        row: "flex w-full mt-0",
        cell: cn(
          "relative p-0 text-center text-[13px] focus-within:relative focus-within:z-20",
          "first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md"
        ),
        day: cn(
          "h-9 w-9 p-0 font-normal text-[13px] aria-selected:opacity-100 hover:bg-[#F3F4F6] rounded-md flex items-center justify-center"
        ),
        day_selected: "bg-black text-white hover:bg-black hover:text-white focus:bg-black focus:text-white",
        day_today: "bg-[#F3F4F6] text-[#111827]",
        day_outside: "text-[#6B7280] opacity-50",
        day_disabled: "text-[#6B7280] opacity-50",
        day_range_middle: "aria-selected:bg-[#F3F4F6] aria-selected:text-[#111827]",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ...props }) => <ChevronLeft className="h-4 w-4" />,
        IconRight: ({ ...props }) => <ChevronRight className="h-4 w-4" />,
      }}
      {...props}
    />
  )
}

DatePickerCalendar.displayName = "DatePickerCalendar"

export { DatePickerCalendar } 
"use client";

import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import type { DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DATE_PRESETS } from "@/lib/date-presets";
import { FilterSelect } from "./FilterSelect";

/** Preset select for the completion date, plus a calendar when the preset is "custom". */
export function DateFilter({
  label,
  preset,
  onPresetChange,
  range,
  onRangeChange,
}: {
  label: string;
  preset: string;
  onPresetChange: (preset: string) => void;
  range: DateRange | undefined;
  onRangeChange: (range: DateRange | undefined) => void;
}) {
  return (
    <>
      <FilterSelect label={label} value={preset} onChange={onPresetChange} allLabel="All Dates" options={DATE_PRESETS} />

      {preset === "custom" && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Date Range</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal focus:ring-2 focus:ring-blue-500"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {range?.from ? (
                  range.to ? (
                    <>
                      {format(range.from, "LLL dd, y")} - {format(range.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(range.from, "LLL dd, y")
                  )
                ) : (
                  <span>Pick a date range</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="range"
                defaultMonth={range?.from ?? new Date()}
                selected={range}
                onSelect={onRangeChange}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        </div>
      )}
    </>
  );
}

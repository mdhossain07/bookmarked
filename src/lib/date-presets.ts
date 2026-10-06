import {
  endOfDay,
  endOfMonth,
  endOfWeek,
  endOfYear,
  startOfDay,
  startOfMonth,
  startOfWeek,
  startOfYear,
  subDays,
  subMonths,
  subWeeks,
  subYears,
} from "date-fns";

export const DATE_PRESETS = [
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "this-week", label: "This Week" },
  { value: "last-week", label: "Last Week" },
  { value: "this-month", label: "This Month" },
  { value: "last-month", label: "Last Month" },
  { value: "this-year", label: "This Year" },
  { value: "last-year", label: "Last Year" },
  { value: "custom", label: "Custom Range" },
] as const;

export type DatePreset = (typeof DATE_PRESETS)[number]["value"];

export interface DateBounds {
  from?: Date;
  to?: Date;
}

/** Start and end of a preset in local time, or the custom range when `preset` is "custom". */
export function presetRange(preset: string, custom?: DateBounds): DateBounds | undefined {
  const now = new Date();
  switch (preset) {
    case "today":
      return { from: startOfDay(now), to: endOfDay(now) };
    case "yesterday":
      return { from: startOfDay(subDays(now, 1)), to: endOfDay(subDays(now, 1)) };
    case "this-week":
      return { from: startOfWeek(now), to: endOfWeek(now) };
    case "last-week":
      return { from: startOfWeek(subWeeks(now, 1)), to: endOfWeek(subWeeks(now, 1)) };
    case "this-month":
      return { from: startOfMonth(now), to: endOfMonth(now) };
    case "last-month":
      return { from: startOfMonth(subMonths(now, 1)), to: endOfMonth(subMonths(now, 1)) };
    case "this-year":
      return { from: startOfYear(now), to: endOfYear(now) };
    case "last-year":
      return { from: startOfYear(subYears(now, 1)), to: endOfYear(subYears(now, 1)) };
    case "custom":
      return custom?.from && custom.to ? { from: startOfDay(custom.from), to: endOfDay(custom.to) } : undefined;
    default:
      return undefined;
  }
}

/** `completedFrom`/`completedTo` query params for a preset, as ISO strings. */
export function completedParams(preset: string, custom?: DateBounds) {
  const range = presetRange(preset, custom);
  return { completedFrom: range?.from?.toISOString(), completedTo: range?.to?.toISOString() };
}

export function presetLabel(preset: string): string {
  return DATE_PRESETS.find((p) => p.value === preset)?.label ?? preset;
}

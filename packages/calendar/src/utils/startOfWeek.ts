import type { WeekDayType } from "../models";

export default function startOfWeek(date: Date, weekStartsOn: WeekDayType): Date {
  const d = new Date(date);
  const diff = (d.getDay() - weekStartsOn + 7) % 7;
  d.setDate(d.getDate() - diff);
  return d;
}

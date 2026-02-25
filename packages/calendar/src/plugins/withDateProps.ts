import type { DateCell } from "../models";
import { isSameDate, isSameYearAndMonth } from "../utils";

export default function withDateProps(baseDate: Date, cursorDate: Date) {
  return <T extends DateCell>(cell: T) => {
    const { value: targetDate } = cell;
    const isCurrentMonth = isSameYearAndMonth(cursorDate, targetDate);
    const isCurrentDate = isSameDate(baseDate, targetDate);
    const day = targetDate.getDay();
    const isWeekend = day === 0 || day === 6;

    return {
      ...cell,
      date: targetDate.getDate(),
      isCurrentMonth,
      isCurrentDate,
      isWeekend,
    };
  };
}

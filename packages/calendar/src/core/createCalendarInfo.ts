import type { WeekDayType } from "../models";
import { arrayOf, parseDate } from "../utils";
import addDays from "../utils/addDays";
import getDaysInMonth from "../utils/getDaysInMonth";
import startOfMonth from "../utils/startOfMonth";

export default function createCalendarInfo(cursorDate: Date, { weekStartsOn }: { weekStartsOn: WeekDayType }) {
  const { year, month, day } = parseDate(cursorDate);
  const startWeekdayInMonth = getStartWeekdayInMonth(cursorDate, weekStartsOn);
  const weeksInMonth = getWeeksInMonth(cursorDate, startWeekdayInMonth);
  const weekdays = arrayOf(7).map((index) => {
    const diff = index + weekStartsOn - cursorDate.getDay();
    return { value: addDays(cursorDate, diff) };
  });

  const getDateCellByIndex = (weekIndex: number, dayIndex: number) => {
    const day = weekIndex * 7 + dayIndex - startWeekdayInMonth + 1;

    return { value: new Date(year, month, day) };
  };

  return {
    cursorDate,
    year,
    month,
    day,
    weekStartsOn,
    startWeekdayInMonth,
    weeksInMonth,
    weekdays,
    today: {
      weekIndex: getCurrentWeekIndex(day, startWeekdayInMonth),
      dateIndex: cursorDate.getDay(),
    },
    getDateCellByIndex,
  };
}

function getStartWeekdayInMonth(date: Date, weekStartsOn: WeekDayType) {
  const monthStartsAt = (startOfMonth(date).getDay() - weekStartsOn) % 7;

  return monthStartsAt < 0 ? monthStartsAt + 7 : monthStartsAt;
}

function getWeeksInMonth(date: Date, startWeekdayInMonth: number) {
  const totalDaysOfMonth = getDaysInMonth(date);

  return Math.ceil((startWeekdayInMonth + totalDaysOfMonth) / 7);
}

function getCurrentWeekIndex(day: number, startWeekdayInMonth: number) {
  if ((day + startWeekdayInMonth) % 7 > 0) {
    return Math.floor((day + startWeekdayInMonth) / 7);
  }

  return Math.floor((day + startWeekdayInMonth) / 7) - 1;
}

import { useCallback, useMemo, useState } from "react";

type WeekDayType = 0 | 1 | 2 | 3 | 4 | 5 | 6;

interface DateCell {
  value: Date;
  [key: string]: unknown;
}

interface UseNDayViewOptions {
  defaultDate?: Date | number | string;
  defaultWeekStart?: WeekDayType;
  numberOfDays?: number;
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function isSameYearAndMonth(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

function isSameDate(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

let idCounter = 0;
function generateID(prefix: string) {
  return `${prefix}-${++idCounter}`;
}

export function useNDayView({
  defaultDate,
  defaultWeekStart = 0,
  numberOfDays: defaultNumberOfDays = 3,
}: UseNDayViewOptions = {}) {
  const baseDate = useMemo(() => {
    return defaultDate != null ? new Date(defaultDate) : new Date();
  }, []);

  const [cursorDate, setCursorDate] = useState(baseDate);
  const [numberOfDays, setNumberOfDays] = useState(defaultNumberOfDays);

  const year = cursorDate.getFullYear();
  const month = cursorDate.getMonth();
  const day = cursorDate.getDate();

  const getHeaders = useCallback(() => {
    return {
      weekdays: Array.from({ length: numberOfDays }, (_, i) => ({
        key: generateID("weekdays"),
        value: addDays(cursorDate, i),
      })),
    };
  }, [cursorDate, numberOfDays]);

  const getBody = useCallback(() => {
    return {
      value: [
        {
          key: generateID("n-day-row"),
          value: Array.from({ length: numberOfDays }, (_, i) => {
            const date = addDays(cursorDate, i);
            const dayOfWeek = date.getDay();
            return {
              value: date,
              key: generateID("days"),
              date: date.getDate(),
              isCurrentMonth: isSameYearAndMonth(cursorDate, date),
              isCurrentDate: isSameDate(baseDate, date),
              isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
              hours: Array.from({ length: 24 }, (_, hour) => ({
                hour,
                key: generateID("hours"),
              })),
            };
          }),
        },
      ],
    };
  }, [baseDate, cursorDate, numberOfDays]);

  return useMemo(
    () => ({
      cursorDate,
      year,
      month,
      day,
      weekStartsOn: defaultWeekStart,
      numberOfDays,
      headers: getHeaders(),
      body: getBody(),
      navigation: {
        toNext: () => setCursorDate((d) => addDays(d, numberOfDays)),
        toPrev: () => setCursorDate((d) => addDays(d, -numberOfDays)),
        setToday: () => setCursorDate(new Date()),
        setDate: (date: Date) => setCursorDate(date),
      },
      view: {
        numberOfDays,
        setNumberOfDays,
      },
    }),
    [cursorDate, year, month, day, numberOfDays, getHeaders, getBody],
  );
}

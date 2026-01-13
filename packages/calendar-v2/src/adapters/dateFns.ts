/**
 * date-fns DateAdapter
 *
 * date-fns 라이브러리를 사용하는 DateAdapter 구현.
 * 실제 프로덕션 사용을 위한 어댑터.
 *
 * @requires date-fns ^4.0.0
 */

import type { DateAdapter, WeekDay } from '../adapter/types';

// date-fns v4 imports (tree-shakeable)
import {
  addDays,
  startOfMonth,
  startOfWeek,
  startOfDay,
  isSameDay,
  isSameMonth,
  isSameYear,
  isBefore,
  isAfter,
  parseISO,
  formatISO,
  getDay,
  getMonth,
  getYear,
  getDate,
} from 'date-fns';

export interface DateFnsAdapterOptions {
  weekStartsOn?: WeekDay;
}

/**
 * date-fns 기반 DateAdapter 생성
 *
 * @param options - 어댑터 옵션
 * @returns DateAdapter<Date>
 *
 * @example
 * import { createDateFnsAdapter } from '@h6s/calendar-v2/adapters/dateFns';
 *
 * const adapter = createDateFnsAdapter({ weekStartsOn: 1 }); // 월요일 시작
 * const grid = createTimeGrid({ adapter, ... });
 */
export function createDateFnsAdapter(
  options: DateFnsAdapterOptions = {}
): DateAdapter<Date> {
  const { weekStartsOn: defaultWeekStartsOn = 0 } = options;

  return {
    addDays(date: Date, days: number): Date {
      return addDays(date, days);
    },

    startOfMonth(date: Date): Date {
      return startOfMonth(date);
    },

    startOfWeek(date: Date, opts?: { weekStartsOn?: WeekDay }): Date {
      return startOfWeek(date, {
        weekStartsOn: opts?.weekStartsOn ?? defaultWeekStartsOn,
      });
    },

    startOfDay(date: Date): Date {
      return startOfDay(date);
    },

    isSame(a: Date, b: Date, unit: 'day' | 'month' | 'year'): boolean {
      switch (unit) {
        case 'day':
          return isSameDay(a, b);
        case 'month':
          return isSameMonth(a, b);
        case 'year':
          return isSameYear(a, b);
      }
    },

    isBefore(a: Date, b: Date): boolean {
      return isBefore(a, b);
    },

    isAfter(a: Date, b: Date): boolean {
      return isAfter(a, b);
    },

    today(): Date {
      return startOfDay(new Date());
    },

    fromISO(iso: string): Date {
      return parseISO(iso);
    },

    toISO(date: Date): string {
      return formatISO(date, { representation: 'date' });
    },

    getDay(date: Date): WeekDay {
      return getDay(date) as WeekDay;
    },

    getMonth(date: Date): number {
      return getMonth(date);
    },

    getYear(date: Date): number {
      return getYear(date);
    },

    getDate(date: Date): number {
      return getDate(date);
    },

    getWeekStartsOn(): WeekDay {
      return defaultWeekStartsOn;
    },
  };
}

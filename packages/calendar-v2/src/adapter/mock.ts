/**
 * Mock DateAdapter - 테스트용 어댑터
 *
 * 외부 의존성 없이 순수 JavaScript Date를 사용하는 간단한 구현.
 * PoC 검증 및 단위 테스트에 사용.
 */

import type { DateAdapter, WeekDay } from './types';

export interface MockAdapterOptions {
  weekStartsOn?: WeekDay;
}

export function createMockAdapter(
  options: MockAdapterOptions = {}
): DateAdapter<Date> {
  const { weekStartsOn = 0 } = options;

  return {
    // ============ 날짜 연산 ============

    addDays(date: Date, days: number): Date {
      const result = new Date(date);
      result.setDate(result.getDate() + days);
      return result;
    },

    startOfMonth(date: Date): Date {
      return new Date(date.getFullYear(), date.getMonth(), 1);
    },

    startOfWeek(date: Date, opts?: { weekStartsOn?: WeekDay }): Date {
      const startDay = opts?.weekStartsOn ?? weekStartsOn;
      const result = new Date(date);
      const day = result.getDay();
      const diff = (day - startDay + 7) % 7;
      result.setDate(result.getDate() - diff);
      return this.startOfDay(result);
    },

    startOfDay(date: Date): Date {
      const result = new Date(date);
      result.setHours(0, 0, 0, 0);
      return result;
    },

    // ============ 날짜 비교 ============

    isSame(a: Date, b: Date, unit: 'day' | 'month' | 'year'): boolean {
      switch (unit) {
        case 'day':
          return (
            a.getFullYear() === b.getFullYear() &&
            a.getMonth() === b.getMonth() &&
            a.getDate() === b.getDate()
          );
        case 'month':
          return (
            a.getFullYear() === b.getFullYear() &&
            a.getMonth() === b.getMonth()
          );
        case 'year':
          return a.getFullYear() === b.getFullYear();
      }
    },

    isBefore(a: Date, b: Date): boolean {
      return a.getTime() < b.getTime();
    },

    isAfter(a: Date, b: Date): boolean {
      return a.getTime() > b.getTime();
    },

    // ============ 날짜 생성 ============

    today(): Date {
      const now = new Date();
      return this.startOfDay(now);
    },

    fromISO(iso: string): Date {
      return new Date(iso);
    },

    toISO(date: Date): string {
      return date.toISOString().split('T')[0];
    },

    // ============ 날짜 정보 추출 ============

    getDay(date: Date): WeekDay {
      return date.getDay() as WeekDay;
    },

    getMonth(date: Date): number {
      return date.getMonth();
    },

    getYear(date: Date): number {
      return date.getFullYear();
    },

    getDate(date: Date): number {
      return date.getDate();
    },

    // ============ 로케일 정보 ============

    getWeekStartsOn(): WeekDay {
      return weekStartsOn;
    },
  };
}

/**
 * Navigation Plugin - 네비게이션 플러그인
 *
 * 이전/다음/오늘 이동 기능을 제공하는 플러그인.
 * 상태 관리는 외부(React state 등)에서 처리.
 */

import type { TimeGrid } from '../core/types';
import type { Plugin } from '../plugin/types';
import {
  addDays,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  today,
  type WeekDay,
} from '../utils/date';

export type NavigationUnit = 'day' | 'week' | 'month' | 'year';

export interface NavigationOptions {
  /** 이동 단위 */
  unit: NavigationUnit;
  /** 주 시작 요일 (week 단위에서 사용, 기본값: 0) */
  weekStartsOn?: WeekDay;
}

export interface NavigationState {
  /** 현재 커서 날짜 */
  cursor: Date;
  /** 현재 범위 시작 */
  rangeStart: Date;
  /** 현재 범위 끝 */
  rangeEnd: Date;
}

export interface NavigationExtension {
  navigation: {
    /** 현재 상태 */
    state: NavigationState;
    /** 다음으로 이동 */
    goNext: () => NavigationState;
    /** 이전으로 이동 */
    goPrev: () => NavigationState;
    /** 오늘로 이동 */
    goToday: () => NavigationState;
    /** 특정 날짜로 이동 */
    goTo: (date: Date) => NavigationState;
    /** 새로운 범위 반환 (grid 재생성용) */
    getRange: () => { start: Date; end: Date };
  };
}

/**
 * Navigation 플러그인 생성
 *
 * @param options - 네비게이션 옵션
 * @returns Navigation Plugin
 *
 * @example
 * const grid = createTimeGrid({
 *   range: { start: '2026-01-01', end: '2026-01-31' },
 *   cellUnit: 'day',
 *   plugins: [navigation({ unit: 'month' })],
 * });
 *
 * // 다음 달로 이동
 * const newState = grid.navigation.goNext();
 */
export function navigation(options: NavigationOptions): Plugin<NavigationExtension> {
  const { unit, weekStartsOn = 0 } = options;

  return {
    name: 'navigation',
    extend<TData>(grid: TimeGrid<TData>) {
      // 초기 상태 (grid의 range에서 추출)
      let state: NavigationState = {
        cursor: grid.range.start,
        rangeStart: grid.range.start,
        rangeEnd: grid.range.end,
      };

      const calculateRange = (cursor: Date): { start: Date; end: Date } => {
        switch (unit) {
          case 'day':
            return { start: cursor, end: cursor };

          case 'week': {
            const weekStart = startOfWeek(cursor, weekStartsOn);
            const weekEnd = addDays(weekStart, 6);
            return { start: weekStart, end: weekEnd };
          }

          case 'month': {
            const monthStart = startOfMonth(cursor);
            const monthEnd = endOfMonth(cursor);
            return { start: monthStart, end: monthEnd };
          }

          case 'year': {
            const year = cursor.getFullYear();
            return {
              start: new Date(year, 0, 1),
              end: new Date(year, 11, 31),
            };
          }
        }
      };

      const moveCursor = (direction: number): NavigationState => {
        let newCursor: Date;

        switch (unit) {
          case 'day':
            newCursor = addDays(state.cursor, direction);
            break;

          case 'week':
            newCursor = addDays(state.cursor, direction * 7);
            break;

          case 'month': {
            const currentMonth = state.cursor.getMonth();
            const currentYear = state.cursor.getFullYear();
            const newMonth = currentMonth + direction;

            if (newMonth > 11) {
              newCursor = new Date(currentYear + 1, 0, 1);
            } else if (newMonth < 0) {
              newCursor = new Date(currentYear - 1, 11, 1);
            } else {
              newCursor = new Date(currentYear, newMonth, 1);
            }
            break;
          }

          case 'year': {
            const year = state.cursor.getFullYear() + direction;
            newCursor = new Date(year, 0, 1);
            break;
          }
        }

        const range = calculateRange(newCursor);
        state = {
          cursor: newCursor,
          rangeStart: range.start,
          rangeEnd: range.end,
        };

        return state;
      };

      const goNext = (): NavigationState => moveCursor(1);

      const goPrev = (): NavigationState => moveCursor(-1);

      const goToday = (): NavigationState => {
        const todayDate = today();
        const range = calculateRange(todayDate);
        state = {
          cursor: todayDate,
          rangeStart: range.start,
          rangeEnd: range.end,
        };
        return state;
      };

      const goTo = (date: Date): NavigationState => {
        const range = calculateRange(date);
        state = {
          cursor: date,
          rangeStart: range.start,
          rangeEnd: range.end,
        };
        return state;
      };

      const getRange = () => ({
        start: state.rangeStart,
        end: state.rangeEnd,
      });

      return {
        ...grid,
        navigation: {
          state,
          goNext,
          goPrev,
          goToday,
          goTo,
          getRange,
        },
      };
    },
  };
}

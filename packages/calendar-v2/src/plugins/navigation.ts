/**
 * Navigation Plugin - 네비게이션 플러그인
 *
 * 이전/다음/오늘 이동 기능을 제공하는 플러그인.
 * 상태 관리는 외부(React state 등)에서 처리.
 */

import type { TimeGrid } from '../core/types';
import type { DateAdapter } from '../adapter/types';
import type { Plugin } from '../plugin/types';

export type NavigationUnit = 'day' | 'week' | 'month' | 'year';

export interface NavigationOptions<TDate> {
  /** 이동 단위 */
  unit: NavigationUnit;
  /** DateAdapter (날짜 계산용) */
  adapter: DateAdapter<TDate>;
}

export interface NavigationState<TDate> {
  /** 현재 커서 날짜 */
  cursor: TDate;
  /** 현재 범위 시작 */
  rangeStart: TDate;
  /** 현재 범위 끝 */
  rangeEnd: TDate;
}

export interface NavigationExtension<TDate> {
  navigation: {
    /** 현재 상태 */
    state: NavigationState<TDate>;
    /** 다음으로 이동 */
    goNext: () => NavigationState<TDate>;
    /** 이전으로 이동 */
    goPrev: () => NavigationState<TDate>;
    /** 오늘로 이동 */
    goToday: () => NavigationState<TDate>;
    /** 특정 날짜로 이동 */
    goTo: (date: TDate) => NavigationState<TDate>;
    /** 새로운 범위 반환 (grid 재생성용) */
    getRange: () => { start: TDate; end: TDate };
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
 *   adapter,
 *   range,
 *   cellUnit: 'day',
 *   plugins: [navigation({ unit: 'month', adapter })],
 * });
 *
 * // 다음 달로 이동
 * const newState = grid.navigation.goNext();
 * // newState.rangeStart, newState.rangeEnd로 새 grid 생성
 */
export function navigation<TDate>(
  options: NavigationOptions<TDate>
): Plugin<NavigationExtension<TDate>> {
  const { unit, adapter } = options;

  return {
    name: 'navigation',
    extend<TData, TDateGrid>(grid: TimeGrid<TData, TDateGrid>) {
      // 초기 상태 (grid의 range에서 추출)
      let state: NavigationState<TDate> = {
        cursor: grid.range.start as unknown as TDate,
        rangeStart: grid.range.start as unknown as TDate,
        rangeEnd: grid.range.end as unknown as TDate,
      };

      const calculateRange = (cursor: TDate): { start: TDate; end: TDate } => {
        switch (unit) {
          case 'day':
            return { start: cursor, end: cursor };

          case 'week': {
            const weekStart = adapter.startOfWeek(cursor);
            const weekEnd = adapter.addDays(weekStart, 6);
            return { start: weekStart, end: weekEnd };
          }

          case 'month': {
            const monthStart = adapter.startOfMonth(cursor);
            // 다음 달 1일의 전날 = 이번 달 마지막 날
            const nextMonth = adapter.addDays(monthStart, 32);
            const monthEnd = adapter.addDays(adapter.startOfMonth(nextMonth), -1);
            return { start: monthStart, end: monthEnd };
          }

          case 'year': {
            const yearStart = new Date(adapter.getYear(cursor), 0, 1) as unknown as TDate;
            const yearEnd = new Date(adapter.getYear(cursor), 11, 31) as unknown as TDate;
            return { start: yearStart, end: yearEnd };
          }
        }
      };

      const moveCursor = (direction: number): NavigationState<TDate> => {
        let newCursor: TDate;

        switch (unit) {
          case 'day':
            newCursor = adapter.addDays(state.cursor, direction);
            break;

          case 'week':
            newCursor = adapter.addDays(state.cursor, direction * 7);
            break;

          case 'month': {
            const currentMonth = adapter.getMonth(state.cursor);
            const currentYear = adapter.getYear(state.cursor);
            const newMonth = currentMonth + direction;

            if (newMonth > 11) {
              newCursor = new Date(currentYear + 1, 0, 1) as unknown as TDate;
            } else if (newMonth < 0) {
              newCursor = new Date(currentYear - 1, 11, 1) as unknown as TDate;
            } else {
              newCursor = new Date(currentYear, newMonth, 1) as unknown as TDate;
            }
            break;
          }

          case 'year': {
            const year = adapter.getYear(state.cursor) + direction;
            newCursor = new Date(year, 0, 1) as unknown as TDate;
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

      const goNext = (): NavigationState<TDate> => moveCursor(1);

      const goPrev = (): NavigationState<TDate> => moveCursor(-1);

      const goToday = (): NavigationState<TDate> => {
        const today = adapter.today();
        const range = calculateRange(today);
        state = {
          cursor: today,
          rangeStart: range.start,
          rangeEnd: range.end,
        };
        return state;
      };

      const goTo = (date: TDate): NavigationState<TDate> => {
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
      } as TimeGrid<TData, TDateGrid> & NavigationExtension<TDate>;
    },
  };
}

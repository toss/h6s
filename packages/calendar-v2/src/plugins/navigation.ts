/**
 * Navigation Plugin - 네비게이션 플러그인
 *
 * 이전/다음/오늘 이동 기능을 제공하는 플러그인.
 * - Plugin은 순수 로직만 제공
 * - 상태 관리는 React Adapter에서 담당
 */

import type { TimeGrid, TimeRange } from '../core/types';
import type { Plugin } from '../plugin/types';
import {
  addDays,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  startOfDay,
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
    /** 다음으로 이동 (새 상태 반환) */
    computeNext: () => NavigationState;
    /** 이전으로 이동 (새 상태 반환) */
    computePrev: () => NavigationState;
    /** 오늘로 이동 (새 상태 반환) */
    computeToday: () => NavigationState;
    /** 특정 날짜로 이동 (새 상태 반환) */
    computeGoTo: (date: Date) => NavigationState;
    /** 범위 가져오기 */
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
 * // React Adapter에서 상태 변경 시:
 * const newState = grid.navigation.computeNext();
 * setNavState(newState);
 */
export function navigation(
  options: NavigationOptions
): Plugin<NavigationExtension, NavigationState> {
  const { unit, weekStartsOn = 0 } = options;

  // 범위 계산 (순수 함수)
  const calculateRange = (cursor: Date): { start: Date; end: Date } => {
    switch (unit) {
      case 'day': {
        const dayStart = startOfDay(cursor);
        const dayEnd = new Date(dayStart);
        dayEnd.setHours(23, 59, 59, 999);
        return { start: dayStart, end: dayEnd };
      }

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

  // 커서 이동 (순수 함수)
  const moveCursor = (state: NavigationState, direction: number): NavigationState => {
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
    return {
      cursor: newCursor,
      rangeStart: range.start,
      rangeEnd: range.end,
    };
  };

  return {
    name: 'navigation',

    // 초기 상태 생성
    getInitialState: (range: TimeRange): NavigationState => {
      const calculatedRange = calculateRange(range.start);
      return {
        cursor: range.start,
        rangeStart: calculatedRange.start,
        rangeEnd: calculatedRange.end,
      };
    },

    // Grid 확장
    extend(grid: TimeGrid, state?: NavigationState) {
      // 상태가 없으면 grid.range에서 초기화
      const currentState: NavigationState = state ?? {
        cursor: grid.range.start,
        rangeStart: grid.range.start,
        rangeEnd: grid.range.end,
      };

      return {
        ...grid,
        navigation: {
          state: currentState,

          // 순수 함수들: 새 상태 반환
          computeNext: () => moveCursor(currentState, 1),
          computePrev: () => moveCursor(currentState, -1),

          computeToday: () => {
            const todayDate = today();
            const range = calculateRange(todayDate);
            return {
              cursor: todayDate,
              rangeStart: range.start,
              rangeEnd: range.end,
            };
          },

          computeGoTo: (date: Date) => {
            const range = calculateRange(date);
            return {
              cursor: date,
              rangeStart: range.start,
              rangeEnd: range.end,
            };
          },

          getRange: () => ({
            start: currentState.rangeStart,
            end: currentState.rangeEnd,
          }),
        },
      };
    },
  };
}

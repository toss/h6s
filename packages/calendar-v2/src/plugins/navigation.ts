/**
 * Navigation Plugin - 네비게이션 플러그인
 *
 * 이전/다음/오늘 이동 기능을 제공하는 플러그인.
 * - step: 이동 속도 (몇 unit씩 이동할지)
 * - range 크기: 초기 range에서 결정, navigation이 유지
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
  /** 이동 스텝 (기본값: 1) - 모든 unit에서 동일하게 동작 */
  step?: number;
  /** 주 시작 요일 (week 단위에서 사용, 기본값: 0) */
  weekStartsOn?: WeekDay;
}

export interface NavigationState {
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
 * step은 이동 속도만 제어, range 크기는 초기값 유지.
 *
 * @example
 * // 월간 달력: 1개월씩 이동
 * navigation({ unit: 'month' })
 *
 * @example
 * // 연도 선택기: 12년씩 이동 (range는 초기값으로 12년 설정)
 * navigation({ unit: 'year', step: 12 })
 */
export function navigation(
  options: NavigationOptions
): Plugin<NavigationExtension, NavigationState> {
  const { unit, step = 1, weekStartsOn = 0 } = options;

  /**
   * 범위를 unit * step 만큼 이동 (duration 유지)
   */
  const shiftRange = (state: NavigationState, direction: number): NavigationState => {
    const amount = direction * step;
    let newStart: Date;
    let newEnd: Date;

    switch (unit) {
      case 'day': {
        newStart = addDays(state.rangeStart, amount);
        newEnd = addDays(state.rangeEnd, amount);
        break;
      }

      case 'week': {
        newStart = addDays(state.rangeStart, amount * 7);
        newEnd = addDays(state.rangeEnd, amount * 7);
        break;
      }

      case 'month': {
        newStart = addMonths(state.rangeStart, amount);
        newEnd = addMonths(state.rangeEnd, amount);
        break;
      }

      case 'year': {
        newStart = addYears(state.rangeStart, amount);
        newEnd = addYears(state.rangeEnd, amount);
        break;
      }
    }

    return { rangeStart: newStart, rangeEnd: newEnd };
  };

  /**
   * 특정 날짜를 포함하는 기본 범위 계산 (goToday, goTo용)
   */
  const calculateDefaultRange = (date: Date): { start: Date; end: Date } => {
    switch (unit) {
      case 'day': {
        const dayStart = startOfDay(date);
        const dayEnd = new Date(dayStart);
        dayEnd.setHours(23, 59, 59, 999);
        return { start: dayStart, end: dayEnd };
      }

      case 'week': {
        const weekStart = startOfWeek(date, weekStartsOn);
        const weekEnd = addDays(weekStart, 6);
        return { start: weekStart, end: weekEnd };
      }

      case 'month': {
        const monthStart = startOfMonth(date);
        const monthEnd = endOfMonth(date);
        return { start: monthStart, end: monthEnd };
      }

      case 'year': {
        const year = date.getFullYear();
        return {
          start: new Date(year, 0, 1),
          end: new Date(year, 11, 31),
        };
      }
    }
  };

  return {
    name: 'navigation',

    // 초기 상태: 전달받은 range 그대로 사용
    getInitialState: (range: TimeRange): NavigationState => {
      return {
        rangeStart: range.start,
        rangeEnd: range.end,
      };
    },

    // Grid 확장
    extend(grid: TimeGrid, state?: NavigationState) {
      const currentState: NavigationState = state ?? {
        rangeStart: grid.range.start,
        rangeEnd: grid.range.end,
      };

      return {
        ...grid,
        navigation: {
          state: currentState,

          computeNext: () => shiftRange(currentState, 1),
          computePrev: () => shiftRange(currentState, -1),

          computeToday: () => {
            const todayDate = today();
            const range = calculateDefaultRange(todayDate);
            return {
              rangeStart: range.start,
              rangeEnd: range.end,
            };
          },

          computeGoTo: (date: Date) => {
            const range = calculateDefaultRange(date);
            return {
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

// ============ Helper Functions ============

function addMonths(date: Date, amount: number): Date {
  const result = new Date(date);
  const currentMonth = result.getMonth();
  const currentYear = result.getFullYear();
  const totalMonths = currentYear * 12 + currentMonth + amount;
  const newYear = Math.floor(totalMonths / 12);
  const newMonth = ((totalMonths % 12) + 12) % 12;
  result.setFullYear(newYear, newMonth);
  return result;
}

function addYears(date: Date, amount: number): Date {
  const result = new Date(date);
  result.setFullYear(result.getFullYear() + amount);
  return result;
}

/**
 * Navigation Plugin - 네비게이션 플러그인
 *
 * 이전/다음/오늘 이동 기능을 제공하는 플러그인.
 * - createTimeGrid: goNext(step?) → NavigationState 반환
 * - useTimeGrid: goNext(step?) → void (내부 setState)
 *
 * TanStack 철학: Range Duration 보존
 * - goNext(step?)/goPrev(step?): step 만큼 이동 (기본값: 1), duration 유지
 * - goToday/goTo: 목표 날짜로 이동, duration 유지
 */

import type { TimeGrid, TimeRange } from '../core/types';
import type { Plugin } from '../plugin/types';
import {
  addDays,
  addMonths,
  addYears,
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
    goNext: (step?: number) => NavigationState;
    /** 이전으로 이동 (새 상태 반환) */
    goPrev: (step?: number) => NavigationState;
    /** 오늘로 이동 (새 상태 반환, duration 유지) */
    goToday: () => NavigationState;
    /** 특정 날짜로 이동 (새 상태 반환, duration 유지) */
    goTo: (date: Date) => NavigationState;
    /** 범위 가져오기 */
    getRange: () => { start: Date; end: Date };
  };
}

/**
 * Navigation 플러그인 생성
 *
 * @example
 * // 1달 달력 - goToday 시 1달 유지
 * const grid = useTimeGrid({
 *   range: { start: startOfMonth(today), end: endOfMonth(today) },
 *   plugins: [navigation({ unit: 'month' })],
 * });
 *
 * @example
 * // 2달 달력 - goToday 시 2달 유지
 * const grid = useTimeGrid({
 *   range: { start: startOfMonth(today), end: endOfMonth(addMonths(today, 1)) },
 *   plugins: [navigation({ unit: 'month' })],
 * });
 */
/**
 * 날짜가 해당 월의 마지막 날인지 확인
 */
function isLastDayOfMonth(date: Date): boolean {
  const nextDay = new Date(date);
  nextDay.setDate(nextDay.getDate() + 1);
  return nextDay.getMonth() !== date.getMonth();
}

export function navigation(
  options: NavigationOptions
): Plugin<NavigationExtension, NavigationState> {
  const { unit, weekStartsOn = 0 } = options;

  /**
   * 범위 내 unit 수 계산 (inclusive)
   */
  const countUnits = (start: Date, end: Date): number => {
    switch (unit) {
      case 'day': {
        const startDay = startOfDay(start).getTime();
        const endDay = startOfDay(end).getTime();
        return Math.round((endDay - startDay) / (1000 * 60 * 60 * 24)) + 1;
      }
      case 'week': {
        const startWeek = startOfWeek(start, weekStartsOn).getTime();
        const endWeek = startOfWeek(end, weekStartsOn).getTime();
        return Math.round((endWeek - startWeek) / (1000 * 60 * 60 * 24 * 7)) + 1;
      }
      case 'month': {
        return (end.getFullYear() - start.getFullYear()) * 12
             + (end.getMonth() - start.getMonth()) + 1;
      }
      case 'year': {
        return end.getFullYear() - start.getFullYear() + 1;
      }
    }
  };

  /**
   * 범위를 unit * step 만큼 이동 (duration 유지)
   */
  const shiftRange = (state: NavigationState, step: number): NavigationState => {
    const amount = step;
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
        // 원래 월말이었다면 새 월에서도 월말 유지
        if (isLastDayOfMonth(state.rangeEnd)) {
          newEnd = endOfMonth(newEnd);
        }
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
   * 목표 날짜로 이동 (duration 유지)
   *
   * - 현재 range의 unit 수를 계산
   * - 목표 날짜를 시작으로 동일한 unit 수의 새 range 생성
   */
  const navigateTo = (state: NavigationState, targetDate: Date): NavigationState => {
    const unitCount = countUnits(state.rangeStart, state.rangeEnd);

    switch (unit) {
      case 'day': {
        const newStart = startOfDay(targetDate);
        const newEnd = addDays(newStart, unitCount - 1);
        return { rangeStart: newStart, rangeEnd: newEnd };
      }

      case 'week': {
        const newStart = startOfWeek(targetDate, weekStartsOn);
        const newEnd = addDays(newStart, unitCount * 7 - 1);
        return { rangeStart: newStart, rangeEnd: newEnd };
      }

      case 'month': {
        const newStart = startOfMonth(targetDate);
        const newEnd = endOfMonth(addMonths(newStart, unitCount - 1));
        return { rangeStart: newStart, rangeEnd: newEnd };
      }

      case 'year': {
        const year = targetDate.getFullYear();
        const newStart = new Date(year, 0, 1);
        const newEnd = new Date(year + unitCount - 1, 11, 31);
        return { rangeStart: newStart, rangeEnd: newEnd };
      }
    }
  };

  return {
    name: 'navigation',
    actions: ['goNext', 'goPrev', 'goToday', 'goTo'],

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

          // 액션 메서드: 새 상태 반환
          goNext: (step: number = 1) => shiftRange(currentState, step),
          goPrev: (step: number = 1) => shiftRange(currentState, -step),

          // Duration 보존 navigation
          goToday: () => navigateTo(currentState, today()),
          goTo: (date: Date) => navigateTo(currentState, date),

          getRange: () => ({
            start: currentState.rangeStart,
            end: currentState.rangeEnd,
          }),
        },
      };
    },
  };
}

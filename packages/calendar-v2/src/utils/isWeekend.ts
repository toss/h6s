/**
 * isWeekend - 주말 판별 유틸리티
 *
 * Cell의 weekday를 기반으로 주말 여부 판별.
 * Core에 포함되지 않고 유틸리티로 분리되어 선택적 사용 가능.
 */

import type { WeekDay } from './date';

/**
 * 주말 여부 판별
 * @param weekday - 요일 (0=일요일, 6=토요일)
 * @returns 주말이면 true
 */
export function isWeekend(weekday: WeekDay): boolean {
  return weekday === 0 || weekday === 6;
}

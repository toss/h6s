/**
 * groupBy - 셀 그룹화 유틸리티
 *
 * TimeGrid의 셀들을 다양한 기준으로 그룹화.
 * 월간 달력(주 단위), GitHub 잔디(요일 단위) 등 레이아웃 구성에 사용.
 */

import type { WeekDay } from '../adapter/types';
import type { Cell, TimeGrid } from '../core/types';

export type GroupByKey = 'week' | 'weekday' | 'month';

export interface GroupedCells<TData, TDate> {
  key: string;
  cells: Cell<TData, TDate>[];
}

/**
 * 셀들을 지정된 기준으로 그룹화
 *
 * @param grid - TimeGrid 객체
 * @param key - 그룹화 기준 ('week' | 'weekday' | 'month')
 * @returns 그룹화된 셀 배열
 *
 * @example
 * // 월간 달력용 주 단위 그룹화
 * const weeks = groupBy(grid, 'week');
 * // [{ key: '2026-W01', cells: [...] }, { key: '2026-W02', cells: [...] }]
 *
 * @example
 * // GitHub 잔디용 요일 단위 그룹화
 * const weekdays = groupBy(grid, 'weekday');
 * // [{ key: '0', cells: [일요일들...] }, { key: '1', cells: [월요일들...] }]
 */
export function groupBy<TData, TDate>(
  grid: TimeGrid<TData, TDate>,
  key: GroupByKey
): GroupedCells<TData, TDate>[] {
  const groups = new Map<string, Cell<TData, TDate>[]>();

  for (const cell of grid.cells) {
    const groupKey = getGroupKey(cell, key, grid.weekStartsOn);

    if (!groups.has(groupKey)) {
      groups.set(groupKey, []);
    }
    groups.get(groupKey)!.push(cell);
  }

  // Map을 배열로 변환하며 순서 유지
  return Array.from(groups.entries()).map(([groupKey, cells]) => ({
    key: groupKey,
    cells,
  }));
}

function getGroupKey<TData, TDate>(
  cell: Cell<TData, TDate>,
  key: GroupByKey,
  weekStartsOn: WeekDay
): string {
  switch (key) {
    case 'week':
      return getWeekKey(cell, weekStartsOn);
    case 'weekday':
      return String(cell.weekday);
    case 'month':
      return `${cell.year}-${String(cell.month + 1).padStart(2, '0')}`;
  }
}

function getWeekKey<TData, TDate>(
  cell: Cell<TData, TDate>,
  weekStartsOn: WeekDay
): string {
  // 주 번호 계산 (ISO 주 번호 기반 단순화)
  // weekStartsOn이 다르면 주 경계가 달라짐
  const dayOfYear = getDayOfYear(cell.year, cell.month, cell.dayOfMonth);
  const daysSinceWeekStart = (cell.weekday - weekStartsOn + 7) % 7;
  const weekStart = dayOfYear - daysSinceWeekStart;
  const weekNumber = Math.ceil(weekStart / 7);

  return `${cell.year}-W${String(weekNumber).padStart(2, '0')}`;
}

function getDayOfYear(year: number, month: number, day: number): number {
  const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

  // 윤년 체크
  if ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0) {
    daysInMonth[1] = 29;
  }

  let dayOfYear = day;
  for (let i = 0; i < month; i++) {
    dayOfYear += daysInMonth[i];
  }

  return dayOfYear;
}

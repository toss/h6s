/**
 * withPadding - 패딩 셀 추가 유틸리티
 *
 * @deprecated `createTimeGrid({ fillWeeks: true })` 사용 권장.
 * `cell.month !== displayMonth`로 padding 여부 판단 가능.
 *
 * 월간 달력에서 이전/다음 달의 날짜를 표시하기 위한 패딩 셀 추가.
 * 첫 주의 빈 공간과 마지막 주의 빈 공간을 채움.
 */

import type { Cell, TimeGrid } from '../core/types';
import {
  addDays,
  today,
  isSameDay,
  toISODateString,
  getDay,
  getDate,
  getMonth,
  getYear,
  type WeekDay,
} from './date';

export interface PaddedCell extends Cell {
  /** 패딩 셀 여부 (이전/다음 달) */
  isPadding: boolean;
}

export interface PaddedTimeGrid extends Omit<TimeGrid, 'cells'> {
  cells: PaddedCell[];
}

/**
 * TimeGrid에 패딩 셀 추가
 *
 * @deprecated `createTimeGrid({ fillWeeks: true })` 사용 권장.
 *
 * @param grid - 원본 TimeGrid
 * @returns 패딩이 추가된 TimeGrid
 *
 * @example
 * // Before (deprecated)
 * const paddedGrid = withPadding(grid);
 *
 * // After (recommended)
 * const grid = createTimeGrid({ ..., fillWeeks: true });
 * const isPadding = cell.month !== displayMonth;
 */
export function withPadding(grid: TimeGrid): PaddedTimeGrid {
  if (grid.cells.length === 0) {
    return {
      ...grid,
      cells: [],
    };
  }

  const firstCell = grid.cells[0];
  const lastCell = grid.cells[grid.cells.length - 1];

  // 첫 주의 패딩 (이전 달)
  const leadingPadding = createLeadingPadding(firstCell, grid.weekStartsOn);

  // 마지막 주의 패딩 (다음 달)
  const trailingPadding = createTrailingPadding(lastCell, grid.weekStartsOn);

  // 기존 셀에 isPadding: false 추가
  const existingCells: PaddedCell[] = grid.cells.map((cell) => ({
    ...cell,
    isPadding: false,
  }));

  return {
    ...grid,
    cells: [...leadingPadding, ...existingCells, ...trailingPadding],
    cellCount: leadingPadding.length + existingCells.length + trailingPadding.length,
  };
}

function createLeadingPadding(
  firstCell: Cell,
  weekStartsOn: WeekDay
): PaddedCell[] {
  const padding: PaddedCell[] = [];

  // 첫 셀의 요일과 주 시작 요일의 차이
  const daysToFill = (firstCell.weekday - weekStartsOn + 7) % 7;

  for (let i = daysToFill; i > 0; i--) {
    const date = addDays(firstCell.date, -i);
    const cell = createPaddingCell(date);
    padding.push(cell);
  }

  return padding;
}

function createTrailingPadding(
  lastCell: Cell,
  weekStartsOn: WeekDay
): PaddedCell[] {
  const padding: PaddedCell[] = [];

  // 마지막 셀의 요일과 주 끝 요일의 차이
  const weekEndDay = ((weekStartsOn + 6) % 7) as WeekDay;
  const daysToFill = (weekEndDay - lastCell.weekday + 7) % 7;

  for (let i = 1; i <= daysToFill; i++) {
    const date = addDays(lastCell.date, i);
    const cell = createPaddingCell(date);
    padding.push(cell);
  }

  return padding;
}

function createPaddingCell(date: Date): PaddedCell {
  const todayDate = today();

  return {
    key: toISODateString(date),
    date,
    isToday: isSameDay(date, todayDate),
    weekday: getDay(date),
    dayOfMonth: getDate(date),
    month: getMonth(date),
    year: getYear(date),
    hour: 0,
    isPadding: true,
  };
}

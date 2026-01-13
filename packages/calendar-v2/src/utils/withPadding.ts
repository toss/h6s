/**
 * withPadding - 패딩 셀 추가 유틸리티
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

export interface PaddedCell<TData = unknown> extends Cell<TData> {
  /** 패딩 셀 여부 (이전/다음 달) */
  isPadding: boolean;
}

export interface PaddedTimeGrid<TData = unknown>
  extends Omit<TimeGrid<TData>, 'cells'> {
  cells: PaddedCell<TData>[];
}

/**
 * TimeGrid에 패딩 셀 추가
 *
 * @param grid - 원본 TimeGrid
 * @returns 패딩이 추가된 TimeGrid
 *
 * @example
 * const paddedGrid = withPadding(grid);
 * // 첫 주: [이전달28, 이전달29, 이전달30, 1, 2, 3, 4]
 * // 마지막 주: [28, 29, 30, 31, 다음달1, 다음달2, 다음달3]
 */
export function withPadding<TData>(
  grid: TimeGrid<TData>
): PaddedTimeGrid<TData> {
  if (grid.cells.length === 0) {
    return {
      ...grid,
      cells: [],
    };
  }

  const firstCell = grid.cells[0];
  const lastCell = grid.cells[grid.cells.length - 1];

  // 첫 주의 패딩 (이전 달)
  const leadingPadding = createLeadingPadding<TData>(
    firstCell,
    grid.weekStartsOn
  );

  // 마지막 주의 패딩 (다음 달)
  const trailingPadding = createTrailingPadding<TData>(
    lastCell,
    grid.weekStartsOn
  );

  // 기존 셀에 isPadding: false 추가
  const existingCells: PaddedCell<TData>[] = grid.cells.map((cell) => ({
    ...cell,
    isPadding: false,
  }));

  return {
    ...grid,
    cells: [...leadingPadding, ...existingCells, ...trailingPadding],
    cellCount: leadingPadding.length + existingCells.length + trailingPadding.length,
  };
}

function createLeadingPadding<TData>(
  firstCell: Cell<TData>,
  weekStartsOn: WeekDay
): PaddedCell<TData>[] {
  const padding: PaddedCell<TData>[] = [];

  // 첫 셀의 요일과 주 시작 요일의 차이
  const daysToFill = (firstCell.weekday - weekStartsOn + 7) % 7;

  for (let i = daysToFill; i > 0; i--) {
    const date = addDays(firstCell.date, -i);
    const cell = createPaddingCell<TData>(date);
    padding.push(cell);
  }

  return padding;
}

function createTrailingPadding<TData>(
  lastCell: Cell<TData>,
  weekStartsOn: WeekDay
): PaddedCell<TData>[] {
  const padding: PaddedCell<TData>[] = [];

  // 마지막 셀의 요일과 주 끝 요일의 차이
  const weekEndDay = ((weekStartsOn + 6) % 7) as WeekDay;
  const daysToFill = (weekEndDay - lastCell.weekday + 7) % 7;

  for (let i = 1; i <= daysToFill; i++) {
    const date = addDays(lastCell.date, i);
    const cell = createPaddingCell<TData>(date);
    padding.push(cell);
  }

  return padding;
}

function createPaddingCell<TData>(date: Date): PaddedCell<TData> {
  const todayDate = today();

  return {
    key: toISODateString(date),
    date,
    data: [] as TData[],
    isToday: isSameDay(date, todayDate),
    weekday: getDay(date),
    dayOfMonth: getDate(date),
    month: getMonth(date),
    year: getYear(date),
    isPadding: true,
  };
}

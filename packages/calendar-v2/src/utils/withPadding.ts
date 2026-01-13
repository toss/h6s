/**
 * withPadding - 패딩 셀 추가 유틸리티
 *
 * 월간 달력에서 이전/다음 달의 날짜를 표시하기 위한 패딩 셀 추가.
 * 첫 주의 빈 공간과 마지막 주의 빈 공간을 채움.
 */

import type { DateAdapter, WeekDay } from '../adapter/types';
import type { Cell, TimeGrid } from '../core/types';

export interface PaddedCell<TData, TDate> extends Cell<TData, TDate> {
  /** 패딩 셀 여부 (이전/다음 달) */
  isPadding: boolean;
}

export interface PaddedTimeGrid<TData, TDate>
  extends Omit<TimeGrid<TData, TDate>, 'cells'> {
  cells: PaddedCell<TData, TDate>[];
}

/**
 * TimeGrid에 패딩 셀 추가
 *
 * @param grid - 원본 TimeGrid
 * @param adapter - DateAdapter 인스턴스
 * @returns 패딩이 추가된 TimeGrid
 *
 * @example
 * const paddedGrid = withPadding(grid, adapter);
 * // 첫 주: [이전달28, 이전달29, 이전달30, 1, 2, 3, 4]
 * // 마지막 주: [28, 29, 30, 31, 다음달1, 다음달2, 다음달3]
 */
export function withPadding<TData, TDate>(
  grid: TimeGrid<TData, TDate>,
  adapter: DateAdapter<TDate>
): PaddedTimeGrid<TData, TDate> {
  if (grid.cells.length === 0) {
    return {
      ...grid,
      cells: [],
    };
  }

  const firstCell = grid.cells[0];
  const lastCell = grid.cells[grid.cells.length - 1];

  // 첫 주의 패딩 (이전 달)
  const leadingPadding = createLeadingPadding(
    firstCell,
    grid.weekStartsOn,
    adapter
  );

  // 마지막 주의 패딩 (다음 달)
  const trailingPadding = createTrailingPadding(
    lastCell,
    grid.weekStartsOn,
    adapter
  );

  // 기존 셀에 isPadding: false 추가
  const existingCells: PaddedCell<TData, TDate>[] = grid.cells.map((cell) => ({
    ...cell,
    isPadding: false,
  }));

  return {
    ...grid,
    cells: [...leadingPadding, ...existingCells, ...trailingPadding],
    cellCount: leadingPadding.length + existingCells.length + trailingPadding.length,
  };
}

function createLeadingPadding<TData, TDate>(
  firstCell: Cell<TData, TDate>,
  weekStartsOn: WeekDay,
  adapter: DateAdapter<TDate>
): PaddedCell<TData, TDate>[] {
  const padding: PaddedCell<TData, TDate>[] = [];

  // 첫 셀의 요일과 주 시작 요일의 차이
  const daysToFill = (firstCell.weekday - weekStartsOn + 7) % 7;

  for (let i = daysToFill; i > 0; i--) {
    const date = adapter.addDays(firstCell.date, -i);
    const cell = createPaddingCell<TData, TDate>(date, adapter);
    padding.push(cell);
  }

  return padding;
}

function createTrailingPadding<TData, TDate>(
  lastCell: Cell<TData, TDate>,
  weekStartsOn: WeekDay,
  adapter: DateAdapter<TDate>
): PaddedCell<TData, TDate>[] {
  const padding: PaddedCell<TData, TDate>[] = [];

  // 마지막 셀의 요일과 주 끝 요일의 차이
  const weekEndDay = ((weekStartsOn + 6) % 7) as WeekDay;
  const daysToFill = (weekEndDay - lastCell.weekday + 7) % 7;

  for (let i = 1; i <= daysToFill; i++) {
    const date = adapter.addDays(lastCell.date, i);
    const cell = createPaddingCell<TData, TDate>(date, adapter);
    padding.push(cell);
  }

  return padding;
}

function createPaddingCell<TData, TDate>(
  date: TDate,
  adapter: DateAdapter<TDate>
): PaddedCell<TData, TDate> {
  const today = adapter.today();

  return {
    key: adapter.toISO(date),
    date,
    data: [] as TData[],
    isToday: adapter.isSame(date, today, 'day'),
    weekday: adapter.getDay(date),
    dayOfMonth: adapter.getDate(date),
    month: adapter.getMonth(date),
    year: adapter.getYear(date),
    isPadding: true,
  };
}

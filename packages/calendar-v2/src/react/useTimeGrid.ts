/**
 * useTimeGrid - React Hook for TimeGrid
 *
 * createTimeGrid를 React 상태와 통합하는 Hook.
 * 플러그인 타입 추론이 자동으로 동작.
 */

import { useMemo, useState, useCallback } from 'react';
import { createTimeGrid } from '../core/createTimeGrid';
import { pipe } from '../plugin/pipe';
import type { DateAdapter, WeekDay } from '../adapter/types';
import type {
  Cell,
  CellUnit,
  CreateTimeGridOptions,
  TimeGrid,
  TimeRange,
} from '../core/types';
import type { ExtendedTimeGrid, Plugin } from '../plugin/types';

export interface UseTimeGridOptions<TData, TDate> {
  /** DateAdapter 인스턴스 */
  adapter: DateAdapter<TDate>;

  /** 초기 범위 */
  initialRange: {
    start: string | TDate;
    end: string | TDate;
  };

  /** 셀 단위 */
  cellUnit: CellUnit;

  /** 주 시작 요일 */
  weekStartsOn?: WeekDay;

  /** 바인딩할 데이터 */
  data?: TData[];

  /** 데이터에서 날짜 추출 함수 */
  getItemDate?: (item: TData) => TDate;
}

export interface UseTimeGridResult<TData, TDate> {
  /** TimeGrid 객체 */
  grid: TimeGrid<TData, TDate>;

  /** 현재 범위 */
  range: TimeRange<TDate>;

  /** 범위 변경 */
  setRange: (range: { start: string | TDate; end: string | TDate }) => void;

  /** 다음으로 이동 */
  goNext: () => void;

  /** 이전으로 이동 */
  goPrev: () => void;

  /** 오늘로 이동 */
  goToday: () => void;
}

/**
 * TimeGrid React Hook
 *
 * @example
 * const { grid, goNext, goPrev } = useTimeGrid({
 *   adapter: createMockAdapter(),
 *   initialRange: { start: '2026-01-01', end: '2026-01-31' },
 *   cellUnit: 'day',
 * });
 */
export function useTimeGrid<TData = unknown, TDate = unknown>(
  options: UseTimeGridOptions<TData, TDate>
): UseTimeGridResult<TData, TDate> {
  const {
    adapter,
    initialRange,
    cellUnit,
    weekStartsOn,
    data,
    getItemDate,
  } = options;

  // 범위 상태 관리
  const [range, setRangeState] = useState<{ start: string | TDate; end: string | TDate }>(
    initialRange
  );

  // TimeGrid 생성 (memoized)
  const grid = useMemo(() => {
    return createTimeGrid<TData, TDate>({
      adapter,
      range,
      cellUnit,
      weekStartsOn,
      data,
      getItemDate,
    });
  }, [adapter, range, cellUnit, weekStartsOn, data, getItemDate]);

  // 범위 변경
  const setRange = useCallback(
    (newRange: { start: string | TDate; end: string | TDate }) => {
      setRangeState(newRange);
    },
    []
  );

  // 네비게이션 함수들
  const goNext = useCallback(() => {
    const days = getDaysToMove(cellUnit, grid.cellCount);
    setRangeState((prev) => {
      const start = normalizeDate(prev.start, adapter);
      const end = normalizeDate(prev.end, adapter);
      return {
        start: adapter.addDays(start, days),
        end: adapter.addDays(end, days),
      };
    });
  }, [adapter, cellUnit, grid.cellCount]);

  const goPrev = useCallback(() => {
    const days = getDaysToMove(cellUnit, grid.cellCount);
    setRangeState((prev) => {
      const start = normalizeDate(prev.start, adapter);
      const end = normalizeDate(prev.end, adapter);
      return {
        start: adapter.addDays(start, -days),
        end: adapter.addDays(end, -days),
      };
    });
  }, [adapter, cellUnit, grid.cellCount]);

  const goToday = useCallback(() => {
    const today = adapter.today();
    const startOfMonth = adapter.startOfMonth(today);
    const endOfMonth = adapter.addDays(
      adapter.startOfMonth(adapter.addDays(startOfMonth, 32)),
      -1
    );
    setRangeState({
      start: startOfMonth,
      end: endOfMonth,
    });
  }, [adapter]);

  return {
    grid,
    range: grid.range,
    setRange,
    goNext,
    goPrev,
    goToday,
  };
}

/**
 * 플러그인이 적용된 TimeGrid Hook
 *
 * @example
 * const { grid } = useTimeGridWithPlugins({
 *   adapter,
 *   initialRange,
 *   cellUnit: 'day',
 *   plugins: [selection({ mode: 'single' })],
 * });
 *
 * // 타입 추론 동작
 * grid.selection.select(cell);
 */
export function useTimeGridWithPlugins<
  TData = unknown,
  TDate = unknown,
  const TPlugins extends readonly Plugin<any>[] = [],
>(
  options: UseTimeGridOptions<TData, TDate> & { plugins: TPlugins }
): UseTimeGridResult<TData, TDate> & {
  grid: ExtendedTimeGrid<TData, TDate, TPlugins>;
} {
  const { plugins, ...baseOptions } = options;
  const result = useTimeGrid<TData, TDate>(baseOptions);

  // 플러그인 적용 (memoized)
  const extendedGrid = useMemo(() => {
    return pipe(result.grid, plugins);
  }, [result.grid, plugins]);

  return {
    ...result,
    grid: extendedGrid,
  };
}

// ============ Helper Functions ============

function normalizeDate<TDate>(
  date: string | TDate,
  adapter: DateAdapter<TDate>
): TDate {
  if (typeof date === 'string') {
    return adapter.fromISO(date);
  }
  return date;
}

function getDaysToMove(cellUnit: CellUnit, cellCount: number): number {
  switch (cellUnit) {
    case 'day':
      return cellCount;
    case 'week':
      return 7;
    case 'month':
      return 30; // 대략적인 값
    case 'hour':
      return 1;
  }
}

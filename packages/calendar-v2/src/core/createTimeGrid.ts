/**
 * createTimeGrid - 시간 그리드 생성 핵심 함수
 *
 * 시간 범위를 셀 배열로 변환하는 Core API.
 * DateAdapter를 통해 모든 날짜 연산을 수행하므로 외부 의존성 없음.
 */

import type { DateAdapter, WeekDay } from '../adapter/types';
import type { Plugin, InferPluginExtensions } from '../plugin/types';
import type {
  Cell,
  CellUnit,
  CreateTimeGridOptions,
  TimeGrid,
  TimeRange,
} from './types';

/**
 * TimeGrid 생성
 *
 * @example
 * // 기본 사용
 * const grid = createTimeGrid({
 *   adapter,
 *   range: { start: '2026-01-01', end: '2026-01-31' },
 *   cellUnit: 'day',
 * });
 *
 * @example
 * // 플러그인과 함께 사용
 * const grid = createTimeGrid({
 *   adapter,
 *   range: { start: '2026-01-01', end: '2026-01-31' },
 *   cellUnit: 'day',
 *   plugins: [selection({ mode: 'single' })],
 * });
 * // grid.selection.select(cell) - 타입 추론 동작
 */
export function createTimeGrid<
  TData = unknown,
  TDate = unknown,
  TPlugins extends Plugin<TData, TDate, any>[] = [],
>(
  options: CreateTimeGridOptions<TData, TDate, TPlugins>
): TimeGrid<TData, TDate> & InferPluginExtensions<TPlugins> {
  const {
    adapter,
    range: rawRange,
    cellUnit,
    weekStartsOn = adapter.getWeekStartsOn(),
    data = [],
    getItemDate,
    plugins = [] as unknown as TPlugins,
  } = options;

  // 범위 정규화 (문자열이면 TDate로 변환)
  const range: TimeRange<TDate> = {
    start: normalizeDate(rawRange.start, adapter),
    end: normalizeDate(rawRange.end, adapter),
  };

  // 데이터를 날짜별로 그룹화
  const dataByDate = groupDataByDate(data, getItemDate, adapter);

  // 셀 생성
  const cells = generateCells(range, cellUnit, adapter, weekStartsOn, dataByDate);

  // TimeGrid 객체 생성
  let grid: TimeGrid<TData, TDate> = {
    cells,
    range,
    cellUnit,
    weekStartsOn,
    cellCount: cells.length,

    getCellByDate(date: TDate): Cell<TData, TDate> | null {
      const targetKey = adapter.toISO(date);
      return cells.find((cell) => cell.key === targetKey) ?? null;
    },

    getCellsInRange(targetRange: TimeRange<TDate>): Cell<TData, TDate>[] {
      return cells.filter((cell) => {
        const date = cell.date;
        return (
          !adapter.isBefore(date, targetRange.start) &&
          !adapter.isAfter(date, targetRange.end)
        );
      });
    },
  };

  // 플러그인 적용
  for (const plugin of plugins) {
    grid = plugin.extend(grid) as TimeGrid<TData, TDate>;
  }

  return grid as TimeGrid<TData, TDate> & InferPluginExtensions<TPlugins>;
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

function groupDataByDate<TData, TDate>(
  data: TData[],
  getItemDate: ((item: TData) => TDate) | undefined,
  adapter: DateAdapter<TDate>
): Map<string, TData[]> {
  const map = new Map<string, TData[]>();

  if (!getItemDate) {
    return map;
  }

  for (const item of data) {
    const date = getItemDate(item);
    const key = adapter.toISO(date);

    if (!map.has(key)) {
      map.set(key, []);
    }
    map.get(key)!.push(item);
  }

  return map;
}

function generateCells<TData, TDate>(
  range: TimeRange<TDate>,
  cellUnit: CellUnit,
  adapter: DateAdapter<TDate>,
  weekStartsOn: WeekDay,
  dataByDate: Map<string, TData[]>
): Cell<TData, TDate>[] {
  const cells: Cell<TData, TDate>[] = [];
  const today = adapter.today();

  let current = adapter.startOfDay(range.start);
  const end = adapter.startOfDay(range.end);

  // 단위에 따른 증분
  const increment = getIncrement(cellUnit);

  while (!adapter.isAfter(current, end)) {
    const key = adapter.toISO(current);
    const cellData = dataByDate.get(key) ?? [];

    const cell: Cell<TData, TDate> = {
      key,
      date: current,
      data: cellData,
      isToday: adapter.isSame(current, today, 'day'),
      weekday: adapter.getDay(current),
      dayOfMonth: adapter.getDate(current),
      month: adapter.getMonth(current),
      year: adapter.getYear(current),
    };

    cells.push(cell);

    // 다음 셀로 이동
    current = adapter.addDays(current, increment);
  }

  return cells;
}

function getIncrement(cellUnit: CellUnit): number {
  switch (cellUnit) {
    case 'hour':
      // hour 단위는 PoC에서는 day로 처리 (시간 단위는 추후 확장)
      return 1;
    case 'day':
      return 1;
    case 'week':
      return 7;
    case 'month':
      // month는 복잡하므로 PoC에서는 day로 처리
      return 1;
  }
}

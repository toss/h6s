/**
 * createTimeGrid - 시간 그리드 생성 핵심 함수
 *
 * 시간 범위를 셀 배열로 변환하는 Core API.
 * Native Date 사용으로 외부 의존성 없음.
 */

import type { Plugin, InferPluginExtensions } from '../plugin/types';
import type {
  Cell,
  CellUnit,
  CreateTimeGridOptions,
  TimeGrid,
  TimeRange,
} from './types';
import {
  addDays,
  addHours,
  startOfDay,
  startOfHour,
  today,
  isSameDay,
  isBefore,
  isAfter,
  isAfterTime,
  toISODateString,
  toISODateTimeString,
  fromISODateString,
  getDay,
  getDate,
  getMonth,
  getYear,
  getHours,
  type WeekDay,
} from '../utils/date';

/**
 * TimeGrid 생성
 *
 * @example
 * // 기본 사용
 * const grid = createTimeGrid({
 *   range: { start: '2026-01-01', end: '2026-01-31' },
 *   cellUnit: 'day',
 * });
 *
 * @example
 * // 플러그인과 함께 사용
 * const grid = createTimeGrid({
 *   range: { start: new Date(), end: endOfMonth(new Date()) },
 *   cellUnit: 'day',
 *   plugins: [selection({ mode: 'single' })],
 * });
 */
export function createTimeGrid<
  TData = unknown,
  const TPlugins extends readonly Plugin<any>[] = [],
>(
  options: CreateTimeGridOptions<TData, TPlugins>
): TimeGrid<TData> & InferPluginExtensions<TPlugins> {
  const {
    range: rawRange,
    cellUnit,
    weekStartsOn = 0,
    data = [],
    getItemDate,
    plugins = [] as unknown as TPlugins,
  } = options;

  // 범위 정규화 (문자열이면 Date로 변환)
  const range: TimeRange = {
    start: normalizeDate(rawRange.start),
    end: normalizeDate(rawRange.end),
  };

  // 데이터를 날짜별로 그룹화
  const dataByDate = groupDataByDate(data, getItemDate);

  // 셀 생성
  const cells = generateCells<TData>(range, cellUnit, weekStartsOn, dataByDate);

  // TimeGrid 객체 생성
  let grid: TimeGrid<TData> = {
    cells,
    range,
    cellUnit,
    weekStartsOn,
    cellCount: cells.length,

    getCellByDate(date: Date): Cell<TData> | null {
      const targetKey = cellUnit === 'hour'
        ? toISODateTimeString(date)
        : toISODateString(date);
      return cells.find((cell) => cell.key === targetKey) ?? null;
    },

    getCellsInRange(targetRange: TimeRange): Cell<TData>[] {
      return cells.filter((cell) => {
        const date = cell.date;
        return !isBefore(date, targetRange.start) && !isAfter(date, targetRange.end);
      });
    },
  };

  // 플러그인 적용
  for (const plugin of plugins) {
    grid = plugin.extend(grid) as TimeGrid<TData>;
  }

  return grid as TimeGrid<TData> & InferPluginExtensions<TPlugins>;
}

// ============ Helper Functions ============

function normalizeDate(date: string | Date): Date {
  if (typeof date === 'string') {
    return fromISODateString(date);
  }
  // Date 객체는 그대로 반환 (hour 그리드에서 시간 정보 필요)
  return date;
}

function groupDataByDate<TData>(
  data: TData[],
  getItemDate: ((item: TData) => Date) | undefined
): Map<string, TData[]> {
  const map = new Map<string, TData[]>();

  if (!getItemDate) {
    return map;
  }

  for (const item of data) {
    const date = getItemDate(item);
    const key = toISODateString(date);

    if (!map.has(key)) {
      map.set(key, []);
    }
    map.get(key)!.push(item);
  }

  return map;
}

function generateCells<TData>(
  range: TimeRange,
  cellUnit: CellUnit,
  weekStartsOn: WeekDay,
  dataByDate: Map<string, TData[]>
): Cell<TData>[] {
  if (cellUnit === 'hour') {
    return generateHourCells(range, dataByDate);
  }
  return generateDayCells(range, cellUnit, dataByDate);
}

function generateHourCells<TData>(
  range: TimeRange,
  dataByDate: Map<string, TData[]>
): Cell<TData>[] {
  const cells: Cell<TData>[] = [];
  const todayDate = today();

  let current = startOfHour(range.start);
  const end = startOfHour(range.end);

  while (!isAfterTime(current, end)) {
    const key = toISODateTimeString(current);
    // hour 단위에서도 일별 데이터 바인딩 지원 (같은 날의 데이터)
    const dateKey = toISODateString(current);
    const cellData = dataByDate.get(dateKey) ?? [];

    const cell: Cell<TData> = {
      key,
      date: new Date(current),
      data: cellData,
      isToday: isSameDay(current, todayDate),
      weekday: getDay(current),
      dayOfMonth: getDate(current),
      month: getMonth(current),
      year: getYear(current),
      hour: getHours(current),
    };

    cells.push(cell);
    current = addHours(current, 1);
  }

  return cells;
}

function generateDayCells<TData>(
  range: TimeRange,
  cellUnit: CellUnit,
  dataByDate: Map<string, TData[]>
): Cell<TData>[] {
  const cells: Cell<TData>[] = [];
  const todayDate = today();

  let current = startOfDay(range.start);
  const end = startOfDay(range.end);
  const increment = cellUnit === 'week' ? 7 : 1;

  while (!isAfter(current, end)) {
    const key = toISODateString(current);
    const cellData = dataByDate.get(key) ?? [];

    const cell: Cell<TData> = {
      key,
      date: new Date(current),
      data: cellData,
      isToday: isSameDay(current, todayDate),
      weekday: getDay(current),
      dayOfMonth: getDate(current),
      month: getMonth(current),
      year: getYear(current),
      hour: 0,
    };

    cells.push(cell);
    current = addDays(current, increment);
  }

  return cells;
}

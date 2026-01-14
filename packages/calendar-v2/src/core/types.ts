/**
 * Core Types - 시간 그리드 프리미티브 타입 정의
 *
 * Native Date 사용으로 단순화된 타입.
 */

import type { WeekDay } from '../utils/date';
import type { Plugin } from '../plugin/types';

// ============ 기본 타입 ============

export type CellUnit = 'hour' | 'day' | 'week' | 'month' | 'year';

export interface TimeRange {
  start: Date;
  end: Date;
}

// ============ Cell - 그리드의 단위 ============

export interface Cell<TData = unknown> {
  /** 고유 키 (React key로 사용, ISO date string) */
  key: string;

  /** 셀의 날짜 */
  date: Date;

  /** 이 셀에 연결된 데이터 */
  data: TData[];

  // ============ 계산된 속성 ============

  /** 오늘인지 여부 */
  isToday: boolean;

  /** 요일 (0=일요일, 6=토요일) */
  weekday: WeekDay;

  /** 일 (1-31) */
  dayOfMonth: number;

  /** 월 (0-11) */
  month: number;

  /** 연도 */
  year: number;

  /** 시간 (0-23, hour 단위 그리드에서 사용) */
  hour: number;
}

// ============ TimeGrid - Core가 반환하는 결과물 ============

export interface TimeGrid<TData = unknown> {
  /** 그리드의 모든 셀 (1D 배열) */
  cells: Cell<TData>[];

  /** 그리드 범위 */
  range: TimeRange;

  /** 셀 단위 */
  cellUnit: CellUnit;

  /** 주 시작 요일 */
  weekStartsOn: WeekDay;

  /** 셀 개수 */
  cellCount: number;

  /** 날짜로 셀 찾기 */
  getCellByDate(date: Date): Cell<TData> | null;

  /** 범위 내 셀 찾기 */
  getCellsInRange(range: TimeRange): Cell<TData>[];
}

// ============ createTimeGrid 옵션 ============

export interface CreateTimeGridOptions<
  TData = unknown,
  TPlugins extends readonly Plugin<any>[] = [],
> {
  /** 그리드 범위 (Date 또는 ISO 문자열) */
  range: {
    start: Date | string;
    end: Date | string;
  };

  /** 셀 단위 */
  cellUnit: CellUnit;

  /** 주 시작 요일 (기본값: 0 = 일요일) */
  weekStartsOn?: WeekDay;

  /** 바인딩할 데이터 */
  data?: TData[];

  /** 데이터에서 날짜 추출 함수 */
  getItemDate?: (item: TData) => Date;

  /** 플러그인 배열 */
  plugins?: TPlugins;
}

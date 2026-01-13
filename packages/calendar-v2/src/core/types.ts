/**
 * Core Types - 시간 그리드 프리미티브 타입 정의
 */

import type { WeekDay } from '../adapter/types';

// ============ 기본 타입 ============

export type CellUnit = 'hour' | 'day' | 'week' | 'month';

export interface TimeRange<TDate = unknown> {
  start: TDate;
  end: TDate;
}

// ============ Cell - 그리드의 단위 ============

export interface Cell<TData = unknown, TDate = unknown> {
  /** 고유 키 (React key로 사용) */
  key: string;

  /** 셀의 날짜 (Point, 단일 시점) */
  date: TDate;

  /** 이 셀에 연결된 데이터 */
  data: TData[];

  // ============ 계산된 속성 (모든 캘린더에서 보편적으로 필요) ============

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
}

// ============ TimeGrid - Core가 반환하는 결과물 ============

export interface TimeGrid<TData = unknown, TDate = unknown> {
  /** 그리드의 모든 셀 (1D 배열) */
  cells: Cell<TData, TDate>[];

  /** 그리드 범위 */
  range: TimeRange<TDate>;

  /** 셀 단위 */
  cellUnit: CellUnit;

  /** 주 시작 요일 */
  weekStartsOn: WeekDay;

  /** 셀 개수 */
  cellCount: number;

  /** 날짜로 셀 찾기 */
  getCellByDate(date: TDate): Cell<TData, TDate> | null;

  /** 범위 내 셀 찾기 */
  getCellsInRange(range: TimeRange<TDate>): Cell<TData, TDate>[];
}

// ============ createTimeGrid 옵션 ============

export interface CreateTimeGridOptions<TData = unknown, TDate = unknown> {
  /** DateAdapter 인스턴스 */
  adapter: import('../adapter/types').DateAdapter<TDate>;

  /** 그리드 범위 (ISO 문자열 또는 TDate) */
  range: {
    start: string | TDate;
    end: string | TDate;
  };

  /** 셀 단위 */
  cellUnit: CellUnit;

  /** 주 시작 요일 (미지정 시 adapter 기본값) */
  weekStartsOn?: WeekDay;

  /** 바인딩할 데이터 */
  data?: TData[];

  /** 데이터에서 날짜 추출 함수 */
  getItemDate?: (item: TData) => TDate;
}

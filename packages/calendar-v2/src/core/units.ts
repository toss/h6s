/**
 * Unit Configurations - 시간 단위 정의
 *
 * 각 단위(hour, day, week, month, year)의 동작을 데이터로 정의.
 * Core에서 if 분기 없이 단위별 동작을 처리.
 */

import {
  addDays,
  addHours,
  addMonths,
  addYears,
  startOfDay,
  startOfHour,
  startOfMonth,
  startOfYear,
  type WeekDay,
} from '../utils/date';
import type { CellUnit } from './types';

/**
 * 단위 설정 인터페이스
 */
export interface UnitConfig {
  /** 날짜를 단위 시작점으로 정규화 */
  normalize: (date: Date) => Date;

  /** 다음 셀 날짜 계산 */
  getNext: (date: Date) => Date;

  /** 두 날짜 비교 (a > b인지) */
  isAfter: (a: Date, b: Date) => boolean;
}

/**
 * 시간 단위 설정
 */
const hourUnit: UnitConfig = {
  normalize: startOfHour,
  getNext: (date) => addHours(date, 1),
  isAfter: (a, b) => startOfHour(a).getTime() > startOfHour(b).getTime(),
};

/**
 * 일 단위 설정
 */
const dayUnit: UnitConfig = {
  normalize: startOfDay,
  getNext: (date) => addDays(date, 1),
  isAfter: (a, b) => startOfDay(a).getTime() > startOfDay(b).getTime(),
};

/**
 * 주 단위 설정 (7일 단위로 증가)
 */
const weekUnit: UnitConfig = {
  normalize: startOfDay,
  getNext: (date) => addDays(date, 7),
  isAfter: (a, b) => startOfDay(a).getTime() > startOfDay(b).getTime(),
};

/**
 * 월 단위 설정 (Month Selector UI용)
 */
const monthUnit: UnitConfig = {
  normalize: startOfMonth,
  getNext: (date) => addMonths(date, 1),
  isAfter: (a, b) => startOfMonth(a).getTime() > startOfMonth(b).getTime(),
};

/**
 * 년 단위 설정 (Year Selector UI용)
 */
const yearUnit: UnitConfig = {
  normalize: startOfYear,
  getNext: (date) => addYears(date, 1),
  isAfter: (a, b) => startOfYear(a).getTime() > startOfYear(b).getTime(),
};

/**
 * 단위별 설정 맵
 */
export const units: Record<CellUnit, UnitConfig> = {
  hour: hourUnit,
  day: dayUnit,
  week: weekUnit,
  month: monthUnit,
  year: yearUnit,
};

/**
 * 단위 설정 조회
 */
export function getUnit(cellUnit: CellUnit): UnitConfig {
  return units[cellUnit];
}

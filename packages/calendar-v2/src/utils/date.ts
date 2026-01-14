/**
 * Date Utilities - Native Date 연산 함수
 *
 * 외부 의존성 없이 순수 JavaScript Date로 구현.
 */

export type WeekDay = 0 | 1 | 2 | 3 | 4 | 5 | 6;

/**
 * 시간 추가
 */
export function addHours(date: Date, hours: number): Date {
  const result = new Date(date);
  result.setHours(result.getHours() + hours);
  return result;
}

/**
 * 일 추가
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * 월 추가
 */
export function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

/**
 * 년 추가
 */
export function addYears(date: Date, years: number): Date {
  const result = new Date(date);
  result.setFullYear(result.getFullYear() + years);
  return result;
}

/**
 * 연의 시작일
 */
export function startOfYear(date: Date): Date {
  return new Date(date.getFullYear(), 0, 1);
}

/**
 * 월의 시작일
 */
export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

/**
 * 월의 마지막일
 */
export function endOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

/**
 * 주의 시작일
 */
export function startOfWeek(date: Date, weekStartsOn: WeekDay = 0): Date {
  const day = date.getDay() as WeekDay;
  const diff = (day - weekStartsOn + 7) % 7;
  const result = new Date(date);
  result.setDate(result.getDate() - diff);
  return startOfDay(result);
}

/**
 * 일의 시작 (00:00:00)
 */
export function startOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

/**
 * 시간의 시작 (HH:00:00)
 */
export function startOfHour(date: Date): Date {
  const result = new Date(date);
  result.setMinutes(0, 0, 0);
  return result;
}

/**
 * 오늘 날짜
 */
export function today(): Date {
  return startOfDay(new Date());
}

/**
 * 두 날짜가 같은지 비교
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

/**
 * date1이 date2보다 이전인지 (일 단위 비교)
 */
export function isBefore(date1: Date, date2: Date): boolean {
  return startOfDay(date1).getTime() < startOfDay(date2).getTime();
}

/**
 * date1이 date2보다 이후인지 (일 단위 비교)
 */
export function isAfter(date1: Date, date2: Date): boolean {
  return startOfDay(date1).getTime() > startOfDay(date2).getTime();
}

/**
 * date1이 date2보다 이전인지 (시간 단위 비교)
 */
export function isBeforeTime(date1: Date, date2: Date): boolean {
  return startOfHour(date1).getTime() < startOfHour(date2).getTime();
}

/**
 * date1이 date2보다 이후인지 (시간 단위 비교)
 */
export function isAfterTime(date1: Date, date2: Date): boolean {
  return startOfHour(date1).getTime() > startOfHour(date2).getTime();
}

/**
 * ISO 문자열로 변환 (YYYY-MM-DD)
 */
export function toISODateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * ISO 날짜+시간 문자열로 변환 (YYYY-MM-DDTHH)
 */
export function toISODateTimeString(date: Date): string {
  const dateStr = toISODateString(date);
  const hour = String(date.getHours()).padStart(2, '0');
  return `${dateStr}T${hour}`;
}

/**
 * 시간 반환 (0-23)
 */
export function getHours(date: Date): number {
  return date.getHours();
}

/**
 * ISO 문자열에서 Date 생성
 */
export function fromISODateString(iso: string): Date {
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * 요일 반환 (0=일요일, 6=토요일)
 */
export function getDay(date: Date): WeekDay {
  return date.getDay() as WeekDay;
}

/**
 * 일 반환 (1-31)
 */
export function getDate(date: Date): number {
  return date.getDate();
}

/**
 * 월 반환 (0-11)
 */
export function getMonth(date: Date): number {
  return date.getMonth();
}

/**
 * 연도 반환
 */
export function getYear(date: Date): number {
  return date.getFullYear();
}

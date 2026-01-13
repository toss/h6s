/**
 * DateAdapter - 날짜 라이브러리 추상화 인터페이스
 *
 * Core가 zero-dependency를 유지하면서 다양한 날짜 라이브러리를 지원하기 위한 어댑터 패턴.
 * date-fns, Day.js, Luxon, Temporal API 등 어떤 라이브러리든 이 인터페이스를 구현하면 사용 가능.
 */

export type WeekDay = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface DateAdapter<TDate = unknown> {
  // ============ 날짜 연산 ============

  /** 날짜에 일수 더하기 (음수면 빼기) */
  addDays(date: TDate, days: number): TDate;

  /** 해당 월의 첫째 날 */
  startOfMonth(date: TDate): TDate;

  /** 해당 주의 첫째 날 */
  startOfWeek(date: TDate, options?: { weekStartsOn?: WeekDay }): TDate;

  /** 해당 일의 시작 (00:00:00) */
  startOfDay(date: TDate): TDate;

  // ============ 날짜 비교 ============

  /** 두 날짜가 같은 단위(day/month/year)인지 비교 */
  isSame(a: TDate, b: TDate, unit: 'day' | 'month' | 'year'): boolean;

  /** a가 b보다 이전인지 */
  isBefore(a: TDate, b: TDate): boolean;

  /** a가 b보다 이후인지 */
  isAfter(a: TDate, b: TDate): boolean;

  // ============ 날짜 생성 ============

  /** 오늘 날짜 */
  today(): TDate;

  /** ISO 문자열에서 날짜 생성 */
  fromISO(iso: string): TDate;

  /** 날짜를 ISO 문자열로 변환 */
  toISO(date: TDate): string;

  // ============ 날짜 정보 추출 ============

  /** 요일 (0=일요일, 6=토요일) */
  getDay(date: TDate): WeekDay;

  /** 월 (0=1월, 11=12월) */
  getMonth(date: TDate): number;

  /** 연도 */
  getYear(date: TDate): number;

  /** 일 (1-31) */
  getDate(date: TDate): number;

  // ============ 로케일 정보 ============

  /** 주 시작 요일 기본값 (로케일 기반) */
  getWeekStartsOn(): WeekDay;
}

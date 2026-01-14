/**
 * Events Plugin - Headless 이벤트 데이터 플러그인
 *
 * Cell은 균일한 시간 단위(시/일)이고, Event는 임의의 시간 범위를 가진다.
 * 이 플러그인은 이벤트 데이터 관리와 필터링을 담당한다.
 */

import type { Cell, CellUnit, TimeGrid, TimeRange } from '../core/types';
import type { Plugin } from '../plugin/types';
import { startOfDay } from '../utils/date';

// ============ 타입 정의 ============

/**
 * 이벤트의 시작/종료 시간 범위
 */
export interface EventRange {
  start: Date;
  end: Date;
}

/**
 * Events 플러그인 옵션
 */
export interface EventsOptions<TEvent> {
  /** 이벤트 데이터 배열 */
  data: TEvent[];

  /**
   * 이벤트에서 시간 범위 추출 함수
   */
  getEventRange: (event: TEvent) => EventRange;
}

/**
 * Events 플러그인이 추가하는 확장 타입
 */
export interface EventsExtension<TEvent> {
  events: {
    /** 모든 이벤트 데이터 */
    data: TEvent[];

    /** 뷰 범위 내 이벤트 */
    eventsInView: TEvent[];

    /**
     * 특정 셀과 겹치는 이벤트 조회
     */
    getEventsForCell: (cell: Cell) => TEvent[];

    /**
     * 특정 날짜와 겹치는 이벤트 조회
     */
    getEventsForDate: (date: Date) => TEvent[];

    /**
     * 이벤트 범위 조회
     */
    getEventRange: (event: TEvent) => EventRange;
  };
}

// ============ 헬퍼 함수 ============

/**
 * 이벤트 범위가 그리드 범위와 겹치는지 확인
 */
function eventOverlapsGridRange(
  eventRange: EventRange,
  gridRange: TimeRange
): boolean {
  return eventRange.start < gridRange.end && eventRange.end > gridRange.start;
}

/**
 * 이벤트가 특정 날짜와 겹치는지 확인
 */
function eventOverlapsDay(eventRange: EventRange, day: Date): boolean {
  const dayStart = startOfDay(day);
  const dayEnd = new Date(dayStart);
  dayEnd.setDate(dayEnd.getDate() + 1);

  return eventRange.start < dayEnd && eventRange.end > dayStart;
}

/**
 * 이벤트가 특정 셀과 겹치는지 확인
 */
function eventOverlapsCell(
  eventRange: EventRange,
  cell: Cell,
  cellUnit: CellUnit
): boolean {
  if (cellUnit === 'hour') {
    const cellStart = cell.date;
    const cellEnd = new Date(cellStart);
    cellEnd.setHours(cellEnd.getHours() + 1);
    return eventRange.start < cellEnd && eventRange.end > cellStart;
  }

  // day, week, month
  return eventOverlapsDay(eventRange, cell.date);
}

// ============ 메인 플러그인 함수 ============

/**
 * Events 플러그인 생성
 *
 * @example
 * const grid = createTimeGrid({
 *   range: dayRange(cursor),
 *   cellUnit: 'hour',
 *   plugins: [
 *     events({
 *       data: myEvents,
 *       getEventRange: (e) => ({ start: e.start, end: e.end }),
 *     }),
 *   ],
 * });
 *
 * // 특정 셀의 이벤트 조회
 * const cellEvents = grid.events.getEventsForCell(cell);
 *
 * // 뷰 범위 내 모든 이벤트
 * grid.events.eventsInView.map(event => ...)
 */
export function events<TEvent>(
  options: EventsOptions<TEvent>
): Plugin<EventsExtension<TEvent>> {
  const { data, getEventRange } = options;

  return {
    name: 'events',
    extend(grid: TimeGrid) {
      // 범위 캐시
      const rangeCache = new Map<TEvent, EventRange>();
      const getRange = (event: TEvent): EventRange => {
        if (!rangeCache.has(event)) {
          rangeCache.set(event, getEventRange(event));
        }
        return rangeCache.get(event)!;
      };

      // 뷰 범위 내 이벤트 필터링
      const eventsInView = data.filter((event) => {
        const range = getRange(event);
        return eventOverlapsGridRange(range, grid.range);
      });

      // API 구현
      const getEventsForCell = (cell: Cell): TEvent[] => {
        return eventsInView.filter((event) => {
          const range = getRange(event);
          return eventOverlapsCell(range, cell, grid.cellUnit);
        });
      };

      const getEventsForDate = (date: Date): TEvent[] => {
        return eventsInView.filter((event) => {
          const range = getRange(event);
          return eventOverlapsDay(range, date);
        });
      };

      return {
        ...grid,
        events: {
          data,
          eventsInView,
          getEventsForCell,
          getEventsForDate,
          getEventRange: getRange,
        },
      };
    },
  };
}

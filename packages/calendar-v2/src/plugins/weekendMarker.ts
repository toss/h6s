/**
 * WeekendMarker Plugin - 주말 표시 플러그인
 *
 * 커스텀 플러그인 예시.
 * 셀에 data-weekend 속성을 추가하여 스타일링에 활용.
 */

import type { Cell, TimeGrid } from '../core/types';
import type { Plugin } from '../plugin/types';
import { isWeekend } from '../utils/isWeekend';

export interface CellProps {
  'data-weekend'?: boolean;
  'data-weekday'?: number;
}

export interface WeekendMarkerExtension<TData, TDate> {
  /** 셀에 적용할 props 반환 */
  getCellProps: (cell: Cell<TData, TDate>) => CellProps;
}

/**
 * WeekendMarker 플러그인 생성
 *
 * @returns WeekendMarker Plugin
 *
 * @example
 * const grid = pipe(baseGrid, [weekendMarker()]);
 *
 * // React에서 사용
 * <div {...grid.getCellProps(cell)}>
 *   {cell.dayOfMonth}
 * </div>
 *
 * // CSS에서 활용
 * [data-weekend="true"] { background: #f5f5f5; }
 */
export function weekendMarker<
  TData = unknown,
  TDate = unknown,
>(): Plugin<TData, TDate, WeekendMarkerExtension<TData, TDate>> {
  return {
    name: 'weekendMarker',
    extend(grid: TimeGrid<TData, TDate>) {
      const getCellProps = (cell: Cell<TData, TDate>): CellProps => ({
        'data-weekend': isWeekend(cell.weekday),
        'data-weekday': cell.weekday,
      });

      return {
        ...grid,
        getCellProps,
      };
    },
  };
}

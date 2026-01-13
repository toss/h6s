/**
 * Selection Plugin - 셀 선택 플러그인
 *
 * 단일 선택 및 범위 선택을 지원하는 플러그인.
 * 상태 관리는 외부(React state 등)에서 처리.
 */

import type { Cell, TimeGrid } from '../core/types';
import type { Plugin } from '../plugin/types';

export type SelectionMode = 'single' | 'range';

export interface SelectionOptions {
  /** 선택 모드 */
  mode: SelectionMode;
}

export interface SelectionState<TData, TDate> {
  /** 현재 선택된 셀 (single 모드) */
  selected: Cell<TData, TDate> | null;
  /** 범위 선택 시작 셀 (range 모드) */
  rangeStart: Cell<TData, TDate> | null;
  /** 범위 선택 끝 셀 (range 모드) */
  rangeEnd: Cell<TData, TDate> | null;
}

export interface SelectionExtension<TData, TDate> {
  selection: {
    /** 현재 상태 */
    state: SelectionState<TData, TDate>;
    /** 셀 선택 */
    select: (cell: Cell<TData, TDate>) => SelectionState<TData, TDate>;
    /** 선택 해제 */
    clear: () => SelectionState<TData, TDate>;
    /** 셀이 선택되었는지 확인 */
    isSelected: (cell: Cell<TData, TDate>) => boolean;
    /** 셀이 범위 내에 있는지 확인 */
    isInRange: (cell: Cell<TData, TDate>) => boolean;
  };
}

/**
 * Selection 플러그인 생성
 *
 * @param options - 선택 옵션
 * @returns Selection Plugin
 *
 * @example
 * const grid = pipe(baseGrid, [selection({ mode: 'single' })]);
 * grid.selection.select(cell);
 * if (grid.selection.isSelected(cell)) { ... }
 */
export function selection<TData = unknown, TDate = unknown>(
  options: SelectionOptions
): Plugin<TData, TDate, SelectionExtension<TData, TDate>> {
  const { mode } = options;

  return {
    name: 'selection',
    extend(grid: TimeGrid<TData, TDate>) {
      // 초기 상태
      let state: SelectionState<TData, TDate> = {
        selected: null,
        rangeStart: null,
        rangeEnd: null,
      };

      const select = (
        cell: Cell<TData, TDate>
      ): SelectionState<TData, TDate> => {
        if (mode === 'single') {
          state = {
            selected: cell,
            rangeStart: null,
            rangeEnd: null,
          };
        } else {
          // range 모드
          if (!state.rangeStart) {
            state = {
              selected: null,
              rangeStart: cell,
              rangeEnd: null,
            };
          } else if (!state.rangeEnd) {
            state = {
              selected: null,
              rangeStart: state.rangeStart,
              rangeEnd: cell,
            };
          } else {
            // 새로운 범위 시작
            state = {
              selected: null,
              rangeStart: cell,
              rangeEnd: null,
            };
          }
        }
        return state;
      };

      const clear = (): SelectionState<TData, TDate> => {
        state = {
          selected: null,
          rangeStart: null,
          rangeEnd: null,
        };
        return state;
      };

      const isSelected = (cell: Cell<TData, TDate>): boolean => {
        if (mode === 'single') {
          return state.selected?.key === cell.key;
        }
        return isInRange(cell);
      };

      const isInRange = (cell: Cell<TData, TDate>): boolean => {
        if (!state.rangeStart || !state.rangeEnd) {
          return state.rangeStart?.key === cell.key;
        }

        // 범위 내에 있는지 확인 (key 기반 비교)
        const cellKey = cell.key;
        const startKey = state.rangeStart.key;
        const endKey = state.rangeEnd.key;

        // ISO 날짜 문자열 비교 (사전순 = 시간순)
        const [min, max] = startKey <= endKey ? [startKey, endKey] : [endKey, startKey];
        return cellKey >= min && cellKey <= max;
      };

      return {
        ...grid,
        selection: {
          state,
          select,
          clear,
          isSelected,
          isInRange,
        },
      };
    },
  };
}

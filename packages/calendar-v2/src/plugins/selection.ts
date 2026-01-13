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

export interface SelectionState {
  /** 현재 선택된 셀 키 (single 모드) */
  selectedKey: string | null;
  /** 범위 선택 시작 키 (range 모드) */
  rangeStartKey: string | null;
  /** 범위 선택 끝 키 (range 모드) */
  rangeEndKey: string | null;
}

export interface SelectionExtension {
  selection: {
    /** 현재 상태 */
    state: SelectionState;
    /** 셀 선택 */
    select: (cell: Cell<any, any>) => SelectionState;
    /** 선택 해제 */
    clear: () => SelectionState;
    /** 셀이 선택되었는지 확인 */
    isSelected: (cell: Cell<any, any>) => boolean;
    /** 셀이 범위 내에 있는지 확인 */
    isInRange: (cell: Cell<any, any>) => boolean;
  };
}

/**
 * Selection 플러그인 생성
 *
 * @param options - 선택 옵션
 * @returns Selection Plugin
 *
 * @example
 * const grid = createTimeGrid({
 *   adapter,
 *   range,
 *   cellUnit: 'day',
 *   plugins: [selection({ mode: 'single' })],
 * });
 * grid.selection.select(cell);
 */
export function selection(options: SelectionOptions): Plugin<SelectionExtension> {
  const { mode } = options;

  return {
    name: 'selection',
    extend<TData, TDate>(grid: TimeGrid<TData, TDate>) {
      // 초기 상태
      let state: SelectionState = {
        selectedKey: null,
        rangeStartKey: null,
        rangeEndKey: null,
      };

      const select = (cell: Cell<any, any>): SelectionState => {
        if (mode === 'single') {
          state = {
            selectedKey: cell.key,
            rangeStartKey: null,
            rangeEndKey: null,
          };
        } else {
          // range 모드
          if (!state.rangeStartKey) {
            state = {
              selectedKey: null,
              rangeStartKey: cell.key,
              rangeEndKey: null,
            };
          } else if (!state.rangeEndKey) {
            state = {
              selectedKey: null,
              rangeStartKey: state.rangeStartKey,
              rangeEndKey: cell.key,
            };
          } else {
            // 새로운 범위 시작
            state = {
              selectedKey: null,
              rangeStartKey: cell.key,
              rangeEndKey: null,
            };
          }
        }
        return state;
      };

      const clear = (): SelectionState => {
        state = {
          selectedKey: null,
          rangeStartKey: null,
          rangeEndKey: null,
        };
        return state;
      };

      const isSelected = (cell: Cell<any, any>): boolean => {
        if (mode === 'single') {
          return state.selectedKey === cell.key;
        }
        return isInRange(cell);
      };

      const isInRange = (cell: Cell<any, any>): boolean => {
        if (!state.rangeStartKey || !state.rangeEndKey) {
          return state.rangeStartKey === cell.key;
        }

        // 범위 내에 있는지 확인 (key 기반 비교)
        const cellKey = cell.key;
        const startKey = state.rangeStartKey;
        const endKey = state.rangeEndKey;

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

/**
 * Selection Plugin - 셀 선택 플러그인
 *
 * 단일 선택 및 범위 선택을 지원하는 플러그인.
 * - Plugin은 순수 로직만 제공
 * - 상태 관리는 React Adapter에서 담당
 */

import type { Cell, TimeGrid, TimeRange } from '../core/types';
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
    /** 셀 선택 (새 상태 반환) */
    computeSelect: (cell: Cell) => SelectionState;
    /** 선택 해제 (새 상태 반환) */
    computeClear: () => SelectionState;
    /** 셀이 선택되었는지 확인 */
    isSelected: (cell: Cell) => boolean;
    /** 셀이 범위 내에 있는지 확인 */
    isInRange: (cell: Cell) => boolean;
  };
}

// 초기 상태
const INITIAL_STATE: SelectionState = {
  selectedKey: null,
  rangeStartKey: null,
  rangeEndKey: null,
};

/**
 * Selection 플러그인 생성
 *
 * @param options - 선택 옵션
 * @returns Selection Plugin
 *
 * @example
 * const grid = createTimeGrid({
 *   range: { start: '2026-01-01', end: '2026-01-31' },
 *   cellUnit: 'day',
 *   plugins: [selection({ mode: 'single' })],
 * });
 *
 * // React Adapter에서 상태 변경 시:
 * const newState = grid.selection.computeSelect(cell);
 * setSelState(newState);
 */
export function selection(
  options: SelectionOptions
): Plugin<SelectionExtension, SelectionState> {
  const { mode } = options;

  // 선택 로직 (순수 함수)
  const computeSelectFn = (state: SelectionState, cell: Cell): SelectionState => {
    if (mode === 'single') {
      return {
        selectedKey: cell.key,
        rangeStartKey: null,
        rangeEndKey: null,
      };
    }

    // range 모드
    if (!state.rangeStartKey) {
      return {
        selectedKey: null,
        rangeStartKey: cell.key,
        rangeEndKey: null,
      };
    }

    if (!state.rangeEndKey) {
      return {
        selectedKey: null,
        rangeStartKey: state.rangeStartKey,
        rangeEndKey: cell.key,
      };
    }

    // 새로운 범위 시작
    return {
      selectedKey: null,
      rangeStartKey: cell.key,
      rangeEndKey: null,
    };
  };

  // 범위 체크 (순수 함수)
  const checkIsInRange = (state: SelectionState, cell: Cell): boolean => {
    if (!state.rangeStartKey || !state.rangeEndKey) {
      return state.rangeStartKey === cell.key;
    }

    const cellKey = cell.key;
    const startKey = state.rangeStartKey;
    const endKey = state.rangeEndKey;

    // ISO 날짜 문자열 비교 (사전순 = 시간순)
    const [min, max] = startKey <= endKey ? [startKey, endKey] : [endKey, startKey];
    return cellKey >= min && cellKey <= max;
  };

  return {
    name: 'selection',

    // 초기 상태 생성
    getInitialState: (_range: TimeRange): SelectionState => {
      return { ...INITIAL_STATE };
    },

    // Grid 확장
    extend(grid: TimeGrid, state?: SelectionState) {
      const currentState: SelectionState = state ?? { ...INITIAL_STATE };

      return {
        ...grid,
        selection: {
          state: currentState,

          // 순수 함수들: 새 상태 반환
          computeSelect: (cell: Cell) => computeSelectFn(currentState, cell),
          computeClear: () => ({ ...INITIAL_STATE }),

          // 조회 함수들
          isSelected: (cell: Cell) => {
            if (mode === 'single') {
              return currentState.selectedKey === cell.key;
            }
            return checkIsInRange(currentState, cell);
          },

          isInRange: (cell: Cell) => checkIsInRange(currentState, cell),
        },
      };
    },
  };
}

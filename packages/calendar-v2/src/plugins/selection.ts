/**
 * Selection Plugin - 셀 선택 플러그인
 *
 * 단일 선택 및 범위 선택을 지원하는 플러그인.
 * - createTimeGrid: select() → SelectionState 반환
 * - useTimeGrid: select() → void (내부 setState)
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
    select: (cell: Cell) => SelectionState;
    /** 선택 해제 (새 상태 반환) */
    clear: () => SelectionState;
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
 * @example
 * // createTimeGrid - 직접 상태 관리
 * const grid = createTimeGrid({ plugins: [selection({ mode: 'single' })] });
 * const newState = grid.selection.select(cell);
 * setSelectionState(newState);
 *
 * @example
 * // useTimeGrid - 자동 상태 관리
 * const grid = useTimeGrid({ plugins: [selection({ mode: 'single' })] });
 * grid.selection.select(cell); // 내부적으로 setState 호출
 */
export function selection(
  options: SelectionOptions
): Plugin<SelectionExtension, SelectionState> {
  const { mode } = options;

  // 선택 로직 (순수 함수)
  const selectFn = (state: SelectionState, cell: Cell): SelectionState => {
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
    actions: ['select', 'clear'],

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

          // 액션 메서드: 새 상태 반환
          select: (cell: Cell) => selectFn(currentState, cell),
          clear: () => ({ ...INITIAL_STATE }),

          // 조회 메서드
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

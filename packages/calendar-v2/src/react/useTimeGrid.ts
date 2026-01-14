/**
 * useTimeGrid - React Adapter
 *
 * Core의 createTimeGrid를 React와 통합.
 * - 플러그인 상태를 내부 useState로 관리
 * - 메서드 호출 시 자동으로 상태 업데이트
 * - 사용자는 useState 보일러플레이트 없이 사용 가능
 */

import { useMemo, useState, useCallback } from 'react';
import { createTimeGrid } from '../core';
import type {
  Cell,
  CellUnit,
  TimeGrid,
  TimeRange,
} from '../core/types';
import type { Plugin, InferPluginExtensions } from '../plugin/types';
import type { NavigationState, NavigationExtension } from '../plugins/navigation';
import type { SelectionState, SelectionExtension } from '../plugins/selection';
import type { WeekDay } from '../utils/date';

// ============ Types ============

export interface UseTimeGridOptions<
  TPlugins extends readonly Plugin<any, any>[] = [],
> {
  /** 초기 범위 (첫 렌더링에만 사용, 이후 navigation 상태로 관리) */
  range: {
    start: Date | string;
    end: Date | string;
  };
  /** 셀 단위 */
  cellUnit: CellUnit;
  /** 주 시작 요일 */
  weekStartsOn?: WeekDay;
  /** 완전한 주로 확장 */
  fillWeeks?: boolean;
  /** 플러그인 배열 */
  plugins?: TPlugins;
}

// Navigation이 바인딩된 확장 타입
type BoundNavigation = {
  state: NavigationState;
  goNext: () => void;
  goPrev: () => void;
  goToday: () => void;
  goTo: (date: Date) => void;
  getRange: () => { start: Date; end: Date };
};

// Selection이 바인딩된 확장 타입
type BoundSelection = {
  state: SelectionState;
  select: (cell: Cell) => void;
  clear: () => void;
  isSelected: (cell: Cell) => boolean;
  isInRange: (cell: Cell) => boolean;
};

// 플러그인 확장에서 navigation/selection을 바인딩된 타입으로 변환
type BindExtensions<T> =
  // navigation과 selection 둘 다 있는 경우
  T extends NavigationExtension & SelectionExtension
    ? Omit<T, 'navigation' | 'selection'> & {
        navigation: BoundNavigation;
        selection: BoundSelection;
      }
    // navigation만 있는 경우
    : T extends NavigationExtension
      ? Omit<T, 'navigation'> & { navigation: BoundNavigation }
      // selection만 있는 경우
      : T extends SelectionExtension
        ? Omit<T, 'selection'> & { selection: BoundSelection }
        // 둘 다 없는 경우
        : T;

// useTimeGrid 반환 타입
export type UseTimeGridResult<
  TPlugins extends readonly Plugin<any, any>[],
> = TimeGrid & BindExtensions<InferPluginExtensions<TPlugins>>;

// ============ Hook ============

/**
 * useTimeGrid - React용 TimeGrid Hook
 *
 * @example
 * function Calendar() {
 *   const grid = useTimeGrid({
 *     range: { start: '2026-01-01', end: '2026-01-31' },
 *     cellUnit: 'day',
 *     plugins: [navigation({ unit: 'month' }), selection({ mode: 'single' })],
 *   });
 *
 *   return (
 *     <div>
 *       <button onClick={grid.navigation.goNext}>Next</button>
 *       {grid.cells.map(cell => (
 *         <div key={cell.key} onClick={() => grid.selection.select(cell)}>
 *           {cell.dayOfMonth}
 *         </div>
 *       ))}
 *     </div>
 *   );
 * }
 */
export function useTimeGrid<
  const TPlugins extends readonly Plugin<any, any>[] = [],
>(
  options: UseTimeGridOptions<TPlugins>
): UseTimeGridResult<TPlugins> {
  const {
    range: initialRange,
    cellUnit,
    weekStartsOn = 0,
    fillWeeks = false,
    plugins = [] as unknown as TPlugins,
  } = options;

  // 플러그인 상태들을 통합 관리
  const [pluginStates, setPluginStates] = useState<Record<string, unknown>>(() => {
    const states: Record<string, unknown> = {};
    const normalizedRange: TimeRange = {
      start: typeof initialRange.start === 'string'
        ? new Date(initialRange.start)
        : initialRange.start,
      end: typeof initialRange.end === 'string'
        ? new Date(initialRange.end)
        : initialRange.end,
    };

    for (const plugin of plugins) {
      if (plugin.getInitialState) {
        states[plugin.name] = plugin.getInitialState(normalizedRange);
      }
    }
    return states;
  });

  // Navigation 상태에서 현재 범위 가져오기
  const currentRange = useMemo(() => {
    const navState = pluginStates.navigation as NavigationState | undefined;
    if (navState) {
      return { start: navState.rangeStart, end: navState.rangeEnd };
    }
    return initialRange;
  }, [pluginStates.navigation, initialRange]);

  // Core Grid 생성 (순수)
  const grid = useMemo(() => {
    return createTimeGrid({
      range: currentRange,
      cellUnit,
      weekStartsOn,
      fillWeeks,
      plugins,
      pluginStates,
    });
  }, [currentRange, cellUnit, weekStartsOn, fillWeeks, plugins, pluginStates]);

  // 플러그인 상태 업데이트 헬퍼
  const updatePluginState = useCallback(
    (pluginName: string, newState: unknown) => {
      setPluginStates((prev) => ({ ...prev, [pluginName]: newState }));
    },
    []
  );

  // Navigation 메서드 바인딩
  const boundNavigation = useMemo(() => {
    const nav = (grid as any).navigation;
    if (!nav) return undefined;

    return {
      state: nav.state,
      goNext: () => updatePluginState('navigation', nav.computeNext()),
      goPrev: () => updatePluginState('navigation', nav.computePrev()),
      goToday: () => updatePluginState('navigation', nav.computeToday()),
      goTo: (date: Date) => updatePluginState('navigation', nav.computeGoTo(date)),
      getRange: nav.getRange,
    };
  }, [grid, updatePluginState]);

  // Selection 메서드 바인딩
  const boundSelection = useMemo(() => {
    const sel = (grid as any).selection;
    if (!sel) return undefined;

    return {
      state: sel.state,
      select: (cell: Cell) => updatePluginState('selection', sel.computeSelect(cell)),
      clear: () => updatePluginState('selection', sel.computeClear()),
      isSelected: sel.isSelected,
      isInRange: sel.isInRange,
    };
  }, [grid, updatePluginState]);

  // 바인딩된 그리드 생성
  const boundGrid = useMemo(() => {
    const result: any = { ...grid };

    if (boundNavigation) {
      result.navigation = boundNavigation;
    }

    if (boundSelection) {
      result.selection = boundSelection;
    }

    return result as UseTimeGridResult<TPlugins>;
  }, [grid, boundNavigation, boundSelection]);

  return boundGrid;
}

/**
 * useTimeGrid - React Adapter
 *
 * Core의 createTimeGrid를 React와 통합.
 * - 플러그인 상태를 내부 useState로 자동 관리
 * - 액션 메서드는 void 반환 (내부 setState 호출)
 * - 플러그인 타입은 InferBoundExtensions로 자동 추론
 */

import { useMemo, useState, useCallback } from 'react';
import { createTimeGrid } from '../core';
import type {
  Cell,
  CellUnit,
  TimeGrid,
  TimeRange,
} from '../core/types';
import type { Plugin } from '../plugin/types';
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

/**
 * 메서드 반환 타입이 TState면 void로 변환
 *
 * - TState가 unknown이면 변환하지 않음 (stateless plugin)
 * - TState가 구체적이면 해당 타입 반환 메서드를 void로 변환
 */
type BindStateReturns<T, TState> =
  unknown extends TState
    ? T
    : {
        [K in keyof T]: T[K] extends (...args: infer A) => TState
          ? (...args: A) => void
          : T[K];
      };

/**
 * Extension 객체의 중첩 메서드들을 바인딩
 */
type BindExtension<TExt, TState> = {
  [K in keyof TExt]: TExt[K] extends object
    ? BindStateReturns<TExt[K], TState>
    : TExt[K];
};

/**
 * React용 바인딩된 확장 타입 추출
 *
 * 각 플러그인의 State 타입을 기반으로 액션 메서드의 반환 타입을 void로 변환.
 * - Stateful plugin: goNext() → void, select() → void
 * - Stateless plugin: getEventsForDate() → TEvent[] (그대로)
 */
type InferBoundExtensions<TPlugins extends readonly Plugin<any, any>[]> =
  TPlugins extends readonly [infer First extends Plugin<any, any>, ...infer Rest extends readonly Plugin<any, any>[]]
    ? (First extends Plugin<infer Ext, infer State>
        ? BindExtension<Ext, State>
        : never) & InferBoundExtensions<Rest>
    : unknown;

/**
 * useTimeGrid 반환 타입
 */
export type UseTimeGridResult<
  TPlugins extends readonly Plugin<any, any>[],
> = TimeGrid & InferBoundExtensions<TPlugins>;

// ============ Hook ============

/**
 * useTimeGrid - React용 TimeGrid Hook
 *
 * @example
 * const grid = useTimeGrid({
 *   range: { start: '2026-01-01', end: '2026-01-31' },
 *   cellUnit: 'day',
 *   plugins: [navigation({ unit: 'month' }), selection({ mode: 'single' })],
 * });
 *
 * grid.navigation.goNext();  // void - 내부 상태 업데이트
 * grid.selection.select(cell);  // void - 내부 상태 업데이트
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
    const navState = pluginStates.navigation as { rangeStart: Date; rangeEnd: Date } | undefined;
    if (navState?.rangeStart && navState?.rangeEnd) {
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
      goNext: () => updatePluginState('navigation', nav.goNext()),
      goPrev: () => updatePluginState('navigation', nav.goPrev()),
      goToday: () => updatePluginState('navigation', nav.goToday()),
      goTo: (date: Date) => updatePluginState('navigation', nav.goTo(date)),
      getRange: nav.getRange,
    };
  }, [grid, updatePluginState]);

  // Selection 메서드 바인딩
  const boundSelection = useMemo(() => {
    const sel = (grid as any).selection;
    if (!sel) return undefined;

    return {
      state: sel.state,
      select: (cell: Cell) => updatePluginState('selection', sel.select(cell)),
      clear: () => updatePluginState('selection', sel.clear()),
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

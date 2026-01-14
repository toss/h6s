/**
 * pipe - 플러그인 조합 함수
 *
 * 여러 플러그인을 순차적으로 적용하여 TimeGrid를 확장.
 * 타입 추론이 자동으로 동작하여 IDE 자동완성 지원.
 */

import type { TimeGrid } from '../core/types';
import type { ExtendedTimeGrid, Plugin } from './types';

/**
 * 플러그인들을 TimeGrid에 적용
 *
 * @param grid - 원본 TimeGrid
 * @param plugins - 적용할 플러그인 배열
 * @returns 모든 플러그인이 적용된 확장 TimeGrid
 *
 * @example
 * const extendedGrid = pipe(grid, [
 *   selection({ mode: 'single' }),
 * ]);
 *
 * // 타입 추론 동작
 * extendedGrid.selection.select(cell); // ✓
 */
export function pipe<const TPlugins extends readonly Plugin<any>[]>(
  grid: TimeGrid,
  plugins: TPlugins
): ExtendedTimeGrid<TPlugins> {
  let result: any = grid;

  for (const plugin of plugins) {
    result = plugin.extend(result);
  }

  return result as ExtendedTimeGrid<TPlugins>;
}

/**
 * 단일 플러그인 적용 (타입 안전)
 */
export function applyPlugin<TExtension>(
  grid: TimeGrid,
  plugin: Plugin<TExtension>
): TimeGrid & TExtension {
  return plugin.extend(grid);
}

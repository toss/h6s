/**
 * Plugin Types - 플러그인 시스템 타입 정의
 *
 * 타입 안전한 플러그인 조합을 위한 인터페이스.
 * 플러그인을 추가할 때마다 타입이 자동으로 추론됨.
 */

import type { TimeGrid } from '../core/types';

/**
 * 플러그인 인터페이스
 *
 * @template TData - 데이터 타입
 * @template TDate - 날짜 타입
 * @template TExtension - 플러그인이 추가하는 확장 타입
 */
export interface Plugin<
  TData = unknown,
  TDate = unknown,
  TExtension = unknown,
> {
  /** 플러그인 이름 (디버깅용) */
  name: string;

  /**
   * TimeGrid를 확장하는 함수
   * @param grid - 원본 TimeGrid
   * @returns 확장된 TimeGrid
   */
  extend: (grid: TimeGrid<TData, TDate>) => TimeGrid<TData, TDate> & TExtension;
}

/**
 * 플러그인 배열에서 확장 타입 추출
 *
 * @example
 * type Extensions = InferPluginExtensions<[SelectionPlugin, NavigationPlugin]>;
 * // { selection: {...} } & { navigation: {...} }
 */
export type InferPluginExtensions<
  TPlugins extends Plugin<any, any, any>[],
> = TPlugins extends [
  Plugin<any, any, infer First>,
  ...infer Rest extends Plugin<any, any, any>[],
]
  ? First & InferPluginExtensions<Rest>
  : unknown;

/**
 * 확장된 TimeGrid 타입
 */
export type ExtendedTimeGrid<
  TData,
  TDate,
  TPlugins extends Plugin<TData, TDate, any>[],
> = TimeGrid<TData, TDate> & InferPluginExtensions<TPlugins>;

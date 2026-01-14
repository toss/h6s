/**
 * Plugin Types - 플러그인 시스템 타입 정의
 *
 * 단순화된 플러그인 인터페이스.
 * - Core는 순수 함수 유지
 * - Plugin은 상태 초기값과 순수 로직 제공
 * - React Adapter가 상태 관리 담당
 */

import type { TimeGrid, TimeRange } from '../core/types';

/**
 * 플러그인 인터페이스
 *
 * @template TExtension - 플러그인이 추가하는 확장 타입
 * @template TState - 플러그인 상태 타입
 */
export interface Plugin<TExtension = unknown, TState = unknown> {
  /** 플러그인 이름 */
  name: string;

  /**
   * 초기 상태 생성 (옵션)
   * 상태가 필요한 플러그인만 구현
   */
  getInitialState?: (range: TimeRange) => TState;

  /**
   * TimeGrid를 확장하는 함수
   * @param grid - 기본 TimeGrid
   * @param state - 플러그인 상태 (getInitialState가 있는 경우)
   */
  extend: (grid: TimeGrid, state?: TState) => TimeGrid & TExtension;
}

/**
 * 플러그인에서 상태 타입 추출
 */
export type InferPluginState<TPlugin> = TPlugin extends Plugin<any, infer TState>
  ? TState
  : never;

/**
 * 플러그인 배열에서 확장 타입 추출
 *
 * @example
 * type Extensions = InferPluginExtensions<[Plugin<SelectionExt>, Plugin<NavExt>]>;
 * // SelectionExt & NavExt
 */
export type InferPluginExtensions<TPlugins extends readonly Plugin<any, any>[]> =
  TPlugins extends readonly [Plugin<infer First, any>, ...infer Rest extends readonly Plugin<any, any>[]]
    ? First & InferPluginExtensions<Rest>
    : unknown;

/**
 * 확장된 TimeGrid 타입
 */
export type ExtendedTimeGrid<
  TPlugins extends readonly Plugin<any, any>[],
> = TimeGrid & InferPluginExtensions<TPlugins>;

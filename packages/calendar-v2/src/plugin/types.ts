/**
 * Plugin Types - 플러그인 시스템 타입 정의
 *
 * 단순화된 플러그인 인터페이스.
 * TData, TDate는 createTimeGrid에서 추론되고, Plugin은 Extension 타입만 정의.
 */

import type { TimeGrid } from '../core/types';

/**
 * 플러그인 인터페이스
 *
 * @template TExtension - 플러그인이 추가하는 확장 타입
 */
export interface Plugin<TExtension = unknown> {
  /** 플러그인 이름 (디버깅용) */
  name: string;

  /**
   * TimeGrid를 확장하는 함수
   * TData, TDate는 createTimeGrid에서 추론됨
   */
  extend: <TData, TDate>(
    grid: TimeGrid<TData, TDate>
  ) => TimeGrid<TData, TDate> & TExtension;
}

/**
 * 플러그인 배열에서 확장 타입 추출
 *
 * @example
 * type Extensions = InferPluginExtensions<[Plugin<SelectionExt>, Plugin<NavExt>]>;
 * // SelectionExt & NavExt
 */
export type InferPluginExtensions<TPlugins extends readonly Plugin<any>[]> =
  TPlugins extends readonly [Plugin<infer First>, ...infer Rest extends readonly Plugin<any>[]]
    ? First & InferPluginExtensions<Rest>
    : unknown;

/**
 * 확장된 TimeGrid 타입
 */
export type ExtendedTimeGrid<
  TData,
  TDate,
  TPlugins extends readonly Plugin<any>[],
> = TimeGrid<TData, TDate> & InferPluginExtensions<TPlugins>;

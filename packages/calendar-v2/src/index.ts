/**
 * @h6s/calendar-v2
 *
 * TanStack 스타일 헤드리스 캘린더 Core
 * Zero-dependency, framework-agnostic time grid primitives
 */

// ============ Core ============
export { createTimeGrid } from './core';
export type {
  Cell,
  CellUnit,
  CreateTimeGridOptions,
  TimeGrid,
  TimeRange,
} from './core';

// ============ Adapter ============
export { createMockAdapter } from './adapter';
export type { DateAdapter, MockAdapterOptions, WeekDay } from './adapter';

// ============ Utils ============
export { groupBy, isWeekend, toMatrix, withPadding } from './utils';
export type {
  GroupByKey,
  GroupedCells,
  PaddedCell,
  PaddedTimeGrid,
} from './utils';

// ============ Plugin System ============
export { applyPlugin, pipe } from './plugin';
export type {
  ExtendedTimeGrid,
  InferPluginExtensions,
  Plugin,
} from './plugin';

// ============ Built-in Plugins ============
export { navigation, selection } from './plugins';
export type {
  NavigationExtension,
  NavigationOptions,
  NavigationState,
  NavigationUnit,
  SelectionExtension,
  SelectionMode,
  SelectionOptions,
  SelectionState,
} from './plugins';

// ============ React (requires react peer dependency) ============
export { useTimeGrid, useTimeGridWithPlugins } from './react';
export type { UseTimeGridOptions, UseTimeGridResult } from './react';

// ============ date-fns Adapter (requires date-fns peer dependency) ============
export { createDateFnsAdapter } from './adapters';
export type { DateFnsAdapterOptions } from './adapters';

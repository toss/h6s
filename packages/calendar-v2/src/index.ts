/**
 * @h6s/calendar-v2
 *
 * TanStack 스타일 헤드리스 캘린더
 * - Core: 순수 함수 (createTimeGrid)
 * - Plugin: 순수 로직 (navigation, selection, events)
 * - React Adapter: 상태 관리 (useTimeGrid)
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

// ============ React Adapter ============
export { useTimeGrid } from './react';
export type { UseTimeGridOptions, UseTimeGridResult } from './react';

// ============ Utils ============
export {
  // Date utilities
  addDays,
  endOfMonth,
  fromISODateString,
  getDate,
  getDay,
  getMonth,
  getYear,
  isAfter,
  isBefore,
  isSameDay,
  startOfDay,
  startOfMonth,
  startOfWeek,
  today,
  toISODateString,
  // Grid utilities
  groupBy,
  isWeekend,
  toMatrix,
  withPadding,
} from './utils';
export type {
  GroupByKey,
  GroupedCells,
  PaddedCell,
  PaddedTimeGrid,
  WeekDay,
} from './utils';

// ============ Plugin System ============
export { applyPlugin, pipe } from './plugin';
export type {
  ExtendedTimeGrid,
  InferPluginExtensions,
  InferPluginState,
  Plugin,
} from './plugin';

// ============ Built-in Plugins ============
export { events, navigation, selection } from './plugins';
export type {
  EventRange,
  EventsExtension,
  EventsOptions,
  NavigationExtension,
  NavigationOptions,
  NavigationState,
  NavigationUnit,
  SelectionExtension,
  SelectionMode,
  SelectionOptions,
  SelectionState,
} from './plugins';

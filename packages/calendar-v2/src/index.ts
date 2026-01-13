/**
 * @h6s/calendar-v2
 *
 * TanStack 스타일 헤드리스 캘린더 Core
 * Zero-dependency, Native Date 기반
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

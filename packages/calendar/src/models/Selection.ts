import type { DateCell } from "./Calendar";

export type Matcher =
  | Date
  | Date[]
  | { before: Date }
  | { after: Date }
  | { from: Date; to: Date }
  | { dayOfWeek: number[] }
  | ((date: Date) => boolean);

export interface DateRange {
  from: Date;
  to?: Date;
}

// ─── Calendar Body Types ────────────────────────────────

export interface CalendarBodyCell extends DateCell {
  key: string;
}

export interface CalendarBodyWeek<C extends CalendarBodyCell = CalendarBodyCell> {
  key: string;
  value: C[];
}

export interface CalendarBody<C extends CalendarBodyCell = CalendarBodyCell> {
  value: CalendarBodyWeek<C>[];
}

export interface SelectionCellProps {
  isSelected: boolean;
  isDisabled: boolean;
}

export interface RangeSelectionCellProps extends SelectionCellProps {
  isRangeStart: boolean;
  isRangeEnd: boolean;
  isInRange: boolean;
}

// ─── Options ────────────────────────────────────────────

export interface SingleSelectionOptions<C extends CalendarBodyCell = CalendarBodyCell> {
  mode: "single";
  required?: boolean;
  disabled?: Matcher | Matcher[];
  body: CalendarBody<C>;
}

export interface RangeSelectionOptions<C extends CalendarBodyCell = CalendarBodyCell> {
  mode: "range";
  min?: number;
  max?: number;
  disabled?: Matcher | Matcher[];
  body: CalendarBody<C>;
}

export interface MultipleSelectionOptions<C extends CalendarBodyCell = CalendarBodyCell> {
  mode: "multiple";
  min?: number;
  max?: number;
  disabled?: Matcher | Matcher[];
  body: CalendarBody<C>;
}

export type SelectionOptions<C extends CalendarBodyCell = CalendarBodyCell> =
  | SingleSelectionOptions<C>
  | RangeSelectionOptions<C>
  | MultipleSelectionOptions<C>;

// ─── Return Types ───────────────────────────────────────

export interface SingleSelectionReturn<C extends CalendarBodyCell = CalendarBodyCell> {
  selected: Date | undefined;
  select: (date: Date) => void;
  deselect: () => void;
  isSelected: (date: Date) => boolean;
  isDisabled: (date: Date) => boolean;
  body: CalendarBody<C & SelectionCellProps>;
}

export interface RangeSelectionReturn<C extends CalendarBodyCell = CalendarBodyCell> {
  selected: DateRange | undefined;
  select: (date: Date) => void;
  deselect: () => void;
  isSelected: (date: Date) => boolean;
  isDisabled: (date: Date) => boolean;
  isRangeStart: (date: Date) => boolean;
  isRangeEnd: (date: Date) => boolean;
  isInRange: (date: Date) => boolean;
  body: CalendarBody<C & RangeSelectionCellProps>;
}

export interface MultipleSelectionReturn<C extends CalendarBodyCell = CalendarBodyCell> {
  selected: Date[];
  select: (date: Date) => void;
  deselect: (date: Date) => void;
  isSelected: (date: Date) => boolean;
  isDisabled: (date: Date) => boolean;
  body: CalendarBody<C & SelectionCellProps>;
}

import { useCallback, useMemo, useState } from "react";

import type {
  CalendarBodyCell,
  DateRange,
  MultipleSelectionOptions,
  MultipleSelectionReturn,
  RangeSelectionOptions,
  RangeSelectionReturn,
  SingleSelectionOptions,
  SingleSelectionReturn,
} from "./models/Selection";
import isSameDate from "./utils/isSameDate";
import { matchDateArray } from "./utils/matchDate";

function diffInDays(a: Date, b: Date): number {
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.round(Math.abs(a.getTime() - b.getTime()) / msPerDay) + 1;
}

function useDisabled(disabled: SingleSelectionOptions["disabled"]) {
  return useCallback(
    (date: Date) => matchDateArray(date, disabled),
    [disabled],
  );
}

// ─── Single Selection ───────────────────────────────────

export function useSingleSelection<C extends CalendarBodyCell>(
  options: Omit<SingleSelectionOptions<C>, "mode">,
): SingleSelectionReturn<C> {
  const { disabled } = options;
  const isDisabled = useDisabled(disabled);
  const [selected, setSelected] = useState<Date | undefined>(undefined);

  const select = useCallback(
    (date: Date) => {
      if (isDisabled(date)) return;

      setSelected((prev) => {
        if (prev && isSameDate(prev, date)) {
          return options.required ? prev : undefined;
        }
        return date;
      });
    },
    [isDisabled, options.required],
  );

  const deselect = useCallback(() => {
    if (!options.required) {
      setSelected(undefined);
    }
  }, [options.required]);

  const isSelected = useCallback(
    (date: Date) => (selected ? isSameDate(selected, date) : false),
    [selected],
  );

  const body = useMemo(() => ({
    value: options.body.value.map((week) => ({
      ...week,
      value: week.value.map((cell) => ({
        ...cell,
        isSelected: selected ? isSameDate(selected, cell.value) : false,
        isDisabled: isDisabled(cell.value),
      })),
    })),
  }), [options.body, selected, isDisabled]);

  return { selected, select, deselect, isSelected, isDisabled, body };
}

// ─── Range Selection ────────────────────────────────────

export function useRangeSelection<C extends CalendarBodyCell>(
  options: Omit<RangeSelectionOptions<C>, "mode">,
): RangeSelectionReturn<C> {
  const { disabled } = options;
  const isDisabled = useDisabled(disabled);
  const [selected, setSelected] = useState<DateRange | undefined>(undefined);

  const select = useCallback(
    (date: Date) => {
      if (isDisabled(date)) return;

      setSelected((prev) => {
        // No selection yet or range is complete → start new range
        if (!prev || prev.to) {
          return { from: date };
        }

        // First click already set, now set the end
        let from = prev.from;
        let to = date;

        // Swap if from > to
        if (from > to) {
          [from, to] = [to, from];
        }

        const days = diffInDays(from, to);

        if (options.min !== undefined && days < options.min) {
          return prev;
        }

        if (options.max !== undefined && days > options.max) {
          return prev;
        }

        return { from, to };
      });
    },
    [isDisabled, options.min, options.max],
  );

  const deselect = useCallback(() => {
    setSelected(undefined);
  }, []);

  const isSelected = useCallback(
    (date: Date) => {
      if (!selected) return false;
      if (isSameDate(selected.from, date)) return true;
      if (selected.to && isSameDate(selected.to, date)) return true;
      if (selected.to && date > selected.from && date < selected.to) return true;
      return false;
    },
    [selected],
  );

  const isRangeStart = useCallback(
    (date: Date) => (selected ? isSameDate(selected.from, date) : false),
    [selected],
  );

  const isRangeEnd = useCallback(
    (date: Date) =>
      selected?.to ? isSameDate(selected.to, date) : false,
    [selected],
  );

  const isInRange = useCallback(
    (date: Date) => {
      if (!selected?.to) return false;
      return date > selected.from && date < selected.to;
    },
    [selected],
  );

  const body = useMemo(() => ({
    value: options.body.value.map((week) => ({
      ...week,
      value: week.value.map((cell) => {
        const cellDate = cell.value;
        let cellIsSelected = false;
        let cellIsRangeStart = false;
        let cellIsRangeEnd = false;
        let cellIsInRange = false;

        if (selected) {
          cellIsRangeStart = isSameDate(selected.from, cellDate);
          cellIsRangeEnd = selected.to ? isSameDate(selected.to, cellDate) : false;
          cellIsInRange = selected.to ? cellDate > selected.from && cellDate < selected.to : false;
          cellIsSelected = cellIsRangeStart || cellIsRangeEnd || cellIsInRange;
        }

        return {
          ...cell,
          isSelected: cellIsSelected,
          isDisabled: isDisabled(cellDate),
          isRangeStart: cellIsRangeStart,
          isRangeEnd: cellIsRangeEnd,
          isInRange: cellIsInRange,
        };
      }),
    })),
  }), [options.body, selected, isDisabled]);

  return {
    selected,
    select,
    deselect,
    isSelected,
    isDisabled,
    isRangeStart,
    isRangeEnd,
    isInRange,
    body,
  };
}

// ─── Multiple Selection ─────────────────────────────────

export function useMultipleSelection<C extends CalendarBodyCell>(
  options: Omit<MultipleSelectionOptions<C>, "mode">,
): MultipleSelectionReturn<C> {
  const { disabled } = options;
  const isDisabled = useDisabled(disabled);
  const [selected, setSelected] = useState<Date[]>([]);

  const select = useCallback(
    (date: Date) => {
      if (isDisabled(date)) return;

      setSelected((prev) => {
        const existing = prev.findIndex((d) => isSameDate(d, date));

        // Already selected → toggle off (respect min)
        if (existing !== -1) {
          if (options.min !== undefined && prev.length <= options.min) {
            return prev;
          }
          return prev.filter((_, i) => i !== existing);
        }

        // Not selected → add (respect max)
        if (options.max !== undefined && prev.length >= options.max) {
          return prev;
        }

        return [...prev, date];
      });
    },
    [isDisabled, options.min, options.max],
  );

  const deselect = useCallback(
    (date: Date) => {
      setSelected((prev) => {
        if (options.min !== undefined && prev.length <= options.min) {
          return prev;
        }
        return prev.filter((d) => !isSameDate(d, date));
      });
    },
    [options.min],
  );

  const isSelected = useCallback(
    (date: Date) => selected.some((d) => isSameDate(d, date)),
    [selected],
  );

  const body = useMemo(() => ({
    value: options.body.value.map((week) => ({
      ...week,
      value: week.value.map((cell) => ({
        ...cell,
        isSelected: selected.some((d) => isSameDate(d, cell.value)),
        isDisabled: isDisabled(cell.value),
      })),
    })),
  }), [options.body, selected, isDisabled]);

  return { selected, select, deselect, isSelected, isDisabled, body };
}

// ─── Convenience Wrapper ────────────────────────────────
// Note: `mode` must remain constant across renders (Rules of Hooks).

export function useSelection<C extends CalendarBodyCell>(
  options: SingleSelectionOptions<C>,
): SingleSelectionReturn<C>;
export function useSelection<C extends CalendarBodyCell>(
  options: RangeSelectionOptions<C>,
): RangeSelectionReturn<C>;
export function useSelection<C extends CalendarBodyCell>(
  options: MultipleSelectionOptions<C>,
): MultipleSelectionReturn<C>;
export function useSelection<C extends CalendarBodyCell>(
  options: SingleSelectionOptions<C> | RangeSelectionOptions<C> | MultipleSelectionOptions<C>,
): SingleSelectionReturn<C> | RangeSelectionReturn<C> | MultipleSelectionReturn<C> {
  const { mode, ...rest } = options;

  if (mode === "single") {
    return useSingleSelection<C>(rest as Omit<SingleSelectionOptions<C>, "mode">);
  }

  if (mode === "range") {
    return useRangeSelection<C>(rest as Omit<RangeSelectionOptions<C>, "mode">);
  }

  return useMultipleSelection<C>(rest as Omit<MultipleSelectionOptions<C>, "mode">);
}

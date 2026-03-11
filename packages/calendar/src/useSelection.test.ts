import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { CalendarBody } from "./models/Selection";
import { useSelection } from "./useSelection";
import { matchDate, matchDateArray } from "./utils/matchDate";

const emptyBody: CalendarBody = { value: [] };

function createMockBody(dates: Date[][]): CalendarBody {
  return {
    value: dates.map((week, wi) => ({
      key: `week-${wi}`,
      value: week.map((date) => ({
        value: date,
        key: date.toISOString(),
        date: date.getDate(),
        isCurrentMonth: true,
        isCurrentDate: false,
        isWeekend: date.getDay() === 0 || date.getDay() === 6,
      })),
    })),
  };
}

describe("matchDate", () => {
  it("matches exact Date", () => {
    const date = new Date(2024, 0, 15);
    expect(matchDate(date, new Date(2024, 0, 15))).toBe(true);
    expect(matchDate(date, new Date(2024, 0, 16))).toBe(false);
  });

  it("matches Date[]", () => {
    const date = new Date(2024, 0, 15);
    const dates = [new Date(2024, 0, 10), new Date(2024, 0, 15)];
    expect(matchDate(date, dates)).toBe(true);
    expect(matchDate(new Date(2024, 0, 1), dates)).toBe(false);
  });

  it("matches { before }", () => {
    const jan10 = new Date(2024, 0, 10);
    expect(matchDate(new Date(2024, 0, 5), { before: jan10 })).toBe(true);
    expect(matchDate(new Date(2024, 0, 15), { before: jan10 })).toBe(false);
  });

  it("matches { after }", () => {
    const jan10 = new Date(2024, 0, 10);
    expect(matchDate(new Date(2024, 0, 15), { after: jan10 })).toBe(true);
    expect(matchDate(new Date(2024, 0, 5), { after: jan10 })).toBe(false);
  });

  it("matches { from, to }", () => {
    const range = { from: new Date(2024, 0, 10), to: new Date(2024, 0, 20) };
    expect(matchDate(new Date(2024, 0, 15), range)).toBe(true);
    expect(matchDate(new Date(2024, 0, 10), range)).toBe(true);
    expect(matchDate(new Date(2024, 0, 20), range)).toBe(true);
    expect(matchDate(new Date(2024, 0, 5), range)).toBe(false);
  });

  it("matches { dayOfWeek }", () => {
    // 2024-01-15 is Monday (1)
    const monday = new Date(2024, 0, 15);
    expect(matchDate(monday, { dayOfWeek: [1, 3, 5] })).toBe(true);
    expect(matchDate(monday, { dayOfWeek: [0, 6] })).toBe(false);
  });

  it("matches function matcher", () => {
    const isWeekend = (d: Date) => d.getDay() === 0 || d.getDay() === 6;
    // 2024-01-14 is Sunday
    expect(matchDate(new Date(2024, 0, 14), isWeekend)).toBe(true);
    // 2024-01-15 is Monday
    expect(matchDate(new Date(2024, 0, 15), isWeekend)).toBe(false);
  });
});

describe("matchDateArray", () => {
  it("returns false for undefined", () => {
    expect(matchDateArray(new Date(), undefined)).toBe(false);
  });

  it("handles single Matcher", () => {
    expect(matchDateArray(new Date(2024, 0, 5), { before: new Date(2024, 0, 10) })).toBe(true);
  });

  it("handles Matcher[]", () => {
    const matchers = [{ before: new Date(2024, 0, 5) }, { after: new Date(2024, 0, 20) }];
    expect(matchDateArray(new Date(2024, 0, 3), matchers)).toBe(true);
    expect(matchDateArray(new Date(2024, 0, 25), matchers)).toBe(true);
    expect(matchDateArray(new Date(2024, 0, 10), matchers)).toBe(false);
  });
});

describe("useSelection - single mode", () => {
  it("starts with undefined selected", () => {
    // Given
    const { result } = renderHook(() => useSelection({ mode: "single", body: emptyBody }));
    // Then
    expect(result.current.selected).toBeUndefined();
  });

  it("selects a date", () => {
    // Given
    const date = new Date(2024, 0, 15);
    const { result } = renderHook(() => useSelection({ mode: "single", body: emptyBody }));
    // When
    act(() => {
      result.current.select(date);
    });
    // Then
    expect(result.current.selected).toEqual(date);
    expect(result.current.isSelected(date)).toBe(true);
  });

  it("replaces selection when selecting a different date", () => {
    // Given
    const date1 = new Date(2024, 0, 15);
    const date2 = new Date(2024, 0, 20);
    const { result } = renderHook(() => useSelection({ mode: "single", body: emptyBody }));
    // When
    act(() => {
      result.current.select(date1);
    });
    act(() => {
      result.current.select(date2);
    });
    // Then
    expect(result.current.selected).toEqual(date2);
    expect(result.current.isSelected(date1)).toBe(false);
    expect(result.current.isSelected(date2)).toBe(true);
  });

  it("toggles off when selecting the same date", () => {
    // Given
    const date = new Date(2024, 0, 15);
    const { result } = renderHook(() => useSelection({ mode: "single", body: emptyBody }));
    // When
    act(() => {
      result.current.select(date);
    });
    act(() => {
      result.current.select(new Date(2024, 0, 15));
    });
    // Then
    expect(result.current.selected).toBeUndefined();
  });

  it("does not toggle off when required is true", () => {
    // Given
    const date = new Date(2024, 0, 15);
    const { result } = renderHook(() => useSelection({ mode: "single", required: true, body: emptyBody }));
    // When
    act(() => {
      result.current.select(date);
    });
    act(() => {
      result.current.select(new Date(2024, 0, 15));
    });
    // Then
    expect(result.current.selected).toEqual(date);
  });

  it("ignores disabled dates", () => {
    // Given
    const disabled = new Date(2024, 0, 15);
    const { result } = renderHook(() => useSelection({ mode: "single", disabled, body: emptyBody }));
    // When
    act(() => {
      result.current.select(new Date(2024, 0, 15));
    });
    // Then
    expect(result.current.selected).toBeUndefined();
    expect(result.current.isDisabled(new Date(2024, 0, 15))).toBe(true);
  });

  it("deselects via deselect()", () => {
    // Given
    const { result } = renderHook(() => useSelection({ mode: "single", body: emptyBody }));
    act(() => {
      result.current.select(new Date(2024, 0, 15));
    });
    // When
    act(() => {
      result.current.deselect();
    });
    // Then
    expect(result.current.selected).toBeUndefined();
  });
});

describe("useSelection - range mode", () => {
  it("starts with undefined selected", () => {
    // Given
    const { result } = renderHook(() => useSelection({ mode: "range", body: emptyBody }));
    // Then
    expect(result.current.selected).toBeUndefined();
  });

  it("sets from on first click", () => {
    // Given
    const date = new Date(2024, 0, 10);
    const { result } = renderHook(() => useSelection({ mode: "range", body: emptyBody }));
    // When
    act(() => {
      result.current.select(date);
    });
    // Then
    expect(result.current.selected).toEqual({ from: date });
    expect(result.current.isRangeStart(date)).toBe(true);
  });

  it("completes range on second click", () => {
    // Given
    const from = new Date(2024, 0, 10);
    const to = new Date(2024, 0, 20);
    const { result } = renderHook(() => useSelection({ mode: "range", body: emptyBody }));
    // When
    act(() => {
      result.current.select(from);
    });
    act(() => {
      result.current.select(to);
    });
    // Then
    expect(result.current.selected).toEqual({ from, to });
    expect(result.current.isRangeStart(from)).toBe(true);
    expect(result.current.isRangeEnd(to)).toBe(true);
  });

  it("swaps from/to when from > to", () => {
    // Given
    const earlier = new Date(2024, 0, 10);
    const later = new Date(2024, 0, 20);
    const { result } = renderHook(() => useSelection({ mode: "range", body: emptyBody }));
    // When — select later first, then earlier
    act(() => {
      result.current.select(later);
    });
    act(() => {
      result.current.select(earlier);
    });
    // Then
    expect(result.current.selected).toEqual({ from: earlier, to: later });
  });

  it("isInRange returns true for dates between from and to", () => {
    // Given
    const from = new Date(2024, 0, 10);
    const to = new Date(2024, 0, 20);
    const middle = new Date(2024, 0, 15);
    const { result } = renderHook(() => useSelection({ mode: "range", body: emptyBody }));
    // When
    act(() => {
      result.current.select(from);
    });
    act(() => {
      result.current.select(to);
    });
    // Then
    expect(result.current.isInRange(middle)).toBe(true);
    expect(result.current.isInRange(from)).toBe(false);
    expect(result.current.isInRange(to)).toBe(false);
    expect(result.current.isInRange(new Date(2024, 0, 5))).toBe(false);
  });

  it("isSelected includes from, to, and in-range dates", () => {
    // Given
    const from = new Date(2024, 0, 10);
    const to = new Date(2024, 0, 20);
    const { result } = renderHook(() => useSelection({ mode: "range", body: emptyBody }));
    // When
    act(() => {
      result.current.select(from);
    });
    act(() => {
      result.current.select(to);
    });
    // Then
    expect(result.current.isSelected(from)).toBe(true);
    expect(result.current.isSelected(to)).toBe(true);
    expect(result.current.isSelected(new Date(2024, 0, 15))).toBe(true);
    expect(result.current.isSelected(new Date(2024, 0, 5))).toBe(false);
  });

  it("respects min constraint", () => {
    // Given — min 5 days
    const from = new Date(2024, 0, 10);
    const tooClose = new Date(2024, 0, 12); // 3 days
    const { result } = renderHook(() => useSelection({ mode: "range", min: 5, body: emptyBody }));
    // When
    act(() => {
      result.current.select(from);
    });
    act(() => {
      result.current.select(tooClose);
    });
    // Then — range stays incomplete
    expect(result.current.selected).toEqual({ from });
  });

  it("respects max constraint", () => {
    // Given — max 5 days
    const from = new Date(2024, 0, 10);
    const tooFar = new Date(2024, 0, 20); // 11 days
    const { result } = renderHook(() => useSelection({ mode: "range", max: 5, body: emptyBody }));
    // When
    act(() => {
      result.current.select(from);
    });
    act(() => {
      result.current.select(tooFar);
    });
    // Then — range stays incomplete
    expect(result.current.selected).toEqual({ from });
  });

  it("ignores disabled dates", () => {
    // Given
    const disabled = new Date(2024, 0, 15);
    const { result } = renderHook(() => useSelection({ mode: "range", disabled, body: emptyBody }));
    // When
    act(() => {
      result.current.select(new Date(2024, 0, 15));
    });
    // Then
    expect(result.current.selected).toBeUndefined();
  });

  it("starts new range after completing one", () => {
    // Given
    const { result } = renderHook(() => useSelection({ mode: "range", body: emptyBody }));
    act(() => {
      result.current.select(new Date(2024, 0, 10));
    });
    act(() => {
      result.current.select(new Date(2024, 0, 20));
    });
    // When — third click starts new range
    const newFrom = new Date(2024, 1, 1);
    act(() => {
      result.current.select(newFrom);
    });
    // Then
    expect(result.current.selected).toEqual({ from: newFrom });
  });

  it("deselects via deselect()", () => {
    // Given
    const { result } = renderHook(() => useSelection({ mode: "range", body: emptyBody }));
    act(() => {
      result.current.select(new Date(2024, 0, 10));
    });
    // When
    act(() => {
      result.current.deselect();
    });
    // Then
    expect(result.current.selected).toBeUndefined();
  });
});

describe("useSelection - multiple mode", () => {
  it("starts with empty array", () => {
    // Given
    const { result } = renderHook(() => useSelection({ mode: "multiple", body: emptyBody }));
    // Then
    expect(result.current.selected).toEqual([]);
  });

  it("adds dates to selection", () => {
    // Given
    const date1 = new Date(2024, 0, 10);
    const date2 = new Date(2024, 0, 15);
    const { result } = renderHook(() => useSelection({ mode: "multiple", body: emptyBody }));
    // When
    act(() => {
      result.current.select(date1);
    });
    act(() => {
      result.current.select(date2);
    });
    // Then
    expect(result.current.selected).toEqual([date1, date2]);
    expect(result.current.isSelected(date1)).toBe(true);
    expect(result.current.isSelected(date2)).toBe(true);
  });

  it("toggles off already selected date via select()", () => {
    // Given
    const date = new Date(2024, 0, 10);
    const { result } = renderHook(() => useSelection({ mode: "multiple", body: emptyBody }));
    act(() => {
      result.current.select(date);
    });
    // When
    act(() => {
      result.current.select(new Date(2024, 0, 10));
    });
    // Then
    expect(result.current.selected).toEqual([]);
  });

  it("respects max constraint", () => {
    // Given — max 2
    const { result } = renderHook(() => useSelection({ mode: "multiple", max: 2, body: emptyBody }));
    act(() => {
      result.current.select(new Date(2024, 0, 10));
    });
    act(() => {
      result.current.select(new Date(2024, 0, 15));
    });
    // When — try to add third
    act(() => {
      result.current.select(new Date(2024, 0, 20));
    });
    // Then
    expect(result.current.selected).toHaveLength(2);
  });

  it("respects min constraint on deselect", () => {
    // Given — min 1
    const date = new Date(2024, 0, 10);
    const { result } = renderHook(() => useSelection({ mode: "multiple", min: 1, body: emptyBody }));
    act(() => {
      result.current.select(date);
    });
    // When — try to deselect the only item
    act(() => {
      result.current.deselect(date);
    });
    // Then
    expect(result.current.selected).toHaveLength(1);
  });

  it("ignores disabled dates", () => {
    // Given
    const disabled = new Date(2024, 0, 15);
    const { result } = renderHook(() => useSelection({ mode: "multiple", disabled, body: emptyBody }));
    // When
    act(() => {
      result.current.select(new Date(2024, 0, 15));
    });
    // Then
    expect(result.current.selected).toEqual([]);
    expect(result.current.isDisabled(new Date(2024, 0, 15))).toBe(true);
  });

  it("deselects specific date via deselect()", () => {
    // Given
    const date1 = new Date(2024, 0, 10);
    const date2 = new Date(2024, 0, 15);
    const { result } = renderHook(() => useSelection({ mode: "multiple", body: emptyBody }));
    act(() => {
      result.current.select(date1);
    });
    act(() => {
      result.current.select(date2);
    });
    // When
    act(() => {
      result.current.deselect(date1);
    });
    // Then
    expect(result.current.selected).toEqual([date2]);
  });
});

describe("useSelection - body enrichment", () => {
  const jan15 = new Date(2024, 0, 15); // Monday
  const jan16 = new Date(2024, 0, 16); // Tuesday
  const jan17 = new Date(2024, 0, 17); // Wednesday
  const jan18 = new Date(2024, 0, 18); // Thursday
  const jan14 = new Date(2024, 0, 14); // Sunday
  const mockBody = createMockBody([[jan14, jan15, jan16, jan17, jan18]]);

  it("single mode: enriches cells with isSelected and isDisabled", () => {
    const { result } = renderHook(() =>
      useSelection({
        mode: "single",
        body: mockBody,
        disabled: { dayOfWeek: [0] }, // Sunday disabled
      }),
    );

    // Before selection — no cell is selected, Sunday is disabled
    const week = result.current.body.value[0];
    expect(week.value[0].isDisabled).toBe(true); // Sunday
    expect(week.value[0].isSelected).toBe(false);
    expect(week.value[1].isDisabled).toBe(false); // Monday
    expect(week.value[1].isSelected).toBe(false);

    // Select jan15
    act(() => {
      result.current.select(jan15);
    });

    const weekAfter = result.current.body.value[0];
    expect(weekAfter.value[1].isSelected).toBe(true); // jan15
    expect(weekAfter.value[2].isSelected).toBe(false); // jan16
  });

  it("range mode: enriches cells with range props", () => {
    const { result } = renderHook(() => useSelection({ mode: "range", body: mockBody }));

    // Select range: jan15 → jan18
    act(() => {
      result.current.select(jan15);
    });
    act(() => {
      result.current.select(jan18);
    });

    const week = result.current.body.value[0];
    // jan14 — not in range
    expect(week.value[0].isSelected).toBe(false);
    expect(week.value[0].isInRange).toBe(false);
    // jan15 — range start
    expect(week.value[1].isSelected).toBe(true);
    expect(week.value[1].isRangeStart).toBe(true);
    expect(week.value[1].isRangeEnd).toBe(false);
    expect(week.value[1].isInRange).toBe(false);
    // jan16 — in range
    expect(week.value[2].isSelected).toBe(true);
    expect(week.value[2].isInRange).toBe(true);
    expect(week.value[2].isRangeStart).toBe(false);
    expect(week.value[2].isRangeEnd).toBe(false);
    // jan17 — in range
    expect(week.value[3].isInRange).toBe(true);
    // jan18 — range end
    expect(week.value[4].isSelected).toBe(true);
    expect(week.value[4].isRangeEnd).toBe(true);
    expect(week.value[4].isRangeStart).toBe(false);
    expect(week.value[4].isInRange).toBe(false);
  });

  it("multiple mode: enriched body updates on toggle", () => {
    const { result } = renderHook(() => useSelection({ mode: "multiple", body: mockBody }));

    // Select jan15 and jan17
    act(() => {
      result.current.select(jan15);
    });
    act(() => {
      result.current.select(jan17);
    });

    let week = result.current.body.value[0];
    expect(week.value[1].isSelected).toBe(true); // jan15
    expect(week.value[2].isSelected).toBe(false); // jan16
    expect(week.value[3].isSelected).toBe(true); // jan17

    // Toggle off jan15
    act(() => {
      result.current.select(new Date(2024, 0, 15));
    });

    week = result.current.body.value[0];
    expect(week.value[1].isSelected).toBe(false); // jan15 toggled off
    expect(week.value[3].isSelected).toBe(true); // jan17 still on
  });

  it("preserves original body cell properties", () => {
    const { result } = renderHook(() => useSelection({ mode: "single", body: mockBody }));

    const cell = result.current.body.value[0].value[0];
    // Original properties preserved
    expect(cell.key).toBe(jan14.toISOString());
    expect(cell.date).toBe(14);
    expect(cell.isCurrentMonth).toBe(true);
    expect(cell.isWeekend).toBe(true);
    // Enriched properties added
    expect(typeof cell.isSelected).toBe("boolean");
    expect(typeof cell.isDisabled).toBe("boolean");
  });
});

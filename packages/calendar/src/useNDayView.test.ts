import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useNDayView } from "./useNDayView";
import isSameDate from "./utils/isSameDate";

describe("useNDayView hooks test", () => {
	describe("result.headers", () => {
		it("return N weekdays starting from cursorDate", () => {
			const defaultDate = new Date(2024, 2, 15);
			const { result } = renderHook(() =>
				useNDayView({
					defaultDate,
					numberOfDays: 3,
				}),
			);

			const onlyDates = result.current.headers.weekdays.map(({ value }) => ({
				value,
			}));
			expect(onlyDates).toEqual([
				{ value: new Date(2024, 2, 15) },
				{ value: new Date(2024, 2, 16) },
				{ value: new Date(2024, 2, 17) },
			]);
		});

		it("return weekdays with key property", () => {
			const defaultDate = new Date(2024, 2, 15);
			const { result } = renderHook(() =>
				useNDayView({
					defaultDate,
					numberOfDays: 3,
				}),
			);

			for (const weekday of result.current.headers.weekdays) {
				expect(weekday.key).toBeDefined();
			}
		});

		it("return 7 weekdays when numberOfDays is 7", () => {
			const defaultDate = new Date(2024, 2, 15);
			const { result } = renderHook(() =>
				useNDayView({
					defaultDate,
					numberOfDays: 7,
				}),
			);

			expect(result.current.headers.weekdays).toHaveLength(7);
		});
	});

	describe("result.body", () => {
		it("return 3 DateCells by default", () => {
			const defaultDate = new Date(2024, 2, 15);
			const { result } = renderHook(() =>
				useNDayView({
					defaultDate,
				}),
			);

			expect(result.current.body.value).toHaveLength(1);
			expect(result.current.body.value[0].value).toHaveLength(3);
		});

		it("return N DateCells matching numberOfDays", () => {
			const defaultDate = new Date(2024, 2, 15);
			const { result } = renderHook(() =>
				useNDayView({
					defaultDate,
					numberOfDays: 7,
				}),
			);

			expect(result.current.body.value[0].value).toHaveLength(7);
		});

		it("return 14 DateCells when numberOfDays is 14", () => {
			const defaultDate = new Date(2024, 2, 15);
			const { result } = renderHook(() =>
				useNDayView({
					defaultDate,
					numberOfDays: 14,
				}),
			);

			expect(result.current.body.value[0].value).toHaveLength(14);
		});

		it("return correct date values for N consecutive days", () => {
			const defaultDate = new Date(2024, 2, 15);
			const { result } = renderHook(() =>
				useNDayView({
					defaultDate,
					numberOfDays: 3,
				}),
			);

			const cells = result.current.body.value[0].value;
			expect(cells[0].value).toEqual(new Date(2024, 2, 15));
			expect(cells[1].value).toEqual(new Date(2024, 2, 16));
			expect(cells[2].value).toEqual(new Date(2024, 2, 17));
		});

		it("include withDateProps plugin properties", () => {
			const defaultDate = new Date(2024, 2, 15);
			const { result } = renderHook(() =>
				useNDayView({
					defaultDate,
					numberOfDays: 3,
				}),
			);

			const cell = result.current.body.value[0].value[0];
			expect(cell.date).toBe(15);
			expect(cell.isCurrentMonth).toBe(true);
			expect(cell.isCurrentDate).toBeDefined();
			expect(cell.isWeekend).toBeDefined();
		});

		it("detect weekend correctly via withDateProps", () => {
			// 2024-03-16 is Saturday, 2024-03-17 is Sunday
			const defaultDate = new Date(2024, 2, 16);
			const { result } = renderHook(() =>
				useNDayView({
					defaultDate,
					numberOfDays: 2,
				}),
			);

			const cells = result.current.body.value[0].value;
			expect(cells[0].isWeekend).toBe(true); // Saturday
			expect(cells[1].isWeekend).toBe(true); // Sunday
		});

		it("detect isCurrentMonth correctly across month boundary", () => {
			// 2024-01-30 ~ 2024-02-01
			const defaultDate = new Date(2024, 0, 30);
			const { result } = renderHook(() =>
				useNDayView({
					defaultDate,
					numberOfDays: 3,
				}),
			);

			const cells = result.current.body.value[0].value;
			expect(cells[0].isCurrentMonth).toBe(true); // Jan 30 - same month as cursor
			expect(cells[1].isCurrentMonth).toBe(true); // Jan 31 - same month as cursor
			expect(cells[2].isCurrentMonth).toBe(false); // Feb 1 - different month
		});

		it("include withKeyProps plugin property", () => {
			const defaultDate = new Date(2024, 2, 15);
			const { result } = renderHook(() =>
				useNDayView({
					defaultDate,
					numberOfDays: 3,
				}),
			);

			for (const cell of result.current.body.value[0].value) {
				expect(cell.key).toBeDefined();
			}
		});

		it("each cell has 24 hour slots", () => {
			const defaultDate = new Date(2024, 2, 15);
			const { result } = renderHook(() =>
				useNDayView({
					defaultDate,
					numberOfDays: 3,
				}),
			);

			for (const cell of result.current.body.value[0].value) {
				expect(cell.hours).toHaveLength(24);
				expect(cell.hours[0].hour).toBe(0);
				expect(cell.hours[23].hour).toBe(23);
			}
		});

		it("hour slots have key property", () => {
			const defaultDate = new Date(2024, 2, 15);
			const { result } = renderHook(() =>
				useNDayView({
					defaultDate,
					numberOfDays: 2,
				}),
			);

			for (const cell of result.current.body.value[0].value) {
				for (const hourSlot of cell.hours) {
					expect(hourSlot.key).toBeDefined();
				}
			}
		});

		it("hour slots have sequential hour values 0-23", () => {
			const defaultDate = new Date(2024, 2, 15);
			const { result } = renderHook(() =>
				useNDayView({
					defaultDate,
					numberOfDays: 1,
				}),
			);

			const hours = result.current.body.value[0].value[0].hours;
			hours.forEach((slot, index) => {
				expect(slot.hour).toBe(index);
			});
		});

		it("row has key property", () => {
			const defaultDate = new Date(2024, 2, 15);
			const { result } = renderHook(() =>
				useNDayView({
					defaultDate,
					numberOfDays: 3,
				}),
			);

			expect(result.current.body.value[0].key).toBeDefined();
		});
	});

	describe("result.navigation", () => {
		it("toNext moves cursorDate forward by N days", () => {
			const defaultDate = new Date(2024, 2, 15);
			const { result, rerender } = renderHook(() =>
				useNDayView({
					defaultDate,
					numberOfDays: 3,
				}),
			);

			act(() => {
				result.current.navigation.toNext();
			});
			rerender();

			expect(result.current.cursorDate).toEqual(new Date(2024, 2, 18));
		});

		it("toPrev moves cursorDate backward by N days", () => {
			const defaultDate = new Date(2024, 2, 15);
			const { result, rerender } = renderHook(() =>
				useNDayView({
					defaultDate,
					numberOfDays: 3,
				}),
			);

			act(() => {
				result.current.navigation.toPrev();
			});
			rerender();

			expect(result.current.cursorDate).toEqual(new Date(2024, 2, 12));
		});

		it("toNext moves by 7 days when numberOfDays is 7", () => {
			const defaultDate = new Date(2024, 2, 15);
			const { result, rerender } = renderHook(() =>
				useNDayView({
					defaultDate,
					numberOfDays: 7,
				}),
			);

			act(() => {
				result.current.navigation.toNext();
			});
			rerender();

			expect(result.current.cursorDate).toEqual(new Date(2024, 2, 22));
		});

		it("toPrev moves by 7 days when numberOfDays is 7", () => {
			const defaultDate = new Date(2024, 2, 15);
			const { result, rerender } = renderHook(() =>
				useNDayView({
					defaultDate,
					numberOfDays: 7,
				}),
			);

			act(() => {
				result.current.navigation.toPrev();
			});
			rerender();

			expect(result.current.cursorDate).toEqual(new Date(2024, 2, 8));
		});

		it("setToday sets cursorDate to today", () => {
			const defaultDate = new Date(2024, 2, 15);
			const { result, rerender } = renderHook(() =>
				useNDayView({
					defaultDate,
				}),
			);

			act(() => {
				result.current.navigation.setToday();
			});
			rerender();

			expect(isSameDate(result.current.cursorDate, new Date())).toBe(true);
		});

		it("setDate sets cursorDate to specific date", () => {
			const defaultDate = new Date(2024, 2, 15);
			const targetDate = new Date(2025, 5, 1);
			const { result, rerender } = renderHook(() =>
				useNDayView({
					defaultDate,
				}),
			);

			act(() => {
				result.current.navigation.setDate(targetDate);
			});
			rerender();

			expect(result.current.cursorDate).toEqual(targetDate);
		});
	});

	describe("result.view", () => {
		it("default numberOfDays is 3", () => {
			const defaultDate = new Date(2024, 2, 15);
			const { result } = renderHook(() =>
				useNDayView({
					defaultDate,
				}),
			);

			expect(result.current.view.numberOfDays).toBe(3);
		});

		it("setNumberOfDays changes the number of displayed days", () => {
			const defaultDate = new Date(2024, 2, 15);
			const { result, rerender } = renderHook(() =>
				useNDayView({
					defaultDate,
				}),
			);

			expect(result.current.view.numberOfDays).toBe(3);

			act(() => {
				result.current.view.setNumberOfDays(5);
			});
			rerender();

			expect(result.current.view.numberOfDays).toBe(5);
			expect(result.current.body.value[0].value).toHaveLength(5);
			expect(result.current.headers.weekdays).toHaveLength(5);
		});

		it("numberOfDays reflects custom initial value", () => {
			const defaultDate = new Date(2024, 2, 15);
			const { result } = renderHook(() =>
				useNDayView({
					defaultDate,
					numberOfDays: 14,
				}),
			);

			expect(result.current.view.numberOfDays).toBe(14);
		});
	});
});

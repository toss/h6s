import { describe, expect, it } from "vitest";

import createNDayInfo from "./createNDayInfo";

describe("createNDayInfo", () => {
	it("returns correct year, month, day from cursorDate", () => {
		const cursorDate = new Date(2024, 2, 15);
		const result = createNDayInfo(cursorDate, { weekStartsOn: 0, numberOfDays: 3 });

		expect(result.year).toBe(2024);
		expect(result.month).toBe(2);
		expect(result.day).toBe(15);
	});

	it("returns correct numberOfDays", () => {
		const cursorDate = new Date(2024, 2, 15);
		const result = createNDayInfo(cursorDate, { weekStartsOn: 0, numberOfDays: 5 });

		expect(result.numberOfDays).toBe(5);
	});

	it("returns N weekdays starting from cursorDate", () => {
		const cursorDate = new Date(2024, 2, 15);
		const result = createNDayInfo(cursorDate, { weekStartsOn: 0, numberOfDays: 3 });

		expect(result.weekdays).toHaveLength(3);
		expect(result.weekdays[0].value).toEqual(new Date(2024, 2, 15));
		expect(result.weekdays[1].value).toEqual(new Date(2024, 2, 16));
		expect(result.weekdays[2].value).toEqual(new Date(2024, 2, 17));
	});

	it("returns 7 weekdays when numberOfDays is 7", () => {
		const cursorDate = new Date(2024, 0, 1);
		const result = createNDayInfo(cursorDate, { weekStartsOn: 0, numberOfDays: 7 });

		expect(result.weekdays).toHaveLength(7);
		expect(result.weekdays[6].value).toEqual(new Date(2024, 0, 7));
	});

	it("returns 14 weekdays when numberOfDays is 14", () => {
		const cursorDate = new Date(2024, 0, 1);
		const result = createNDayInfo(cursorDate, { weekStartsOn: 0, numberOfDays: 14 });

		expect(result.weekdays).toHaveLength(14);
		expect(result.weekdays[13].value).toEqual(new Date(2024, 0, 14));
	});

	it("getDateCellByIndex returns correct date cell", () => {
		const cursorDate = new Date(2024, 2, 15);
		const result = createNDayInfo(cursorDate, { weekStartsOn: 0, numberOfDays: 3 });

		expect(result.getDateCellByIndex(0).value).toEqual(new Date(2024, 2, 15));
		expect(result.getDateCellByIndex(1).value).toEqual(new Date(2024, 2, 16));
		expect(result.getDateCellByIndex(2).value).toEqual(new Date(2024, 2, 17));
	});

	it("handles month boundary correctly", () => {
		const cursorDate = new Date(2024, 0, 30);
		const result = createNDayInfo(cursorDate, { weekStartsOn: 0, numberOfDays: 5 });

		expect(result.weekdays[0].value).toEqual(new Date(2024, 0, 30));
		expect(result.weekdays[1].value).toEqual(new Date(2024, 0, 31));
		expect(result.weekdays[2].value).toEqual(new Date(2024, 1, 1));
		expect(result.weekdays[3].value).toEqual(new Date(2024, 1, 2));
		expect(result.weekdays[4].value).toEqual(new Date(2024, 1, 3));
	});

	it("preserves weekStartsOn in return value", () => {
		const cursorDate = new Date(2024, 2, 15);
		const result = createNDayInfo(cursorDate, { weekStartsOn: 1, numberOfDays: 3 });

		expect(result.weekStartsOn).toBe(1);
	});
});

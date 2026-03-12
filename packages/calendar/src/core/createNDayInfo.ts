import type { WeekDayType } from "../models";
import { arrayOf, parseDate } from "../utils";
import addDays from "../utils/addDays";

export default function createNDayInfo(
	cursorDate: Date,
	{ weekStartsOn, numberOfDays }: { weekStartsOn: WeekDayType; numberOfDays: number },
) {
	const { year, month, day } = parseDate(cursorDate);

	const weekdays = arrayOf(numberOfDays).map((index) => {
		return { value: addDays(cursorDate, index) };
	});

	const getDateCellByIndex = (dayIndex: number) => {
		return { value: addDays(cursorDate, dayIndex) };
	};

	return {
		cursorDate,
		year,
		month,
		day,
		weekStartsOn,
		numberOfDays,
		weekdays,
		getDateCellByIndex,
	};
}

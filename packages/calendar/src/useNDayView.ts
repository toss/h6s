import { useCallback, useMemo, useState } from "react";

import { createNDayInfo } from "./core";
import useIsMounted from "./hooks/useIsMounted";
import type { WeekDayType } from "./models";
import { withDateProps } from "./plugins";
import withKeyProps from "./plugins/withKeyProps";
import { arrayOf, generateID, pipeWith, withKey } from "./utils";
import addDays from "./utils/addDays";

export interface UseNDayViewOptions {
	defaultDate?: Date | number | string;
	defaultWeekStart?: WeekDayType;
	numberOfDays?: number;
}

export function useNDayView({
	defaultDate,
	defaultWeekStart = 0,
	numberOfDays: defaultNumberOfDays = 3,
}: UseNDayViewOptions = {}) {
	const isMounted = useIsMounted();
	// biome-ignore lint: reason
	const baseDate = useMemo(() => {
		return defaultDate != null ? new Date(defaultDate) : new Date();
	}, [defaultDate, isMounted]);

	const [weekStartsOn, setWeekStartsOn] = useState(defaultWeekStart);
	const [cursorDate, setCursorDate] = useState(baseDate);
	const [numberOfDays, setNumberOfDays] = useState(defaultNumberOfDays);

	const nDayInfo = createNDayInfo(cursorDate, { weekStartsOn, numberOfDays });
	const { weekdays, getDateCellByIndex } = nDayInfo;

	const getHeaders = useCallback(() => {
		return {
			weekdays: withKey(weekdays, "weekdays"),
		};
	}, [weekdays]);

	const getBody = useCallback(() => {
		return {
			value: [
				{
					key: generateID("n-day-row"),
					value: arrayOf(numberOfDays).map((dayIndex) => {
						const cell = pipeWith(
							getDateCellByIndex(dayIndex),
							withDateProps(baseDate, cursorDate),
							withKeyProps("days"),
						);
						return {
							...cell,
							hours: arrayOf(24).map((hour) => ({
								hour,
								key: generateID("hours"),
							})),
						};
					}),
				},
			],
		};
	}, [baseDate, cursorDate, getDateCellByIndex, numberOfDays]);

	return useMemo(
		() => ({
			...nDayInfo,
			headers: getHeaders(),
			body: getBody(),
			navigation: {
				toNext: () => setCursorDate((date) => addDays(date, numberOfDays)),
				toPrev: () => setCursorDate((date) => addDays(date, -numberOfDays)),
				setToday: () => setCursorDate(new Date()),
				setDate: (date: Date) => setCursorDate(date),
			},
			view: {
				numberOfDays,
				setNumberOfDays,
				setWeekStartsOn,
			},
		}),
		[nDayInfo, getHeaders, getBody, numberOfDays],
	);
}

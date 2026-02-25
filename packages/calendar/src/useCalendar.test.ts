import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { DecemberFirstWeekData, DecemberMonthMatrix } from "./mocks/mockDate";
import CalendarViewType from "./models/CalendarViewType";
import { useCalendar } from "./useCalendar";
import isSameDate from "./utils/isSameDate";

describe("useCalendar hooks test", () => {
  describe("result.header", () => {
    it("return weekdays array when month viewType", () => {
      // Given
      const defaultDate = new Date(2020, 11, 1);
      const defaultWeekStart = 0;
      const defaultViewType = CalendarViewType.Month;
      // When
      const { result } = renderHook(() =>
        useCalendar({
          defaultDate,
          defaultWeekStart,
          defaultViewType,
        }),
      );
      // Then
      const onlyDates = result.current.headers.weekdays.map(({ value }) => ({
        value,
      }));
      expect(onlyDates).toEqual(DecemberFirstWeekData.value[0].value);
      expect(result.current.headers.weekdays[0].key).toBeDefined();
    });

    it("return weekdays array when month viewType", () => {
      // Given
      const defaultDate = new Date(2020, 11, 27);
      const defaultWeekStart = 0;
      const defaultViewType = CalendarViewType.Day;
      // When
      const { result } = renderHook(() =>
        useCalendar({
          defaultDate,
          defaultWeekStart,
          defaultViewType,
        }),
      );
      // Then
      const onlyDates = result.current.headers.weekdays.map(({ value }) => ({
        value,
      }));
      expect(onlyDates).toEqual([{ value: defaultDate }]);
    });

    it("return weekdays when set WeekDayType: 0", () => {
      // Given
      const defaultDate = new Date(2021, 8, 30);
      const defaultWeekStart = 0;
      // When
      const { result } = renderHook(() =>
        useCalendar({
          defaultDate,
          defaultWeekStart,
        }),
      );
      // Then
      const onlyDates = result.current.headers.weekdays.map(({ value }) => ({
        value,
      }));
      expect(onlyDates).toEqual([
        { value: new Date(2021, 8, 26) },
        { value: new Date(2021, 8, 27) },
        { value: new Date(2021, 8, 28) },
        { value: new Date(2021, 8, 29) },
        { value: new Date(2021, 8, 30) },
        { value: new Date(2021, 9, 1) },
        { value: new Date(2021, 9, 2) },
      ]);
    });
    it("return weekdays when set WeekDayType: 1", () => {
      // Given
      const defaultDate = new Date(2021, 8, 30);
      const defaultWeekStart = 1;
      // When
      const { result } = renderHook(() =>
        useCalendar({
          defaultDate,
          defaultWeekStart,
        }),
      );
      // Then
      const onlyDates = result.current.headers.weekdays.map(({ value }) => ({
        value,
      }));
      expect(onlyDates).toEqual([
        { value: new Date(2021, 8, 27) },
        { value: new Date(2021, 8, 28) },
        { value: new Date(2021, 8, 29) },
        { value: new Date(2021, 8, 30) },
        { value: new Date(2021, 9, 1) },
        { value: new Date(2021, 9, 2) },
        { value: new Date(2021, 9, 3) },
      ]);
    });
  });

  describe("result.body", () => {
    it("return pure month data / no plugins, Month viewType", () => {
      // Given
      const defaultDate = new Date(2020, 11, 27);
      const defaultWeekStart = 0;
      const defaultViewType = CalendarViewType.Month;

      // When
      const { result } = renderHook(() =>
        useCalendar({
          defaultDate,
          defaultWeekStart,
          defaultViewType,
        }),
      );
      const onlyDates = result.current.body.value.map((week) => {
        return {
          value: week.value.map((day) => {
            return { value: day.value };
          }),
        };
      });

      // Then
      expect({ value: onlyDates }).toEqual(DecemberMonthMatrix);
    });

    it("reutrn pure week data / no plugins, Week viewType", () => {
      // Given
      const defaultDate = new Date(2020, 11, 1);
      const defaultWeekStart = 0;
      const defaultViewType = CalendarViewType.Week;

      // When
      const { result } = renderHook(() =>
        useCalendar({
          defaultDate,
          defaultWeekStart,
          defaultViewType,
        }),
      );
      const weekRow = result.current.body.value[0];
      const onlyDates = weekRow.value.map(({ value }) => ({ value }));

      // Then
      expect({ value: [{ value: onlyDates }] }).toEqual(DecemberFirstWeekData);
    });

    it("reutrn pure date data / no plugins, Day viewType", () => {
      // Given
      const defaultDate = new Date(2020, 11, 1);
      const defaultWeekStart = 0;
      const defaultViewType = CalendarViewType.Day;

      // When
      const { result } = renderHook(() =>
        useCalendar({
          defaultDate,
          defaultWeekStart,
          defaultViewType,
        }),
      );

      // Then
      expect(result.current.body.value[0].key).toBe("week-day-type");
      expect(result.current.body.value[0].value[0].value).toEqual(defaultDate);
      expect(result.current.body.value[0].value[0].isCurrentDate).toBeTruthy();
      expect(result.current.body.value[0].value[0].isCurrentMonth).toBeTruthy();
      expect(result.current.body.value[0].value[0].key).toBeDefined();
    });
  });

  describe("result.navigation", () => {
    it("return changed date by setDate", () => {
      // Given
      const defaultDate = new Date(2020, 11, 27);
      const targetDate = new Date(2021, 1, 1);
      // When
      const { result, rerender } = renderHook(() =>
        useCalendar({
          defaultDate,
        }),
      );
      act(() => {
        result.current.navigation.setDate(targetDate);
      });
      rerender();
      // Then
      expect(result.current.cursorDate).toEqual(targetDate);
    });

    it("return next month by toNext when month viewType", () => {
      // Given
      const defaultViewType = CalendarViewType.Month;
      const defaultDate = new Date(2020, 10, 27);

      // When
      const { result, rerender } = renderHook(() =>
        useCalendar({
          defaultDate,
          defaultViewType,
        }),
      );
      act(() => {
        result.current.navigation.toNext();
      });
      rerender();
      // Then
      expect(result.current.cursorDate.getMonth()).toEqual(defaultDate.getMonth() + 1);
    });

    it("return next month by toNext when month viewType", () => {
      // Given
      const defaultViewType = CalendarViewType.Month;
      const defaultDate = new Date(2021, 4, 30);

      // When
      const { result, rerender } = renderHook(() =>
        useCalendar({
          defaultDate,
          defaultViewType,
        }),
      );
      act(() => {
        result.current.navigation.toNext();
      });
      rerender();
      // Then
      expect(result.current.cursorDate.getMonth()).toEqual(defaultDate.getMonth() + 1);
    });

    it("return next week by toNext when week viewType", () => {
      // Given
      const defaultViewType = CalendarViewType.Week;
      const defaultDate = new Date(2020, 10, 27);

      // When
      const { result, rerender } = renderHook(() =>
        useCalendar({
          defaultDate,
          defaultViewType,
        }),
      );
      act(() => {
        result.current.navigation.toNext();
      });
      rerender();
      // Then
      expect(result.current.cursorDate).toEqual(new Date(2020, 10, 29));
    });

    it("return next date by toNext when day viewType", () => {
      // Given
      const defaultViewType = CalendarViewType.Day;
      const defaultDate = new Date(2020, 11, 27);

      // When
      const { result, rerender } = renderHook(() =>
        useCalendar({
          defaultDate,
          defaultViewType,
        }),
      );
      act(() => {
        result.current.navigation.toNext();
      });
      rerender();
      // Then
      expect(result.current.cursorDate).toEqual(new Date(2020, 11, 28));
    });

    it("return prev month by toPrev when month viewType", () => {
      // Given
      const defaultViewType = CalendarViewType.Month;
      const defaultDate = new Date(2020, 11, 27);

      // When
      const { result, rerender } = renderHook(() =>
        useCalendar({
          defaultDate,
          defaultViewType,
        }),
      );
      act(() => {
        result.current.navigation.toPrev();
      });
      rerender();
      // Then
      expect(result.current.cursorDate.getMonth()).toEqual(defaultDate.getMonth() - 1);
    });

    it("return prev week by toPrev when week viewType", () => {
      // Given
      const defaultViewType = CalendarViewType.Week;
      const defaultDate = new Date(2020, 11, 27);

      // When
      const { result, rerender } = renderHook(() =>
        useCalendar({
          defaultDate,
          defaultViewType,
        }),
      );
      act(() => {
        result.current.navigation.toPrev();
      });
      rerender();
      // Then
      expect(result.current.cursorDate).toEqual(new Date(2020, 11, 20));
    });

    it("return prev date by toPrev when day viewType", () => {
      // Given
      const defaultViewType = CalendarViewType.Day;
      const defaultDate = new Date(2020, 11, 27);

      // When
      const { result, rerender } = renderHook(() =>
        useCalendar({
          defaultDate,
          defaultViewType,
        }),
      );
      act(() => {
        result.current.navigation.toPrev();
      });
      rerender();
      // Then
      expect(result.current.cursorDate).toEqual(new Date(2020, 11, 26));
    });

    it("return today date by setToday", () => {
      // Given
      const defaultDate = new Date(2020, 11, 27);
      // When
      const { result, rerender } = renderHook(() =>
        useCalendar({
          defaultDate,
        }),
      );
      act(() => {
        result.current.navigation.setToday();
      });
      rerender();
      // Then
      expect(isSameDate(result.current.cursorDate, new Date())).toBe(true);
    });

    it("return next week by toNext when defaultWeekStart: 1", () => {
      // Given
      const defaultViewType = CalendarViewType.Week;
      const defaultDate = new Date(2020, 10, 27);
      const defaultWeekStart = 1;

      // When
      const { result, rerender } = renderHook(() =>
        useCalendar({
          defaultDate,
          defaultViewType,
          defaultWeekStart,
        }),
      );
      act(() => {
        result.current.navigation.toNext();
      });
      rerender();
      // Then
      expect(result.current.cursorDate).toEqual(new Date(2020, 10, 30));
    });
  });

  describe("result.view", () => {
    it("return default view type", () => {
      // Given
      const defaultViewType = CalendarViewType.Month;
      // When
      const { result } = renderHook(() =>
        useCalendar({
          defaultViewType,
        }),
      );
      // Then
      expect(result.current.view.type).toBe(defaultViewType);
    });

    it("return changed view type by setViewType", () => {
      // Given
      const defaultViewType = CalendarViewType.Month;
      // When
      const { result, rerender } = renderHook(() =>
        useCalendar({
          defaultViewType,
        }),
      );
      expect(result.current.view.type).toBe(CalendarViewType.Month);
      expect(result.current.view.isMonthView).toBeTruthy();
      expect(result.current.view.isWeekView).toBeFalsy();
      expect(result.current.view.isDayView).toBeFalsy();

      act(() => {
        result.current.view.setViewType(CalendarViewType.Day);
      });
      rerender();
      // Then
      expect(result.current.view.type).toBe(CalendarViewType.Day);
      expect(result.current.view.isMonthView).toBeFalsy();
      expect(result.current.view.isWeekView).toBeFalsy();
      expect(result.current.view.isDayView).toBeTruthy();
    });

    it("return changed view type by showDayView", () => {
      // Given
      const defaultViewType = CalendarViewType.Month;
      // When
      const { result, rerender } = renderHook(() =>
        useCalendar({
          defaultViewType,
        }),
      );
      expect(result.current.view.type).toBe(CalendarViewType.Month);
      expect(result.current.view.isMonthView).toBeTruthy();
      expect(result.current.view.isWeekView).toBeFalsy();
      expect(result.current.view.isDayView).toBeFalsy();

      act(() => {
        result.current.view.showDayView();
      });
      rerender();
      // Then
      expect(result.current.view.type).toBe(CalendarViewType.Day);
      expect(result.current.view.isMonthView).toBeFalsy();
      expect(result.current.view.isWeekView).toBeFalsy();
      expect(result.current.view.isDayView).toBeTruthy();
    });

    it("return changed view type by showMonthView", () => {
      // Given
      const defaultViewType = CalendarViewType.Week;
      // When
      const { result, rerender } = renderHook(() =>
        useCalendar({
          defaultViewType,
        }),
      );
      expect(result.current.view.type).toBe(CalendarViewType.Week);
      expect(result.current.view.isMonthView).toBeFalsy();
      expect(result.current.view.isWeekView).toBeTruthy();
      expect(result.current.view.isDayView).toBeFalsy();

      act(() => {
        result.current.view.showMonthView();
      });
      rerender();
      // Then
      expect(result.current.view.type).toBe(CalendarViewType.Month);
      expect(result.current.view.isMonthView).toBeTruthy();
      expect(result.current.view.isWeekView).toBeFalsy();
      expect(result.current.view.isDayView).toBeFalsy();
    });

    it("return changed view type by showWeekView", () => {
      // Given
      const defaultViewType = CalendarViewType.Month;
      // When
      const { result, rerender } = renderHook(() =>
        useCalendar({
          defaultViewType,
        }),
      );
      expect(result.current.view.type).toBe(CalendarViewType.Month);
      expect(result.current.view.isMonthView).toBeTruthy();
      expect(result.current.view.isWeekView).toBeFalsy();
      expect(result.current.view.isDayView).toBeFalsy();

      act(() => {
        result.current.view.showWeekView();
      });
      rerender();
      // Then
      expect(result.current.view.type).toBe(CalendarViewType.Week);
      expect(result.current.view.isMonthView).toBeFalsy();
      expect(result.current.view.isWeekView).toBeTruthy();
      expect(result.current.view.isDayView).toBeFalsy();
    });
  });
});

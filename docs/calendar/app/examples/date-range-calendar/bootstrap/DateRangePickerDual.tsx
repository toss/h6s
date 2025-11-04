"use client";

import { useCalendar } from "@h6s/calendar";
import { format, isSameDay, isWithinInterval, isAfter, isBefore, addMonths, subMonths } from "date-fns";
import { useState } from "react";

type DateRange = {
  start: Date | null;
  end: Date | null;
};

export function DateRangePickerDual() {
  const [dateRange, setDateRange] = useState<DateRange>({ start: null, end: null });
  const [hoverDate, setHoverDate] = useState<Date | null>(null);

  const leftCalendar = useCalendar({
    defaultDate: new Date(),
  });

  const rightCalendar = useCalendar({
    defaultDate: addMonths(new Date(), 1),
  });

  function handleDateSelect(date: Date) {
    if (!dateRange.start || (dateRange.start && dateRange.end)) {
      // Start new selection
      setDateRange({ start: date, end: null });
    } else {
      // Complete the range
      if (isAfter(date, dateRange.start)) {
        setDateRange({ start: dateRange.start, end: date });
      } else {
        setDateRange({ start: date, end: dateRange.start });
      }
    }
  }

  function handleClear() {
    setDateRange({ start: null, end: null });
    setHoverDate(null);
  }

  function isInRange(date: Date): boolean {
    if (!dateRange.start) return false;

    const end = dateRange.end || hoverDate;
    if (!end) return false;

    // If start and end are the same day, there's no range
    if (isSameDay(dateRange.start, end)) return false;

    const rangeStart = isBefore(dateRange.start, end) ? dateRange.start : end;
    const rangeEnd = isAfter(dateRange.start, end) ? dateRange.start : end;

    // Exclude start and end dates - only dates strictly between them
    return isWithinInterval(date, { start: rangeStart, end: rangeEnd })
      && !isSameDay(date, rangeStart)
      && !isSameDay(date, rangeEnd);
  }

  function isRangeStart(date: Date): boolean {
    if (!dateRange.start) return false;
    if (dateRange.end) {
      const rangeStart = isBefore(dateRange.start, dateRange.end) ? dateRange.start : dateRange.end;
      return isSameDay(date, rangeStart);
    }
    return isSameDay(date, dateRange.start);
  }

  function isRangeEnd(date: Date): boolean {
    if (!dateRange.start) return false;
    if (dateRange.end) {
      const rangeEnd = isAfter(dateRange.start, dateRange.end) ? dateRange.start : dateRange.end;
      return isSameDay(date, rangeEnd);
    }
    if (hoverDate) {
      return isSameDay(date, hoverDate);
    }
    return false;
  }

  const formatRange = () => {
    if (!dateRange.start) return "Pick a start date";
    if (!dateRange.end) return `${format(dateRange.start, "MMM d, yyyy")} - ...`;

    const start = isBefore(dateRange.start, dateRange.end) ? dateRange.start : dateRange.end;
    const end = isAfter(dateRange.start, dateRange.end) ? dateRange.start : dateRange.end;

    return `${format(start, "MMM d, yyyy")} - ${format(end, "MMM d, yyyy")}`;
  };

  const renderCalendar = (calendar: ReturnType<typeof useCalendar>) => {
    return (
      <table
        className="table table-borderless text-center mb-0"
        onMouseLeave={() => setHoverDate(null)}
      >
        <thead>
          <tr>
            {calendar.headers.weekdays.map(({ key, value }) => (
              <th
                key={key}
                className="fw-medium text-body-secondary py-2"
                style={{ fontSize: "0.875rem" }}
              >
                {format(value, "EEEEEE")}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {calendar.body.value.map(({ key, value: days }) => (
            <tr key={key} style={{ height: "2.75rem" }}>
              {days.map(({ key, value, isCurrentMonth }) => {
                const inRange = isInRange(value);
                const isStart = isRangeStart(value);
                const isEnd = isRangeEnd(value);

                // Only apply in-range to dates between start and end (exclusive)
                const isMiddleRange = inRange && !isStart && !isEnd;

                // Only show primary color for actually selected dates (not hover)
                const isSelectedStart = dateRange.start && isSameDay(value, dateRange.start);
                const isSelectedEnd = dateRange.end && isSameDay(value, dateRange.end);
                const isSelected = isSelectedStart || isSelectedEnd;

                let btnClass = "btn btn-sm border-0";
                const style: React.CSSProperties = {
                  width: "2.5rem",
                  height: "2.5rem",
                  fontSize: "0.875rem",
                  transition: "all 0.15s ease",
                  borderRadius: "0.375rem",
                  position: "relative",
                  zIndex: 2,
                };

                const cellStyle: React.CSSProperties = {
                  position: "relative",
                  padding: "0",
                };

                if (isCurrentMonth && isMiddleRange) {
                  cellStyle.backgroundColor = "#dbeafe";
                }

                if (isSelected) {
                  btnClass += " btn-primary fw-semibold";
                } else if (isMiddleRange) {
                  btnClass += " text-primary";
                  style.fontWeight = 500;
                } else if (isCurrentMonth) {
                  btnClass += " text-body";
                }

                return (
                  <td key={key} className="p-0" style={cellStyle}>
                    {isCurrentMonth ? (
                      <button
                        type="button"
                        onClick={() => handleDateSelect(value)}
                        onMouseEnter={() => dateRange.start && !dateRange.end && setHoverDate(value)}
                        className={btnClass}
                        style={style}
                        aria-label={format(value, "PPP")}
                      >
                        {format(value, "d")}
                      </button>
                    ) : null}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <div className="d-flex justify-content-center my-4">
      <div style={{ maxWidth: "48rem" }}>
        <div className="card shadow-sm border rounded-3">
          <div className="card-body p-4">
            <div className="d-flex justify-content-between align-items-start border-bottom pb-4">
              <div>
                <p className="text-body-secondary small mb-1 fw-semibold">Selected range</p>
                <p className="text-body-emphasis fw-semibold mb-0 fs-6">
                  {formatRange()}
                </p>
              </div>
              <button
                type="button"
                onClick={handleClear}
                disabled={!dateRange.start}
                className="btn btn-outline-primary btn-sm px-3 fw-medium"
              >
                Clear
              </button>
            </div>

            <div className="row g-4">
              <div className="col-6">
                <div className="d-flex justify-content-between align-items-center py-3">
                  <button
                    type="button"
                    onClick={() => {
                      const newDate = subMonths(leftCalendar.cursorDate, 1);
                      leftCalendar.navigation.setDate(newDate);
                      rightCalendar.navigation.setDate(addMonths(newDate, 1));
                    }}
                    className="btn btn-link text-body p-2 text-decoration-none"
                    aria-label="Previous month"
                  >
                    <span style={{ fontSize: "1.25rem" }}>←</span>
                  </button>

                  <h2 className="mb-0 fw-semibold text-body-emphasis fs-6">
                    {format(leftCalendar.cursorDate, "MMMM yyyy")}
                  </h2>

                  <div style={{ width: "2.125rem" }} />
                </div>
                {renderCalendar(leftCalendar)}
              </div>

              <div className="col-6">
                <div className="d-flex justify-content-between align-items-center py-3">
                  <div style={{ width: "2.125rem" }} />

                  <h2 className="mb-0 fw-semibold text-body-emphasis fs-6">
                    {format(rightCalendar.cursorDate, "MMMM yyyy")}
                  </h2>

                  <button
                    type="button"
                    onClick={() => {
                      const newDate = addMonths(leftCalendar.cursorDate, 1);
                      leftCalendar.navigation.setDate(newDate);
                      rightCalendar.navigation.setDate(addMonths(newDate, 1));
                    }}
                    className="btn btn-link text-body p-2 text-decoration-none"
                    aria-label="Next month"
                  >
                    <span style={{ fontSize: "1.25rem" }}>→</span>
                  </button>
                </div>
                {renderCalendar(rightCalendar)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

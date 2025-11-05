"use client";

import { useCalendar } from "@h6s/calendar";
import { format, isSameDay, isAfter, isToday, addMonths, subMonths } from "date-fns";
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
      setDateRange({ start: date, end: null });
    } else {
      if (isAfter(date, dateRange.start)) {
        setDateRange({ start: dateRange.start, end: date });
      } else {
        setDateRange({ start: date, end: null });
      }
    }
  }

  function handleClear() {
    setDateRange({ start: null, end: null });
    setHoverDate(null);
  }

  function isInRange(date: Date): boolean {
    if (!dateRange.start) return false;

    const end = dateRange.end || (hoverDate && isAfter(hoverDate, dateRange.start) ? hoverDate : null);
    if (!end) return false;

    return isAfter(date, dateRange.start) && isAfter(end, date);
  }

  function isSelected(date: Date): boolean {
    if (dateRange.start && isSameDay(date, dateRange.start)) return true;
    if (dateRange.end && isSameDay(date, dateRange.end)) return true;
    return false;
  }

  const formatRange = () => {
    if (!dateRange.start) return "Pick a start date";
    if (!dateRange.end) return `${format(dateRange.start, "MM/dd/yyyy")} - ...`;
    return `${format(dateRange.start, "MM/dd/yyyy")} - ${format(dateRange.end, "MM/dd/yyyy")}`;
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
            <tr key={key}>
              {days.map(({ key, value, isCurrentMonth }) => {
                const inRange = isInRange(value);
                const selected = isSelected(value);
                const today = isToday(value);

                let btnClass = "btn btn-sm border-0";
                const style: React.CSSProperties = {
                  width: "2.5rem",
                  height: "2.5rem",
                  fontSize: "0.875rem",
                  transition: "all 0.15s ease",
                  borderRadius: "0.375rem",
                  position: "relative",
                  zIndex: 2,
                  ["--bs-btn-hover-bg" as any]: selected ? "#3b82f6" : "light-dark(#f3f4f6, #374151)",
                  ["--bs-btn-hover-border-color" as any]: "transparent",
                };

                const cellStyle: React.CSSProperties = {
                  position: "relative",
                  padding: "0",
                };

                const rangeStyle: React.CSSProperties | undefined = isCurrentMonth && inRange ? {
                  content: '""',
                  position: "absolute",
                  top: "50%",
                  left: 0,
                  right: 0,
                  height: "2rem",
                  transform: "translateY(-50%)",
                  backgroundColor: "light-dark(#dbeafe, #1e3a8a)",
                  zIndex: 0,
                } : undefined;

                if (today) {
                  style.border = "2px solid #0d6efd";
                }

                if (selected) {
                  btnClass += " btn-primary fw-semibold";
                } else if (inRange) {
                  btnClass += " text-primary-emphasis";
                  style.fontWeight = 500;
                } else if (isCurrentMonth) {
                  btnClass += " text-body";
                }

                return (
                  <td key={key} className="p-0" style={cellStyle}>
                    {isCurrentMonth && inRange && <div style={rangeStyle} />}
                    {isCurrentMonth ? (
                      <button
                        type="button"
                        onClick={() => handleDateSelect(value)}
                        onMouseEnter={() => {
                          if (dateRange.start && !dateRange.end && !isSameDay(value, hoverDate || new Date(0))) {
                            setHoverDate(value);
                          }
                        }}
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

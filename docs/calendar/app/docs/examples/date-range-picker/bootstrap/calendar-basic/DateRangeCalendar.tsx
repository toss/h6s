"use client";

import { useCalendar } from "@h6s/calendar";
import { format, isAfter, isSameDay, isToday } from "date-fns";
import { useState } from "react";

type DateRange = {
  start: Date | null;
  end: Date | null;
};

export function DateRangeCalendar() {
  const [dateRange, setDateRange] = useState<DateRange>({ start: null, end: null });
  const [hoverDate, setHoverDate] = useState<Date | null>(null);

  const { headers, body, navigation, cursorDate } = useCalendar({
    defaultDate: dateRange.start ?? new Date(),
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

  return (
    <div>
      <div style={{ display: "inline-block", width: "fit-content" }}>
        <div className="card shadow-lg border rounded-3">
          <div className="card-body p-3">
            <div className="d-flex justify-content-between align-items-start border-bottom pb-4">
              <div>
                <p className="text-body-secondary small mb-1 fw-semibold">Selected range</p>
                <p className="text-body-emphasis fw-semibold mb-0 fs-6">{formatRange()}</p>
              </div>
            </div>

            <div className="d-flex justify-content-between align-items-center py-3">
              <button
                type="button"
                onClick={navigation.toPrev}
                className="btn btn-link text-body p-2 text-decoration-none"
                aria-label="Previous month"
              >
                <span style={{ fontSize: "1.25rem" }}>←</span>
              </button>

              <h2 className="mb-0 fw-semibold text-body-emphasis fs-6">{format(cursorDate, "MMMM yyyy")}</h2>

              <button
                type="button"
                onClick={navigation.toNext}
                className="btn btn-link text-body p-2 text-decoration-none"
                aria-label="Next month"
              >
                <span style={{ fontSize: "1.25rem" }}>→</span>
              </button>
            </div>

            <div style={{ display: "inline-block", width: "fit-content" }}>
              <table className="table table-borderless text-center mb-0" onMouseLeave={() => setHoverDate(null)}>
                <thead>
                  <tr>
                    {headers.weekdays.map(({ key, value }) => (
                      <th key={key} className="fw-medium text-body-secondary py-2" style={{ fontSize: "0.875rem" }}>
                        {format(value, "EEEEEE")}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {body.value.map(({ key, value: days }) => (
                    <tr key={key}>
                      {days.map(({ key, value, isCurrentMonth }) => {
                        const inRange = isInRange(value);
                        const selected = isSelected(value);
                        const today = isToday(value);

                        let btnClass = `btn btn-sm ${today ? "" : "border-0"}`;
                        const style = {
                          width: "2.5rem",
                          height: "2.5rem",
                          fontSize: "0.875rem",
                          transition: "all 0.15s ease",
                          borderRadius: "0.375rem",
                          position: "relative",
                          zIndex: 2,
                          "--bs-btn-hover-bg": selected ? "#3b82f6" : "light-dark(#f3f4f6, #374151)",
                          "--bs-btn-hover-border-color": "transparent",
                        } as React.CSSProperties;

                        const cellStyle: React.CSSProperties = {
                          position: "relative",
                          padding: "0",
                        };

                        const rangeStyle: React.CSSProperties | undefined = inRange
                          ? {
                              content: '""',
                              position: "absolute",
                              top: "50%",
                              left: 0,
                              right: 0,
                              height: "2rem",
                              transform: "translateY(-50%)",
                              backgroundColor: "light-dark(#dbeafe, #1e3a8a)",
                              zIndex: 0,
                            }
                          : undefined;

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
                        } else {
                          btnClass += " text-secondary";
                        }

                        return (
                          <td key={key} className="p-0" style={cellStyle}>
                            {inRange && <div style={rangeStyle} />}
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
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

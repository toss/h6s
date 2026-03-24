"use client";

import { useCalendar, useSelection } from "@h6s/calendar";
import { format, isSameDay, isToday } from "date-fns";
import { useState } from "react";

export function DateRangeCalendar() {
  const [hoverDate, setHoverDate] = useState<Date | null>(null);

  const { headers, body, navigation, cursorDate } = useCalendar({
    defaultDate: new Date(),
  });

  const selection = useSelection({ mode: "range", body });

  function isInRangeWithHover(date: Date): boolean {
    if (selection.selected?.to) return selection.isInRange(date);
    if (!selection.selected?.from || !hoverDate) return false;
    const [start, end] = selection.selected.from < hoverDate
      ? [selection.selected.from, hoverDate]
      : [hoverDate, selection.selected.from];
    return date > start && date < end;
  }

  const formatRange = () => {
    if (!selection.selected) return "Pick a start date";
    if (!selection.selected.to) return `${format(selection.selected.from, "MM/dd/yyyy")} - ...`;
    return `${format(selection.selected.from, "MM/dd/yyyy")} - ${format(selection.selected.to, "MM/dd/yyyy")}`;
  };

  return (
    <div>
      <div style={{ display: "inline-block", width: "fit-content" }}>
        <div className="card shadow-sm border rounded-3">
          <div className="card-body p-3">
            <div className="d-flex flex-column">
              <div className="d-flex justify-content-between align-items-start border-bottom pb-2">
                <div>
                  <p className="text-body-emphasis fw-semibold mb-0" style={{ fontSize: "0.875rem" }}>
                    {formatRange()}
                  </p>
                </div>
              </div>

              <div className="d-flex justify-content-between align-items-center py-1">
                <button
                  type="button"
                  onClick={navigation.toPrev}
                  className="btn btn-link text-body p-2 text-decoration-none"
                  aria-label="Previous month"
                >
                  <span style={{ fontSize: "1.25rem" }}>←</span>
                </button>

                <h2 className="mb-0 fw-semibold text-body-emphasis" style={{ fontSize: "0.8rem" }}>
                  {format(cursorDate, "MMMM yyyy")}
                </h2>

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
                        <th
                          key={key}
                          className="fw-medium text-body-secondary px-1 py-2"
                          style={{ fontSize: "0.875rem", whiteSpace: "nowrap", overflow: "hidden" }}
                        >
                          {format(value, "EEEEEE")}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {selection.body.value.map(({ key, value: days }) => (
                      <tr key={key}>
                        {days.map(({ key, value, isCurrentMonth }) => {
                          const inRange = isInRangeWithHover(value);
                          const selected = selection.isRangeStart(value) || selection.isRangeEnd(value);
                          const today = isToday(value);

                          let btnClass = `btn btn-sm ${today ? "" : "border-0"}`;
                          const style = {
                            width: "2.25rem",
                            height: "2.25rem",
                            fontSize: "0.75rem",
                            lineHeight: "1",
                            padding: "0",
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
                            style.border = "2px solid #3b82f6";
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
                                onClick={() => selection.select(value)}
                                onMouseEnter={() => {
                                  if (
                                    selection.selected?.from &&
                                    !selection.selected?.to &&
                                    !isSameDay(value, hoverDate || new Date(0))
                                  ) {
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
    </div>
  );
}

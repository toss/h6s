"use client";

import { useCalendar } from "@h6s/calendar";
import { format, isSameDay } from "date-fns";
import { useState } from "react";

/**
 * Pure Bootstrap implementation.
 * Assumes Bootstrap styles are already available in the application.
 */
export function DatePicker() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const { headers, body, navigation, cursorDate } = useCalendar({
    defaultDate: selectedDate ?? new Date(),
  });

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  return (
    <div className="my-4 d-flex">
      <div className="card shadow-sm border border-secondary-subtle rounded-4 bg-body-tertiary">
        <div className="card-body p-4">
          <div className="d-flex justify-content-between align-items-start border-bottom pb-3 mb-4">
            <div>
              <p className="text-uppercase text-muted fw-semibold mb-1 small">Selected date</p>
              <p className="h5 fw-semibold text-body-emphasis mb-0">
                {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                navigation.setToday();
                setSelectedDate(new Date());
              }}
              className="btn btn-outline-primary btn-sm"
            >
              Today
            </button>
          </div>

          <div className="d-flex justify-content-between align-items-center mb-4">
            <button
              type="button"
              onClick={navigation.toPrev}
              className="btn btn-sm btn-outline-secondary rounded-circle"
              aria-label="Previous month"
            >
              <span aria-hidden className="fw-semibold">
                ‹
              </span>
            </button>
            <h2 className="h5 mb-0 fw-semibold text-body-emphasis">{format(cursorDate, "MMMM yyyy")}</h2>
            <button
              type="button"
              onClick={navigation.toNext}
              className="btn btn-sm btn-outline-secondary rounded-circle"
              aria-label="Next month"
            >
              <span aria-hidden className="fw-semibold">
                ›
              </span>
            </button>
          </div>

          <table className="table table-borderless text-center mb-0">
            <thead className="text-muted small text-uppercase">
              <tr>
                {headers.weekdays.map(({ key, value }) => (
                  <th key={key} className="fw-semibold pb-2">
                    {format(value, "EEE")}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {body.value.map(({ key, value: days }) => (
                <tr key={key}>
                  {days.map(({ key, value, isCurrentDate, isCurrentMonth }) => {
                    const isSelected = selectedDate && isSameDay(value, selectedDate);
                    const baseClasses = "btn btn-sm rounded-circle d-inline-flex align-items-center justify-content-center";
                    const widthStyle = { width: "2.5rem", height: "2.5rem" };

                    let className = `${baseClasses} btn-outline-secondary text-body-secondary`;

                    if (!isCurrentMonth) {
                      className = `${baseClasses} btn-outline-light text-muted`;
                    }

                    if (isCurrentDate) {
                      className = `${className} border border-primary text-primary bg-body`;
                    }

                    if (isSelected) {
                      className = `${baseClasses} btn-primary text-white shadow-sm`;
                    }

                    return (
                      <td key={key} className="py-1">
                        <button
                          type="button"
                          onClick={() => handleDateSelect(value)}
                          className={className}
                          style={widthStyle}
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
  );
}

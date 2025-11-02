"use client";

import { useCalendar } from "@h6s/calendar";
import { format, isSameDay } from "date-fns";
import { useState } from "react";

export function DatePicker() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const { headers, body, navigation, cursorDate } = useCalendar({
    defaultDate: selectedDate ?? new Date(),
  });

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  return (
    <div className="my-4" style={{ maxWidth: "24rem" }}>
      <div className="card shadow-sm border rounded-3">
        <div className="card-body p-4">
          <div className="d-flex justify-content-between align-items-start border-bottom pb-4 mb-4">
            <div>
              <p className="text-body-secondary small mb-1 fw-medium">Selected date</p>
              <p className="text-body-emphasis fw-semibold mb-0 fs-6">
                {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                const today = new Date();
                navigation.setToday();
                setSelectedDate(today);
              }}
              className="btn btn-outline-primary btn-sm px-3 fw-medium"
            >
              Today
            </button>
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

            <h2 className="mb-0 fw-semibold text-body-emphasis fs-6">
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

          <table className="table table-borderless text-center mb-0">
            <thead>
              <tr>
                {headers.weekdays.map(({ key, value }) => (
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
              {body.value.map(({ key, value: days }) => (
                <tr key={key}>
                  {days.map(({ key, value, isCurrentDate, isCurrentMonth }) => {
                    const isSelected = selectedDate && isSameDay(value, selectedDate);

                    let btnClass = "btn btn-sm rounded-circle border-0";
                    const style: React.CSSProperties = {
                      width: "2.5rem",
                      height: "2.5rem",
                      fontSize: "0.875rem",
                      transition: "all 0.15s ease"
                    };

                    if (isSelected) {
                      btnClass += " btn-primary";
                    } else if (isCurrentDate) {
                      btnClass += " text-body-emphasis fw-bold";
                      style.boxShadow = "0 0 0 2px var(--bs-primary)";
                    } else if (isCurrentMonth) {
                      btnClass += " text-body";
                    } else {
                      btnClass += " text-body-secondary";
                      style.opacity = 0.4;
                    }

                    return (
                      <td key={key} className="p-1">
                        <button
                          type="button"
                          onClick={() => handleDateSelect(value)}
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
  );
}

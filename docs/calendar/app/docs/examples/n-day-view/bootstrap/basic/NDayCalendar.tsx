"use client";

import { useNDayView } from "./useNDayView";
import { format, isSameDay } from "date-fns";
import { useState } from "react";

const DAY_OPTIONS = [3, 5, 7, 14];

export function NDayCalendar() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const { body, navigation, cursorDate, view } = useNDayView({
    defaultDate: new Date(),
    numberOfDays: 3,
  });

  return (
    <div className="card border rounded-3" style={{ maxWidth: "40rem" }}>
      <div className="card-body p-3">
        <div className="d-flex flex-wrap justify-content-between align-items-center border-bottom pb-2 gap-2">
          <div className="d-flex align-items-center gap-2">
            <button
              type="button"
              onClick={() => {
                navigation.setToday();
                setSelectedDate(new Date());
              }}
              className="btn btn-primary btn-sm px-2 py-1 fw-medium"
              style={{ fontSize: "0.75rem" }}
            >
              Today
            </button>
            <div className="btn-group btn-group-sm">
              <button
                type="button"
                onClick={navigation.toPrev}
                className="btn btn-outline-secondary"
                aria-label="Previous"
              >
                &larr;
              </button>
              <button
                type="button"
                onClick={navigation.toNext}
                className="btn btn-outline-secondary"
                aria-label="Next"
              >
                &rarr;
              </button>
            </div>
            <h2 className="mb-0 fw-semibold text-body-emphasis" style={{ fontSize: "0.875rem" }}>
              {format(cursorDate, "MMMM yyyy")}
            </h2>
          </div>
          <div className="btn-group btn-group-sm">
            {DAY_OPTIONS.map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => view.setNumberOfDays(n)}
                className={`btn ${view.numberOfDays === n ? "btn-primary" : "btn-outline-secondary"}`}
                style={{ fontSize: "0.7rem" }}
              >
                {n} days
              </button>
            ))}
          </div>
        </div>

        {body.value.map(({ key: rowKey, value: days }) => (
          <div key={rowKey}>
            <div className="d-flex border-bottom pt-2">
              <div style={{ width: "3rem", flexShrink: 0 }} />
              {days.map(({ key, value, isCurrentDate, isWeekend }) => {
                const isSelected = selectedDate && isSameDay(value, selectedDate);
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSelectedDate(value)}
                    className={`btn flex-fill d-flex flex-column align-items-center gap-0 rounded-2 mb-1 mx-0 p-1 ${
                      isSelected
                        ? "btn-primary"
                        : isCurrentDate
                          ? "btn-outline-primary"
                          : "btn-light border-0"
                    }`}
                    style={{ minWidth: 0 }}
                  >
                    <span
                      className={`fw-semibold text-uppercase ${
                        isSelected
                          ? "text-white"
                          : isWeekend
                            ? "text-danger"
                            : "text-body-secondary"
                      }`}
                      style={{ fontSize: "0.6rem", letterSpacing: "0.05em" }}
                    >
                      {format(value, "EEE")}
                    </span>
                    <span
                      className={`fw-semibold ${isSelected ? "text-white" : "text-body-emphasis"}`}
                      style={{ fontSize: "1.15rem" }}
                    >
                      {format(value, "d")}
                    </span>
                  </button>
                );
              })}
            </div>

            <div style={{ maxHeight: "20rem", overflowY: "auto" }}>
              {days[0].hours.map(({ hour }) => (
                <div
                  key={hour}
                  className="d-flex border-bottom"
                  style={{ minHeight: "2.5rem", borderColor: "var(--bs-border-color-translucent) !important" }}
                >
                  <div
                    className="d-flex align-items-start justify-content-end pe-2 text-body-tertiary"
                    style={{ width: "3rem", flexShrink: 0, paddingTop: "0.125rem", fontSize: "0.65rem", fontWeight: 500 }}
                  >
                    {hour === 0 ? "" : `${hour}:00`}
                  </div>
                  {days.map(({ key }) => (
                    <div
                      key={`${key}-${hour}`}
                      className="flex-fill border-start"
                      style={{ minWidth: 0, borderColor: "var(--bs-border-color-translucent) !important" }}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

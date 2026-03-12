import { format, isSameDay } from "date-fns";
import { useState } from "react";

import { useNDayView } from "../useNDayView";

const DAY_OPTIONS = [3, 5, 7, 14];

export function NDayView({ numberOfDays: defaultNumberOfDays = 3 }: { numberOfDays?: number }) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const { body, navigation, cursorDate, view } = useNDayView({
    defaultDate: new Date(),
    numberOfDays: defaultNumberOfDays,
  });

  return (
    <div style={{ maxWidth: "40rem", fontFamily: "system-ui, sans-serif" }}>
      <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "0.75rem", borderBottom: "1px solid #e4e4e7" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <button type="button" onClick={navigation.toPrev} aria-label="Previous">
            {"<"}
          </button>
          <button
            type="button"
            onClick={() => {
              navigation.setToday();
              setSelectedDate(new Date());
            }}
          >
            TODAY
          </button>
          <button type="button" onClick={navigation.toNext} aria-label="Next">
            {">"}
          </button>
          <span data-testid="cursor-date" style={{ fontWeight: 600, marginLeft: "0.5rem" }}>
            {format(cursorDate, "yyyy. MM")}
          </span>
        </div>
        <div style={{ display: "flex", gap: "0.25rem" }}>
          {DAY_OPTIONS.map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => view.setNumberOfDays(n)}
              aria-label={`${n} day view`}
              style={{
                fontWeight: view.numberOfDays === n ? 700 : 400,
                background: view.numberOfDays === n ? "#18181b" : "transparent",
                color: view.numberOfDays === n ? "#fff" : "#18181b",
                border: "1px solid #d4d4d8",
                borderRadius: "0.25rem",
                padding: "0.25rem 0.5rem",
                cursor: "pointer",
              }}
            >
              {n}D
            </button>
          ))}
        </div>
      </nav>

      {body.value.map(({ key: rowKey, value: days }) => (
        <div key={rowKey}>
          <div style={{ display: "flex", borderBottom: "1px solid #e4e4e7", paddingTop: "0.5rem" }}>
            <div style={{ width: "3rem", flexShrink: 0 }} />
            {days.map(({ key, value, isCurrentDate, isWeekend }) => {
              const isSelected = selectedDate && isSameDay(value, selectedDate);
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelectedDate(value)}
                  data-testid={isCurrentDate ? "n-day-cell--today" : "n-day-cell"}
                  style={{
                    flex: 1,
                    minWidth: 0,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "0.125rem",
                    padding: "0.5rem 0.25rem",
                    marginBottom: "0.25rem",
                    border: isSelected
                      ? "2px solid #18181b"
                      : isCurrentDate
                        ? "2px solid #3b82f6"
                        : "1px solid transparent",
                    borderRadius: "0.5rem",
                    background: isSelected ? "#18181b" : "transparent",
                    color: isSelected ? "#fff" : "inherit",
                    cursor: "pointer",
                  }}
                >
                  <span
                    style={{
                      fontSize: "0.7rem",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      color: isSelected ? "#fff" : isWeekend ? "#ef4444" : "#71717a",
                    }}
                  >
                    {format(value, "EEE")}
                  </span>
                  <span style={{ fontSize: "1.25rem", fontWeight: 600, color: isSelected ? "#fff" : "#18181b" }}>
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
                style={{ display: "flex", minHeight: "2.5rem", borderBottom: "1px solid #f4f4f5" }}
              >
                <div
                  style={{
                    width: "3rem",
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "flex-end",
                    paddingRight: "0.5rem",
                    paddingTop: "0.125rem",
                    fontSize: "0.65rem",
                    fontWeight: 500,
                    color: "#a1a1aa",
                  }}
                >
                  {hour === 0 ? "" : `${hour}:00`}
                </div>
                {days.map(({ key }) => (
                  <div
                    key={`${key}-${hour}`}
                    style={{ flex: 1, minWidth: 0, borderLeft: "1px solid #f4f4f5" }}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

"use client";

import { useCalendar } from "@h6s/calendar";
import * as Popover from "@radix-ui/react-popover";
import { format, isSameDay, isToday } from "date-fns";
import { useMemo, useState } from "react";

export default function DatePicker() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [open, setOpen] = useState(false);

  const displayValue = useMemo(() => (selectedDate ? format(selectedDate, "PPP") : "Pick a date"), [selectedDate]);

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <div style={{ maxWidth: "20rem" }}>
        <Popover.Trigger asChild>
          <button
            type="button"
            className="btn btn-outline-secondary w-100 d-flex justify-content-between align-items-center"
            style={
              {
                textAlign: "left",
                fontSize: "0.875rem",
                padding: "0.375rem 0.75rem",
                "--bs-btn-hover-bg": "var(--bs-secondary-bg-subtle)",
                "--bs-btn-hover-border-color": "var(--bs-secondary-border-subtle)",
                "--bs-btn-active-bg": "var(--bs-secondary-bg-subtle)",
                "--bs-btn-active-border-color": "var(--bs-secondary-border-subtle)",
              } as React.CSSProperties
            }
          >
            <span className={`${selectedDate ? "text-body" : "text-body-secondary"}`}>{displayValue}</span>
            <svg
              className="text-body-secondary"
              style={{ width: "1rem", height: "1rem", flexShrink: 0 }}
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M6 2a1 1 0 0 1 2 0v1h4V2a1 1 0 1 1 2 0v1h1.5A1.5 1.5 0 0 1 17 4.5v11A1.5 1.5 0 0 1 15.5 17h-11A1.5 1.5 0 0 1 3 15.5v-11A1.5 1.5 0 0 1 4.5 3H6V2Zm-1.5 5v8h11V7h-11Z" />
            </svg>
          </button>
        </Popover.Trigger>
      </div>

      <Popover.Portal>
        <Popover.Content
          side="bottom"
          align="start"
          sideOffset={8}
          collisionPadding={12}
          className="card shadow-lg border rounded-3"
          style={{ zIndex: 1050, maxWidth: "calc(100vw - 2rem)" }}
        >
          <div className="card-body p-3">
            <DatePickerContent
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              close={() => setOpen(false)}
            />
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

function DatePickerContent({
  selectedDate,
  setSelectedDate,
  close,
}: {
  selectedDate: Date | null;
  setSelectedDate: (date: Date | null) => void;
  close: () => void;
}) {
  const { headers, body, navigation, cursorDate } = useCalendar({
    defaultDate: selectedDate ?? new Date(),
  });

  function handleSelectDate(date: Date) {
    setSelectedDate(date);
    close();
  }

  return (
    <div className="d-flex flex-column">
      <div className="d-flex justify-content-between align-items-center mb-3">
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
        <table className="table table-borderless text-center mb-0">
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
            {body.value.map(({ key, value: days }) => (
              <tr key={key}>
                {days.map(({ key, value, isCurrentDate, isCurrentMonth }) => {
                  const isSelected = selectedDate && isSameDay(value, selectedDate);
                  const today = isCurrentDate;

                  let btnClass = `btn btn-sm ${today ? "" : "border-0"}`;
                  const style = {
                    width: "2.5rem",
                    height: "2.5rem",
                    fontSize: "0.875rem",
                    transition: "all 0.15s ease",
                    borderRadius: "0.375rem",
                    "--bs-btn-hover-bg": isSelected ? "#3b82f6" : "light-dark(#f3f4f6, #374151)",
                    "--bs-btn-hover-border-color": "transparent",
                  } as React.CSSProperties;

                  if (today) {
                    style.border = "2px solid #3b82f6";
                  }

                  if (isSelected) {
                    btnClass += " btn-primary";
                  } else if (today) {
                    btnClass += " text-body fw-semibold";
                  } else if (isCurrentMonth) {
                    btnClass += " text-body";
                  } else {
                    btnClass += " text-secondary";
                  }

                  return (
                    <td key={key} className="p-0" style={{ position: "relative", padding: 0 }}>
                      <button
                        type="button"
                        onClick={() => handleSelectDate(value)}
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
  );
}

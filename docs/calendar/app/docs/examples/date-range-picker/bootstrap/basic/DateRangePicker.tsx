"use client";

import { useCalendar } from "@h6s/calendar";
import * as Popover from "@radix-ui/react-popover";
import { addMonths, format, isAfter, isSameDay, isToday, subMonths } from "date-fns";
import { useMemo, useState } from "react";

type DateRange = {
  start: Date | null;
  end: Date | null;
};

export default function DateRangePicker() {
  const [dateRange, setDateRange] = useState<DateRange>({ start: null, end: null });
  const [open, setOpen] = useState(false);

  const displayValue = useMemo(() => {
    if (!dateRange.start) return "Pick a date range";
    if (!dateRange.end) return `${format(dateRange.start, "PP")} - ...`;
    return `${format(dateRange.start, "PP")} - ${format(dateRange.end, "PP")}`;
  }, [dateRange]);

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <div style={{ maxWidth: "20rem" }}>
        <Popover.Trigger asChild>
          <button
            type="button"
            className="btn btn-outline-secondary w-100 d-flex justify-content-between align-items-center"
            style={{ 
              textAlign: "left",
              fontSize: "0.875rem",
              padding: "0.375rem 0.75rem",
              "--bs-btn-hover-bg": "var(--bs-secondary-bg-subtle)",
              "--bs-btn-hover-border-color": "var(--bs-secondary-border-subtle)",
              "--bs-btn-active-bg": "var(--bs-secondary-bg-subtle)",
              "--bs-btn-active-border-color": "var(--bs-secondary-border-subtle)",
            } as React.CSSProperties}
          >
            <span className={`${dateRange.start ? "text-body" : "text-body-secondary"}`}>{displayValue}</span>
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
          <div className="card-body p-3 d-flex flex-column">
            <DateRangePickerContent dateRange={dateRange} setDateRange={setDateRange} close={() => setOpen(false)} />
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

function DateRangePickerContent({
  dateRange,
  setDateRange,
  close,
}: {
  dateRange: DateRange;
  setDateRange: (range: DateRange) => void;
  close: () => void;
}) {
  const [hoverDate, setHoverDate] = useState<Date | null>(null);

  const leftCalendar = useCalendar({
    defaultDate: dateRange.start ?? new Date(),
  });

  const rightCalendar = useCalendar({
    defaultDate: addMonths(dateRange.start ?? new Date(), 1),
  });

  function handleDateSelect(date: Date) {
    if (!dateRange.start || (dateRange.start && dateRange.end)) {
      setDateRange({ start: date, end: null });
    } else {
      if (isAfter(date, dateRange.start)) {
        setDateRange({ start: dateRange.start, end: date });
        close();
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

  const renderCalendar = (calendar: ReturnType<typeof useCalendar>) => {
    return (
      <div style={{ display: "inline-block", width: "fit-content" }}>
        <table className="table table-borderless text-center mb-0" onMouseLeave={() => setHoverDate(null)}>
          <thead>
            <tr>
              {calendar.headers.weekdays.map(({ key, value }) => (
                <th key={key} className="fw-medium text-body-secondary py-2" style={{ fontSize: "0.875rem" }}>
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

                  const rangeStyle: React.CSSProperties | undefined =
                    isCurrentMonth && inRange
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
      </div>
    );
  };

  return (
    <div className="d-flex gap-4 overflow-x-auto">
      <div className="d-flex flex-column" style={{ flexShrink: 0 }}>
        <div className="d-flex justify-content-between align-items-center mb-3">
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
          <div style={{ width: "2.25rem" }} />
        </div>
        {renderCalendar(leftCalendar)}
      </div>

      <div className="d-flex flex-column" style={{ flexShrink: 0 }}>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div style={{ width: "2.25rem" }} />
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
  );
}

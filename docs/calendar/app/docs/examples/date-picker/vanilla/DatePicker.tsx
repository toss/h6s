import { useCalendar } from "@h6s/calendar";
import * as Popover from "@radix-ui/react-popover";
import { format, isSameDay } from "date-fns";
import { useMemo, useState } from "react";
import "./DatePicker.css";

export default function DatePicker() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [open, setOpen] = useState(false);

  const displayValue = useMemo(() => (selectedDate ? format(selectedDate, "PPP") : "Pick a date"), [selectedDate]);

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <div className="datepicker-field">
        <label className="datepicker-field__label">Date</label>
        <Popover.Trigger asChild>
          <button type="button" className="datepicker-field__trigger">
            <span className={`datepicker-field__value ${selectedDate ? "is-selected" : ""}`}>{displayValue}</span>
            <svg className="datepicker-field__icon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path d="M6 2a1 1 0 0 1 2 0v1h4V2a1 1 0 1 1 2 0v1h1.5A1.5 1.5 0 0 1 17 4.5v11A1.5 1.5 0 0 1 15.5 17h-11A1.5 1.5 0 0 1 3 15.5v-11A1.5 1.5 0 0 1 4.5 3H6V2Zm-1.5 5v8h11V7h-11Z" />
            </svg>
          </button>
        </Popover.Trigger>
        {selectedDate && (
          <button type="button" className="datepicker-field__clear" onClick={() => setSelectedDate(null)}>
            Clear selection
          </button>
        )}
      </div>

      <Popover.Portal>
        <Popover.Content
          side="bottom"
          align="start"
          sideOffset={8}
          collisionPadding={12}
          className="datepicker-popover"
        >
          <DatePickerContent
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            close={() => setOpen(false)}
          />
          <Popover.Arrow className="datepicker-popover__arrow" />
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

  const handleSelectDate = (date: Date) => {
    setSelectedDate(date);
    close();
  };

  return (
    <div className="datepicker-popover__content">
      <div className="datepicker-popover__nav">
        <button
          type="button"
          aria-label="Previous month"
          onClick={navigation.toPrev}
          className="datepicker-popover__nav-button"
        >
          ←
        </button>
        <h2 className="datepicker-popover__month">{format(cursorDate, "MMMM yyyy")}</h2>
        <button
          type="button"
          aria-label="Next month"
          onClick={navigation.toNext}
          className="datepicker-popover__nav-button"
        >
          →
        </button>
      </div>

      <div className="datepicker-popover__table-wrapper">
        <table className="datepicker-popover__table">
          <thead>
            <tr>
              {headers.weekdays.map(({ key, value }) => (
                <th key={key} className="datepicker-popover__weekday">
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

                  const classes = [
                    "datepicker-popover__day",
                    isCurrentDate && "datepicker-popover__day--today",
                    isSelected && "datepicker-popover__day--selected",
                    !isCurrentMonth && "datepicker-popover__day--outside",
                  ]
                    .filter(Boolean)
                    .join(" ");

                  return (
                    <td key={key} className="datepicker-popover__cell">
                      <button type="button" onClick={() => handleSelectDate(value)} className={classes}>
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

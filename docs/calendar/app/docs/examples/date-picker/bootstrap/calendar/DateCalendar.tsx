import { useCalendar } from "@h6s/calendar";
import { format, isSameDay } from "date-fns";
import { useState } from "react";

export default function DateCalendar() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const { headers, body, navigation, cursorDate } = useCalendar({
    defaultDate: selectedDate ?? new Date(),
  });

  function handleDateSelect(date: Date, isCurrentMonth: boolean) {
    if (!isCurrentMonth) {
      navigation.setDate(date);
    }
    setSelectedDate(date);
  }

  return (
    <div>
      <div style={{ display: "inline-block", width: "fit-content" }}>
        <div className="card shadow-lg border rounded-3">
          <div className="card-body p-3">
            <div className="d-flex flex-column">
              <div className="d-flex justify-content-between align-items-start border-bottom pb-4">
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
                  className="btn btn-primary btn-sm px-3 fw-medium"
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
                      <th key={key} className="fw-medium text-body-secondary py-2" style={{ fontSize: "0.875rem" }}>
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
                        } as React.CSSProperties;

                        if (today) {
                          style.border = "2px solid var(--bs-primary)";
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
                              onClick={() => handleDateSelect(value, isCurrentMonth)}
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

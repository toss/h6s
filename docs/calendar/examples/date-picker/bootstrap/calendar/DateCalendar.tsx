import { useCalendar, useSelection } from "@h6s/calendar";
import { format } from "date-fns";

export default function DateCalendar() {
  const { headers, body, navigation, cursorDate } = useCalendar({
    defaultDate: new Date(),
  });

  const selection = useSelection({ mode: "single", body });

  function handleDateSelect(date: Date, isCurrentMonth: boolean) {
    if (!isCurrentMonth) {
      navigation.setDate(date);
    }
    selection.select(date);
  }

  return (
    <div>
      <div style={{ display: "inline-block", width: "fit-content" }}>
        <div className="card border rounded-3">
          <div className="card-body p-3">
            <div className="d-flex flex-column">
              <div className="d-flex justify-content-between align-items-center border-bottom pb-2">
                <div>
                  <p className="text-body-emphasis fw-semibold mb-0" style={{ fontSize: "0.875rem" }}>
                    {selection.selected ? format(selection.selected, "PPP") : "Pick a date"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const today = new Date();
                    navigation.setToday();
                    selection.select(today);
                  }}
                  className="btn btn-primary btn-sm px-2 py-1 fw-medium"
                  style={{ fontSize: "0.75rem" }}
                >
                  Today
                </button>
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
                    {selection.body.value.map(({ key, value: days }) => (
                      <tr key={key}>
                        {days.map(({ key, value, isCurrentDate, isCurrentMonth, isSelected }) => {
                          const today = isCurrentDate;

                          let btnClass = `btn btn-sm ${today ? "" : "border-0"}`;
                          const style = {
                            width: "2.25rem",
                            height: "2.25rem",
                            fontSize: "0.75rem",
                            lineHeight: "1",
                            padding: "0",
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

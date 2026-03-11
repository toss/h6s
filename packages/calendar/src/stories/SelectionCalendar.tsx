import { useCalendar } from "../useCalendar";
import { useSelection } from "../useSelection";

const WEEKDAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function formatYearMonth(date: Date): string {
  return `${date.getFullYear()}. ${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function SingleSelectionCalendar() {
  const calendar = useCalendar();
  const { body, select, selected } = useSelection({
    mode: "single",
    body: calendar.body,
    disabled: { dayOfWeek: [0, 6] },
  });

  return (
    <div>
      <p>Selected: {selected ? formatDate(selected) : "None"}</p>
      <table>
        <caption>
          <nav>
            <button type="button" onClick={calendar.navigation.toPrev}>
              {"<"}
            </button>
            <span>{formatYearMonth(calendar.cursorDate)}</span>
            <button type="button" onClick={calendar.navigation.toNext}>
              {">"}
            </button>
          </nav>
        </caption>
        <thead>
          <tr>
            {calendar.headers.weekdays.map(({ key, value }) => (
              <th key={key}>{WEEKDAY_NAMES[value.getDay()]}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {body.value.map((week) => (
            <tr key={week.key}>
              {week.value.map((day) => (
                <td
                  key={day.key}
                  tabIndex={day.isDisabled ? -1 : 0}
                  style={{
                    padding: "4px 0",
                    opacity: day.isCurrentMonth ? 1 : 0.2,
                    background: day.isSelected ? "blue" : "transparent",
                    color: day.isSelected ? "white" : day.isDisabled ? "gray" : "black",
                    textDecoration: day.isDisabled ? "line-through" : "none",
                    cursor: day.isDisabled ? "not-allowed" : "pointer",
                  }}
                  onClick={() => !day.isDisabled && select(day.value)}
                  onKeyDown={(e) => e.key === "Enter" && !day.isDisabled && select(day.value)}
                >
                  {day.date}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function RangeSelectionCalendar() {
  const calendar = useCalendar();
  const { body, select, selected, deselect } = useSelection({
    mode: "range",
    body: calendar.body,
    min: 2,
    max: 14,
    disabled: { dayOfWeek: [0] },
  });

  const rangeText = selected
    ? `${formatDate(selected.from)}${selected.to ? ` → ${formatDate(selected.to)}` : " (picking end...)"}`
    : "None";

  return (
    <div>
      <p>Range: {rangeText}</p>
      <button type="button" onClick={deselect}>
        Reset
      </button>
      <table>
        <caption>
          <nav>
            <button type="button" onClick={calendar.navigation.toPrev}>
              {"<"}
            </button>
            <span>{formatYearMonth(calendar.cursorDate)}</span>
            <button type="button" onClick={calendar.navigation.toNext}>
              {">"}
            </button>
          </nav>
        </caption>
        <thead>
          <tr>
            {calendar.headers.weekdays.map(({ key, value }) => (
              <th key={key}>{WEEKDAY_NAMES[value.getDay()]}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {body.value.map((week) => (
            <tr key={week.key}>
              {week.value.map((day) => (
                <td
                  key={day.key}
                  tabIndex={day.isDisabled ? -1 : 0}
                  style={{
                    padding: "4px 0",
                    opacity: day.isCurrentMonth ? 1 : 0.2,
                    background:
                      day.isRangeStart || day.isRangeEnd ? "blue" : day.isInRange ? "lightblue" : "transparent",
                    color: day.isRangeStart || day.isRangeEnd ? "white" : day.isDisabled ? "gray" : "black",
                    textDecoration: day.isDisabled ? "line-through" : "none",
                    cursor: day.isDisabled ? "not-allowed" : "pointer",
                  }}
                  onClick={() => !day.isDisabled && select(day.value)}
                  onKeyDown={(e) => e.key === "Enter" && !day.isDisabled && select(day.value)}
                >
                  {day.date}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function MultipleSelectionCalendar() {
  const calendar = useCalendar();
  const { body, select, selected } = useSelection({
    mode: "multiple",
    body: calendar.body,
    max: 5,
    disabled: (date: Date) => date < new Date(new Date().setHours(0, 0, 0, 0)),
  });

  return (
    <div>
      <p>
        Selected ({selected.length}/5): {selected.length > 0 ? selected.map((d) => formatDate(d)).join(", ") : "None"}
      </p>
      <table>
        <caption>
          <nav>
            <button type="button" onClick={calendar.navigation.toPrev}>
              {"<"}
            </button>
            <span>{formatYearMonth(calendar.cursorDate)}</span>
            <button type="button" onClick={calendar.navigation.toNext}>
              {">"}
            </button>
          </nav>
        </caption>
        <thead>
          <tr>
            {calendar.headers.weekdays.map(({ key, value }) => (
              <th key={key}>{WEEKDAY_NAMES[value.getDay()]}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {body.value.map((week) => (
            <tr key={week.key}>
              {week.value.map((day) => (
                <td
                  key={day.key}
                  tabIndex={day.isDisabled ? -1 : 0}
                  style={{
                    padding: "4px 0",
                    opacity: day.isCurrentMonth ? 1 : 0.2,
                    background: day.isSelected ? "blue" : "transparent",
                    color: day.isSelected ? "white" : day.isDisabled ? "gray" : "black",
                    textDecoration: day.isDisabled ? "line-through" : "none",
                    cursor: day.isDisabled ? "not-allowed" : "pointer",
                  }}
                  onClick={() => !day.isDisabled && select(day.value)}
                  onKeyDown={(e) => e.key === "Enter" && !day.isDisabled && select(day.value)}
                >
                  {day.date}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

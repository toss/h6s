"use client";

import { Sandpack } from "@/components/Sandpack";

export function DateCalendarSandpack() {
  return (
    <Sandpack
      files={[
        {
          path: "app/docs/examples/date-calendar/bootstrap/DateCalendar.tsx",
          target: "/App.tsx",
        },
      ]}
      options={{
        externalResources: [
          "https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css",
        ],
      }}
    />
  );
}

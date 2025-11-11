"use client";

import { Sandpack } from "@/components/Sandpack";

export function DatePickerSandpack() {
  return (
    <Sandpack
      files={[
        {
          path: "app/docs/examples/date-picker/tailwind/DatePicker.tsx",
          target: "/App.tsx",
        },
      ]}
      dependencies={{
        "@radix-ui/react-popover": "^1.1.2",
      }}
      options={{
        externalResources: ["https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"],
      }}
    />
  );
}

"use client";

import { Sandpack } from "@/components/Sandpack";

export function DatePickerSandpack() {
  return (
    <Sandpack
      files={[
        {
          path: "app/docs/examples/date-picker/vanilla/DatePicker.tsx",
          target: "/App.tsx",
        },
        {
          path: "app/docs/examples/date-picker/vanilla/DatePicker.css",
          target: "/DatePicker.css",
        },
      ]}
      dependencies={{
        "@radix-ui/react-popover": "^1.1.2",
      }}
      previewOptions={{
        style: {
          height: 550,
        }
      }}
    />
  );
}

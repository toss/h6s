"use client";

import { Sandpack } from "@/components/Sandpack";

export function DatePickerSandpack() {
  return (
    <Sandpack
      files={[
        {
          path: "app/docs/examples/date-picker/vanilla/DatePicker.tsx",
          target: "/App.tsx",
          transform: (code) =>
            code
              .replace(/"use client";\n\n/g, "")
              .replace('import "./DatePicker.css";', 'import "./styles.css";')
              .replace(/export function (\w+)\(\)/g, "export default function $1()"),
        },
        {
          path: "app/docs/examples/date-picker/vanilla/DatePicker.css",
          target: "/styles.css",
          transform: (code) => code, // No transformation needed for CSS
        },
      ]}
      dependencies={{
        "@radix-ui/react-popover": "^1.1.2",
      }}
    />
  );
}

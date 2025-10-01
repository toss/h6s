---
sidebar_position: 2
title: Example
---

[View Source on GitHub](https://github.com/toss/h6s/blob/main/examples/react/src/pages/calendar/index.tsx)

```tsx
import { useCalendar } from '@h6s/calendar'

export default function Calendar() {
  const { headers, body, view } = useCalendar()

  return (
    <Table>
      <Thead>
        <Tr>
          {headers.weekdays.map(({ key, value }) => {
            return <Th key={key}>{format(value, 'E', { locale })}</Th>
          })}
        </Tr>
      </Thead>
      <Tbody>
        {body.value.map(({ key, value: days }) => (
          <Tr key={key}>
            {days.map(({ key, value }) => (
              <Td key={key}>{getDate(value)}</Td>
            ))}
          </Tr>
        ))}
      </Tbody>
    </Table>
  )
}
```

<iframe
  src="https://react-examples.h6s.dev/calendar"
  title="@h6s/calendar example"
  allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
  sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
  style={{
    width: '100%',
    height: '75vh',
    border: '0',
    borderRadius: 8,
    overflow: 'hidden',
    position: 'static',
    zIndex: 0,
  }}
></iframe>

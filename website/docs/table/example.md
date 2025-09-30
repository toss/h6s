---
sidebar_position: 2
title: Example
---

[View Source on GitHub](https://github.com/toss/h6s/blob/main/examples/react/src/pages/table/index.tsx)

```tsx
import { useTable } from '@h6s/table'

export default function Table() {
  const [{ theadGroups, rows }, controls] = useTable({
    model: myTableModel,
    source: products,
  })

  return (
    <table>
      <thead>
        {theadGroups.map(({ theads, getRowProps }) => {
          const props = getRowProps()

          return (
            <tr key={props.id} {...props}>
              {theads.map(head => (
                <th>{head.render({ cellProps: head })}</th>
              ))}
            </tr>
          )
        })}
      </thead>
      <tbody>
        {rows.map(({ cells, getRowProps }) => {
          const props = getRowProps()

          return (
            <tr key={props.id} {...props}>
              {cells.map(cell => (
                cell.colSpan !== 0
                  ? <td key={cell.id}>{cell.render({ cellProps: cell })}</td>
                  : null
              )}
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
```

<iframe
  src="https://react-examples.h6s.dev/table"
  title="@h6s/table example"
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

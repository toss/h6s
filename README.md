<div align="center">
  <img width="200" src="./assets/logo.png" alt="h6s" />
  <h1>@h6s/calendar</h1>

  **A tiny, headless calendar hook for React.**

  [![npm](https://img.shields.io/npm/v/@h6s/calendar)](https://www.npmjs.com/package/@h6s/calendar) [![bundle size](https://img.shields.io/bundlephobia/minzip/@h6s/calendar?label=size)](https://bundlephobia.com/package/@h6s/calendar) [![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/toss/h6s/blob/main/LICENSE) [![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/toss/h6s)
</div>

ENGLISH | [한국어](./README-ko_kr.md)

@h6s/calendar is a headless calendar hook library for React. It provides date calculations, navigation, and selection logic — you bring the markup and styles.

```bash
npm install @h6s/calendar
```

## Example

```tsx
import { useCalendar } from '@h6s/calendar';

function Calendar() {
  const { headers, body, navigation } = useCalendar();

  return (
    <table>
      <thead>
        <tr>
          {headers.weekdays.map(({ key, value }) => (
            <th key={key}>{value.toLocaleDateString('en', { weekday: 'short' })}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {body.value.map((week) => (
          <tr key={week.key}>
            {week.value.map((day) => (
              <td key={day.key}>{day.value.getDate()}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

No CSS to override. No class names to memorize. Just data and your components.

---

### `useSelection(options)`

Composable date selection with three modes:

```tsx
const { body: selectionBody, select, selected } = useSelection({
  mode: 'single',   // 'single' | 'range' | 'multiple'
  body,
  disabled: [
    { dayOfWeek: [0, 6] },   // weekends
    { before: new Date() },   // past dates
  ],
});
```

| Mode | Selected Type | Use Case |
|------|--------------|----------|
| `single` | `Date \| undefined` | Date picker, birthday selector |
| `range` | `{ from: Date, to?: Date }` | Hotel booking, leave requests |
| `multiple` | `Date[]` | Scheduling, availability picker |

---

### Examples

Interactive Sandpack playgrounds — edit directly in the browser:

| Style | DatePicker | DateRangePicker |
|-------|-----------|-----------------|
| **Tailwind CSS** | [Demo](https://h6s.slash.page/calendar/docs/examples/date-picker/tailwind) | [Demo](https://h6s.slash.page/calendar/docs/examples/date-range-picker/tailwind) |
| **Bootstrap** | [Demo](https://h6s.slash.page/calendar/docs/examples/date-picker/bootstrap) | [Demo](https://h6s.slash.page/calendar/docs/examples/date-range-picker/bootstrap) |
| **Vanilla CSS** | [Demo](https://h6s.slash.page/calendar/docs/examples/date-picker/vanilla) | [Demo](https://h6s.slash.page/calendar/docs/examples/date-range-picker/vanilla) |

[Full documentation →](https://h6s.slash.page/calendar)

---

## Why @h6s/calendar?

### Problems with traditional calendar libraries

1. **Style customization limits**
   - Most calendar libraries ship their own UI. You end up fighting CSS overrides to match your design system.
2. **Unnecessary bundle size**
   - Unused CSS and components are still included in your bundle.
3. **Framework lock-in**
   - Tied to a specific CSS solution, making it hard to use your preferred styling approach.

### How @h6s/calendar solves this

1. **Fully headless**
   - Zero UI opinions. Works with Tailwind, Bootstrap, Vanilla CSS, styled-components — anything.
2. **Minimal bundle**
   - ~3.5kB gzipped. Only React as a peer dependency.
3. **Flexible views and selection**
   - Month, Week, and Day views out of the box. Single, Range, and Multiple selection with constraints.

## Contributing

We welcome contributions from everyone. Please read the [Contributing Guide](CONTRIBUTING.md) before submitting a pull request.

```bash
git clone https://github.com/toss/h6s.git
cd h6s && pnpm install
pnpm storybook
```

---

## Other Packages

### @h6s/table

> **Maintenance mode** — Stable, bug fixes only.

[Documentation](https://h6s.dev) · [Package](./packages/table/)

## License

MIT © Viva Republica, Inc. See [LICENSE](./LICENSE) for details.

<a title="Toss" href="https://toss.im">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://static.toss.im/logos/png/4x/logo-toss-reverse.png">
    <img alt="Toss" src="https://static.toss.im/logos/png/4x/logo-toss.png" width="100">
  </picture>
</a>

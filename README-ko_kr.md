<div align="center">
  <img width="200" src="./assets/logo.png" alt="h6s" />
  <h1>@h6s/calendar</h1>

  **가장 가벼운 React 캘린더 훅.**

  [![npm](https://img.shields.io/npm/v/@h6s/calendar)](https://www.npmjs.com/package/@h6s/calendar) [![bundle size](https://img.shields.io/bundlephobia/minzip/@h6s/calendar?label=size)](https://bundlephobia.com/package/@h6s/calendar) [![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/toss/h6s/blob/main/LICENSE) [![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/toss/h6s)
</div>

[English](./README.md) | 한국어

@h6s/calendar는 React에서 캘린더 UI를 만들기 위한 헤드리스 훅 라이브러리예요.

날짜 계산, 네비게이션, 선택 로직만 제공하고, 마크업과 스타일은 완전히 자유롭게 구성할 수 있어요.

```bash
npm install @h6s/calendar
```

## 예제

```tsx
import { useCalendar } from '@h6s/calendar';

function Calendar() {
  const { headers, body, navigation } = useCalendar();

  return (
    <table>
      <thead>
        <tr>
          {headers.weekdays.map(({ key, value }) => (
            <th key={key}>{value.toLocaleDateString('ko', { weekday: 'short' })}</th>
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

CSS를 오버라이드할 필요도, 클래스명을 외울 필요도 없어요. 데이터와 컴포넌트만으로 캘린더를 만들 수 있어요.

---

### `useSelection(options)`

세 가지 모드로 날짜를 선택할 수 있어요:

```tsx
const { body: selectionBody, select, selected } = useSelection({
  mode: 'single',   // 'single' | 'range' | 'multiple'
  body,
  disabled: [
    { dayOfWeek: [0, 6] },   // 주말
    { before: new Date() },   // 과거 날짜
  ],
});
```

| 모드 | 선택 타입 | 사용 예시 |
|------|----------|----------|
| `single` | `Date \| undefined` | 날짜 선택기, 생년월일 |
| `range` | `{ from: Date, to?: Date }` | 호텔 예약, 휴가 신청 |
| `multiple` | `Date[]` | 스케줄링, 가용일 선택 |

---

### 예제 모음

인터랙티브 Sandpack 플레이그라운드에서 직접 편집하고 결과를 확인할 수 있어요:

| 스타일 | DatePicker | DateRangePicker |
|--------|-----------|-----------------|
| **Tailwind CSS** | [데모](https://h6s.slash.page/calendar/docs/examples/date-picker/tailwind) | [데모](https://h6s.slash.page/calendar/docs/examples/date-range-picker/tailwind) |
| **Bootstrap** | [데모](https://h6s.slash.page/calendar/docs/examples/date-picker/bootstrap) | [데모](https://h6s.slash.page/calendar/docs/examples/date-range-picker/bootstrap) |
| **Vanilla CSS** | [데모](https://h6s.slash.page/calendar/docs/examples/date-picker/vanilla) | [데모](https://h6s.slash.page/calendar/docs/examples/date-range-picker/vanilla) |

[전체 문서 →](https://h6s.slash.page/calendar)

---

## @h6s/calendar를 사용하는 이유

### 기존 캘린더 라이브러리의 문제점

1. **스타일 커스터마이징의 한계**
   - 대부분의 캘린더 라이브러리는 자체 UI를 포함하고 있어요.
   - 디자인 시스템에 맞추려면 CSS 오버라이드와 싸워야 했어요.
2. **불필요한 번들 사이즈**
   - 사용하지 않는 CSS와 컴포넌트까지 번들에 포함되었어요.
3. **프레임워크 종속**
   - 특정 CSS 솔루션에 종속되어 다른 스타일링 방식을 사용하기 어려웠어요.

### @h6s/calendar의 접근 방식

1. **완전한 헤드리스 설계**
   - UI 의견이 없어요. Tailwind, Bootstrap, Vanilla CSS, styled-components 등 무엇이든 함께 사용할 수 있어요.
2. **최소한의 번들 사이즈**
   - gzip 기준 ~3.5kB. React 외에 의존성이 없어요.
3. **유연한 뷰와 선택**
   - 월간, 주간, 일간 뷰를 기본 제공하고, Single/Range/Multiple 선택 모드를 지원해요.

## 기여하기

누구나 기여를 환영해요. Pull request를 제출하기 전에 [기여 가이드](CONTRIBUTING.md)를 읽어주세요.

```bash
git clone https://github.com/toss/h6s.git
cd h6s && yarn
yarn storybook
```

---

## 기타 패키지

### @h6s/table

> **유지보수 모드** — 안정적이며 버그 수정만 진행해요.

[문서](https://h6s.dev) · [패키지](./packages/table/)

## License

MIT © Viva Republica, Inc. 자세한 내용은 [LICENSE](./LICENSE)를 참고하세요.

<a title="Toss" href="https://toss.im">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://static.toss.im/logos/png/4x/logo-toss-reverse.png">
    <img alt="Toss" src="https://static.toss.im/logos/png/4x/logo-toss.png" width="100">
  </picture>
</a>

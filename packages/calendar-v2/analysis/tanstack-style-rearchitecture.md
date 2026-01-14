# @h6s/calendar-v2: TanStack 스타일 헤드리스 캘린더

> **목표**: Global #1 Headless Calendar Library
> **철학**: "캘린더 UI"가 아닌 "시간 기반 그리드의 본질"을 추상화
> **구현**: Native Date 기반, Zero-dependency Core

---

## 1. 핵심 철학

### 1.1 TanStack의 교훈

TanStack Table이 성공한 이유는 기능이 많아서가 아니다:

```
❌ "테이블을 렌더링하는 방법"을 제공
✅ "데이터를 행/열 구조로 다루는 로직"을 제공
```

마찬가지로 headless calendar는:

```
❌ "달력 UI를 만드는 방법"을 제공
✅ "시간을 그리드로 매핑하는 로직"을 제공
```

### 1.2 핵심 통찰

**캘린더란 무엇인가?**

```
캘린더 = 시간 범위 → 셀 집합 매핑
```

모든 캘린더 UI는 결국:
1. **시간 범위**를 정의하고 (언제부터 언제까지?)
2. 그 범위를 **셀로 분할**하고 (어떤 단위로?)
3. 각 셀에 **데이터를 연결**하고 (무엇을 보여줄까?)
4. **탐색**을 제공한다 (앞뒤로 어떻게 이동?)

### 1.3 Cell vs Event 구분

**중요한 설계 결정**: Cell과 Event는 별개의 개념이다.

```
┌─────────────────────────────────────────────────────┐
│  Cell = 그리드의 눈금 (배경)                          │
│  - 균일한 시간 단위 (시/일/주/월/년)                  │
│  - Point + Unit 방식: date 하나 + Grid가 unit 보유   │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  Event = 그리드 위에 배치되는 데이터                  │
│  - 임의의 시간 범위 (9:30~11:45 등)                  │
│  - Range 방식: start + end 필요                     │
│  - Events Plugin이 필터링 담당                       │
└─────────────────────────────────────────────────────┘
```

Google Calendar를 생각해보자:
- 배경의 시간 슬롯 (09:00, 10:00, 11:00...) → **Cell** (균일, Point로 충분)
- 그 위의 일정 (9:30~11:45 회의) → **Event** (임의 범위, Range 필요)

---

## 2. 아키텍처 설계

### 2.1 Zero-Dependency 원칙

```
@h6s/calendar-v2 = 순수 JS Core (0 dependencies)

외부 날짜 라이브러리 불필요 - Native Date만 사용
```

### 2.2 Unit 기반 아키텍처

각 시간 단위의 동작을 **데이터로 정의**하여 Core에서 if-branch 없이 처리:

```typescript
// src/core/units.ts
interface UnitConfig {
  /** 날짜를 단위 시작점으로 정규화 */
  normalize: (date: Date) => Date;

  /** 다음 셀 날짜 계산 */
  getNext: (date: Date) => Date;

  /** 두 날짜 비교 (a > b인지) */
  isAfter: (a: Date, b: Date) => boolean;
}

// 5개 Unit 정의
const units: Record<CellUnit, UnitConfig> = {
  hour: {
    normalize: startOfHour,
    getNext: (date) => addHours(date, 1),
    isAfter: (a, b) => startOfHour(a).getTime() > startOfHour(b).getTime(),
  },
  day: {
    normalize: startOfDay,
    getNext: (date) => addDays(date, 1),
    isAfter: (a, b) => startOfDay(a).getTime() > startOfDay(b).getTime(),
  },
  // ... week, month, year
};
```

**장점**:
- Core 로직에 if-branch 없음
- 새 단위 추가가 데이터 추가로 가능
- 단위별 동작이 명시적으로 정의됨

### 2.3 레이어 구조

```
src/
├── react/                    ─┐
│   └── useTimeGrid.ts         │  React Adapter
│                              │  (상태 자동 관리)
│                             ─┘
├── plugins/                  ─┐
│   ├── selection.ts           │  Built-in Plugins
│   ├── navigation.ts          │  (공식 플러그인)
│   └── events.ts              │
│                             ─┘
├── plugin/                   ─┐
│   └── types.ts               │  Plugin System
│                              │  (커스텀 플러그인 인터페이스)
│                             ─┘
├── core/                     ─┐
│   ├── createTimeGrid.ts      │  Core
│   ├── types.ts               │  (TimeGrid, Cell, TimeRange)
│   └── units.ts               │  (hour/day/week/month/year)
│                             ─┘
├── utils/                    ─┐
│   ├── date.ts                │  Utilities
│   └── isWeekend.ts           │  (날짜 연산, 헬퍼)
│                             ─┘
└── index.ts                    Entry Point
```

**의존성 방향:**

```
┌─────────────────────────────────────────────────────────┐
│                     React Adapter                        │
│                    (useTimeGrid)                         │
└─────────────────────────────────────────────────────────┘
                            │ uses
                            ▼
┌─────────────────────────────────────────────────────────┐
│                     Built-in Plugins                     │
│         selection  │  navigation  │  events             │
└─────────────────────────────────────────────────────────┘
                            │ extends
                            ▼
┌─────────────────────────────────────────────────────────┐
│                         Core                             │
│    createTimeGrid  │  TimeGrid  │  Cell  │  Units       │
└─────────────────────────────────────────────────────────┘
                            │ uses
                            ▼
┌─────────────────────────────────────────────────────────┐
│                       Utilities                          │
│              date.ts  │  isWeekend.ts                   │
└─────────────────────────────────────────────────────────┘
                            │ uses
                            ▼
┌─────────────────────────────────────────────────────────┐
│                    Native Date API                       │
│                  (외부 의존성 없음)                       │
└─────────────────────────────────────────────────────────┘
```

---

## 3. Core API

### 3.1 타입 정의

```typescript
// CellUnit: 5가지 시간 단위
type CellUnit = 'hour' | 'day' | 'week' | 'month' | 'year';

type WeekDay = 0 | 1 | 2 | 3 | 4 | 5 | 6;

// TimeRange: 시간 범위
interface TimeRange {
  start: Date;
  end: Date;
}

// Cell: 그리드의 단위
interface Cell {
  /** 고유 키 (React key로 사용) */
  key: string;

  /** 셀의 날짜 */
  date: Date;

  // ============ 계산된 속성 ============

  /** 오늘인지 여부 */
  isToday: boolean;

  /** 요일 (0=일요일, 6=토요일) */
  weekday: WeekDay;

  /** 일 (1-31) */
  dayOfMonth: number;

  /** 월 (0-11) */
  month: number;

  /** 연도 */
  year: number;

  /** 시간 (0-23, hour 단위 그리드에서 사용) */
  hour: number;
}

// TimeGrid: Core가 반환하는 결과물
interface TimeGrid {
  /** 그리드의 모든 셀 (1D 배열) */
  cells: Cell[];

  /** 그리드 범위 */
  range: TimeRange;

  /** 셀 단위 */
  cellUnit: CellUnit;

  /** 주 시작 요일 */
  weekStartsOn: WeekDay;

  /** 셀 개수 */
  cellCount: number;

  /** 날짜로 셀 찾기 */
  getCellByDate(date: Date): Cell | null;

  /** 범위 내 셀 찾기 */
  getCellsInRange(range: TimeRange): Cell[];

  /** 셀을 2D 행렬로 변환 (레이아웃용) */
  getRows(columns?: number): Cell[][];

  /** 셀을 주 단위로 그룹핑 (월간 달력용) */
  getWeeks(): Cell[][];
}
```

### 3.2 셀 키 포맷

단위별로 의미론적으로 명확한 키 포맷 사용:

| Unit | Key Format | 예시 |
|------|------------|------|
| hour | `YYYY-MM-DDTHH` | `2026-01-15T09` |
| day | `YYYY-MM-DD` | `2026-01-15` |
| week | `YYYY-MM-DD` | `2026-01-12` (주 시작일) |
| month | `YYYY-MM` | `2026-01` |
| year | `YYYY` | `2026` |

### 3.3 createTimeGrid

```typescript
import { createTimeGrid } from '@h6s/calendar-v2';

const grid = createTimeGrid({
  // 시간 범위 정의 (Date 또는 ISO 문자열)
  range: {
    start: '2026-01-01',
    end: '2026-01-31',
  },

  // 셀 분할 방식
  cellUnit: 'day',        // 'hour' | 'day' | 'week' | 'month' | 'year'

  // 주 시작 요일 (기본값: 0 = 일요일)
  weekStartsOn: 1,        // 0=일, 1=월, 2=화, ..., 6=토

  // 완전한 주로 확장 (월간 달력용)
  fillWeeks: true,

  // 플러그인 (선택적)
  plugins: [
    selection({ mode: 'single' }),
    navigation({ unit: 'month' }),
  ],
});

// 결과: grid.cells (1D 배열)
grid.cells.forEach(cell => {
  console.log(cell.key, cell.date, cell.isToday);
});
```

### 3.4 getRows vs getWeeks

**두 메서드의 차이:**

| 메서드 | 용도 | 그룹핑 방식 |
|--------|------|------------|
| `getRows(n)` | 레이아웃 (Year/Month 선택기) | 고정 N개씩 분할 |
| `getWeeks()` | 월간 달력 | 의미적 주 단위 그룹핑 |

```typescript
// getRows(4) - Year/Month 선택기용 (3x4 그리드)
const grid = createTimeGrid({
  range: { start: new Date(2026, 0, 1), end: new Date(2026, 11, 31) },
  cellUnit: 'month',
});
const rows = grid.getRows(4);  // [[1월,2월,3월,4월], [5월,6월,7월,8월], [9월,10월,11월,12월]]

// getWeeks() - 월간 달력용 (주 단위 의미적 그룹핑)
const grid = createTimeGrid({
  range: { start: startOfMonth(today), end: endOfMonth(today) },
  cellUnit: 'day',
  fillWeeks: true,
});
const weeks = grid.getWeeks();  // [[일,월,화,수,목,금,토], [...], ...]
```

### 3.5 사용 예시: 다양한 UI 패턴

#### 월간 달력

```typescript
import { createTimeGrid, startOfMonth, endOfMonth } from '@h6s/calendar-v2';

const grid = createTimeGrid({
  range: {
    start: startOfMonth(cursor),
    end: endOfMonth(cursor),
  },
  cellUnit: 'day',
  weekStartsOn: 0,
  fillWeeks: true,  // 완전한 주로 확장
});

// 주 단위 그룹핑 (의미적)
const weeks = grid.getWeeks();
```

```
    일    월    화    수    목    금    토
┌────┬────┬────┬────┬────┬────┬────┐
│ 28 │ 29 │ 30 │ 31 │  1 │  2 │  3 │
│  4 │  5 │  6 │  7 │  8 │  9 │ 10 │
│ 11 │ 12 │ 13 │ 14 │ 15 │ 16 │ 17 │
│ 18 │ 19 │ 20 │ 21 │ 22 │ 23 │ 24 │
│ 25 │ 26 │ 27 │ 28 │ 29 │ 30 │ 31 │
└────┴────┴────┴────┴────┴────┴────┘
       cellUnit: 'day' (한 칸 = 하루)
```

#### GitHub 잔디

```typescript
import { createTimeGrid, events } from '@h6s/calendar-v2';

const grid = createTimeGrid({
  range: { start: '2025-01-12', end: '2026-01-12' },
  cellUnit: 'day',
  plugins: [
    events({
      data: contributions,
      getEventRange: (c) => ({ start: c.date, end: c.date }),
    }),
  ],
});

// 주 단위 그룹화 (열 생성)
const weeks = grid.getWeeks();
```

```
     1월        2월        3월   ...              12월
     ◀─────────────── columns: 53 (주) ───────────────▶
┌────────────────────────────────────────────────────────┐
일 │ ▪  ▫  ▪  ▪  ▫  ▫  ▪  ▪  ▪  ▫  ...  ▪  ▪  ▫  ▪  ▪  │
월 │ ▫  ▪  ▪  ▫  ▪  ▪  ▪  ▫  ▪  ▪  ...  ▫  ▪  ▪  ▪  ▫  │
화 │ ▪  ▪  ▫  ▪  ▪  ▫  ▪  ▪  ▪  ▫  ...  ▪  ▫  ▪  ▪  ▪  │
수 │ ▫  ▪  ▪  ▪  ▫  ▪  ▪  ▫  ▪  ▪  ...  ▪  ▪  ▫  ▪  ▪  │
목 │ ▪  ▫  ▪  ▪  ▪  ▪  ▫  ▪  ▪  ▫  ...  ▫  ▪  ▪  ▫  ▪  │
금 │ ▪  ▪  ▪  ▫  ▪  ▪  ▪  ▪  ▫  ▪  ...  ▪  ▪  ▪  ▪  ▫  │
토 │ ▫  ▪  ▫  ▪  ▪  ▪  ▪  ▪  ▪  ▪  ...  ▪  ▫  ▪  ▪  ▪  │
└────────────────────────────────────────────────────────┘
```

#### Month Selector

```typescript
const grid = createTimeGrid({
  range: {
    start: new Date(2026, 0, 1),   // 2026년 1월
    end: new Date(2026, 11, 31),   // 2026년 12월
  },
  cellUnit: 'month',
});

// 3x4 그리드 레이아웃
const rows = grid.getRows(4);
```

#### Year Selector

```typescript
const grid = createTimeGrid({
  range: {
    start: new Date(2020, 0, 1),
    end: new Date(2031, 0, 1),
  },
  cellUnit: 'year',
});

// 3x4 그리드 레이아웃
const rows = grid.getRows(4);
```

---

## 4. 유틸리티 함수

### 4.1 Date Utilities

```typescript
import {
  // 날짜 연산
  addDays,
  addMonths,
  addYears,

  // 시작점
  startOfDay,
  startOfWeek,
  startOfMonth,
  endOfMonth,

  // 비교
  isSameDay,
  isBefore,
  isAfter,

  // 변환
  toISODateString,      // Date → "YYYY-MM-DD"
  fromISODateString,    // "YYYY-MM-DD" → Date

  // 추출
  getDay,       // 요일 (0-6)
  getDate,      // 일 (1-31)
  getMonth,     // 월 (0-11)
  getYear,      // 연도

  // 헬퍼
  today,        // 오늘 00:00
  isWeekend,    // 주말 체크 (WeekDay → boolean)
} from '@h6s/calendar-v2';
```

### 4.2 isWeekend

```typescript
import { isWeekend } from '@h6s/calendar-v2';

// WeekDay (0-6)을 받아 주말 여부 반환
isWeekend(0);  // true (일요일)
isWeekend(6);  // true (토요일)
isWeekend(1);  // false (월요일)

// 사용 예
headers.map(({ dayIndex }) => (
  <th style={{ color: isWeekend(dayIndex) ? 'red' : 'black' }}>
    {dayName}
  </th>
));
```

---

## 5. 플러그인 시스템

### 5.1 핵심 철학: 모든 Plugin은 동등하다

**TanStack 철학:**

1. **Explicit over Implicit** - 마법 없음, 명시적
2. **No second-class citizens** - 공식/커스텀 구분 없음
3. **User has control** - 사용자가 제어권 가짐

```typescript
// ✅ 모든 기능이 동등한 플러그인
const grid = createTimeGrid({
  range,
  cellUnit: 'day',
  plugins: [
    navigation({ unit: 'month' }),      // 공식 플러그인
    selection({ mode: 'single' }),      // 공식 플러그인
    events({ data: myEvents }),         // 공식 플러그인
    holidays({ data: koreanHolidays }), // 커스텀 플러그인도 동일!
  ],
});
```

### 5.2 플러그인 인터페이스

```typescript
interface Plugin<TExtension = unknown, TState = unknown> {
  /** 플러그인 이름 */
  name: string;

  /**
   * 액션 메서드 이름 목록 (React Adapter에서 자동 바인딩)
   *
   * 여기 명시된 메서드는 useTimeGrid에서 호출 시:
   * - 반환된 상태를 내부 setState로 업데이트
   * - void 반환으로 변환
   */
  actions?: string[];

  /**
   * 초기 상태 생성 (옵션)
   * 상태가 필요한 플러그인만 구현
   */
  getInitialState?: (range: TimeRange) => TState;

  /**
   * TimeGrid를 확장하는 함수
   */
  extend: (grid: TimeGrid, state?: TState) => TimeGrid & TExtension;
}
```

### 5.3 내장 플러그인

#### Selection Plugin

```typescript
import { selection } from '@h6s/calendar-v2';

const grid = createTimeGrid({
  ...options,
  plugins: [
    selection({ mode: 'single' }),  // 또는 'range'
  ] as const,
});

// API
grid.selection.state;              // { selectedKey, rangeStartKey, rangeEndKey }
grid.selection.select(cell);       // 셀 선택 → SelectionState 반환
grid.selection.clear();            // 선택 해제 → SelectionState 반환
grid.selection.isSelected(cell);   // 선택 여부 → boolean
grid.selection.isInRange(cell);    // 범위 내 여부 → boolean
```

#### Navigation Plugin

```typescript
import { navigation } from '@h6s/calendar-v2';

const grid = createTimeGrid({
  ...options,
  plugins: [
    navigation({ unit: 'month', step: 1 }),
  ] as const,
});

// API
grid.navigation.state;        // { rangeStart, rangeEnd }
grid.navigation.goNext();     // 다음으로 이동 → NavigationState 반환
grid.navigation.goPrev();     // 이전으로 이동 → NavigationState 반환
grid.navigation.goToday();    // 오늘로 이동 → NavigationState 반환
grid.navigation.goTo(date);   // 특정 날짜로 이동 → NavigationState 반환
grid.navigation.getRange();   // 현재 범위 반환 → { start, end }
```

#### Events Plugin

```typescript
import { events } from '@h6s/calendar-v2';

const grid = createTimeGrid({
  ...options,
  plugins: [
    events({
      data: myEvents,
      getEventRange: (e) => ({ start: e.start, end: e.end }),
    }),
  ] as const,
});

// API
grid.events.data;                         // 모든 이벤트
grid.events.eventsInView;                 // 뷰 범위 내 이벤트
grid.events.getEventsForCell(cell);       // 특정 셀과 겹치는 이벤트
grid.events.getEventsForDate(date);       // 특정 날짜와 겹치는 이벤트
```

### 5.4 커스텀 플러그인 만들기

#### Stateless 플러그인 (쿼리만)

```typescript
interface HolidaysExtension {
  holidays: {
    isHoliday: (cell: Cell) => boolean;
    getHolidayName: (cell: Cell) => string | null;
  };
}

function holidays(options: { data: Holiday[] }): Plugin<HolidaysExtension> {
  return {
    name: 'holidays',
    // actions 없음 - 모든 메서드가 쿼리
    // getInitialState 없음 - 상태 불필요

    extend(grid) {
      const holidayMap = new Map(
        options.data.map(h => [toISODateString(h.date), h.name])
      );

      return {
        ...grid,
        holidays: {
          isHoliday: (cell) => holidayMap.has(cell.key),
          getHolidayName: (cell) => holidayMap.get(cell.key) ?? null,
        },
      };
    },
  };
}
```

#### Stateful 플러그인 (액션 + 쿼리)

```typescript
interface HighlightState {
  highlightedKey: string | null;
}

interface HighlightExtension {
  highlight: {
    state: HighlightState;
    highlight: (cell: Cell) => HighlightState;    // 액션
    clear: () => HighlightState;                   // 액션
    isHighlighted: (cell: Cell) => boolean;        // 쿼리
  };
}

function highlight(): Plugin<HighlightExtension, HighlightState> {
  return {
    name: 'highlight',
    actions: ['highlight', 'clear'],  // React Adapter에서 자동 바인딩

    getInitialState: () => ({ highlightedKey: null }),

    extend(grid, state) {
      const currentState = state ?? { highlightedKey: null };

      return {
        ...grid,
        highlight: {
          state: currentState,
          highlight: (cell) => ({ highlightedKey: cell.key }),
          clear: () => ({ highlightedKey: null }),
          isHighlighted: (cell) => currentState.highlightedKey === cell.key,
        },
      };
    },
  };
}
```

### 5.5 Core vs Plugin 구분 기준

| 기준 | Core | Plugin |
|------|------|--------|
| **필수성** | 모든 사용자가 필요 | 일부만 필요 |
| **상태** | 상태 없음 (순수 데이터) | 상태 있음 (selected, cursor 등) |
| **구현 방식** | 단일 구현 | 여러 구현 가능 |

---

## 6. React Adapter

### 6.1 useTimeGrid

```typescript
import { useTimeGrid, navigation, selection } from '@h6s/calendar-v2';

function Calendar() {
  const grid = useTimeGrid({
    range: { start: '2026-01-01', end: '2026-01-31' },
    cellUnit: 'day',
    fillWeeks: true,
    plugins: [
      navigation({ unit: 'month' }),
      selection({ mode: 'single' }),
    ] as const,
  });

  const weeks = grid.getWeeks();

  return (
    <div>
      <button onClick={grid.navigation.goNext}>Next</button>
      <button onClick={grid.navigation.goPrev}>Prev</button>

      {weeks.map((week, i) => (
        <div key={i}>
          {week.map(cell => (
            <div
              key={cell.key}
              onClick={() => grid.selection.select(cell)}
              style={{
                background: grid.selection.isSelected(cell) ? 'blue' : 'white'
              }}
            >
              {cell.dayOfMonth}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
```

### 6.2 Core vs React Adapter 차이

| | createTimeGrid (Core) | useTimeGrid (React) |
|---|---|---|
| **상태 관리** | 사용자가 직접 | 내부 useState |
| **액션 반환** | `goNext() → NavigationState` | `goNext() → void` |
| **쿼리 반환** | `isSelected() → boolean` | `isSelected() → boolean` (동일) |
| **리렌더** | 수동 | 자동 |

### 6.3 동적 액션 바인딩

```typescript
// useTimeGrid 내부 구현
for (const plugin of plugins) {
  if (!plugin.actions?.length) continue;

  const boundExtension = { ...extension };  // 전체 복사 (쿼리 메서드 유지)
  for (const actionName of plugin.actions) {
    // actions에 명시된 메서드만 래핑
    boundExtension[actionName] = (...args) => {
      const newState = originalMethod(...args);
      updatePluginState(plugin.name, newState);  // 내부 setState
    };
  }
}
```

---

## 7. 설계 원칙 요약

1. **Zero-Dependency**: Native Date만 사용, 외부 날짜 라이브러리 불필요
2. **Unit-Based Architecture**: 시간 단위 동작을 데이터로 정의, Core에 if-branch 없음
3. **Cells + Methods**: Core는 1D `cells` 배열 + `getRows()`/`getWeeks()` 메서드 제공
4. **Cell vs Event**: Cell은 균일한 그리드 눈금, Event는 임의 범위의 데이터
5. **Plugin Equality**: 공식/커스텀 플러그인 동등, Tree-shaking 완벽
6. **Type Safety**: 플러그인 배열에서 확장 타입 자동 추론
7. **YAGNI**: 사용하지 않는 유틸리티 제거 (toMatrix, groupBy, withPadding, pipe 등)

---

**문서 버전**: 5.0
**최종 업데이트**: 2026-01-15

### 변경 이력

| 버전 | 날짜 | 변경 내용 |
|------|------|-----------|
| 1.0 | 2026-01-12 | 최초 작성 |
| 2.0 | 2026-01-13 | Cell vs Event 구분, 플러그인 철학 추가 |
| 3.0 | 2026-01-15 | DateAdapter 제거, Unit 기반 아키텍처 |
| 4.0 | 2026-01-15 | Plugin Adapter 패턴, actions 필드 |
| 5.0 | 2026-01-15 | **API 단순화**: toMatrix/groupBy/withPadding/pipe 제거, getRows()/getWeeks() 메서드로 통합, 문서 대폭 간소화 |

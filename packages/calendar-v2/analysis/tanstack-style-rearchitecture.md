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
  week: {
    normalize: startOfDay,
    getNext: (date) => addDays(date, 7),
    isAfter: (a, b) => startOfDay(a).getTime() > startOfDay(b).getTime(),
  },
  month: {
    normalize: startOfMonth,
    getNext: (date) => addMonths(date, 1),
    isAfter: (a, b) => startOfMonth(a).getTime() > startOfMonth(b).getTime(),
  },
  year: {
    normalize: startOfYear,
    getNext: (date) => addYears(date, 1),
    isAfter: (a, b) => startOfYear(a).getTime() > startOfYear(b).getTime(),
  },
};
```

**장점**:
- Core 로직에 if-branch 없음
- 새 단위 추가가 데이터 추가로 가능
- 단위별 동작이 명시적으로 정의됨

### 2.3 레이어 구조

```
┌─────────────────────────────────────────────────────────┐
│                    Framework Adapters                    │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│  │  React   │ │   Vue    │ │  Solid   │ │  Svelte  │   │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘   │
│                     (미래 확장)                          │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                     Feature Plugins                      │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                │
│  │Selection │ │Navigation│ │  Events  │                │
│  └──────────┘ └──────────┘ └──────────┘                │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                   @h6s/calendar-v2 Core                  │
│                                                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │  TimeRange  │  │  TimeGrid   │  │    Cell     │     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
│                                                         │
│  ┌─────────────┐  ┌─────────────┐                      │
│  │    Units    │  │   Utils     │                      │
│  └─────────────┘  └─────────────┘                      │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                     Native Date API                      │
│                   (외부 의존성 없음)                      │
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
interface Cell<TData = unknown> {
  /** 고유 키 (React key로 사용) */
  key: string;

  /** 셀의 날짜 */
  date: Date;

  /** 이 셀에 연결된 데이터 */
  data: TData[];

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
interface TimeGrid<TData = unknown> {
  /** 그리드의 모든 셀 (1D 배열) */
  cells: Cell<TData>[];

  /** 그리드 범위 */
  range: TimeRange;

  /** 셀 단위 */
  cellUnit: CellUnit;

  /** 주 시작 요일 */
  weekStartsOn: WeekDay;

  /** 셀 개수 */
  cellCount: number;

  /** 날짜로 셀 찾기 */
  getCellByDate(date: Date): Cell<TData> | null;

  /** 범위 내 셀 찾기 */
  getCellsInRange(range: TimeRange): Cell<TData>[];
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

  // 데이터 바인딩 (선택적)
  data: myData,
  getItemDate: (item) => item.date,

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

### 3.4 사용 예시: 다양한 UI 패턴

#### 월간 달력

```typescript
import { createTimeGrid, startOfMonth, endOfMonth, withPadding, toMatrix } from '@h6s/calendar-v2';

const grid = createTimeGrid({
  range: {
    start: startOfMonth(cursor),
    end: endOfMonth(cursor),
  },
  cellUnit: 'day',
  weekStartsOn: 0,
});

// 패딩 추가 후 7열 행렬로 변환
const paddedGrid = withPadding(grid);
const matrix = toMatrix(paddedGrid.cells, 7);
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
import { createTimeGrid, groupBy } from '@h6s/calendar-v2';

const grid = createTimeGrid({
  range: { start: '2025-01-12', end: '2026-01-12' },
  cellUnit: 'day',
  data: contributions,
  getItemDate: (c) => c.date,
});

// 요일별 그룹화
const weekdays = groupBy(grid, 'weekday');
// weekdays[0] = { key: '0', cells: [모든 일요일] }
// weekdays[1] = { key: '1', cells: [모든 월요일] }
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

#### 일간 타임라인 (Day View)

```typescript
const grid = createTimeGrid({
  range: {
    start: new Date(2026, 0, 12, 0, 0),   // 00:00
    end: new Date(2026, 0, 12, 23, 0),    // 23:00
  },
  cellUnit: 'hour',
});

// grid.cells를 그대로 렌더링 (1D)
grid.cells.map(cell => <HourSlot key={cell.key} hour={cell.hour} />);
```

```
┌─────────────────────┐
│ 00:00               │ cells[0]  (cell.hour = 0)
├─────────────────────┤
│ 01:00               │ cells[1]  (cell.hour = 1)
├─────────────────────┤
│ 02:00               │ cells[2]  (cell.hour = 2)
├─────────────────────┤
│  ...                │
├─────────────────────┤
│ 23:00               │ cells[23] (cell.hour = 23)
└─────────────────────┘
```

#### Month Selector

```typescript
const grid = createTimeGrid({
  range: {
    start: new Date(2026, 0, 1),   // 2026년 1월
    end: new Date(2026, 11, 1),    // 2026년 12월
  },
  cellUnit: 'month',
});

// 12개 셀: 각 셀이 한 달을 나타냄
// cell.key: "2026-01", "2026-02", ... "2026-12"
```

#### Year Selector

```typescript
const grid = createTimeGrid({
  range: {
    start: new Date(2020, 0, 1),
    end: new Date(2030, 0, 1),
  },
  cellUnit: 'year',
});

// 11개 셀: 2020 ~ 2030
// cell.key: "2020", "2021", ... "2030"
```

---

## 4. 유틸리티 함수

### 4.1 Date Utilities

```typescript
import {
  // 날짜 연산
  addHours,
  addDays,
  addMonths,
  addYears,

  // 시작점
  startOfHour,
  startOfDay,
  startOfWeek,
  startOfMonth,
  startOfYear,
  endOfMonth,

  // 비교
  isSameDay,
  isBefore,
  isAfter,

  // 변환
  toISODateString,      // Date → "YYYY-MM-DD"
  toISODateTimeString,  // Date → "YYYY-MM-DDTHH"
  fromISODateString,    // "YYYY-MM-DD" → Date

  // 추출
  getDay,       // 요일 (0-6)
  getDate,      // 일 (1-31)
  getMonth,     // 월 (0-11)
  getYear,      // 연도
  getHours,     // 시간 (0-23)

  // 헬퍼
  today,        // 오늘 00:00
} from '@h6s/calendar-v2';
```

### 4.2 Grid Utilities

```typescript
import {
  groupBy,
  toMatrix,
  withPadding,
  isWeekend,
} from '@h6s/calendar-v2';
```

#### `groupBy`: 셀 그룹화

```typescript
function groupBy<TData>(
  grid: TimeGrid<TData>,
  key: 'week' | 'weekday' | 'month'
): GroupedCells<TData>[];

interface GroupedCells<TData> {
  key: string;
  cells: Cell<TData>[];
}
```

```typescript
// 월간 달력: 주 단위 그룹
const weeks = groupBy(grid, 'week');
// [{ key: '2026-W01', cells: [...] }, { key: '2026-W02', cells: [...] }]

// GitHub 잔디: 요일 단위 그룹
const weekdays = groupBy(grid, 'weekday');
// [{ key: '0', cells: [일요일들] }, { key: '1', cells: [월요일들] }]
```

#### `toMatrix`: 1D → 2D 변환

```typescript
function toMatrix<TData>(
  cells: Cell<TData>[],
  columns?: number  // 기본값: 7
): Cell<TData>[][];
```

```typescript
const matrix = toMatrix(grid.cells, 7);
// [[월, 화, 수, 목, 금, 토, 일], [...], ...]
```

#### `withPadding`: 패딩 셀 추가

월간 2D 달력에서 이전/다음 달 날짜를 채우기 위한 패딩 셀 추가.

```typescript
function withPadding<TData>(
  grid: TimeGrid<TData>
): PaddedTimeGrid<TData>;

interface PaddedCell<TData> extends Cell<TData> {
  /** 패딩 셀 여부 (이전/다음 달) */
  isPadding: boolean;
}

interface PaddedTimeGrid<TData> extends Omit<TimeGrid<TData>, 'cells'> {
  cells: PaddedCell<TData>[];
}
```

```typescript
const paddedGrid = withPadding(grid);
paddedGrid.cells.forEach(cell => {
  if (cell.isPadding) {
    // 이전/다음 달 날짜 (흐리게 표시)
  }
});
```

```
          withPadding 적용 전              withPadding 적용 후
       (range: 1월 1~31일만)           (12월/2월 날짜 포함)

                                  ┌────┬────┬────┬────┬────┬────┬────┐
                                  │ 29 │ 30 │ 31 │  1 │  2 │  3 │  4 │
┌────┬────┬────┬────┬────┬────┐  │ ░░ │ ░░ │ ░░ │    │    │    │    │
│  1 │  2 │  3 │...│ 30 │ 31 │ →├────┴────┴────┴────┴────┴────┴────┤
└────┴────┴────┴────┴────┴────┘  │        ... 1월 날짜들 ...         │
     31개 셀                      ├────┬────┬────┬────┬────┬────┬────┤
                                  │  1 │  2 │  3 │  4 │  5 │  6 │  7 │
                                  │ ░░ │ ░░ │ ░░ │ ░░ │ ░░ │ ░░ │ ░░ │
                                  └────┴────┴────┴────┴────┴────┴────┘
                                         35개 셀 (패딩 포함)
```

#### `isWeekend`: 주말 체크

```typescript
function isWeekend<TData>(cell: Cell<TData>): boolean;

// 사용
grid.cells.filter(isWeekend).forEach(cell => {
  // 주말 셀 처리
});
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
    holidays({ data: koreanHolidays }), // 커뮤니티 플러그인도 동일!
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

// 플러그인 배열에서 확장 타입 추출 (createTimeGrid용)
type InferPluginExtensions<TPlugins extends readonly Plugin<any, any>[]> =
  TPlugins extends readonly [Plugin<infer First, any>, ...infer Rest extends readonly Plugin<any, any>[]]
    ? First & InferPluginExtensions<Rest>
    : unknown;

// React Adapter용 바인딩 타입 (액션 메서드 → void 반환)
type InferBoundExtensions<TPlugins extends readonly Plugin<any, any>[]> = ...;
```

### 5.3 내장 플러그인

#### Selection Plugin

```typescript
import { selection } from '@h6s/calendar-v2';

const grid = createTimeGrid({
  ...options,
  plugins: [
    selection({ mode: 'single' }),  // 또는 'range'
  ],
});

// API
grid.selection.state;              // { selectedKey, rangeStartKey, rangeEndKey }
grid.selection.select(cell);       // 셀 선택 → SelectionState 반환
grid.selection.clear();            // 선택 해제 → SelectionState 반환
grid.selection.isSelected(cell);   // 선택 여부 → boolean
grid.selection.isInRange(cell);    // 범위 내 여부 → boolean
```

```typescript
// Selection 플러그인 구현
function selection(options: SelectionOptions): Plugin<SelectionExtension, SelectionState> {
  return {
    name: 'selection',
    actions: ['select', 'clear'],  // React Adapter에서 자동 바인딩

    getInitialState: () => ({
      selectedKey: null,
      rangeStartKey: null,
      rangeEndKey: null,
    }),

    extend(grid, state) {
      return {
        ...grid,
        selection: {
          state,
          select: (cell) => newState,   // SelectionState 반환
          clear: () => initialState,     // SelectionState 반환
          isSelected: (cell) => boolean, // 쿼리 메서드
          isInRange: (cell) => boolean,  // 쿼리 메서드
        },
      };
    },
  };
}
```

#### Navigation Plugin

```typescript
import { navigation } from '@h6s/calendar-v2';

const grid = createTimeGrid({
  ...options,
  plugins: [
    navigation({ unit: 'month', step: 1 }),
  ],
});

// API
grid.navigation.state;        // { rangeStart, rangeEnd }
grid.navigation.goNext();     // 다음으로 이동 → NavigationState 반환
grid.navigation.goPrev();     // 이전으로 이동 → NavigationState 반환
grid.navigation.goToday();    // 오늘로 이동 → NavigationState 반환
grid.navigation.goTo(date);   // 특정 날짜로 이동 → NavigationState 반환
grid.navigation.getRange();   // 현재 범위 반환 → { start, end }
```

```typescript
// Navigation 플러그인 구현
function navigation(options: NavigationOptions): Plugin<NavigationExtension, NavigationState> {
  return {
    name: 'navigation',
    actions: ['goNext', 'goPrev', 'goToday', 'goTo'],  // React Adapter에서 자동 바인딩

    getInitialState: (range) => ({
      rangeStart: range.start,
      rangeEnd: range.end,
    }),

    extend(grid, state) {
      return {
        ...grid,
        navigation: {
          state,
          goNext: () => newState,     // NavigationState 반환
          goPrev: () => newState,     // NavigationState 반환
          goToday: () => newState,    // NavigationState 반환
          goTo: (date) => newState,   // NavigationState 반환
          getRange: () => ({ start, end }), // 쿼리 메서드
        },
      };
    },
  };
}
```

#### Events Plugin

Cell과 별개로 임의의 시간 범위를 가진 이벤트 데이터 관리.

```typescript
import { events } from '@h6s/calendar-v2';

const myEvents = [
  { id: '1', title: '회의', start: new Date(2026, 0, 12, 9, 30), end: new Date(2026, 0, 12, 11, 45) },
  { id: '2', title: '점심', start: new Date(2026, 0, 12, 12, 0), end: new Date(2026, 0, 12, 13, 0) },
];

const grid = createTimeGrid({
  ...options,
  plugins: [
    events({
      data: myEvents,
      getEventRange: (e) => ({ start: e.start, end: e.end }),
    }),
  ],
});

// API
grid.events.data;                         // 모든 이벤트
grid.events.eventsInView;                 // 뷰 범위 내 이벤트
grid.events.getEventsForCell(cell);       // 특정 셀과 겹치는 이벤트
grid.events.getEventsForDate(date);       // 특정 날짜와 겹치는 이벤트
grid.events.getEventRange(event);         // 이벤트 범위 조회
```

```typescript
// Events 타입
interface EventRange {
  start: Date;
  end: Date;
}

interface EventsExtension<TEvent> {
  events: {
    data: TEvent[];
    eventsInView: TEvent[];
    getEventsForCell: (cell: Cell<any>) => TEvent[];
    getEventsForDate: (date: Date) => TEvent[];
    getEventRange: (event: TEvent) => EventRange;
  };
}
```

### 5.4 타입 추론

plugins 배열에서 타입이 자동으로 추론된다:

```typescript
const grid = createTimeGrid({
  range,
  cellUnit: 'day',
  plugins: [
    navigation({ unit: 'month' }),
    selection({ mode: 'single' }),
  ] as const,  // const assertion으로 튜플 타입 추론
});

// 타입 추론 완벽하게 동작
grid.navigation.goNext();         // ✅ navigation 플러그인에서 추론
grid.selection.select(cell);      // ✅ selection 플러그인에서 추론
grid.holidays.isHoliday(cell);    // ❌ Error: holidays 플러그인 없음
```

### 5.5 커스텀 플러그인 만들기

#### Stateless 플러그인 (쿼리만)

```typescript
// 1. 플러그인이 추가하는 타입 정의
interface HolidaysExtension {
  holidays: {
    isHoliday: (cell: Cell<any>) => boolean;
    getHolidayName: (cell: Cell<any>) => string | null;
  };
}

// 2. 플러그인 팩토리 함수 (TState = unknown, actions 없음)
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
// 1. 타입 정의
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

// 2. 플러그인 구현
function highlight(): Plugin<HighlightExtension, HighlightState> {
  return {
    name: 'highlight',
    actions: ['highlight', 'clear'],  // ⭐ React Adapter에서 자동 바인딩

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

#### 사용

```typescript
// createTimeGrid - 직접 상태 관리
const grid = createTimeGrid({
  plugins: [highlight()],
});
const newState = grid.highlight.highlight(cell);  // HighlightState 반환
setHighlightState(newState);

// useTimeGrid - 자동 상태 관리
const grid = useTimeGrid({
  plugins: [highlight()] as const,
});
grid.highlight.highlight(cell);  // void - 내부 setState 호출
```

### 5.6 Core vs Plugin 구분 기준

| 기준 | Core | Plugin |
|------|------|--------|
| **필수성** | 모든 사용자가 필요 | 일부만 필요 |
| **상태** | 상태 없음 (순수 데이터) | 상태 있음 (selected, cursor 등) |
| **구현 방식** | 단일 구현 | 여러 구현 가능 |
| **역할** | 확장점 제공 | Core를 확장 |

**구체적 분류:**

| 기능 | 위치 | 이유 |
|------|------|------|
| `cells` | Core | 그리드의 본질 |
| `range`, `cellUnit` | Core | 그리드 정의 자체 |
| `getCellByDate()` | Core | 순수 함수, 상태 없음 |
| `isToday` | Core | 모든 캘린더가 필요 |
| `weekday` | Core | 날짜의 본질적 속성 |
| `isWeekend()` | Utils | 선택적 (업무용 캘린더는 불필요) |
| `navigation` | Plugin | cursor 상태 필요 |
| `selection` | Plugin | selected 상태 + 여러 모드 |
| `events` | Plugin | 복잡한 필터링 로직 + 선택적 |

---

## 6. 미래 확장

### 6.1 DateAdapter 패턴 (미구현)

현재는 Native Date만 사용하지만, 미래에 다양한 날짜 라이브러리 지원이 필요할 수 있다.

```typescript
// 미래: DateAdapter 인터페이스
interface DateAdapter<TDate = unknown> {
  addDays(date: TDate, days: number): TDate;
  startOfMonth(date: TDate): TDate;
  isSame(a: TDate, b: TDate, unit: 'day' | 'month' | 'year'): boolean;
  // ...
}

// 어댑터 생성
const dateFnsAdapter = createDateFnsAdapter({ locale: ko });
const temporalAdapter = createTemporalAdapter();

// 사용
const grid = createTimeGrid({
  adapter: dateFnsAdapter,  // 또는 temporalAdapter
  range,
  cellUnit: 'day',
});
```

**고려 시점:**
- 타임존 처리가 복잡해질 때 (Luxon, Temporal API)
- 특정 날짜 라이브러리 로케일이 필요할 때 (date-fns/locale)
- 브라우저 호환성 이슈 발생 시

**현재 Native Date 선택 이유:**
- Zero-dependency 유지
- 대부분의 캘린더 UI에 충분
- 번들 사이즈 최소화

### 6.2 React Adapter (구현됨)

```typescript
import { useTimeGrid, navigation, selection } from '@h6s/calendar-v2';

function Calendar() {
  // useTimeGrid: 플러그인 상태를 내부 useState로 자동 관리
  const grid = useTimeGrid({
    range: { start: '2026-01-01', end: '2026-01-31' },
    cellUnit: 'day',
    plugins: [
      navigation({ unit: 'month' }),
      selection({ mode: 'single' }),
    ] as const,
  });

  return (
    <div>
      {/* 액션 메서드는 void 반환 (내부 setState 호출) */}
      <button onClick={grid.navigation.goNext}>Next</button>
      <button onClick={grid.navigation.goPrev}>Prev</button>

      {grid.cells.map(cell => (
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
  );
}
```

**Core vs React Adapter 차이:**

| | createTimeGrid (Core) | useTimeGrid (React) |
|---|---|---|
| **상태 관리** | 사용자가 직접 | 내부 useState |
| **액션 반환** | `goNext() → NavigationState` | `goNext() → void` |
| **쿼리 반환** | `isSelected() → boolean` | `isSelected() → boolean` (동일) |
| **리렌더** | 수동 | 자동 |

**동적 액션 바인딩:**

```typescript
// useTimeGrid 내부 구현
for (const plugin of plugins) {
  const extension = result[plugin.name];
  if (!extension || !plugin.actions?.length) continue;

  const boundExtension = { ...extension };  // 전체 복사
  for (const actionName of plugin.actions) {
    const originalMethod = extension[actionName];
    if (typeof originalMethod === 'function') {
      // actions에 명시된 메서드만 래핑
      boundExtension[actionName] = (...args) => {
        const newState = originalMethod(...args);
        updatePluginState(plugin.name, newState);
      };
    }
  }
  result[plugin.name] = boundExtension;
}
```

**타입 추론:**

```typescript
// createTimeGrid: InferPluginExtensions 사용
type CreateResult = TimeGrid & InferPluginExtensions<TPlugins>;
// goNext: () => NavigationState

// useTimeGrid: InferBoundExtensions 사용
type UseResult = TimeGrid & InferBoundExtensions<TPlugins>;
// goNext: () => void (actions에 명시된 메서드만 void로 변환)
```

### 6.3 추가 플러그인 (미구현)

- `a11y` - 접근성 (ARIA 속성, 키보드 네비게이션)
- `holidays` - 공휴일
- `recurring` - 반복 이벤트

---

## 7. 설계 원칙 요약

1. **Zero-Dependency**: Native Date만 사용, 외부 날짜 라이브러리 불필요
2. **Unit-Based Architecture**: 시간 단위 동작을 데이터로 정의, Core에 if-branch 없음
3. **Cells Only**: Core는 1D `cells` 배열만 반환, 레이아웃은 유틸리티로 분리
4. **Cell vs Event**: Cell은 균일한 그리드 눈금, Event는 임의 범위의 데이터
5. **Plugin Equality**: 공식/커스텀 플러그인 동등, Tree-shaking 완벽
6. **Type Safety**: 플러그인 배열에서 확장 타입 자동 추론

---

**문서 버전**: 4.0
**최종 업데이트**: 2026-01-15

### 변경 이력

| 버전 | 날짜 | 변경 내용 |
|------|------|-----------|
| 1.0 | 2026-01-12 | 최초 작성 |
| 2.0 | 2026-01-13 | Cell vs Event 구분, 플러그인 철학, Core vs Plugin 기준 등 추가 |
| 3.0 | 2026-01-15 | **실제 구현과 동기화**: DateAdapter 제거 (Native Date만 사용), CellUnit에 'year' 추가, Unit 기반 아키텍처 문서화, 플러그인 인터페이스 단순화 (`{ name, extend }`), Navigation/Selection/Events API 실제 구현 반영, 미구현 기능 명시 (Framework Adapters 등) |
| 4.0 | 2026-01-15 | **Plugin Adapter 패턴**: Plugin에 `actions`, `getInitialState` 추가, useTimeGrid 동적 액션 바인딩 구현, InferBoundExtensions 타입 추론, Stateful/Stateless 커스텀 플러그인 가이드 추가 |

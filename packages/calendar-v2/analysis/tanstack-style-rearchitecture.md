# @h6s/calendar: TanStack 스타일 리아키텍처 제안서

> **작성일**: 2026-01-12
> **목표**: Global #1 Headless Calendar Library
> **철학**: "캘린더 UI"가 아닌 "시간 기반 그리드의 본질"을 추상화

---

## 1. 기존 접근법의 근본적 문제

### 1.1 기존 분석 보고서들의 한계

두 분석 보고서(`critical-analysis.md`, `critical-analysis2.md`)는 공통적으로 **기능 추가**를 해법으로 제시한다:

| 제안 | 문제점 |
|------|--------|
| "이벤트 관리 추가" | 특정 사용 사례에 종속 |
| "선택 기능 추가" | 하나의 상호작용 패턴 강제 |
| "i18n 추가" | 특정 포맷팅 방식 강제 |
| "접근성 헬퍼 추가" | React 컴포넌트 모델 가정 |

이 접근법의 결과물은 **"기능이 많은 캘린더 훅"**일 뿐, TanStack 같은 라이브러리가 아니다.

### 1.2 TanStack이 다른 이유

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

### 1.3 현재 @h6s/calendar의 철학적 문제

```typescript
// 현재: "월간 달력 뷰"라는 특정 UI 모델에 종속
const { headers, body, navigation, view } = useCalendar();

// headers: 요일 헤더 (월~일)
// body: 주 × 일 매트릭스
// view: Month | Week | Day
```

이것은 "달력 UI의 한 종류"를 추상화한 것이지, "시간 기반 그리드"를 추상화한 것이 아니다.

**표현 불가능한 것들:**
- GitHub 잔디 (53주 × 7일, 수평 스크롤)
- 타임라인 뷰 (수평 시간축)
- 간트 차트 (작업 × 시간)
- 예약 시스템 (자원 × 시간 슬롯)
- N-day 뷰 (임의의 연속 일수)
- 아젠다 뷰 (리스트 형태)

---

## 2. 새로운 철학: "Time Grid Primitives"

### 2.1 핵심 통찰

**캘린더란 무엇인가?**

```
캘린더 = 시간 범위 → 셀 집합 매핑
```

모든 캘린더 UI는 결국:
1. **시간 범위**를 정의하고 (언제부터 언제까지?)
2. 그 범위를 **셀로 분할**하고 (어떤 단위로?)
3. 각 셀에 **데이터를 연결**하고 (무엇을 보여줄까?)
4. **탐색**을 제공한다 (앞뒤로 어떻게 이동?)

### 2.2 새 라이브러리 이름 제안

```
@h6s/time-grid
```

또는 현재 이름 유지하되 철학을 완전히 바꾼다.

### 2.3 핵심 추상화: Cell vs Event 구분

**중요한 설계 결정**: Cell과 Event는 별개의 개념이다.

```
┌─────────────────────────────────────────────────────┐
│  Cell = 그리드의 눈금 (배경)                          │
│  - 균일한 시간 단위 (시/일/주/월)                     │
│  - Point + Unit 방식: date 하나 + Grid가 unit 보유   │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  Event = 그리드 위에 배치되는 데이터                  │
│  - 임의의 시간 범위 (9:30~11:45 등)                  │
│  - Range 방식: start + end 필요                     │
│  - Events Plugin이 배치 계산 담당                    │
└─────────────────────────────────────────────────────┘
```

**왜 이렇게 분리하는가?**

Google Calendar를 생각해보자:
- 배경의 시간 슬롯 (09:00, 10:00, 11:00...) → **Cell** (균일, Point로 충분)
- 그 위의 일정 (9:30~11:45 회의) → **Event** (임의 범위, Range 필요)

Cell에 Range를 넣으면 대부분의 케이스에서 불필요하게 장황해진다.

### 2.4 Core 인터페이스

```typescript
// 1. Cell: 그리드의 단위 (Point + Unit 방식)
interface Cell<TData = unknown> {
  key: string;
  date: TDate;              // 셀의 시작점 (단일 포인트)
  data: TData[];            // 이 셀에 연결된 데이터

  // 계산된 속성 (모든 캘린더에서 보편적으로 필요한 것만)
  isToday: boolean;
  weekday: number;          // 0-6 (유틸리티로 isWeekend 계산 가능)
  dayOfMonth: number;       // 1-31
  month: number;            // 0-11
  year: number;
}

// isWeekend는 유틸리티로 제공 (모든 캘린더가 필요하지 않음)
// import { isWeekend } from '@h6s/calendar/utils';
// isWeekend(cell) → cell.weekday === 0 || cell.weekday === 6

// 2. Grid: 셀 단위 정보를 포함
interface TimeGrid<TData = unknown> {
  cells: Cell<TData>[];
  cellUnit: 'hour' | 'day' | 'week' | 'month';  // 셀의 시간 단위
  range: TimeRange;         // 전체 그리드 범위
}

// 3. TimeRange: 범위가 필요한 곳에서만 사용 (Grid 범위, Event 범위)
interface TimeRange {
  start: TDate;
  end: TDate;
}

// 4. Event: 임의의 시간 범위를 가진 데이터 (Events Plugin에서 사용)
interface CalendarEvent {
  id: string;
  start: TDate;             // 시작 시간 (임의)
  end: TDate;               // 종료 시간 (임의)
  [key: string]: unknown;   // 사용자 정의 필드
}

// Note: Navigation, Selection 등은 Core가 아닌 Plugin에서 제공
// (섹션 5.0 Core vs Plugin 구분 기준 참조)
```

---

## 3. 아키텍처 설계

### 3.1 레이어 구조

```
┌─────────────────────────────────────────────────────────┐
│                    Framework Adapters                    │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│  │  React   │ │   Vue    │ │  Solid   │ │  Svelte  │   │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘   │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                     Feature Plugins                      │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│  │Selection │ │Navigation│ │  Events  │ │   A11y   │   │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘   │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                    @h6s/calendar-core                    │
│                                                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │  TimeRange  │  │    Grid     │  │    Cell     │     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
│                                                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │  Resolver   │  │  Iterator   │  │   Differ    │     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                    Date/Time Adapters                    │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│  │ Temporal │ │ date-fns │ │  Day.js  │ │  Luxon   │   │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘   │
└─────────────────────────────────────────────────────────┘
```

### 3.2 패키지 구조

```
@h6s/calendar-core          # 순수 JS 코어 (0 dependencies)
@h6s/calendar-react         # React 어댑터
@h6s/calendar-vue           # Vue 어댑터
@h6s/calendar-solid         # Solid 어댑터

@h6s/calendar-plugin-selection    # 선택 기능
@h6s/calendar-plugin-navigation   # 탐색 기능
@h6s/calendar-plugin-events       # 이벤트 배치
@h6s/calendar-plugin-a11y         # 접근성 헬퍼

@h6s/calendar-adapter-temporal    # Temporal API
@h6s/calendar-adapter-datefns     # date-fns
@h6s/calendar-adapter-dayjs       # Day.js
```

### 3.3 Core의 Zero-Dependency 원칙

```typescript
// @h6s/calendar-core는 외부 의존성 없이 순수 JS로 작성
// 날짜 연산은 어댑터를 통해 주입받음

interface DateAdapter<TDate = unknown> {
  // 기본 연산
  addDays(date: TDate, days: number): TDate;
  startOfMonth(date: TDate): TDate;
  startOfWeek(date: TDate, options?: { weekStartsOn?: WeekDay }): TDate;

  // 비교
  isSame(a: TDate, b: TDate, unit: 'day' | 'month' | 'year'): boolean;
  isBefore(a: TDate, b: TDate): boolean;

  // 생성
  today(): TDate;
  fromISO(iso: string): TDate;
  toISO(date: TDate): string;

  // 정보 추출
  getDay(date: TDate): number;
  getMonth(date: TDate): number;
  getYear(date: TDate): number;

  // 로케일 정보 (주 시작 요일 기본값 제공)
  getWeekStartsOn(): WeekDay;  // 0=일, 1=월, ..., 6=토
}

type WeekDay = 0 | 1 | 2 | 3 | 4 | 5 | 6;

// 어댑터 생성 예시
function createDateFnsAdapter(options?: { locale?: Locale }): DateAdapter<Date> {
  const locale = options?.locale;

  return {
    // ... 기타 메서드
    getWeekStartsOn: () => locale?.options?.weekStartsOn ?? 0,
    startOfWeek: (date, opts) =>
      dateFns.startOfWeek(date, {
        weekStartsOn: opts?.weekStartsOn ?? locale?.options?.weekStartsOn ?? 0
      }),
  };
}
```

---

## 4. API 설계

### 4.1 Core API: createTimeGrid

```typescript
import { createTimeGrid } from '@h6s/calendar-core';
import { createDateFnsAdapter } from '@h6s/calendar-adapter-datefns';
import { ko } from 'date-fns/locale';

// DateAdapter가 로케일 기본값 제공
const adapter = createDateFnsAdapter({ locale: ko });

const grid = createTimeGrid({
  adapter,

  // 시간 범위 정의
  range: {
    start: '2026-01-01',
    end: '2026-01-31',
  },

  // 셀 분할 방식
  cellUnit: 'day',        // 'day' | 'hour' | 'week' | 'month'

  // 주 시작 요일 (선택적)
  // 미지정 시 adapter 로케일 기본값 사용
  weekStartsOn: 1,        // 0=일, 1=월, 2=화, ..., 6=토
});

// 결과: grid.cells (1D 배열)
// 레이아웃 변환은 유틸리티 사용 (섹션 4.7 참조)
import { withPadding, toMatrix } from '@h6s/calendar/utils';

const matrix = toMatrix(
  withPadding(grid.cells, { weekStartsOn: 1, range: grid.range }),
  { columns: 7 }
);
```

#### weekStartsOn: 주 시작 요일 설정

주 시작 요일은 두 가지 방식으로 결정된다:

**1. DateAdapter 로케일 기본값** (암묵적)
```typescript
// 한국 로케일: 월요일 시작
const koAdapter = createDateFnsAdapter({ locale: ko });

// 미국 로케일: 일요일 시작
const usAdapter = createDateFnsAdapter({ locale: enUS });

const grid = createTimeGrid({
  adapter: koAdapter,  // 자동으로 월요일 시작
  ...
});
```

**2. Core 옵션으로 오버라이드** (명시적)
```typescript
const grid = createTimeGrid({
  adapter: koAdapter,
  weekStartsOn: 0,     // 로케일 무시하고 일요일 시작
  ...
});
```

```
weekStartsOn: 0 (일요일 시작)       weekStartsOn: 1 (월요일 시작)

  일   월   화   수   목   금   토     월   화   수   목   금   토   일
┌────┬────┬────┬────┬────┬────┬────┐ ┌────┬────┬────┬────┬────┬────┬────┐
│ 28 │ 29 │ 30 │ 31 │  1 │  2 │  3 │ │ 29 │ 30 │ 31 │  1 │  2 │  3 │  4 │
│  4 │  5 │  6 │  7 │  8 │  9 │ 10 │ │  5 │  6 │  7 │  8 │  9 │ 10 │ 11 │
│ ...                              │ │ ...                              │
└────┴────┴────┴────┴────┴────┴────┘ └────┴────┴────┴────┴────┴────┴────┘
```

**설계 원칙:**
- 로케일 기본값으로 대부분의 케이스 커버 (암묵적)
- 필요시 명시적 오버라이드 가능 (Explicit over Implicit)

#### Core의 데이터 바인딩 vs Events Plugin

**Core `data` 옵션**: 간단한 1:1 매핑 (Cell 하나에 데이터 연결)
```typescript
// GitHub 잔디: 각 날짜에 커밋 수 연결
const grid = createTimeGrid({
  range: yearRange('2025'),
  cellUnit: 'day',
  data: contributions,                    // [{ date: '2025-03-15', count: 5 }, ...]
  getItemDate: (item) => item.date,       // 데이터를 어느 셀에 연결할지
});

// cell.data = [{ date: '2025-03-15', count: 5 }]
```

**Events Plugin**: 복잡한 범위 매핑 (Event가 여러 Cell에 걸침)
```typescript
import { events } from '@h6s/calendar/plugins';

// Google Calendar: 이벤트가 임의 시간 범위
const grid = useTimeGrid({
  ...options,
  plugins: [
    events({
      data: myEvents,  // [{ start: '09:30', end: '11:45', ... }]
      getEventRange: (e) => ({ start: e.start, end: e.end }),
    }),
  ],
});

// grid.getEventPosition(event) → { top, height, column, ... }
```

### 4.2 Grid 결과물: Core는 cells만 제공

**TanStack 철학**: Core는 가장 순수한 형태의 프리미티브만 제공한다.

```typescript
// Core가 반환하는 결과물 (가장 순수한 형태)
interface TimeGridResult<TData, TDate> {
  // 메타데이터
  range: TimeRange;              // 전체 그리드 범위
  cellUnit: CellUnit;            // 'hour' | 'day' | 'week' | 'month'
  cellCount: number;
  weekStartsOn: WeekDay;

  // 그리드 데이터 - 항상 1D 배열
  cells: Cell<TData, TDate>[];

  // 유틸리티
  getCellByDate(date: TDate): Cell<TData, TDate> | null;
  getCellsInRange(range: TimeRange): Cell<TData, TDate>[];

  // 셀 속성 생성기
  getCellProps(cell: Cell<TData, TDate>): CellProps;
}

// Cell: 범용적 속성만 (특정 레이아웃에 종속되지 않음)
interface Cell<TData, TDate> {
  key: string;
  date: TDate;                   // 셀의 시작점 (단일 포인트)
  data: TData[];                 // 이 셀과 연결된 데이터

  // 계산된 속성 (모든 캘린더에서 보편적으로 필요)
  isToday: boolean;
  weekday: number;               // 0-6
  dayOfMonth: number;            // 1-31
  month: number;                 // 0-11
  year: number;
  // Note: isWeekend는 유틸리티 함수로 제공 (isWeekend(cell))
}
```

**왜 `rows`가 Core에 없는가?**

```
월간 달력에서 row = 주 (week)
GitHub 잔디에서 row = 요일 (weekday)
주간 시간표에서 row = 시간 (hour)
```

`row`의 의미가 컨텍스트마다 다르므로, Core에서 정의하면 혼란을 야기한다.
대신 **레이아웃 유틸리티**로 분리한다. (섹션 4.7 참조)

**왜 `isPadding`이 Core Cell에 없는가?**

패딩 셀(이전/다음 달 날짜)은 **월간 2D 달력**에서만 필요한 개념이다.
다른 캘린더(GitHub 잔디, 타임라인 등)에서는 의미가 없다.
따라서 **레이아웃 유틸리티**에서 처리한다.

**Point + Unit의 장점:**
- Cell이 단순해짐 (`date` 하나면 충분)
- `cellUnit`은 Grid 레벨에서 한 번만 정의
- 특정 UI 패턴에 종속되지 않음

### 4.3 사용 예시: 다양한 UI 패턴 (시각적 가이드)

> 참고: Core는 `cells` 1D 배열만 반환한다. 아래 시각적 예시는 레이아웃 유틸리티(섹션 4.7) 적용 후의 결과이다.

#### 월간 달력 (전통적)

```typescript
import { withPadding, toMatrix } from '@h6s/calendar/utils';

const grid = createTimeGrid({
  adapter: temporalAdapter,
  range: monthRange('2026-01'),      // 1월 1일 ~ 1월 31일
  cellUnit: 'day',
  weekStartsOn: 0,                   // Grid가 weekStartsOn의 단일 소스
});

// 레이아웃 변환: grid 전달 → weekStartsOn, range 자동 참조
const matrix = toMatrix(withPadding(grid), 7);
```

```
         range: 2026년 1월
         ┌─────────────────────────────────────────┐
         │                                         │
         ▼                                         ▼
    ┌────────────────────────────────────────────────┐
    │  일    월    화    수    목    금    토        │ ← columns: 7
    ├────────────────────────────────────────────────┤
    │  28   29   30   31    1    2    3   │ row[0]  │
    │   4    5    6    7    8    9   10   │ row[1]  │
    │  11   12   13   14   15   16   17   │ row[2]  │
    │  18   19   20   21   22   23   24   │ row[3]  │
    │  25   26   27   28   29   30   31   │ row[4]  │
    └────────────────────────────────────────────────┘
                    cellUnit: 'day'
                   (한 칸 = 하루)
```

#### GitHub 잔디

```typescript
import { groupBy } from '@h6s/calendar/utils';

const grid = createTimeGrid({
  adapter: temporalAdapter,
  range: { start: '2025-01-12', end: '2026-01-12' },  // 1년
  cellUnit: 'day',
  data: contributions,
  getItemDate: (c) => c.date,
});

// 레이아웃 변환: 요일별 그룹화
const weekdays = groupBy(grid.cells, 'weekday');
// weekdays[0] = 모든 일요일, weekdays[1] = 모든 월요일, ...
```

```
    range: 2025년 1월 ~ 2026년 1월 (1년)
    ┌──────────────────────────────────────────────────────────────┐
    │                                                              │
    ▼                                                              ▼

         1월        2월        3월   ...                    12월
         ◀─────────────── columns: 53 (주) ───────────────────▶
    ┌────────────────────────────────────────────────────────────────┐
 일 │ ▪  ▫  ▪  ▪  ▫  ▫  ▪  ▪  ▪  ▫  ...  ▪  ▪  ▫  ▪  ▪  ▪  ▫  ▪  │
 월 │ ▫  ▪  ▪  ▫  ▪  ▪  ▪  ▫  ▪  ▪  ...  ▫  ▪  ▪  ▪  ▫  ▪  ▪  ▫  │
 화 │ ▪  ▪  ▫  ▪  ▪  ▫  ▪  ▪  ▪  ▫  ...  ▪  ▫  ▪  ▪  ▪  ▫  ▪  ▪  │
 수 │ ▫  ▪  ▪  ▪  ▫  ▪  ▪  ▫  ▪  ▪  ...  ▪  ▪  ▫  ▪  ▪  ▪  ▫  ▪  │
 목 │ ▪  ▫  ▪  ▪  ▪  ▪  ▫  ▪  ▪  ▫  ...  ▫  ▪  ▪  ▫  ▪  ▪  ▪  ▪  │
 금 │ ▪  ▪  ▪  ▫  ▪  ▪  ▪  ▪  ▫  ▪  ...  ▪  ▪  ▪  ▪  ▫  ▪  ▪  ▫  │
 토 │ ▫  ▪  ▫  ▪  ▪  ▪  ▪  ▪  ▪  ▪  ...  ▪  ▫  ▪  ▪  ▪  ▪  ▪  ▪  │
    └────────────────────────────────────────────────────────────────┘
       ▲
       │
    cellUnit: 'day' (한 칸 = 하루)

    ▪ = 커밋 있음 (cell.data.length > 0)
    ▫ = 커밋 없음
```

#### 일간 타임라인 (Google Calendar Day View)

```typescript
// 레이아웃 변환 불필요 - cells 그대로 사용
const grid = createTimeGrid({
  adapter: temporalAdapter,
  range: dayRange('2026-01-12'),   // 하루 (00:00 ~ 23:59)
  cellUnit: 'hour',
});

// grid.cells를 그대로 렌더링 (1D)
grid.cells.map(cell => <HourSlot key={cell.key} cell={cell} />);
```

```
    range: 2026-01-12 하루
    ┌─────────────────────┐
    │                     │
    ▼                     ▼

    ┌─────────────────────┐
    │ 00:00               │ cells[0]
    ├─────────────────────┤
    │ 01:00               │ cells[1]
    ├─────────────────────┤
    │ 02:00               │ cells[2]
    ├─────────────────────┤
    │  ...                │
    ├─────────────────────┤
    │ 09:00  ┌──────────┐ │ cells[9]
    ├────────│ 회의     │─┤           ← Event (9:30~11:45)
    │ 10:00  │          │ │ cells[10]    Cell과 별개로 오버레이
    ├────────│          │─┤
    │ 11:00  └──────────┘ │ cells[11]
    ├─────────────────────┤
    │  ...                │
    ├─────────────────────┤
    │ 23:00               │ cells[23]
    └─────────────────────┘
         ▲
         │
    cellUnit: 'hour' (한 칸 = 1시간)
    cells를 그대로 렌더링 (세로 나열)
```

#### 주간 시간표

```typescript
import { groupBy } from '@h6s/calendar/utils';

const grid = createTimeGrid({
  adapter: temporalAdapter,
  range: weekRange('2026-01-12'),   // 1주 (일~토)
  cellUnit: 'hour',
});

// 레이아웃 변환: 시간별 그룹화
const hours = groupBy(grid.cells, 'hour');
// hours[0] = 00시의 모든 요일, hours[9] = 09시의 모든 요일, ...
```

```
         range: 1월 12일(일) ~ 1월 18일(토)
         ┌─────────────────────────────────────────────┐
         │                                             │
         ▼                                             ▼

              일      월      화      수      목      금      토
            ┌──────┬──────┬──────┬──────┬──────┬──────┬──────┐
    00:00   │      │      │      │      │      │      │      │
    01:00   │      │      │      │      │      │      │      │
      ...   │      │      │      │      │      │      │      │
    09:00   │      │ ████ │      │ ████ │      │ ████ │      │ ← 수업
    10:00   │      │ ████ │      │ ████ │      │ ████ │      │
    11:00   │      │      │      │      │      │      │      │
    12:00   │ ░░░░ │ ░░░░ │ ░░░░ │ ░░░░ │ ░░░░ │      │      │ ← 점심
    13:00   │      │      │ ████ │      │ ████ │      │      │
      ...   │      │      │      │      │      │      │      │
    23:00   │      │      │      │      │      │      │      │
            └──────┴──────┴──────┴──────┴──────┴──────┴──────┘
               ▲
               │
          cellUnit: 'hour'
          168개 셀 (7일 × 24시간)
```

#### N-Day 뷰 (5일)

```typescript
// 레이아웃 변환 불필요 - cells 그대로 사용
const grid = createTimeGrid({
  adapter: temporalAdapter,
  range: { start: '2026-01-12', end: '2026-01-16' },  // 5일
  cellUnit: 'day',
});

// grid.cells를 그대로 수평 렌더링
grid.cells.map(cell => <DayColumn key={cell.key} cell={cell} />);
```

```
    range: 1월 12일 ~ 1월 16일 (5일)
    ┌─────────────────────────────────────────────────────┐
    │                                                     │
    ▼                                                     ▼

    ┌─────────┬─────────┬─────────┬─────────┬─────────┐
    │  12일   │  13일   │  14일   │  15일   │  16일   │
    │   일    │   월    │   화    │   수    │   목    │
    │         │         │         │         │         │
    │  ▪▪▪    │  ▪▪     │         │  ▪▪▪▪   │  ▪      │
    └─────────┴─────────┴─────────┴─────────┴─────────┘
       cells[0]  cells[1]  cells[2]  cells[3]  cells[4]

    cells를 그대로 렌더링 (수평 나열은 CSS로)
    cellUnit: 'day'
```

#### 아젠다 뷰

```typescript
const grid = createTimeGrid({
  adapter: temporalAdapter,
  range: monthRange('2026-01'),
  cellUnit: 'day',
  data: events,
});

// 이벤트 있는 날만 필터링 (렌더링 단계에서)
const cellsWithEvents = grid.cells.filter(cell => cell.data.length > 0);
```

#### Core API 요약

| Prop | 역할 | 질문 |
|------|------|------|
| `range` | 시간 범위 | "언제부터 언제까지?" |
| `cellUnit` | 셀 단위 | "어떤 단위로 쪼갤까?" |
| `weekStartsOn` | 주 시작일 | "주가 무슨 요일부터 시작?" |

```
Core: range + cellUnit = cells (1D 배열)
Utils: cells → 원하는 레이아웃 (2D, 그룹화 등)
```

### 4.4 Plugin 사용법

#### 기본 사용법 (plugins 옵션)

```typescript
import { createTimeGrid } from '@h6s/calendar-core';
import { navigation, selection } from '@h6s/calendar/plugins';

// createTimeGrid의 plugins 옵션으로 전달
const grid = createTimeGrid({
  adapter,
  range,
  cellUnit: 'day',
  plugins: [
    navigation({ step: 'month', min: '2020-01-01', max: '2030-12-31' }),
    selection({ mode: 'range', onSelect: console.log }),
  ],
});

// 플러그인이 추가한 API 사용 (타입 추론 동작)
grid.navigation.goNext();
grid.navigation.goPrev();
grid.selection.select(cell);
grid.selection.clear();
```

#### React에서 사용

```typescript
import { useTimeGrid } from '@h6s/calendar-react';
import { navigation, selection } from '@h6s/calendar/plugins';

const grid = useTimeGrid({
  adapter: dateFnsAdapter,
  range: monthRange(cursor),
  cellUnit: 'day',
  plugins: [
    navigation({ step: 'month' }),
    selection({ mode: 'range' }),
  ],
});
```

#### 고급: pipe 유틸리티 (동적 플러그인 조합)

```typescript
import { pipe } from '@h6s/calendar/plugin';

// 런타임에 동적으로 플러그인 조합이 필요한 경우
const baseGrid = createTimeGrid({ adapter, range, cellUnit: 'day' });
const enhancedGrid = pipe(baseGrid, conditionalPlugins);
```

#### 플러그인 API 예시

```typescript
// Navigation Plugin API
grid.navigation.goNext();
grid.navigation.goPrev();
grid.navigation.goTo('2026-06-15');
grid.navigation.canGoNext;  // boolean
grid.navigation.canGoPrev;  // boolean

// Selection Plugin API
grid.selection.selected;              // Cell | Cell[] | { start: Cell, end: Cell }
grid.selection.select(cell);
grid.selection.selectRange(start, end);
grid.selection.clear();
grid.selection.isSelected(cell);      // boolean
```

### 4.5 React Adapter 전체 예제

```typescript
import { useMonthGrid } from '@h6s/calendar-react';
import { navigation, selection } from '@h6s/calendar/plugins';

function Calendar() {
  const [cursor, setCursor] = useState(new Date());

  const grid = useMonthGrid(cursor, {
    adapter: dateFnsAdapter,
    weekStartsOn: 1,
    plugins: [
      navigation({ step: 'month', onChange: setCursor }),
      selection({ mode: 'single' }),
    ],
  });

  return (
    <div>
      <button onClick={grid.navigation.goPrev}>Prev</button>
      <button onClick={grid.navigation.goNext}>Next</button>

      {grid.matrix.map((week, i) => (
        <div key={i} className="week">
          {week.map(cell => (
            <button
              key={cell.key}
              {...grid.getCellProps(cell)}
              className={cell.isPadding ? 'opacity-30' : ''}
            >
              {cell.dayOfMonth}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}
```

### 4.6 Navigation 심화: range와 cursor의 관계

#### range는 "현재 보이는 범위"

`range`는 **현재 화면에 표시되는 시간 범위**만 정의한다. 전체 데이터 범위가 아님.

```
                        range (현재 뷰)
                    ┌───────────────────┐
                    │                   │
    ────────────────┼───────────────────┼────────────────▶ 시간
        2025-12     │     2026-01       │    2026-02
                    │    (보이는 범위)   │
                    └───────────────────┘
```

#### Navigation 동작 원리

`cursor` 상태가 바뀌면 → `range`가 재계산되고 → 그리드가 다시 생성된다.

```
cursor 변경 → range 재계산 → grid 재생성 → UI 업데이트

     setCursor(새 날짜)
           │
           ▼
    range = monthRange(cursor)  ← cursor 기준으로 range 계산
           │
           ▼
    grid = createTimeGrid({ range, ... })
           │
           ▼
    UI 리렌더링
```

```
    goPrev()                              goNext()
       ◀                                     ▶
       │                                     │
       │         ┌─────────────────┐         │
       └─────────│   2026년 1월    │─────────┘
                 │                 │
                 │  [달력 그리드]   │
                 │                 │
                 └─────────────────┘
                        ▲
                        │
                   range = monthRange(cursor)
                   cursor가 바뀌면 range도 바뀜
```

#### 기본 Navigation 사용

```typescript
import { useMonthGrid } from '@h6s/calendar-react';
import { navigation } from '@h6s/calendar/plugins';

function Calendar() {
  const [cursor, setCursor] = useState(new Date());  // 현재 기준점

  const grid = useMonthGrid(cursor, {
    adapter: dateFnsAdapter,
    weekStartsOn: 1,
    plugins: [
      navigation({
        step: 'month',           // 한 번에 1달씩 이동
        onChange: setCursor,     // 이동 시 cursor 업데이트
      }),
    ],
  });

  return (
    <div>
      {/* 이전/다음 버튼 */}
      <button onClick={grid.navigation.goPrev}>◀ 이전 달</button>
      <span>{format(cursor, 'yyyy년 MM월')}</span>
      <button onClick={grid.navigation.goNext}>다음 달 ▶</button>

      {/* 달력 그리드 */}
      {grid.matrix.map((week, i) => (
        <div key={i}>{week.map(cell => ...)}</div>
      ))}
    </div>
  );
}
```

#### 드롭다운으로 월/연도 점프

`navigation.goTo()`를 사용하면 특정 날짜로 바로 이동할 수 있다.

```typescript
function Calendar() {
  const [cursor, setCursor] = useState(new Date());

  const grid = useMonthGrid(cursor, {
    adapter: dateFnsAdapter,
    weekStartsOn: 1,
    plugins: [
      navigation({ step: 'month', onChange: setCursor }),
    ],
  });

  // 년도 선택
  const handleYearChange = (year: number) => {
    grid.navigation.goTo(new Date(year, cursor.getMonth(), 1));
  };

  // 월 선택
  const handleMonthChange = (month: number) => {
    grid.navigation.goTo(new Date(cursor.getFullYear(), month, 1));
  };

  return (
    <div>
      {/* 년도 드롭다운 */}
      <select
        value={cursor.getFullYear()}
        onChange={e => handleYearChange(Number(e.target.value))}
      >
        {[2024, 2025, 2026, 2027, 2028].map(year => (
          <option key={year} value={year}>{year}년</option>
        ))}
      </select>

      {/* 월 드롭다운 */}
      <select
        value={cursor.getMonth()}
        onChange={e => handleMonthChange(Number(e.target.value))}
      >
        {Array.from({ length: 12 }, (_, i) => (
          <option key={i} value={i}>{i + 1}월</option>
        ))}
      </select>

      {/* 이전/다음 버튼 */}
      <button onClick={grid.navigation.goPrev}>◀</button>
      <button onClick={grid.navigation.goNext}>▶</button>

      {/* 달력 그리드 */}
      {grid.matrix.map((week, i) => (
        <div key={i}>{week.map(cell => ...)}</div>
      ))}
    </div>
  );
}
```

```
    ┌──────────────────────────────────────────────────┐
    │                                                  │
    │   ┌─────────┐  ┌─────────┐   ◀  ▶              │
    │   │ 2026년 ▼│  │  1월  ▼ │                      │
    │   └─────────┘  └─────────┘                      │
    │       │            │                            │
    │       │            └── handleMonthChange(0~11)  │
    │       │                                         │
    │       └── handleYearChange(2024~2028)           │
    │                                                  │
    │   ┌──────────────────────────────────────────┐  │
    │   │                                          │  │
    │   │            [달력 그리드]                  │  │
    │   │                                          │  │
    │   └──────────────────────────────────────────┘  │
    │                                                  │
    └──────────────────────────────────────────────────┘
```

#### Navigation 없이 직접 cursor 조작

Plugin 없이도 `cursor`를 직접 조작하면 동일한 효과를 얻을 수 있다.

```typescript
function Calendar() {
  const [cursor, setCursor] = useState(new Date());

  const grid = useTimeGrid({
    adapter: dateFnsAdapter,
    range: monthRange(cursor),  // cursor가 바뀌면 자동 재계산
    cellUnit: 'day',
  });

  // 직접 날짜 설정
  const jumpToDate = (year: number, month: number) => {
    setCursor(new Date(year, month, 1));
  };

  const goNext = () => {
    setCursor(prev => addMonths(prev, 1));
  };

  const goPrev = () => {
    setCursor(prev => subMonths(prev, 1));
  };

  return (
    <div>
      <button onClick={goPrev}>◀</button>
      <button onClick={goNext}>▶</button>
      <select onChange={e => jumpToDate(cursor.getFullYear(), Number(e.target.value))}>
        {/* 월 옵션 */}
      </select>
    </div>
  );
}
```

#### Navigation Plugin의 장점

직접 조작과 비교했을 때 Navigation Plugin은:

| 기능 | 직접 조작 | Navigation Plugin |
|------|----------|-------------------|
| 이전/다음 이동 | 직접 구현 | `goNext()`, `goPrev()` |
| 특정 날짜 이동 | 직접 구현 | `goTo(date)` |
| 이동 가능 여부 | 직접 구현 | `canGoNext`, `canGoPrev` |
| 범위 제한 | 직접 구현 | `min`, `max` 옵션 |
| step 단위 | 직접 구현 | `step: 'day' \| 'week' \| 'month' \| 'year'` |

```typescript
// Navigation Plugin의 범위 제한 예시
navigation({
  step: 'month',
  min: '2020-01-01',  // 이 날짜 이전으로 못 감
  max: '2030-12-31',  // 이 날짜 이후로 못 감
  onChange: setCursor,
});

grid.navigation.canGoPrev;  // min에 도달하면 false
grid.navigation.canGoNext;  // max에 도달하면 false
```

### 4.7 레이아웃 유틸리티: 다양한 UI 패턴 지원

Core는 `cells` 배열만 제공하고, 레이아웃 관련 변환은 **유틸리티 함수**로 분리한다.

#### 왜 레이아웃을 Core에서 분리하는가?

```
TanStack Table: data → rows → cells (테이블은 본질적으로 row 기반)
TanStack Calendar: range → cells → ??? (캘린더는 다양한 레이아웃)
```

캘린더는 테이블과 다르게 레이아웃 의미가 컨텍스트마다 다르다:

| 캘린더 유형 | 그룹핑 기준 | row의 의미 |
|------------|-----------|-----------|
| 월간 달력 | week | 주 |
| GitHub 잔디 | weekday | 요일 |
| 주간 시간표 | hour | 시간 |
| 타임라인 | (없음) | 해당 없음 |

따라서 **레이아웃은 유틸리티**로 제공한다.

#### 유틸리티 함수들

```typescript
import {
  groupBy,
  withPadding,
  toMatrix,
  chunk,
  isWeekend,  // Cell → boolean
} from '@h6s/calendar/utils';
```

**설계 원칙: Grid가 weekStartsOn의 단일 소스**

유틸리티 함수들은 `grid.weekStartsOn`을 참조한다. 별도 파라미터로 받지 않음.

```typescript
// ❌ 나쁜 예: weekStartsOn을 중복 전달
withPadding(grid.cells, { weekStartsOn: 1, range: grid.range });

// ✅ 좋은 예: grid를 전달하면 weekStartsOn 자동 참조
withPadding(grid);
```

##### `groupBy`: 셀을 특정 기준으로 그룹화

```typescript
// 월간 달력: 주 단위로 그룹 (grid.weekStartsOn 자동 사용)
const weeks = groupBy(grid, 'week');
// [[월, 화, 수, 목, 금, 토, 일], [월, 화, 수, ...], ...]

// GitHub 잔디: 요일 단위로 그룹
const weekdays = groupBy(grid, 'weekday');
// [[모든 일요일], [모든 월요일], ...]

// 주간 시간표: 시간 단위로 그룹
const hours = groupBy(grid, 'hour');
// [[00시 모든 요일], [01시 모든 요일], ...]
```

##### `withPadding`: 패딩 셀 추가 (월간 2D 전용)

```typescript
// 1월 달력에 12월/2월 날짜 추가
// grid.range와 grid.weekStartsOn을 자동으로 사용
const paddedCells = withPadding(grid);

// 추가된 셀은 isPadding: true
paddedCells.forEach(cell => {
  if (cell.isPadding) {
    // 이전/다음 달 날짜 (흐리게 표시)
  }
});
```

```
              withPadding 적용 전           withPadding 적용 후
         (range: 1월 1~31일만)         (12월/2월 날짜 포함)

                                    ┌────┬────┬────┬────┬────┬────┬────┐
                                    │ 29 │ 30 │ 31 │  1 │  2 │  3 │  4 │
┌────┬────┬────┬────┬────┬────┐    │ ░░ │ ░░ │ ░░ │    │    │    │    │
│  1 │  2 │  3 │ ...│ 30 │ 31 │ → ├────┴────┴────┴────┴────┴────┴────┤
└────┴────┴────┴────┴────┴────┘    │        ... 1월 날짜들 ...         │
      31개 셀                       ├────┬────┬────┬────┬────┬────┬────┤
                                    │  1 │  2 │  3 │  4 │  5 │  6 │  7 │
                                    │ ░░ │ ░░ │ ░░ │ ░░ │ ░░ │ ░░ │ ░░ │
                                    └────┴────┴────┴────┴────┴────┴────┘
                                           35개 셀 (패딩 포함)
```

##### `toMatrix`: 1D → 2D 변환

```typescript
// 7열 매트릭스로 변환
const matrix = toMatrix(paddedCells, { columns: 7 });
// [[Cell, Cell, Cell, Cell, Cell, Cell, Cell], ...]

// 렌더링
matrix.map((row, i) => (
  <div key={i} className="week">
    {row.map(cell => <Day key={cell.key} cell={cell} />)}
  </div>
));
```

##### `chunk`: 단순 분할

```typescript
// N개씩 분할
const rows = chunk(grid.cells, 7);
```

#### 조합 예시: pipe 패턴

```typescript
import { pipe } from '@h6s/calendar/utils';

// 월간 달력: grid 전달 → weekStartsOn, range 자동 참조
const monthView = pipe(
  grid,
  withPadding,          // grid.weekStartsOn, grid.range 사용
  toMatrix(7),          // 7열로 변환
);

// GitHub 잔디
const grassView = groupBy(grid, 'weekday');

// 또는 함수형 스타일
const monthView = toMatrix(withPadding(grid), 7);
```

### 4.8 React Hook 편의 함수 및 프리셋

자주 사용되는 패턴은 **프리셋**으로 제공한다.

#### 철학적 위치: Core vs Framework Adapter

```
┌─────────────────────────────────────────────────────────────────┐
│ "Core는 cells만 반환" 원칙은 @h6s/calendar-core에 적용된다.      │
│                                                                 │
│ Framework Adapter (예: @h6s/calendar-react)는 편의 레이어로,    │
│ Core 위에서 레이아웃 유틸리티를 조합하여 matrix, weekdays 등을   │
│ 제공할 수 있다. 이것은 철학 위반이 아니라 레이어 분리이다.        │
│                                                                 │
│   Core:     cells (1D)  ← 프리미티브, 순수                      │
│   Adapter:  cells + matrix + weekdays  ← 편의, 조합             │
└─────────────────────────────────────────────────────────────────┘
```

**핵심**: Core를 수정하지 않고 Adapter에서 유틸리티를 조합하므로, Core의 순수성은 유지된다.

#### 기본 Hook + 프리셋

```typescript
import { useTimeGrid, presets } from '@h6s/calendar-react';

// 프리셋 사용: 월간 달력
// weekStartsOn은 Grid 옵션에서 한 번만 설정
const grid = useTimeGrid({
  adapter: dateFnsAdapter,
  range: monthRange(cursor),
  cellUnit: 'day',
  weekStartsOn: 1,                    // Grid가 단일 소스
  layout: presets.monthCalendar(),    // 프리셋은 grid.weekStartsOn 참조
});

// grid.matrix: Cell[][] (2D 배열, 패딩 포함)
// grid.cells: Cell[] (1D 배열, Core 원본)

// 프리셋 사용: GitHub 잔디
const grid = useTimeGrid({
  adapter: dateFnsAdapter,
  range: yearRange(2025),
  cellUnit: 'day',
  layout: presets.yearGrass(),
});

// grid.weekdays: Cell[][] (요일별 그룹)
```

#### 전용 Hook

전용 Hook은 내부적으로 Grid를 생성하므로, weekStartsOn을 받아서 Grid에 전달한다.

```typescript
import {
  useMonthGrid,
  useWeekGrid,
  useDayGrid,
  useYearGrid,
} from '@h6s/calendar-react';

// 월간 달력 전용
function MonthCalendar() {
  // weekStartsOn은 내부 Grid 생성 시 사용됨
  const grid = useMonthGrid(cursor, {
    weekStartsOn: 1,                  // 내부적으로 Grid에 전달
    plugins: [navigation(), selection()],
  });

  return (
    <div>
      {grid.matrix.map((week, i) => (
        <div key={i} className="week">
          {week.map(cell => (
            <div
              key={cell.key}
              className={cn({
                'opacity-30': cell.isPadding,
                'bg-blue-500': cell.isToday,
              })}
            >
              {cell.dayOfMonth}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

// GitHub 잔디 전용
function ContributionGraph() {
  const grid = useYearGrid(2025, {
    data: contributions,
    getItemDate: (c) => c.date,
  });

  return (
    <div className="flex">
      {grid.weekdays.map((days, weekdayIndex) => (
        <div key={weekdayIndex} className="flex flex-col">
          {days.map(cell => (
            <div
              key={cell.key}
              className={getIntensityClass(cell.data[0]?.count)}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
```

#### 프리셋 vs 유틸리티 직접 사용

| 방식 | 장점 | 단점 |
|------|------|------|
| **프리셋** (`presets.monthCalendar`) | 간편, 빠른 시작 | 커스터마이징 제한 |
| **전용 Hook** (`useMonthGrid`) | 더 간편, 타입 최적화 | 유연성 낮음 |
| **유틸리티 직접** (`pipe + groupBy`) | 최대 유연성 | 코드량 증가 |

**권장:**
- 일반 사용자: 전용 Hook 또는 프리셋
- 커스텀 UI: 유틸리티 직접 사용

---

## 5. 플러그인 시스템 설계

### 5.0 Core vs Plugin 구분 기준

#### 판단 기준

| 기준 | Core | Plugin |
|------|------|--------|
| **필수성** | 모든 사용자가 필요 | 일부만 필요 |
| **상태** | 상태 없음 (순수 데이터) | 상태 있음 (selected, cursor 등) |
| **구현 방식** | 단일 구현 | 여러 구현 가능 |
| **역할** | 확장점 제공 | Core를 확장 |

#### 판단 플로우차트

```
기능 X를 어디에 넣을까?
    │
    ▼
상태 관리가 필요한가? ─── Yes ──→ Plugin
    │
    No
    ▼
모든 사용자가 필요한가? ─── No ──→ Plugin
    │
    Yes
    ▼
구현 방식이 여러 가지인가? ─── Yes ──→ Plugin
    │
    No
    ▼
  Core
```

#### 구체적 분류

| 기능 | 위치 | 이유 |
|------|------|------|
| `cells` | Core | 그리드의 본질 (1D 배열) |
| `range`, `cellUnit` | Core | 그리드 정의 자체 |
| `getCellByDate()` | Core | 순수 함수, 상태 없음 |
| `getCellProps()` 기반 | Core | 플러그인 확장점 |
| `isToday` | Core | 모든 캘린더가 필요 |
| `weekday` | Core | 날짜의 본질적 속성 |
| `isWeekend()` | Utils | 선택적 (업무용 캘린더는 불필요) |
| `navigation` | Plugin | cursor 상태 필요 |
| `selection` | Plugin | selected 상태 + 여러 모드 (single/range) |
| `events` | Plugin | 복잡한 배치 로직 + 선택적 |
| `a11y` | Plugin | focus 상태 + 선택적 |
| `holidays` | Plugin | 선택적 |

**원칙:**
> Core는 "캘린더 그리드의 본질"만.
> 상태가 필요하거나, 선택적이거나, 여러 구현이 가능하면 Plugin.

### 5.1 핵심 철학: 모든 Plugin은 동등하다

**TanStack 철학:**

1. **Explicit over Implicit** - 마법 없음, 명시적
2. **No second-class citizens** - 공식/커스텀 구분 없음
3. **User has control** - 사용자가 제어권 가짐
4. **First-class extensibility** - 확장이 핵심

#### 하이브리드 접근법의 문제 (❌ 채택하지 않음)

```typescript
// ❌ 하이브리드: 두 가지 방식 = 혼란
useTimeGrid({
  // "공식" 플러그인은 옵션으로
  navigation: { step: 'month' },
  selection: { mode: 'single' },

  // "커스텀" 플러그인은 배열로
  plugins: [withHolidays(...)],
});

// 문제:
// - "왜 holidays는 plugins에 넣어야 해?"
// - 커스텀이 2등 시민처럼 느껴짐
// - 커뮤니티 플러그인 생태계 저해
```

#### 올바른 접근법: 모든 것이 Plugin

```typescript
// ✅ 모든 기능이 동등한 플러그인
useTimeGrid({
  adapter: dateFnsAdapter,
  range: monthRange(date),
  cellUnit: 'day',

  plugins: [
    navigation({ step: 'month' }),      // "공식" 플러그인
    selection({ mode: 'single' }),      // "공식" 플러그인
    events({ data: myEvents }),         // "공식" 플러그인
    holidays({ data: koreanHolidays }), // 커뮤니티 플러그인도 동일!
    recurring({ rrule: '...' }),        // 커뮤니티 플러그인도 동일!
  ],
});
```

**장점:**
- 하나의 패턴 (배우기 쉬움)
- 공식/커스텀 구분 없음 (모두 동등)
- 순서가 명시적 (적용 순서 = 배열 순서)
- 커뮤니티 플러그인 생태계 촉진
- Tree-shaking 완벽 (안 쓰는 플러그인은 번들에 안 들어감)

#### 플러그인 import가 곧 문서

```typescript
// 뭘 쓰는지 import만 봐도 알 수 있음
import { navigation, selection, events } from '@h6s/calendar/plugins';
import { holidays } from '@h6s/calendar-plugin-holidays';  // 커뮤니티
import { recurring } from '@h6s/calendar-plugin-recurring'; // 커뮤니티
```

**"공식 플러그인"은 그냥 "우리가 먼저 만든 플러그인"일 뿐.**
커뮤니티 플러그인과 기술적으로 완전히 동등하다.

### 5.2 플러그인 인터페이스

```typescript
interface TimeGridPlugin<TState = unknown, TApi = unknown> {
  name: string;

  // 상태 초기화
  getInitialState?: () => TState;

  // 셀 속성 확장
  extendCellProps?: (cell: Cell, state: TState) => Record<string, unknown>;

  // 그리드 API 확장
  extendGridApi?: (grid: TimeGrid, state: TState) => TApi;

  // 그리드 결과 변환
  transformGrid?: (grid: TimeGrid, state: TState) => TimeGrid;

  // 다른 플러그인 의존성
  dependencies?: string[];
}
```

### 5.3 플러그인 예시: Selection

```typescript
const selectionPlugin: TimeGridPlugin<SelectionState, SelectionApi> = {
  name: 'selection',

  getInitialState: () => ({
    selected: null,
    mode: 'single',
  }),

  extendCellProps: (cell, state) => ({
    isSelected: isSelected(cell, state.selected),
    isInSelectionRange: isInRange(cell, state.selected),
    onClick: () => state.select(cell),
  }),

  extendGridApi: (grid, state) => ({
    selection: {
      selected: state.selected,
      select: (cell) => { /* ... */ },
      selectRange: (start, end) => { /* ... */ },
      clear: () => { /* ... */ },
    },
  }),
};
```

### 5.4 플러그인 예시: Events (임의 시간 범위 처리)

Events Plugin은 **Cell과 별개로** 임의의 시간 범위를 가진 데이터를 그리드 위에 배치한다.

```typescript
import { useTimeGrid } from '@h6s/calendar-react';
import { events } from '@h6s/calendar/plugins';

// 이벤트 데이터 (임의의 시간 범위)
const myEvents = [
  { id: '1', title: '회의', start: '2026-01-12T09:30', end: '2026-01-12T11:45' },
  { id: '2', title: '점심', start: '2026-01-12T12:00', end: '2026-01-12T13:00' },
];

const grid = useTimeGrid({
  adapter: dateFnsAdapter,
  range: dayRange('2026-01-12'),
  cellUnit: 'hour',
  plugins: [
    events({
      data: myEvents,
      getEventRange: (e) => ({ start: e.start, end: e.end }),
    }),
  ],
});

// 이벤트 배치 정보 조회
grid.getEventPosition(myEvents[0]);
// {
//   top: 0.5,           // 9:30 = 9시 셀에서 50% 아래 위치
//   height: 2.25,       // 2시간 15분 = 2.25 셀 높이
//   column: 0,          // 겹침 처리 시 열 번호
//   totalColumns: 1,    // 총 겹침 열 수
//   startsInView: true, // 뷰 내에서 시작하는지
//   endsInView: true,   // 뷰 내에서 끝나는지
// }

// 특정 셀과 겹치는 이벤트 조회
grid.getEventsForCell(cell);
// [{ id: '1', ... }, { id: '2', ... }]
```

**렌더링 예시: Google Calendar 스타일 Day View**

```tsx
import { useTimeGrid } from '@h6s/calendar-react';
import { events } from '@h6s/calendar/plugins';

function DayView({ myEvents }) {
  const grid = useTimeGrid({
    adapter: dateFnsAdapter,
    range: dayRange(cursor),
    cellUnit: 'hour',
    plugins: [
      events({ data: myEvents }),
    ],
  });

  return (
    <div className="day-view" style={{ position: 'relative' }}>
      {/* 레이어 1: 배경 시간 슬롯 (Cell) */}
      <div className="time-slots">
        {grid.cells.map(cell => (
          <div key={cell.key} className="hour-slot" style={{ height: CELL_HEIGHT }}>
            {format(cell.date, 'HH:mm')}
          </div>
        ))}
      </div>

      {/* 레이어 2: 이벤트 오버레이 (Event) */}
      <div className="events-layer">
        {myEvents.map(event => {
          const pos = grid.getEventPosition(event);
          return (
            <div
              key={event.id}
              className="event"
              style={{
                position: 'absolute',
                top: pos.top * CELL_HEIGHT,
                height: pos.height * CELL_HEIGHT,
                left: `${(pos.column / pos.totalColumns) * 100}%`,
                width: `${100 / pos.totalColumns}%`,
              }}
            >
              {event.title}
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

**핵심 포인트:**
- Cell은 "그리드 눈금" (균일, Point + Unit)
- Event는 "그 위에 그려지는 데이터" (임의 범위)
- Events Plugin이 배치 계산 (위치, 높이, 겹침 처리)

### 5.5 플러그인 타입 추론

plugins 배열에서 타입이 자동으로 추론된다:

```typescript
// useTimeGrid 시그니처
function useTimeGrid<
  TData,
  TDate,
  const TPlugins extends readonly Plugin[]  // const로 튜플 추론
>(options: {
  adapter: DateAdapter<TDate>;
  range: TimeRange;
  cellUnit: CellUnit;
  plugins?: TPlugins;
}): TimeGrid<TData, TDate> & InferPluginTypes<TPlugins>;
```

```typescript
// 사용 예시
const grid = useTimeGrid({
  adapter: dateFnsAdapter,
  range: monthRange(date),
  cellUnit: 'day',
  plugins: [
    navigation({ step: 'month' }),
    selection({ mode: 'single' }),
  ],
});

// 타입 추론 완벽하게 동작
grid.navigation.goNext();         // ✅ navigation 플러그인에서 추론
grid.selection.select(cell);      // ✅ selection 플러그인에서 추론
grid.holidays.isHoliday(cell);    // ❌ Error: holidays 플러그인 없음
```

### 5.6 커스텀 플러그인 만들기

```typescript
// 1. 플러그인이 추가하는 타입 정의
interface WithHolidays<TData, TDate> {
  holidays: {
    isHoliday: (cell: Cell<TData, TDate>) => boolean;
    getHolidayName: (cell: Cell<TData, TDate>) => string | null;
  };
}

// 2. 플러그인 팩토리 함수
function holidays<TData, TDate>(
  options: { data: Holiday[] }
): Plugin<TimeGrid<TData, TDate>, WithHolidays<TData, TDate>> {

  return (grid) => {
    const holidayMap = new Map(
      options.data.map(h => [h.date, h.name])
    );

    return {
      ...grid,
      getCellProps: (cell) => ({
        ...grid.getCellProps(cell),
        'data-holiday': holidayMap.has(toISODate(cell.date)),
      }),
      holidays: {
        isHoliday: (cell) => holidayMap.has(toISODate(cell.date)),
        getHolidayName: (cell) => holidayMap.get(toISODate(cell.date)) ?? null,
      },
    };
  };
}

// 3. 사용 - 공식 플러그인과 동일한 방식
const grid = useTimeGrid({
  plugins: [
    navigation({ step: 'month' }),
    holidays({ data: koreanHolidays }),  // 커스텀도 동등!
  ],
});

grid.holidays.isHoliday(cell);  // ✅ 타입 추론 동작
```

### 5.7 플러그인 조합

```typescript
// 기본: createTimeGrid의 plugins 옵션으로 전달
const grid = createTimeGrid({
  ...options,
  plugins: [
    navigation({ step: 'month' }),
    selection({ mode: 'range' }),
    a11y({ locale: 'ko-KR' }),
    events({ data: myEvents }),
  ],
});

// React Hook에서도 동일
const grid = useTimeGrid({
  ...options,
  plugins: [
    navigation({ step: 'month' }),
    selection({ mode: 'range' }),
  ],
});

// 고급: pipe로 동적 조합 (런타임에 조건부로 플러그인 추가 시)
const enhancedGrid = pipe(baseGrid, dynamicPlugins);
```

---

## 6. 접근성 설계

### 6.1 A11y Plugin

헤드리스라도 접근성 **로직**은 제공해야 한다:

```typescript
import { useTimeGrid } from '@h6s/calendar-react';
import { navigation, selection, a11y } from '@h6s/calendar/plugins';

const grid = useTimeGrid({
  adapter: dateFnsAdapter,
  range: monthRange(cursor),
  cellUnit: 'day',
  plugins: [
    navigation({ step: 'month' }),
    selection({ mode: 'single' }),
    a11y({ locale: 'ko-KR', announcements: true }),  // 접근성 플러그인
  ],
});

// getCellProps가 ARIA 속성 자동 생성
grid.getCellProps(cell);
// {
//   role: 'gridcell',
//   'aria-label': '2026년 1월 12일 월요일',
//   'aria-selected': false,
//   'aria-disabled': false,
//   tabIndex: cell.isToday ? 0 : -1,
// }

// 키보드 네비게이션
grid.a11y.handleKeyDown(event);  // Arrow keys, Enter, Escape
grid.a11y.focusedCell;
grid.a11y.setFocus(cell);
```

### 6.2 ARIA 가이드라인 준수

```typescript
interface A11yGridProps {
  role: 'grid';
  'aria-label': string;
  'aria-describedby'?: string;
}

interface A11yCellProps {
  role: 'gridcell';
  'aria-label': string;
  'aria-selected'?: boolean;
  'aria-disabled'?: boolean;
  'aria-current'?: 'date';
  tabIndex: number;
}
```

---

## 7. 성능 최적화 전략

### 7.1 Lazy Evaluation

```typescript
// 모든 셀을 미리 계산하지 않음
const grid = createTimeGrid({
  // ...
  lazy: true,  // 기본값
});

// 필요할 때만 계산
grid.getCellByDate(date);      // 해당 셀만 계산
grid.getCellsInViewport(0, 42); // 뷰포트 내 셀만 계산
```

### 7.2 Virtualization 지원

```typescript
// 가상화 라이브러리와 호환되는 API
const grid = createTimeGrid({ ... });

// react-virtual과 함께 사용
const virtualizer = useVirtualizer({
  count: grid.cellCount,
  getScrollElement: () => parentRef.current,
  estimateSize: () => 40,
});

virtualizer.getVirtualItems().map(virtualItem => {
  const cell = grid.cells[virtualItem.index];
  // render cell
});
```

### 7.3 Structural Sharing

```typescript
// 이전 결과와 비교하여 변경된 셀만 새 객체 생성
const prevGrid = grid.snapshot();
grid.navigation.goNext();
const nextGrid = grid.snapshot();

// prevGrid.cells[0] === nextGrid.cells[0] (변경 없으면 동일 참조)
```

### 7.4 Memoization 전략

```typescript
// React 어댑터 내부
function useTimeGrid(options) {
  // 옵션 변경 시에만 재계산
  const grid = useMemo(() => createTimeGrid(options), [
    options.range.start,
    options.range.end,
    options.cellUnit,
  ]);

  // 데이터 변경은 별도 추적
  useEffect(() => {
    grid.setData(options.data);
  }, [options.data]);

  return useSyncExternalStore(grid.subscribe, grid.getSnapshot);
}
```

---

## 8. 마이그레이션 전략

### 8.1 현재 API와의 호환 레이어

```typescript
// @h6s/calendar-compat: 기존 useCalendar API 유지
import { useCalendar } from '@h6s/calendar-compat';

// 내부적으로 새 코어 사용, 기존 API 형태로 변환
const { headers, body, navigation, view } = useCalendar({
  defaultDate: new Date(),
  defaultWeekStart: 0,
  defaultViewType: CalendarViewType.Month,
});
```

### 8.2 점진적 마이그레이션

```
Phase 1: @h6s/calendar-core 개발 (새 코어)
Phase 2: @h6s/calendar-react 개발 (React 어댑터)
Phase 3: @h6s/calendar-compat 개발 (호환 레이어)
Phase 4: 기존 @h6s/calendar를 compat으로 교체
Phase 5: 새 API 문서화 및 마이그레이션 가이드
Phase 6: compat deprecation 예고
```

---

## 9. 기존 보고서 제안과의 비교

| 제안 | 기존 보고서 | 이 보고서 |
|------|-------------|-----------|
| 이벤트 관리 | 코어에 내장 | 플러그인 (`@h6s/calendar-plugin-events`) |
| 선택 기능 | 코어에 내장 | 플러그인 (`@h6s/calendar-plugin-selection`) |
| 접근성 | 헬퍼 함수 추가 | 플러그인 + getCellProps 패턴 |
| i18n | 로케일 옵션 | DateAdapter 레벨에서 처리 |
| 타임존 | date-fns-tz 통합 | DateAdapter 교체로 해결 |
| date-fns 탈피 | 어댑터 패턴 | ✅ 동일 |
| 플러그인 시스템 | "확장 가능하게" | 구체적 인터페이스 정의 |
| 프레임워크 확장 | 미래 고려사항 | 1일차부터 core/adapter 분리 |

---

## 10. 왜 이 접근법인가?

### 10.1 TanStack의 교훈

TanStack Table은 "테이블"이 아니라 **"데이터를 행/열로 다루는 방법"**을 추상화했다.

그래서:
- 테이블이 아닌 UI (카드, 칸반)에도 사용 가능
- 프레임워크 무관
- 필요한 기능만 조립 가능

### 10.2 진정한 Headless Calendar

"Headless"는 "UI가 없다"가 아니라 **"특정 UI 패턴에 종속되지 않는다"**를 의미해야 한다.

현재 @h6s/calendar:
```
"월간/주간/일간 뷰를 위한 데이터"를 제공
→ 특정 UI 패턴에 종속
→ 진정한 headless가 아님
```

새로운 @h6s/calendar:
```
"시간을 그리드로 매핑하는 로직"을 제공
→ 어떤 시간 기반 UI든 표현 가능
→ 진정한 headless
```

### 10.3 확장성

기능을 코어에 넣으면 → 모두가 그 기능을 로드
기능을 플러그인으로 → 필요한 것만 로드

번들 사이즈, 개념적 복잡도, 유지보수 모두 유리.

---

## 11. 구현 우선순위

### Phase 1: Foundation (MVP)
1. `@h6s/calendar-core` - 순수 JS 코어
2. `@h6s/calendar-adapter-datefns` - date-fns 어댑터 (기존 사용자용)
3. `@h6s/calendar-react` - React 어댑터
4. 기본 예제: 월간 달력

### Phase 2: Essential Plugins
5. `@h6s/calendar-plugin-navigation` - 탐색
6. `@h6s/calendar-plugin-selection` - 선택
7. `@h6s/calendar-plugin-a11y` - 접근성

### Phase 3: Compatibility
8. `@h6s/calendar-compat` - 기존 API 호환
9. 마이그레이션 가이드

### Phase 4: Ecosystem
10. `@h6s/calendar-adapter-temporal` - Temporal API
11. `@h6s/calendar-plugin-events` - 이벤트 배치
12. `@h6s/calendar-vue` - Vue 어댑터
13. 다양한 예제 (GitHub 잔디, 타임라인, 예약 시스템)

---

## 12. 결론

### 기존 보고서의 접근법
> "현재 구조에 기능을 더하자"

결과: 기능이 많지만 유연하지 않은 라이브러리

### 이 보고서의 접근법
> "추상화 수준을 바꾸자"

결과: 어떤 시간 기반 UI든 표현할 수 있는 프리미티브 툴킷

---

**핵심 메시지:**

> "Global #1 Headless Calendar"가 되려면,
> "캘린더 훅"이 아니라 "시간 그리드 프리미티브"를 만들어야 한다.
>
> TanStack Table이 "테이블"이 아니라 "데이터 그리드 로직"을 추상화했듯이,
> @h6s/calendar는 "달력"이 아니라 "시간-그리드 매핑"을 추상화해야 한다.

---

## 부록: 참고 자료

- [TanStack Table Architecture](https://tanstack.com/table/latest/docs/introduction)
- [TanStack Core Architecture - DeepWiki](https://deepwiki.com/tanstack/table/2.1-core-architecture)
- [Headless UI Philosophy](https://tanstack.com/table/latest)

---

**문서 버전**: 2.0
**작성자**: Claude (Opus 4.5)
**라이센스**: MIT

### 변경 이력

| 버전 | 날짜 | 변경 내용 |
|------|------|-----------|
| 1.0 | 2026-01-12 | 최초 작성 |
| 1.1 | 2026-01-13 | Cell vs Event 구분 명확화. Cell은 Point + Unit 방식으로 단순화, Event는 Range 방식으로 분리. Google Calendar 스타일 Day View 예시 추가. |
| 1.2 | 2026-01-13 | "모든 것이 Plugin" 철학 추가. 하이브리드 방식 폐기, 공식/커스텀 플러그인 동등화. 플러그인 타입 추론 및 커스텀 플러그인 작성 가이드 추가. |
| 1.3 | 2026-01-13 | Core vs Plugin 구분 기준 추가 (섹션 5.0). 판단 플로우차트 및 구체적 분류표 포함. |
| 1.4 | 2026-01-13 | 전체 문서 일관성 검토. 플러그인 import 스타일 통일 (`navigation`, `selection`, `events` 등), Core 인터페이스에서 Navigation 제거 (Plugin으로 이동), 예제 코드 현대화. |
| 1.5 | 2026-01-13 | `getDataDate` → `getItemDate`로 명칭 변경. TanStack의 `getRowId` 패턴과 일관성 있는 네이밍으로 통일. |
| 1.6 | 2026-01-13 | 섹션 4.3에 시각적 다이어그램 추가 (월간 달력, GitHub 잔디, 일간 타임라인, 주간 시간표, N-day 뷰). 섹션 4.6 "Navigation 심화" 추가: range와 cursor 관계, 드롭다운으로 월/연도 점프, Navigation Plugin 장점 비교. |
| 1.7 | 2026-01-13 | `weekStartsOn` 설정 추가. DateAdapter에서 로케일 기반 기본값 제공 + Core 레벨에서 명시적 오버라이드 가능. DateAdapter 인터페이스에 `getWeekStartsOn()`, `startOfWeek()` 추가. |
| 1.8 | 2026-01-13 | **Core 단순화**: `rows`와 `shape` 옵션 Core에서 제거. Core는 `cells` 1D 배열만 반환. 섹션 4.7 "레이아웃 유틸리티" 추가 (`groupBy`, `withPadding`, `toMatrix`). 섹션 4.8 "React Hook 프리셋" 추가 (`useMonthGrid`, `useYearGrid` 등). TanStack 철학 준수: 프리미티브 + 유틸리티 조합. |
| 1.9 | 2026-01-13 | **일관성 검토**: 섹션 2.4 Cell 인터페이스에 `dayOfMonth`, `month`, `year` 추가 (섹션 4.2와 동기화). 섹션 4.5, 4.6의 예제를 `useMonthGrid` + `grid.matrix` 패턴으로 통일. 섹션 5.0 분류표에서 `rows` 제거. |
| 2.0 | 2026-01-13 | **비일관성 수정**: (1) `isWeekend`를 Core Cell에서 제거, 유틸리티 함수로 이동 (업무용 캘린더는 불필요). (2) `weekStartsOn` 중복 제거 - Grid가 단일 소스, 유틸리티는 `grid.weekStartsOn` 참조. (3) 섹션 4.8에 "철학적 위치: Core vs Framework Adapter" 추가 - 프리셋/편의 Hook이 철학 위반이 아님을 명시. |

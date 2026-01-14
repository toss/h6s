# @h6s/calendar PoC 계획

> **작성일**: 2026-01-13
> **관련 문서**: [tanstack-style-rearchitecture.md](./tanstack-style-rearchitecture.md) v2.0

## 목적

TanStack 스타일 리아키텍처의 **핵심 가정들을 검증**하기 위한 최소한의 구현.

### PoC가 증명해야 할 것

| 가정 | 검증 방법 |
|------|----------|
| "시간 그리드 프리미티브"가 다양한 UI를 표현 가능 | 동일 cells로 월간/잔디/타임라인 3개 UI 구현 |
| DateAdapter로 날짜 라이브러리 교체 가능 | mock + date-fns 두 어댑터로 동일 결과 |
| Plugin 타입 추론이 실제로 동작 | 2-3개 플러그인 조합 시 IDE 자동완성 |
| Core가 진정한 zero-dependency | 빌드 결과에 외부 의존성 없음 |

### PoC가 증명하지 않아도 되는 것

- 완전한 Navigation/Selection/Events 플러그인
- Vue/Solid/Svelte 어댑터
- 모든 타임존 엣지 케이스
- A11y 완전 구현
- 성능 최적화

---

## 구현 범위

### Phase 1: Core 기반 (~300 LOC)

#### 1.1 DateAdapter 인터페이스 및 구현

```
packages/calendar-core/src/
├── adapter/
│   ├── types.ts          # DateAdapter<TDate> 인터페이스
│   └── mock.ts           # 테스트용 mock 어댑터
└── index.ts
```

**구현할 메서드** (10개):
- `addDays`, `startOfMonth`, `startOfWeek`
- `isSame`, `isBefore`
- `today`, `getDay`, `getMonth`, `getYear`
- `getWeekStartsOn`

**검증 포인트**:
- 10개 메서드로 충분한가?
- 추가 필요한 메서드가 있는가?

#### 1.2 Core API: createTimeGrid

```
packages/calendar-core/src/
├── core/
│   ├── createTimeGrid.ts   # 핵심 함수
│   ├── types.ts            # Cell, TimeGrid, TimeRange
│   └── index.ts
```

**입력**:
```typescript
createTimeGrid({
  adapter: DateAdapter,
  range: { start, end },
  cellUnit: 'day' | 'hour',
  weekStartsOn?: 0-6,
  data?: T[],
  getItemDate?: (item: T) => TDate,
})
```

**출력**:
```typescript
interface TimeGrid<TData, TDate> {
  cells: Cell<TData, TDate>[];
  range: TimeRange;
  cellUnit: CellUnit;
  weekStartsOn: WeekDay;
  getCellByDate(date: TDate): Cell | null;
}
```

**검증 포인트**:
- 2026년 1월 생성 시 31개 셀 정확히 생성되는가?
- weekStartsOn이 다르면 cell.weekday 순서가 달라지는가?
- data binding이 올바르게 동작하는가?

#### 1.3 유틸리티 함수

```
packages/calendar-core/src/
├── utils/
│   ├── groupBy.ts       # 셀 그룹화 (week/weekday/hour)
│   ├── withPadding.ts   # 패딩 셀 추가
│   ├── toMatrix.ts      # 1D → 2D 변환
│   ├── isWeekend.ts     # 주말 판별
│   └── index.ts
```

**검증 포인트**:
- `groupBy(grid, 'week')`: 월간 달력 주 단위 그룹화
- `groupBy(grid, 'weekday')`: GitHub 잔디 요일 단위 그룹화
- `withPadding(grid)`: 이전/다음 달 날짜 추가
- `toMatrix(cells, 7)`: 7열 2D 배열 변환

---

### Phase 2: Plugin 시스템 (~200 LOC)

#### 2.1 Plugin 인터페이스

```
packages/calendar-core/src/
├── plugin/
│   ├── types.ts         # Plugin 인터페이스
│   ├── pipe.ts          # 플러그인 조합 함수 (고급 사용자용)
│   └── index.ts
```

**Plugin 인터페이스**:
```typescript
interface Plugin<TGrid, TExtension> {
  name: string;
  extend: (grid: TGrid) => TGrid & TExtension;
}
```

**사용법** (createTimeGrid의 plugins 옵션):
```typescript
const grid = createTimeGrid({
  adapter,
  range: { start, end },
  cellUnit: 'day',
  plugins: [selection({ mode: 'single' })],
});

// 타입 추론 동작
grid.selection.select(cell);
```

**검증 포인트**:
- plugins 옵션으로 전달 시 타입이 올바르게 병합되는가?
- `grid.pluginA.method()` + `grid.pluginB.method()` 자동완성

#### 2.2 샘플 플러그인

```
packages/calendar-core/src/
├── plugins/
│   └── selection.ts     # 선택 플러그인 (최소 버전)
```

**Selection Plugin** (최소 구현):
```typescript
selection({ mode: 'single' | 'range' })
→ {
  selection: {
    selected: Cell | null,
    select: (cell) => void,
    clear: () => void,
    isSelected: (cell) => boolean,
  }
}
```

**검증 포인트**:
- 플러그인 타입 추론이 동작하는가?
- 커스텀 플러그인이 동일한 인터페이스로 작성 가능한가?

---

### Phase 3: React 어댑터 (~150 LOC)

```
packages/calendar-react/src/
├── useTimeGrid.ts       # React Hook
├── adapters/
│   └── dateFns.ts       # date-fns 어댑터
└── index.ts
```

**useTimeGrid Hook**:
```typescript
function useTimeGrid<TData, TDate, TPlugins>(options: {
  adapter: DateAdapter<TDate>,
  range: TimeRange,
  cellUnit: CellUnit,
  plugins?: TPlugins,
}): TimeGrid<TData, TDate> & InferPluginTypes<TPlugins>
```

**검증 포인트**:
- 상태 변경 시 리렌더링이 올바르게 동작하는가?
- 플러그인 타입 추론이 React Hook에서도 동작하는가?

---

### Phase 4: 데모 UI (~200 LOC)

```
packages/calendar-demo/src/
├── MonthCalendar.tsx    # 전통적 월간 달력
├── GithubGrass.tsx      # GitHub 잔디 스타일
├── DayTimeline.tsx      # 일간 타임라인
└── App.tsx              # 3개 UI 동시 렌더링
```

**검증 포인트**:
- 동일한 `createTimeGrid` 결과로 3개 완전히 다른 UI 렌더링
- 유틸리티 조합만으로 레이아웃 변환

---

## 검증 체크리스트

### 아키텍처 검증

| # | 검증 항목 | 성공 기준 |
|---|----------|----------|
| 1 | Core zero-dependency | `package.json`에 dependencies 없음 |
| 2 | DateAdapter 교체 | mock과 date-fns 동일 결과 |
| 3 | 3개 UI 패턴 | 동일 cells로 월간/잔디/타임라인 렌더링 |
| 4 | Plugin 타입 추론 | IDE에서 모든 플러그인 메서드 자동완성 |
| 5 | 커스텀 플러그인 | 공식과 동일한 방식으로 동작 |

### 기능 검증

| # | 검증 항목 | 성공 기준 |
|---|----------|----------|
| 1 | 월간 셀 생성 | 2026년 1월 → 31개 셀, 정확한 날짜 |
| 2 | weekStartsOn | 0(일) vs 1(월) 시 다른 그룹화 결과 |
| 3 | withPadding | 이전/다음 달 날짜가 isPadding: true |
| 4 | Selection | select/clear/isSelected 동작 |
| 5 | 리렌더링 | 상태 변경 시 UI 업데이트 |

### 엣지 케이스

| # | 케이스 | 검증 방법 |
|---|--------|----------|
| 1 | 단일 날짜 범위 | `range: { start: '2026-01-01', end: '2026-01-01' }` |
| 2 | 빈 데이터 | `data: []` 시 에러 없음 |
| 3 | 윤년 2월 | 2024년 2월 29일 포함 |

---

## 파일 구조 (예상)

```
packages/
├── calendar-core/           # ~500 LOC
│   ├── src/
│   │   ├── adapter/
│   │   │   ├── types.ts
│   │   │   └── mock.ts
│   │   ├── core/
│   │   │   ├── createTimeGrid.ts
│   │   │   └── types.ts
│   │   ├── utils/
│   │   │   ├── groupBy.ts
│   │   │   ├── withPadding.ts
│   │   │   ├── toMatrix.ts
│   │   │   └── isWeekend.ts
│   │   ├── plugin/
│   │   │   ├── types.ts
│   │   │   └── pipe.ts
│   │   ├── plugins/
│   │   │   └── selection.ts
│   │   └── index.ts
│   ├── package.json         # dependencies: {} (empty!)
│   └── tsconfig.json
│
├── calendar-react/          # ~150 LOC
│   ├── src/
│   │   ├── useTimeGrid.ts
│   │   ├── adapters/
│   │   │   └── dateFns.ts
│   │   └── index.ts
│   └── package.json
│
└── calendar-demo/           # ~200 LOC
    ├── src/
    │   ├── MonthCalendar.tsx
    │   ├── GithubGrass.tsx
    │   ├── DayTimeline.tsx
    │   └── App.tsx
    └── package.json
```

---

## 예상 총 코드량

| 패키지 | LOC | 비고 |
|--------|-----|------|
| calendar-core | ~500 | 테스트 제외 |
| calendar-react | ~150 | Hook + date-fns 어댑터 |
| calendar-demo | ~200 | 3개 데모 UI |
| **합계** | **~850** | |

---

## 성공/실패 기준

### 성공 시
- 문서 v2.0의 아키텍처가 실현 가능함을 증명
- 본격 구현 진행

### 실패 시 (발견할 수 있는 문제)
- DateAdapter 인터페이스 불충분 → 메서드 추가 필요
- Plugin 타입 추론 실패 → 다른 패턴 필요
- 유틸리티 조합 불가 → Core 수정 필요

**PoC의 진짜 가치**: 실패해도 일찍 발견하면 방향 수정 가능

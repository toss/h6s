# @h6s/calendar V2 아키텍처: `useTimeGrid` (가칭)

## 1. 개요 (Overview)

기존 `useCalendar`의 구조적 한계(7일 고정, 월 중심 로직)를 극복하기 위해, **하위 호환성을 고려한 억지 통합 대신 완전히 새로운 Time Grid Engine Hook(`useTimeGrid`)을 개발**합니다.

이 새로운 훅은 **"Headless Time Grid"**를 지향하며, 어떤 형태의 시계열 UI(Calendar, Heatmap, Timeline, Gantt 등)도 소화할 수 있는 유연한 엔진 역할을 합니다.

---

## 2. 설계 철학 (Design Philosophy)

1.  **Breaking Free from "Calendar"**: '달력'이라는 메타포를 버리고 '시간 그리드(Time Grid)'로 접근합니다.
2.  **Native 2D Matrix**: UI 렌더링에 최적화된 2차원 배열 구조를 기본으로 반환합니다.
3.  **Strategy-First**: 모든 계산 로직(범위, 그리드 생성, 이동)은 외부에서 주입된 `GridStrategy`가 담당합니다.
4.  **No Legacy Burden**: 기존 v1 로직과의 호환성을 위해 설계를 타협하지 않습니다.

---

## 3. 핵심 인터페이스 (Core Interfaces)

### 3.1 Cell & Matrix
```typescript
interface GridCell<T = unknown> {
  value: Date;      // 셀의 기준 시간
  row: number;      // 그리드 상의 행 인덱스
  col: number;      // 그리드 상의 열 인덱스
  context?: T;      // 전략별 커스텀 메타데이터 (선택적)

  // 상태 플래그 (Strategy에서 계산하여 주입)
  isMain: boolean;  // 현재 뷰의 핵심 범위 포함 여부
}

interface GridMatrix<T = unknown> {
  rows: number;
  cols: number;
  data: GridCell<T>[][]; // 2D 배열
}
```

### 3.2 Axis Header
```typescript
interface AxisHeader {
  index: number;
  label: string | number; // 기본값 (전략이 제공)
  value: Date | unknown;  // 실제 값 (포맷팅용)
  span?: number;          // colSpan 또는 rowSpan
}
```

### 3.3 Grid Strategy
```typescript
interface GridStrategy<T = unknown> {
  /**
   * 뷰의 시작/종료 범위 계산
   */
  getRange(cursorDate: Date): { startDate: Date; endDate: Date };

  /**
   * 그리드 데이터 생성
   */
  createGrid(range: { startDate: Date; endDate: Date }, cursorDate: Date): GridMatrix<T>;

  /**
   * 헤더 정보 생성
   */
  getAxes(cursorDate: Date, range: { startDate: Date; endDate: Date }): {
    x: AxisHeader[]; // 상단 헤더 (Columns)
    y: AxisHeader[]; // 좌측 헤더 (Rows)
  };

  /**
   * 네비게이션 이동
   */
  navigate(cursorDate: Date, action: 'prev' | 'next'): Date;
}
```

---

## 4. `useTimeGrid` Hook API

```typescript
interface UseTimeGridOptions<T> {
  defaultDate?: Date;
  strategy: GridStrategy<T>; // 필수 주입
}

function useTimeGrid<T>({ defaultDate, strategy }: UseTimeGridOptions<T>) {
  // ... 내부 구현 ...
  return {
    cursorDate,
    grid: GridMatrix<T>,
    axes: { x: AxisHeader[], y: AxisHeader[] },
    navigation: {
      next: () => void,
      prev: () => void,
      setDate: (date: Date) => void,
    },
    // 필요 시 헬퍼 함수 제공 (ex: getCell(row, col))
  };
}
```

---

## 5. 제공될 내장 전략 (Built-in Strategies)

1.  **`MonthGridStrategy`**: 기존 달력과 동일 (7열, 가변 행). X축=요일.
2.  **`WeekGridStrategy`**: 1행 7열. X축=요일.
3.  **`DayRangeStrategy`**: N일 보기 (ex: 3일). X축=날짜.
4.  **`AnnualHeatmapStrategy`**: GitHub 스타일. Y축=요일, X축=주(월 라벨).

---

## 6. 네이밍 및 마이그레이션 전략 (Naming Strategy)

개발 단계에서는 혼동을 피하기 위해 **`useTimeGrid`**라는 이름을 사용하지만, 최종 릴리즈 시에는 다음과 같이 정리합니다.

1.  **`useCalendar` (v2)**: 새로운 `useTimeGrid` 엔진을 `useCalendar`라는 이름으로 export 합니다. 이것이 메인 훅이 됩니다.
2.  **`useLegacyCalendar`**: 기존 v1 `useCalendar` 로직은 이 이름으로 변경하여 export 합니다. 기존 사용자들은 import 이름만 바꾸면 됩니다.

> "모든 시간 그리드는 달력의 확장이다."라는 관점에서 `useCalendar` 이름을 계승합니다.

---

## 7. 개발 로드맵

### Phase 1: Foundation
*   `GridCell`, `GridMatrix`, `GridStrategy` 타입 정의.
*   `useTimeGrid` Hook 스캐폴딩.

### Phase 2: Implementation
*   `MonthGridStrategy` 구현 (v1 로직 마이그레이션).
*   `useTimeGrid` 구현 및 테스트.

### Phase 3: Expansion
*   `FixedDayStrategy` (n-day) 구현.
*   `HeatmapStrategy` 구현.

### Phase 4: Release
*   `@h6s/calendar` v2.0.0-alpha 배포.
*   기존 `useCalendar` → `useLegacyCalendar` 리네이밍.
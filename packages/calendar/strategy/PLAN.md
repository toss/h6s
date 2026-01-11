# @h6s/calendar 아키텍처 개편 계획: "Time Grid Engine"

## 1. 개요 및 비전

현재의 `@h6s/calendar`는 7일 주기의 월간/주간 뷰에 로직이 강하게 결합되어 있어, 다양한 형태의 시계열 시각화(Heatmap, n-day view, Timeline 등)를 구현하기 어렵습니다.

본 개편의 목표는 `useCalendar`를 특정 UI 형태에 종속되지 않는 **"시간 데이터를 2차원 그리드에 매핑하는 엔진"**으로 재정의하는 것입니다.

---

## 2. 핵심 설계 명세 (Core Specification)

### 2.1 GridStrategy 인터페이스
```typescript
interface CalendarCell {
  date: Date;
  row: number;
  col: number;
  // Metadata for styling/logic
  isToday: boolean;
  isCurrentMonth: boolean;
  isCurrentDate: boolean;
  isWeekend: boolean;
}

interface GridHeader {
  key: string;
  label: string; // ex: "Sun", "2024-01", "Mon"
  value: any;
}

interface GridStrategy {
  /** 뷰의 시작/종료 범위 계산 */
  getRange(cursorDate: Date): { startDate: Date; endDate: Date };
  
  /** 그리드 데이터 생성 (rows x cols 매트릭스) */
  createGrid(range: { startDate: Date; endDate: Date }, cursorDate: Date): {
    rows: number;
    cols: number;
    cells: CalendarCell[][];
  };

  /** 열(Column) 헤더 데이터 생성 (상단 레이블) */
  getColumnHeaders(cursorDate: Date): GridHeader[];

  /** 행(Row) 헤더 데이터 생성 (좌측 레이블 - 히트맵 등에서 사용) */
  getRowHeaders(cursorDate: Date): GridHeader[];

  /** 네비게이션 이동 로직 */
  navigate(cursorDate: Date, action: 'prev' | 'next'): Date;
}
```

---

## 3. 커스텀 전략 예시: GitHub 히트맵

```typescript
class AnnualHeatmapStrategy implements GridStrategy {
  getRange(cursorDate: Date) {
    return { startDate: subYears(cursorDate, 1), endDate: cursorDate };
  }

  createGrid(range, cursorDate) {
    // 7행(요일) x 53열(주)의 매트릭스 생성
    return { rows: 7, cols: 53, cells: heatmapMatrix };
  }

  getColumnHeaders(cursorDate) { return months; } // Jan, Feb...
  getRowHeaders(cursorDate) { return ['Mon', 'Wed', 'Fri']; } // 특정 요일만 표시 가능

  navigate(cursorDate, action) {
    return action === 'next' ? addYears(cursorDate, 1) : subYears(cursorDate, 1);
  }
}
```

---

## 4. 하위 호환성 및 어댑터 (Legacy Adapter)

기존 사용자의 `body.value.map(...)` 구조가 깨지지 않도록, 엔진 출력물을 레거시 포맷으로 변환하는 어댑터를 제공합니다.

```typescript
function transformToLegacyFormat(cells: CalendarCell[][]) {
  return {
    value: cells.map((row, i) => ({
      key: `week-${i}`,
      value: row.map(cell => ({ ...cell, key: `day-${cell.date.getTime()}` }))
    }))
  };
}
```

---

## 5. 데이터 흐름 및 성능

1.  **Selective Plugin**: `AnnualMatrixStrategy`와 같이 셀이 많은 경우, 플러그인 연산을 최소화하거나 캐싱하는 로직을 엔진 레벨에서 고려합니다.
2.  **State Logic**: `useCalendar`는 `cursorDate`와 `strategy`를 동기화하여 그리드를 재생성합니다.

---

## 6. 단계별 실행 계획

### 1단계: 인터페이스 및 어댑터 설계
- `src/models/GridStrategy.ts` 정의.
- `LegacyAdapter` 유틸리티 작성 (기존 API 호환성 보장).

### 2단계: 전략 클래스 구현
- `MonthStrategy`, `WeekStrategy`, `DayStrategy` 구현.
- `FixedSpanStrategy` (n-day용) 추가.

### 3단계: 엔진 교체
- `useCalendar`를 전략 기반으로 리팩토링.
- 기존 사용자가 별도 설정 없이도 작동하도록 `defaultStrategy` 매핑 로직 추가.

### 4단계: 검증
- 3일 보기 뷰 및 히트맵 뷰에 대한 테스트 케이스 작성.
- 기존 테스트(7일 달력) 통과 확인.

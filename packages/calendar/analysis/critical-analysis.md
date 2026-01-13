# @h6s/calendar: 비판적 분석 보고서

**버전**: 2.0.3
**타입**: React 헤드리스 캘린더 Hook
**작성일**: 2026년 1월

---

## 요약

`@h6s/calendar`는 UI 구현 없이 날짜 그리드 로직만을 제공하는 미니멀한 헤드리스 캘린더 라이브러리입니다. 깔끔한 아키텍처 원칙과 타입 안정성을 보여주지만, 프로덕션 요구사항과 비교했을 때 기능이 심각하게 제한적입니다. 학습 예제나 기초로는 적합하지만, 종합적인 캘린더 솔루션으로는 부족합니다.

**종합 평가**: ⭐⭐⭐ (3/5)
- 탄탄한 기초이지만 불완전한 기능 세트
- 훌륭한 아키텍처이지만 제한적인 확장성
- 단순한 사용 사례에는 좋지만 복잡한 애플리케이션에는 부적합

---

## 1. @h6s/calendar이란?

### 핵심 컨셉
UI 없이 캘린더 상태 관리와 날짜 계산을 제공하는 헤드리스 캘린더 hook입니다. 사용자는 `useCalendar` hook을 통해 데이터를 받아 자체 UI를 구현합니다.

### 아키텍처
```
useCalendar (React Hook 레이어)
    ↓
createCalendarInfo (순수 코어 로직)
    ↓
플러그인 시스템 (withDateProps, withKeyProps)
    ↓
출력 (headers, body, navigation, view)
```

### 주요 의존성
- **React**: >=18 (peer dependency)
- **date-fns**: >=2 (peer dependency, 잠재적 번들 임팩트 ~2.3MB)

---

## 2. 무엇을 할 수 있나?

### 2.1 핵심 기능

#### 뷰 타입
- **월간 뷰**: 표준 월간 캘린더 그리드 (4-6주)
- **주간 뷰**: 단일 주 표시
- **일간 뷰**: 단일 일 포커스

#### 네비게이션
```typescript
navigation: {
  toNext()    // 앞으로 이동 (월/주/일)
  toPrev()    // 뒤로 이동
  setToday()  // 오늘로 이동
  setDate()   // 특정 날짜로 이동
}
```

#### 커스터마이징
- **주 시작 요일**: 설정 가능 (0=일요일 ~ 6=토요일)
- **초기 날짜**: 시작 커서 날짜 설정
- **초기 뷰**: 기본 뷰 타입

#### 데이터 보강
각 날짜 셀에 포함되는 정보:
- `value`: Date 객체
- `date`: 일자 숫자 (1-31)
- `isCurrentMonth`: 표시된 월에 속하는지 여부
- `isCurrentDate`: base date와 일치하는지 여부
- `isWeekend`: 토/일요일 감지
- `key`: React 렌더링용 키

### 2.2 잘하는 것

1. **깔끔한 아키텍처**: 코어 로직, hooks, 플러그인 간 명확한 분리
2. **타입 안전성**: 완전한 TypeScript 지원과 적절한 타입 export
3. **테스트 커버리지**: 포괄적인 유닛 테스트 (11개 테스트 파일)
4. **작은 API 표면**: 배우기 쉽고, 인지 부담 최소화
5. **UI 의견 제로**: 진정한 헤드리스 설계로 완전한 UI 유연성 제공
6. **순수 함수**: 코어 로직이 프레임워크 무관 (포팅 가능)

---

## 3. 치명적인 한계점과 약점

### 3.1 기능 격차 (치명적)

#### 이벤트 관리 없음
```typescript
// ❌ 이런 걸 할 수 없음
const calendar = useCalendar({
  events: myEvents,
  onDateClick: handleClick
});
```

**문제**: 캘린더의 주요 사용 사례는 이벤트/약속 표시입니다. 이 라이브러리는 날짜 그리드만 제공 - 이벤트 배치, 겹침 로직, 여러 날에 걸친 이벤트가 없습니다.

**영향**: 사용자가 전체 이벤트 관리 레이어를 직접 구현해야 하며, 이는 캘린더 개발에서 가장 어려운 부분입니다.

#### 날짜 선택 기능 없음
```typescript
// ❌ 이런 걸 할 수 없음
const calendar = useCalendar({
  onSelect: handleSelect,
  selectionMode: 'range' // single, multiple, range
});
```

**문제**: 선택된 날짜, 범위, 또는 다중 선택을 위한 내장 상태 관리가 없습니다. 이는 기본적인 캘린더 기능입니다.

#### 비활성 날짜 기능 없음
```typescript
// ❌ 이런 걸 할 수 없음
const calendar = useCalendar({
  disabledDates: [pastDates],
  minDate: new Date(),
  maxDate: endDate
});
```

**문제**: 예약 시스템, 날짜 선택기의 일반적인 요구사항. 사용자가 유효성 검사 로직을 별도로 구현해야 합니다.

### 3.2 설계 및 아키텍처 문제

#### 유연하지 않은 플러그인 시스템
```typescript
// 현재: 하드코딩된 플러그인 파이프라인
withDateProps(baseDate, cursorDate)(cell)

// ❌ 불가능: 커스텀 플러그인 주입
useCalendar({
  plugins: [myCustomPlugin, highlightHolidays]
})
```

**문제**: 플러그인이 hook에 하드코딩되어 있습니다. 포크하지 않고는 기능을 확장할 방법이 없습니다.

**비교**: TanStack Table 같은 라이브러리는 플러그인 API를 제공합니다. 이 라이브러리는 그렇지 않습니다.

#### date-fns 강결합
```typescript
// 여러 파일에서 date-fns import
import { addDays, startOfMonth, ... } from 'date-fns';
```

**문제**:
- date-fns에 하드 의존성 (사용자가 Day.js, Luxon, 또는 네이티브 Temporal API를 사용할 수 없음)
- 트리 쉐이킹을 해도 번들 사이즈 영향 (~20-50KB 오버헤드)
- 여러 날짜 라이브러리를 지원하는 어댑터 패턴이 없음

**더 나은 접근**: 날짜 라이브러리 어댑터 제공 또는 네이티브 Date API 사용.

#### 낭비적인 재계산

```typescript
// useCalendar.ts:115
return useMemo(
  () => ({
    ...calendar,
    headers: getHeaders(viewType),
    body: getBody(viewType),
    // ...
  }),
  [calendar, getBody, getHeaders, setNext, setPrev, viewType],
);
```

**문제**:
- `useMemo` 과용으로 조기 최적화 발생
- 커서 변경마다 `calendar` 객체 재생성
- `getHeaders`/`getBody` 콜백이 자주 재생성됨
- 네비게이션만 변경되어도 매트릭스 재생성 발생

**영향**: 소비자 컴포넌트에서 불필요한 재렌더링.

### 3.3 API 일관성 문제

#### 혼란스러운 데이터 구조
```typescript
// 왜 중첩된 value 객체들?
body: {
  value: [                    // 주의 배열
    {
      key: "weeks-123",
      value: [                // 일의 배열
        {
          key: "days-456",
          value: Date,        // 실제 날짜
          date: 15,
          isCurrentMonth: true,
          // ...
        }
      ]
    }
  ]
}
```

**문제**: 3중 중첩 구조 (matrix → week → day → value)는 장황하고 혼란스럽습니다. 왜 모든 레벨에서 `value` 래핑?

**더 나은 API**:
```typescript
body: {
  weeks: [
    {
      id: "week-1",
      days: [
        {
          id: "day-1",
          date: Date,
          // props...
        }
      ]
    }
  ]
}
```

#### 일관성 없는 네이밍
- `cursorDate` (내부 개념이 노출됨)
- `setWeekStartsOn` (동사) vs `weekStartsOn` (명사)
- `showMonthView()` vs `setViewType()`

**문제**: API가 신중한 설계라기보다 노출된 내부 구현처럼 느껴집니다.

### 3.4 필수 기능 누락

#### 국제화 없음
```typescript
// ❌ 이렇게 할 수 없음
useCalendar({
  locale: 'ko-KR',
  monthFormat: 'YYYY년 MM월'
})
```

**문제**: 요일 이름, 월 이름, 포맷팅을 모두 사용자가 처리해야 합니다. Intl API나 date-fns 로케일과의 통합이 없습니다.

#### 타임존 지원 없음
```typescript
// 타임존 처리가 완전히 없음
const calendar = useCalendar({
  defaultDate: new Date() // 로컬 시간 사용
});
```

**문제**: 모든 날짜가 로컬 시간으로 처리됩니다. 타임존을 지정할 방법이 없으며, 글로벌 애플리케이션에는 치명적입니다.

#### 접근성 헬퍼 없음
```typescript
// ❌ ARIA 속성 제공 안 됨
body.value[0].value[0] // 그냥 날짜, aria-label, role 등 없음
```

**문제**: 사용자가 수동으로 ARIA 라벨, 키보드 네비게이션, 포커스 관리를 구현해야 합니다. 헤드리스라고 접근성이 없어도 되는 건 아닙니다.

**더 나은 접근**: Downshift처럼 `getDateProps()` 헬퍼 제공.

#### 범위 선택 없음
```typescript
// ❌ 날짜 범위 (호텔, 항공권 예약) 지원 안 됨
```

### 3.5 문서화 및 개발자 경험 문제

#### 최소한의 README
```md
# [@h6s/calendar](https://h6s.dev/docs/calendar/get-started)
```

**문제**: 패키지 README가 사실상 비어있습니다. 사용자가 외부 문서를 방문해야 합니다.

#### JSDoc 주석 없음
```typescript
// 인라인 문서 없음
export function useCalendar({ ... }) { ... }
```

**문제**: IDE에서 IntelliSense 문서가 없습니다. 사용자가 계속 외부 문서를 참조해야 합니다.

#### 제한적인 예제
Storybook 예제만 제공됩니다. 없는 것들:
- CodeSandbox 데모
- 실제 통합 예제
- 일반적인 레시피 (날짜 선택기, 이벤트 캘린더 등)

### 3.6 테스트 격차

유닛 테스트 커버리지는 좋지만 누락된 것들:
- **E2E 테스트**: Playwright 설정은 있지만 실제 테스트는 없음
- **접근성 테스트**: axe-core나 유사한 테스팅 없음
- **성능 테스트**: 큰 날짜 범위에 대한 벤치마크 없음
- **통합 테스트**: 실제 UI 라이브러리와의 테스트 없음

---

## 4. 경쟁사 분석

### vs. react-calendar (주간 다운로드 62k+)
**react-calendar의 장점:**
- ✅ 이벤트 지원
- ✅ 날짜 범위 선택
- ✅ 비활성 날짜
- ✅ 광범위한 커스터마이징
- ✅ 더 나은 문서화

**@h6s/calendar의 장점:**
- ✅ 헤드리스 (UI 유연성)
- ✅ 더 나은 TypeScript 지원
- ✅ 더 깔끔한 아키텍처

### vs. react-day-picker (주간 다운로드 265k+)
**react-day-picker의 장점:**
- ✅ 날짜 선택 (단일/다중/범위)
- ✅ 비활성 날짜
- ✅ 모디파이어 시스템
- ✅ 국제화
- ✅ 내장 접근성

### vs. TanStack/table (헤드리스 라이브러리 비교)
**TanStack Table이 잘하는 것:**
- ✅ 확장 가능한 플러그인 시스템
- ✅ 프레임워크 어댑터 (React/Vue/Solid)
- ✅ 포괄적인 예제
- ✅ 상세한 문서화

---

## 5. 개선 로드맵

### 5.1 치명적 (v3.0에 필요)

1. **이벤트 관리 시스템**
   ```typescript
   interface CalendarEvent {
     id: string;
     start: Date;
     end: Date;
     title: string;
     metadata?: Record<string, unknown>;
   }

   useCalendar({
     events: CalendarEvent[],
     getEventsForDate: (date: Date) => Event[]
   })
   ```

2. **선택 상태**
   ```typescript
   useCalendar({
     selectionMode: 'single' | 'multiple' | 'range',
     selected: Date | Date[] | { start: Date, end: Date },
     onSelect: (selection) => void
   })
   ```

3. **확장 가능한 플러그인 시스템**
   ```typescript
   useCalendar({
     plugins: [
       disablePastDates,
       highlightWeekends,
       customPlugin
     ]
   })
   ```

### 5.2 높은 우선순위 (v3.1)

4. **접근성 헬퍼**
   ```typescript
   const { getDateCellProps, getNavigationProps } = useCalendar()

   <button {...getDateCellProps(date)}>
     {/* ARIA 속성, 키보드 핸들러 자동 포함 */}
   </button>
   ```

5. **날짜 라이브러리 어댑터**
   ```typescript
   import { dateFnsAdapter } from '@h6s/calendar/adapters'

   useCalendar({
     adapter: dateFnsAdapter // 또는 dayjs, luxon 등
   })
   ```

6. **국제화**
   ```typescript
   useCalendar({
     locale: 'ko-KR',
     formatters: {
       weekday: (date) => format(date, 'EEE'),
       month: (date) => format(date, 'MMMM yyyy')
     }
   })
   ```

### 5.3 중간 우선순위 (v3.2)

7. **타임존 지원**
   ```typescript
   useCalendar({
     timezone: 'America/New_York',
     baseDate: zonedTime
   })
   ```

8. **성능 최적화**
   - 메모이제이션 전략 검토
   - 큰 날짜 범위를 위한 가상 렌더링
   - 화면 밖 날짜의 지연 계산

9. **더 나은 개발자 경험**
   - 포괄적인 JSDoc
   - 인터랙티브 문서
   - CodeSandbox 템플릿
   - 레시피 쿡북

### 5.4 있으면 좋은 것 (v4.0)

10. **프레임워크 어댑터**
    - Vue composition API
    - Solid.js signals
    - Svelte stores

11. **고급 기능**
    - 반복 이벤트
    - 드래그 앤 드롭 이벤트 일정 변경
    - 다중 타임존 표시
    - 커스텀 주 정의 (ISO 8601)

---

## 6. 코드 품질 이슈

### 6.1 사소한 문제들

#### 사용되지 않는 `isMounted` Hook
```typescript
// useCalendar.ts:22
const isMounted = useIsMounted();
// biome-ignore lint: reason

const baseDate = useMemo(() => {
  return defaultDate != null ? new Date(defaultDate) : new Date();
}, [defaultDate, isMounted]); // isMounted가 재계산을 강제하지만 왜?
```

**문제**: `isMounted`가 의존성 배열에 있지만 불필요해 보입니다. 문서화되거나 제거되어야 할 하이드레이션 해결책일 가능성.

#### 매직 스트링 키
```typescript
// useCalendar.ts:83
key: "week-day-type" // 왜 이 특정 문자열?
```

#### 일관성 없는 타입 export
```typescript
// 일부는 default, 일부는 named export
export default CalendarViewType;
export interface DateCell { ... }
```

**문제**: default와 named export를 섞으면 일관성 없는 import 패턴이 생깁니다.

---

## 7. 권장사항

### 이 라이브러리를 고려하는 사용자들에게

**@h6s/calendar를 사용하세요:**
- ✅ 간단한 날짜 선택기를 만들 때
- ✅ 완전한 UI 제어가 필요할 때
- ✅ 이벤트 관리를 구현할 시간이 있을 때
- ✅ 국제화가 필요 없을 때
- ✅ 간단한 캘린더 표시가 목표일 때

**@h6s/calendar를 피하세요:**
- ❌ 이벤트/약속 관리가 필요할 때
- ❌ 날짜 범위 선택이 필요할 때
- ❌ 국제화가 필요할 때
- ❌ 복잡한 스케줄링 UI를 만들 때
- ❌ 즉시 사용 가능한 접근성이 필요할 때

### 라이브러리 관리자들에게

1. **범위 정의**: 이것이 최소한의 날짜 그리드(현재)인지 완전한 캘린더 솔루션(야심찬)인지 명확히 문서화하세요.

2. **이벤트 관리 우선순위화**: 이것이 프로덕션 채택을 막는 1순위 기능 격차입니다.

3. **TanStack Table 연구**: 그들의 플러그인 시스템, 문서화, 예제에서 배우세요.

4. **접근성 추가**: 헤드리스 라이브러리도 접근성 헬퍼를 제공해야지, 사용자가 재구현하도록 강요하면 안 됩니다.

5. **문서화 개선**: JSDoc, CodeSandbox 예제, 마이그레이션 가이드를 추가하세요.

6. **date-fns 대안 고려**: 어댑터 패턴을 제공하거나 하드 의존성을 제거하세요.

---

## 8. 결론

### 강점
- ✅ 깔끔하고 테스트 가능한 아키텍처
- ✅ 타입 안전한 API
- ✅ 진정한 헤드리스 설계
- ✅ 확장을 위한 좋은 기초

### 약점
- ❌ 심각하게 제한된 기능 세트
- ❌ 이벤트 관리 없음 (대부분의 사용 사례에서 치명적)
- ❌ 유연하지 않은 플러그인 시스템
- ❌ 접근성 헬퍼 누락
- ❌ 빈약한 문서화
- ❌ date-fns 결합

### 최종 판단

**@h6s/calendar는 미완성으로 느껴지는 유망한 기초입니다.** 아키텍처는 탄탄하지만, 기능 세트는 이 라이브러리가 "MVP" 단계에서 개발을 멈춘 것 같다는 것을 시사합니다.

프로덕션 사용을 위해, 대부분의 팀은 다음을 해야 합니다:
1. 이벤트 관리를 직접 구현 (~200-500 LOC)
2. 선택 상태 추가 (~100 LOC)
3. 접근성 구현 (~150 LOC)
4. 국제화 추가 (~50-100 LOC)

**이 시점에서, 사용자는 라이브러리가 제공하는 것보다 더 많은 코드를 작성하게 됩니다.**

라이브러리는 두 가지 경로 중 하나에 집중하면 크게 도움이 될 것입니다:
1. **최소 경로**: 작게 유지하되 선택 상태와 접근성 헬퍼 추가
2. **종합 경로**: 이벤트 관리 추가, 진정한 헤드리스 캘린더 솔루션이 되기

현재는 불편하게 중간에 있습니다: 복잡한 사용 사례에는 너무 제한적이고, 최소 사용 사례에는 너무 의견이 강합니다(date-fns).

**권장사항**: 확립된 라이브러리들과 기능 동등성에 도달하도록 개발을 계속하거나, 이것을 프로덕션 준비 솔루션이 아닌 "학습 예제"로 명확히 문서화하세요.

---

## 부록: 빠른 비교 매트릭스

| 기능 | @h6s/calendar | react-calendar | react-day-picker | @tanstack/react-table |
|------|---------------|----------------|------------------|----------------------|
| 헤드리스 | ✅ | ❌ | ❌ | ✅ |
| TypeScript | ✅ | ⚠️ | ✅ | ✅ |
| 이벤트 관리 | ❌ | ⚠️ | ❌ | ✅ (테이블용) |
| 날짜 선택 | ❌ | ✅ | ✅ | ✅ |
| 범위 선택 | ❌ | ✅ | ✅ | ✅ |
| 비활성 날짜 | ❌ | ✅ | ✅ | ✅ |
| 접근성 | ❌ | ⚠️ | ✅ | ✅ |
| 국제화 | ❌ | ⚠️ | ✅ | ✅ |
| 플러그인 시스템 | ⚠️ | ❌ | ⚠️ | ✅ |
| 문서화 | ⚠️ | ✅ | ✅ | ✅ |
| 예제 | ⚠️ | ✅ | ✅ | ✅ |

범례: ✅ 완전 지원 | ⚠️ 부분 지원 | ❌ 미지원

---

**보고서 작성일**: 2026년 1월 12일
**검토 버전**: @h6s/calendar v2.0.3
**작성자**: Critical Analysis
**라이센스**: MIT

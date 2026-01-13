# @h6s/calendar: 한계점 극복 시 가능한 UI 패턴 보고서

**기반 문서**: critical-analysis.md
**작성일**: 2026년 1월 12일
**목적**: 현재 한계점을 극복했을 때 구현 가능한 캘린더 UI 패턴 제시

---

## 목차

1. [Executive Summary](#executive-summary)
2. [한계점별 해결 시나리오](#한계점별-해결-시나리오)
3. [실현 가능한 캘린더 UI 패턴](#실현-가능한-캘린더-ui-패턴)
4. [구현 복잡도 분석](#구현-복잡도-분석)
5. [우선순위 로드맵](#우선순위-로드맵)

---

## Executive Summary

현재 `@h6s/calendar`는 기본적인 날짜 그리드만 제공하는 미완성 라이브러리입니다. 하지만 critical-analysis.md에서 지적된 9가지 주요 한계점을 극복하면, **최소 15가지 이상의 프로덕션급 캘린더 UI 패턴**을 지원할 수 있는 종합 헤드리스 캘린더 솔루션으로 발전할 수 있습니다.

### 핵심 발견사항

- **현재 상태**: 단순 날짜 그리드 (사용 사례 ~10%)
- **한계 극복 후**: 범용 캘린더 플랫폼 (사용 사례 ~90%)
- **잠재 시장**: Google Calendar, Outlook, Airbnb, 병원 예약, 프로젝트 관리 등

---

## 한계점별 해결 시나리오

### 1. 이벤트 관리 시스템 추가

#### 현재 불가능한 것
```typescript
// ❌ 현재: 이벤트를 표시할 방법이 없음
const calendar = useCalendar();
// 날짜 그리드만 제공
```

#### 해결 후 가능한 것
```typescript
// ✅ 이벤트 기반 캘린더
const calendar = useCalendar({
  events: [
    {
      id: '1',
      title: '팀 회의',
      start: new Date('2026-01-15T10:00:00'),
      end: new Date('2026-01-15T11:00:00'),
      color: '#4285f4',
      recurring: { frequency: 'weekly', interval: 1 }
    }
  ],
  eventHandlers: {
    onEventClick: (event) => {},
    onEventDrag: (event, newDate) => {},
    onEventResize: (event, newEnd) => {}
  }
});
```

**실현 가능한 UI 패턴**:
- 📅 Google Calendar 스타일 주간/일간 뷰
- 🗓️ Outlook 타임라인 뷰
- 📊 팀 리소스 스케줄러
- 🏥 병원 예약 시스템
- ✈️ 항공권/호텔 예약 관리

---

### 2. 날짜 선택 기능 추가

#### 현재 불가능한 것
```typescript
// ❌ 선택 상태를 수동으로 관리해야 함
const [selected, setSelected] = useState(null);
```

#### 해결 후 가능한 것
```typescript
// ✅ 내장 선택 상태 관리
const calendar = useCalendar({
  selectionMode: 'range', // 'single' | 'multiple' | 'range'
  selected: { start: startDate, end: endDate },
  onSelect: (selection) => {
    console.log('Selected range:', selection);
  },
  minDate: new Date(),
  maxDate: addMonths(new Date(), 3)
});
```

**실현 가능한 UI 패턴**:
- 🏨 **Airbnb 스타일 날짜 선택기**: 체크인/체크아웃 범위
- ✈️ **항공권 예약**: 출발/도착 날짜
- 📊 **애널리틱스 대시보드**: 날짜 범위 필터
- 📝 **휴가 신청 시스템**: 시작/종료일 선택
- 🎫 **이벤트 티케팅**: 다중 날짜 선택

---

### 3. 확장 가능한 플러그인 시스템

#### 현재 불가능한 것
```typescript
// ❌ 하드코딩된 플러그인, 커스터마이징 불가
```

#### 해결 후 가능한 것
```typescript
// ✅ 동적 플러그인 주입
import {
  useCalendar,
  withHolidays,
  withWeatherData,
  withPriceIndicator
} from '@h6s/calendar';

const calendar = useCalendar({
  plugins: [
    withHolidays({ country: 'KR' }),
    withWeatherData({ apiKey: 'xxx' }),
    withPriceIndicator({ priceSource: getPrices })
  ]
});

// 각 날짜 셀에 자동으로 데이터 추가
body.weeks[0].days[0] = {
  date: Date,
  holiday: { name: '설날', type: 'public' },
  weather: { temp: 5, condition: 'sunny' },
  price: { value: 150000, trend: 'low' }
}
```

**실현 가능한 UI 패턴**:
- 🎌 **공휴일 표시 캘린더**: 국가별 휴일 자동 표시
- ⛅ **날씨 통합 캘린더**: 일정 계획 시 날씨 정보
- 💰 **가격 달력**: 항공권/숙박 최저가 표시
- 🌙 **음력/절기 캘린더**: 전통 달력 정보
- 📈 **주식 트레이딩 캘린더**: 거래일/배당일 표시

---

### 4. 접근성 헬퍼 추가

#### 현재 불가능한 것
```typescript
// ❌ ARIA 속성을 수동으로 구현해야 함
<button onClick={() => selectDate(date)}>
  {date.getDate()}
</button>
```

#### 해결 후 가능한 것
```typescript
// ✅ 접근성 자동 처리
const { getDateCellProps, getNavigationProps } = useCalendar();

<button {...getDateCellProps(date)}>
  {/* 자동 포함:
    - aria-label="2026년 1월 15일"
    - role="gridcell"
    - aria-selected={isSelected}
    - tabIndex={isFocused ? 0 : -1}
    - onKeyDown={keyboardNavigation}
  */}
  {date.getDate()}
</button>
```

**실현 가능한 UI 패턴**:
- ♿ **완전 접근 가능한 날짜 선택기**: WCAG 2.1 AAA 준수
- ⌨️ **키보드 전용 네비게이션**: 화살표 키로 완전 제어
- 🔊 **스크린 리더 최적화**: 명확한 음성 안내
- 📱 **터치 접근성**: 큰 터치 타겟, 제스처 지원

---

### 5. 국제화 (i18n) 지원

#### 현재 불가능한 것
```typescript
// ❌ 수동으로 번역 관리
const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
```

#### 해결 후 가능한 것
```typescript
// ✅ 자동 로케일 처리
const calendar = useCalendar({
  locale: 'ko-KR',
  formatters: {
    weekday: 'short', // 월, 화, 수...
    month: 'long',    // 2026년 1월
    date: 'numeric'
  },
  firstDayOfWeek: 1, // 월요일 시작
  weekendDays: [0, 6] // 일요일, 토요일
});

// 또는 다국어 지원
const calendar = useCalendar({
  locale: userLocale, // 'en-US', 'ja-JP', 'ar-SA' 등
  direction: getDirection(userLocale) // 'ltr' or 'rtl'
});
```

**실현 가능한 UI 패턴**:
- 🌍 **글로벌 SaaS 캘린더**: 100+ 로케일 지원
- 📅 **다국어 이벤트 플랫폼**: Eventbrite, Meetup 스타일
- 🕌 **종교 달력**: 이슬람력, 히브리력, 불교력
- 🗓️ **문화별 주 시작**: 일요일(US) vs 월요일(EU)

---

### 6. 타임존 지원

#### 현재 불가능한 것
```typescript
// ❌ 로컬 시간만 지원
const calendar = useCalendar({
  defaultDate: new Date() // 사용자의 로컬 타임존
});
```

#### 해결 후 가능한 것
```typescript
// ✅ 다중 타임존 처리
const calendar = useCalendar({
  timezone: 'America/New_York',
  events: [
    {
      title: '글로벌 회의',
      start: '2026-01-15T14:00:00Z', // UTC
      timezone: 'Europe/London'
    }
  ],
  displayTimezone: userTimezone,
  showMultipleTimezones: ['Asia/Seoul', 'America/Los_Angeles']
});
```

**실현 가능한 UI 패턴**:
- 🌐 **다국적 기업 스케줄러**: 여러 타임존 동시 표시
- ✈️ **여행 일정 관리**: 출발/도착지 시간 자동 변환
- 📞 **국제 회의 조율**: World Time Buddy 스타일
- 🎮 **글로벌 이벤트 캘린더**: 게임 이벤트 로컬 시간 표시

---

### 7. 비활성/제약 날짜 기능

#### 현재 불가능한 것
```typescript
// ❌ 수동으로 비활성 로직 구현
```

#### 해결 후 가능한 것
```typescript
// ✅ 유연한 제약 조건
const calendar = useCalendar({
  disabledDates: [pastDates, holidays, fullyBookedDates],
  minDate: new Date(),
  maxDate: addMonths(new Date(), 6),
  disabledDaysOfWeek: [0, 6], // 주말 비활성
  customDisable: (date) => {
    // 커스텀 로직: 재고 없는 날짜 등
    return !hasAvailability(date);
  }
});
```

**실현 가능한 UI 패턴**:
- 🏥 **병원 예약**: 진료 불가 날짜 표시
- 🍽️ **레스토랑 예약**: 만석 날짜 비활성화
- 📚 **도서관 예약**: 대출 불가 기간
- 🏢 **회의실 예약**: 이미 예약된 시간 표시

---

## 실현 가능한 캘린더 UI 패턴

한계점을 극복하면 구현 가능한 15가지 주요 UI 패턴을 제시합니다.

---

### 1. GitHub Contribution Graph (잔디 캘린더)

```typescript
const contributionCalendar = useCalendar({
  viewType: 'year',
  layout: 'horizontal-weeks', // 가로로 주 단위 배치
  plugins: [
    withHeatmap({
      data: contributions, // { date: '2026-01-15', count: 12 }
      colorScale: ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39'],
      threshold: [0, 1, 5, 10, 20]
    })
  ]
});

// 각 셀에 contribution 데이터 자동 추가
body.weeks[0].days[0] = {
  date: Date,
  heatmapValue: 12,
  heatmapColor: '#40c463',
  tooltip: '12 contributions on Jan 15'
}
```

**사용 사례**:
- 개발자 활동 추적 (GitHub, GitLab)
- 습관 트래커 (운동, 독서, 명상)
- 업무 생산성 대시보드
- 영업 활동 히트맵

**추가 요구사항**:
- 연간 뷰 지원 (viewType: 'year')
- 히트맵 플러그인 시스템
- 툴팁 데이터 제공

---

### 2. N-Day View (멀티 데이 타임라인)

```typescript
const scheduler = useCalendar({
  viewType: 'n-day',
  dayCount: 7, // 7일 표시
  timeSlots: {
    start: '06:00',
    end: '22:00',
    interval: 30 // 30분 단위
  },
  events: teamEvents,
  plugins: [
    withTimeSlots(),
    withEventOverlap(), // 겹치는 이벤트 처리
    withResourceColumns({ resources: teamMembers })
  ]
});

// 시간대별 그리드 제공
body = {
  days: [Date, Date, ...], // 7일
  timeSlots: ['06:00', '06:30', '07:00', ...],
  events: [
    {
      event: { ... },
      startSlot: 12, // 06:00 + 12 * 30min = 12:00
      duration: 4,   // 2시간 (4 * 30min)
      column: 0,     // 첫 번째 리소스
      overlapGroup: 1 // 겹침 그룹
    }
  ]
}
```

**사용 사례**:
- **팀 스케줄러**: Asana, Monday.com 스타일
- **회의실 예약**: 시간대별 가용성
- **강의 시간표**: 대학 수업 일정
- **병원 예약**: 의사별 스케줄
- **배달 관리**: 배달원 스케줄 최적화

**추가 요구사항**:
- n-day viewType (현재 Month/Week/Day만 지원)
- 시간 슬롯 시스템
- 이벤트 겹침 계산 로직
- 리소스 컬럼 (여러 사람/장소 동시 표시)

---

### 3. 가격 캘린더 (Airbnb/Skyscanner 스타일)

```typescript
const priceCalendar = useCalendar({
  viewType: 'month',
  selectionMode: 'range',
  plugins: [
    withPricing({
      prices: priceData, // { date: '2026-01-15', price: 120000 }
      currency: 'KRW',
      showTrends: true // 가격 상승/하락 표시
    })
  ]
});

body.weeks[0].days[0] = {
  date: Date,
  price: {
    amount: 120000,
    formatted: '₩120,000',
    trend: 'low', // 'low' | 'average' | 'high'
    percentile: 25 // 하위 25% (저렴)
  }
}
```

**사용 사례**:
- 숙박 예약 (Airbnb, Booking.com)
- 항공권 검색 (Skyscanner, Google Flights)
- 렌터카 가격 비교
- 이벤트 티켓 가격 추이

**추가 요구사항**:
- 커스텀 데이터 플러그인
- 가격 시각화 (컬러 스케일)
- 범위 선택 기능

---

### 4. 연간 캘린더 (Year View)

```typescript
const yearCalendar = useCalendar({
  viewType: 'year',
  year: 2026,
  layout: 'grid', // 3x4 그리드로 12개월
  plugins: [
    withYearOverview(),
    withMiniMonths()
  ]
});

// 12개월 미니 캘린더 제공
body = {
  months: [
    {
      month: 0, // January
      weeks: [...],
      summary: {
        eventCount: 15,
        selectedDates: 3
      }
    },
    // ... 11개월 더
  ]
}
```

**사용 사례**:
- 연간 계획 (프로젝트 로드맵)
- 휴가 계획
- 학사 일정
- 회계 연도 캘린더

**추가 요구사항**:
- viewType: 'year'
- 미니 월 그리드 렌더링
- 효율적인 데이터 구조 (365일 최적화)

---

### 5. 타임라인 뷰 (Gantt Chart 스타일)

```typescript
const timeline = useCalendar({
  viewType: 'timeline',
  range: { start: startDate, end: endDate },
  events: projectTasks,
  plugins: [
    withGantt({
      showDependencies: true,
      showMilestones: true,
      showProgress: true
    }),
    withResourceAllocation()
  ]
});

body.events = [
  {
    id: '1',
    title: 'UI 디자인',
    start: new Date('2026-01-10'),
    end: new Date('2026-01-20'),
    progress: 0.6, // 60% 완료
    dependencies: ['2', '3'],
    assignee: 'designer@example.com',
    milestone: false
  }
]
```

**사용 사례**:
- **프로젝트 관리**: Jira, Asana, Notion
- **제조 스케줄링**: 생산 라인 계획
- **콘텐츠 캘린더**: 마케팅 일정
- **건설 프로젝트**: 공정 관리

**추가 요구사항**:
- 타임라인 레이아웃
- 의존성 그래프
- 진행률 표시
- 드래그 앤 드롭 (시작/종료일 조정)

---

### 6. 리소스 스케줄러 (팀/장비 관리)

```typescript
const resourceScheduler = useCalendar({
  viewType: 'resource-timeline',
  resources: [
    { id: '1', name: '김개발', type: 'developer' },
    { id: '2', name: '이디자인', type: 'designer' },
    { id: '3', name: '회의실 A', type: 'room' }
  ],
  events: assignments,
  plugins: [
    withResourceUtilization(), // 리소스 사용률 계산
    withConflictDetection()    // 충돌 감지
  ]
});

body = {
  resources: [
    {
      resource: { id: '1', name: '김개발' },
      utilization: 0.85, // 85% 활용률
      events: [...],
      conflicts: [] // 겹치는 일정 감지
    }
  ]
}
```

**사용 사례**:
- 직원 스케줄링
- 회의실/장비 예약
- 차량 배차 시스템
- 의료진 근무 관리

**추가 요구사항**:
- 리소스 중심 뷰
- 사용률 계산
- 충돌 감지 알고리즘

---

### 7. 습관 트래커 (Habit Tracker)

```typescript
const habitTracker = useCalendar({
  viewType: 'month',
  plugins: [
    withHabitTracking({
      habits: [
        { id: '1', name: '운동', goal: 5, unit: 'times/week' },
        { id: '2', name: '독서', goal: 30, unit: 'minutes/day' }
      ],
      completions: habitData // { date, habitId, value }
    }),
    withStreaks(), // 연속 달성 계산
    withGoals()    // 목표 달성률
  ]
});

body.weeks[0].days[0] = {
  date: Date,
  habits: [
    { id: '1', completed: true, streak: 7 },
    { id: '2', completed: false, streak: 0 }
  ],
  dailyScore: 0.5 // 50% 달성
}
```

**사용 사례**:
- 개인 습관 관리 앱
- 피트니스 트래커
- 학습 진도 관리
- 금연/다이어트 달력

---

### 8. 이벤트 히트맵 (Analytics Calendar)

```typescript
const analyticsCalendar = useCalendar({
  viewType: 'year',
  plugins: [
    withHeatmap({
      metric: 'pageViews',
      data: analyticsData,
      colorScale: 'viridis',
      aggregation: 'sum' // 'avg', 'max', 'count'
    })
  ]
});
```

**사용 사례**:
- 웹 트래픽 분석 (Google Analytics 스타일)
- 영업 활동 히트맵
- 고객 문의 빈도
- 서버 부하 시각화

---

### 9. 반복 이벤트 캘린더

```typescript
const recurringCalendar = useCalendar({
  events: [
    {
      id: '1',
      title: '주간 회의',
      start: new Date('2026-01-15T10:00:00'),
      recurring: {
        frequency: 'weekly',
        interval: 1,
        daysOfWeek: [1, 3, 5], // 월, 수, 금
        until: new Date('2026-12-31')
      }
    }
  ],
  plugins: [
    withRecurringEvents(), // RRULE 지원
    withExceptions()       // 특정 날짜 제외
  ]
});
```

**사용 사례**:
- 정기 회의 관리
- 구독 서비스 결제일
- 수업 시간표
- 정기 점검 일정

---

### 10. 예약 가용성 캘린더

```typescript
const availabilityCalendar = useCalendar({
  viewType: 'week',
  timeSlots: { start: '09:00', end: '18:00', interval: 30 },
  availability: providerAvailability,
  bookedSlots: existingBookings,
  plugins: [
    withAvailabilitySlots(),
    withBookingRules({
      minAdvanceNotice: '24h',
      maxAdvanceBooking: '30d',
      bufferTime: '15m' // 예약 간 버퍼
    })
  ]
});
```

**사용 사례**:
- Calendly, Doodle 스타일 예약
- 의사/변호사 상담 예약
- 과외 수업 예약
- 서비스 예약 시스템

---

### 11. 다중 캘린더 오버레이

```typescript
const multiCalendar = useCalendar({
  calendars: [
    { id: 'work', name: '업무', color: '#4285f4', visible: true },
    { id: 'personal', name: '개인', color: '#ea4335', visible: true },
    { id: 'holidays', name: '휴일', color: '#fbbc04', visible: true }
  ],
  events: allEvents,
  plugins: [
    withCalendarLayers(),
    withVisibilityToggle()
  ]
});
```

**사용 사례**:
- Google Calendar 스타일 다중 달력
- 팀 캘린더 통합 뷰
- 가족 공유 캘린더
- 프로젝트 별 일정 관리

---

### 12. 이동 스케줄러 (여행/출장)

```typescript
const travelCalendar = useCalendar({
  viewType: 'timeline',
  events: travelEvents,
  plugins: [
    withTimezoneTransitions(),
    withTravelMode(), // 비행기, 기차 등
    withLocationTracking()
  ]
});

body.events = [
  {
    title: '서울 → 도쿄',
    type: 'flight',
    departure: { time: '2026-01-15T10:00', tz: 'Asia/Seoul' },
    arrival: { time: '2026-01-15T13:00', tz: 'Asia/Tokyo' },
    duration: '2h' // 실제 비행 시간
  }
]
```

**사용 사례**:
- 출장 일정 관리
- 여행 계획
- 물류 추적
- 항공/철도 스케줄

---

### 13. 날씨 통합 캘린더

```typescript
const weatherCalendar = useCalendar({
  plugins: [
    withWeatherForecast({
      provider: 'openweathermap',
      apiKey: 'xxx'
    })
  ]
});

body.weeks[0].days[0] = {
  date: Date,
  weather: {
    temp: { min: 2, max: 8 },
    condition: 'partly_cloudy',
    precipitation: 0.2,
    icon: '🌤️'
  }
}
```

**사용 사례**:
- 야외 활동 계획
- 농업 일정 관리
- 이벤트 기획
- 건설 작업 스케줄

---

### 14. 교대 근무 캘린더 (Shift Planner)

```typescript
const shiftCalendar = useCalendar({
  viewType: 'multi-resource',
  shifts: [
    { id: '1', name: '아침 근무', time: '06:00-14:00', color: '#fef3c7' },
    { id: '2', name: '저녁 근무', time: '14:00-22:00', color: '#dbeafe' },
    { id: '3', name: '야간 근무', time: '22:00-06:00', color: '#e0e7ff' }
  ],
  assignments: shiftAssignments,
  plugins: [
    withShiftRotation(),
    withLaborLawCompliance(), // 근로기준법 체크
    withCoverageAnalysis()    // 인력 충분성 분석
  ]
});
```

**사용 사례**:
- 병원 간호사 스케줄
- 24시간 시설 운영 (편의점, 공장)
- 콜센터 근무 관리
- 보안/경비 교대

---

### 15. 소셜 이벤트 달력

```typescript
const socialCalendar = useCalendar({
  events: communityEvents,
  plugins: [
    withRSVP({
      attendees: ['going', 'maybe', 'notGoing']
    }),
    withSocialFeatures({
      comments: true,
      likes: true,
      shares: true
    })
  ]
});

body.weeks[0].days[0].events[0] = {
  title: '커뮤니티 모임',
  attendees: {
    going: 42,
    maybe: 15,
    notGoing: 3
  },
  currentUserStatus: 'going',
  comments: 12,
  likes: 35
}
```

**사용 사례**:
- Facebook Events 스타일
- Meetup.com 이벤트
- 대학 동아리 일정
- 커뮤니티 활동 관리

---

## 구현 복잡도 분석

### 복잡도 매트릭스

| UI 패턴 | 필요한 한계점 해결 | 구현 난이도 | 비즈니스 가치 | 우선순위 |
|---------|-------------------|------------|-------------|---------|
| GitHub 잔디 | 플러그인, 연간뷰 | 🟢 낮음 | 🟡 중간 | P2 |
| N-Day View | 이벤트, 시간슬롯, 겹침처리 | 🔴 높음 | 🟢 높음 | P1 |
| 가격 캘린더 | 플러그인, 범위선택 | 🟡 중간 | 🟢 높음 | P1 |
| 연간 캘린더 | 연간뷰, 성능최적화 | 🟡 중간 | 🟡 중간 | P2 |
| 타임라인 뷰 | 이벤트, 의존성, D&D | 🔴 높음 | 🟢 높음 | P1 |
| 리소스 스케줄러 | 이벤트, 리소스, 충돌감지 | 🔴 높음 | 🟢 높음 | P1 |
| 습관 트래커 | 플러그인, 커스텀데이터 | 🟢 낮음 | 🟡 중간 | P2 |
| 이벤트 히트맵 | 플러그인, 시각화 | 🟢 낮음 | 🟡 중간 | P2 |
| 반복 이벤트 | 이벤트, RRULE | 🔴 높음 | 🟢 높음 | P1 |
| 예약 가용성 | 이벤트, 시간슬롯, 제약 | 🔴 높음 | 🟢 높음 | P1 |
| 다중 캘린더 | 이벤트, 레이어 | 🟡 중간 | 🟢 높음 | P1 |
| 이동 스케줄러 | 이벤트, 타임존 | 🔴 높음 | 🟡 중간 | P2 |
| 날씨 통합 | 플러그인, API통합 | 🟢 낮음 | 🟡 중간 | P3 |
| 교대 근무 | 이벤트, 리소스, 규칙엔진 | 🔴 높음 | 🟢 높음 | P1 |
| 소셜 이벤트 | 이벤트, 소셜기능 | 🟡 중간 | 🟡 중간 | P3 |

### 범례
- 🟢 낮음: 1-2주
- 🟡 중간: 3-4주
- 🔴 높음: 5-8주

---

## 우선순위 로드맵

### Phase 1: 기초 확립 (v3.0) - 3개월
**목표**: 가장 많이 요청되는 기능 구현

1. **이벤트 관리 시스템** (6주)
   - 기본 이벤트 CRUD
   - 시간 슬롯 시스템
   - 이벤트 렌더링 로직

2. **선택 상태 관리** (2주)
   - single/multiple/range 모드
   - 제약 조건 (min/max/disabled dates)

3. **확장 가능한 플러그인** (3주)
   - 플러그인 인터페이스 설계
   - 샘플 플러그인 3개 (holidays, pricing, weather)

4. **접근성 기초** (2주)
   - ARIA 속성 자동 생성
   - 키보드 네비게이션

**달성 가능한 UI**: 가격 캘린더, 예약 시스템, 다중 캘린더

---

### Phase 2: 엔터프라이즈 기능 (v3.1) - 3개월

5. **리소스 스케줄링** (4주)
   - 리소스 컬럼
   - 충돌 감지
   - 사용률 계산

6. **N-Day 타임라인 뷰** (4주)
   - 커스텀 day count
   - 이벤트 겹침 처리
   - 드래그 앤 드롭 기초

7. **국제화** (2주)
   - 로케일 시스템
   - date-fns-tz 통합

8. **반복 이벤트** (3주)
   - RRULE 파싱
   - 예외 처리

**달성 가능한 UI**: N-Day View, 리소스 스케줄러, 교대 근무, 타임라인

---

### Phase 3: 고급 기능 (v3.2) - 2개월

9. **타임존 지원** (3주)
   - 다중 타임존 표시
   - 자동 변환

10. **연간 뷰** (2주)
    - 최적화된 데이터 구조
    - 미니 월 그리드

11. **히트맵/시각화** (2주)
    - 컬러 스케일
    - 툴팁 시스템

12. **성능 최적화** (2주)
    - 가상 스크롤
    - 지연 계산

**달성 가능한 UI**: GitHub 잔디, 연간 캘린더, 히트맵, 이동 스케줄러

---

### Phase 4: 생태계 (v4.0) - 3개월

13. **프레임워크 어댑터**
    - Vue.js
    - Svelte
    - Solid.js

14. **고급 플러그인**
    - Gantt 의존성
    - 소셜 기능
    - AI 일정 추천

15. **개발자 경험**
    - Devtools
    - 디버깅 도구
    - 성능 프로파일러

**달성 가능한 UI**: 모든 15가지 패턴 + 커뮤니티 플러그인

---

## 비즈니스 임팩트 분석

### 시장 기회

| 산업 | 사용 사례 | 시장 규모 | 현재 솔루션의 문제점 |
|------|---------|---------|-------------------|
| **SaaS/프로젝트 관리** | Jira, Asana, Notion | $50B+ | 무거운 번들, 커스터마이징 어려움 |
| **여행/숙박** | Airbnb, Booking.com | $800B+ | 독점 솔루션, 라이센스 비용 |
| **헬스케어** | 병원 예약 시스템 | $300B+ | 레거시 시스템, 접근성 부족 |
| **교육** | 시간표, 온라인 수업 | $200B+ | 유연성 부족 |
| **HR/워크포스** | 교대 근무, 출근 관리 | $15B+ | 사용자 경험 낮음 |

### 경쟁 우위

한계점을 해결한 `@h6s/calendar`의 차별점:

1. **진정한 헤드리스**: react-calendar, react-day-picker는 스타일 포함
2. **TypeScript 우선**: 타입 안전성
3. **플러그인 생태계**: 커뮤니티 확장 가능
4. **프레임워크 중립**: React → Vue/Svelte 확장 가능
5. **현대적 API**: TanStack Table 수준의 DX

---

## 기술적 아키텍처 제안

### 새로운 플러그인 시스템

```typescript
// 플러그인 인터페이스
interface CalendarPlugin<TData = any> {
  name: string;
  version: string;

  // 라이프사이클 훅
  onInit?: (calendar: Calendar) => void;
  onDateCalculate?: (date: Date, context: Context) => TData;
  onEventRender?: (event: Event) => EventWithData<TData>;
  onDestroy?: () => void;

  // 옵션
  options?: Record<string, any>;
}

// 플러그인 구성 가능
const calendar = useCalendar({
  plugins: [
    {
      name: 'holidays',
      onDateCalculate: (date) => ({
        holiday: getHoliday(date)
      })
    },
    {
      name: 'pricing',
      options: { currency: 'KRW' },
      onDateCalculate: (date, { currency }) => ({
        price: getPrice(date, currency)
      })
    }
  ]
});

// 타입 안전한 데이터 접근
body.weeks[0].days[0].plugins = {
  holidays: { holiday: { name: '설날' } },
  pricing: { price: 150000 }
}
```

### 이벤트 시스템 아키텍처

```typescript
// 이벤트 저장소 (외부에서 관리)
interface EventStore {
  getEventsInRange(start: Date, end: Date): Event[];
  addEvent(event: Event): void;
  updateEvent(id: string, updates: Partial<Event>): void;
  deleteEvent(id: string): void;
}

// 캘린더는 뷰 계층만 담당
const calendar = useCalendar({
  eventStore: myEventStore, // 사용자 제공
  eventRenderer: (event, context) => {
    // 이벤트를 어떻게 배치할지 계산
    return {
      ...event,
      top: calculateTop(event.start),
      height: calculateHeight(event.duration),
      column: calculateColumn(event, context.overlapping)
    };
  }
});
```

---

## 결론

### 핵심 발견

1. **현재는 10% 솔루션**: 단순 날짜 그리드만 제공
2. **잠재력은 90% 솔루션**: 한계점 해결 시 15+ UI 패턴 지원
3. **P1 기능 6개**: 이벤트, 선택, 플러그인, 접근성, 리소스, 반복
4. **12개월 로드맵**: 4 phase로 완전한 솔루션 달성 가능
5. **시장 기회**: $1T+ 규모의 산업들

### 권장사항

**단기 (3개월)**:
- Phase 1 완료로 기본 예약 시스템 가능하게 만들기
- 3-5개 레퍼런스 구현 제공 (CodeSandbox)
- 초기 adopter 5-10개 확보

**중기 (6-9개월)**:
- Phase 2 완료로 엔터프라이즈 ready
- 파트너십 (Vercel, Radix UI 등)
- 플러그인 마켓플레이스 오픈

**장기 (12개월+)**:
- Phase 3-4로 생태계 구축
- 프레임워크 중립 확장
- "헤드리스 캘린더의 표준"으로 포지셔닝

---

## 부록: 빠른 참조

### 한계점 → 가능한 UI 매핑

| 해결할 한계점 | 실현 가능한 UI (번호) |
|-------------|-------------------|
| 이벤트 관리 | 2, 5, 6, 9, 10, 11, 12, 14, 15 |
| 선택 기능 | 3, 10 |
| 플러그인 시스템 | 1, 3, 7, 8, 13 |
| 접근성 | 모든 UI |
| 국제화 | 모든 UI (글로벌 배포) |
| 타임존 | 6, 11, 12 |
| 비활성 날짜 | 3, 10 |
| 연간 뷰 | 1, 4, 8 |
| 리소스 관리 | 2, 6, 14 |

### 가장 수요 높은 UI Top 5

1. **예약 가용성 캘린더** (Calendly 스타일) - 시장 수요 최고
2. **N-Day 타임라인** (Google Calendar 주간 뷰) - 기업 필수
3. **가격 캘린더** (Airbnb) - 여행/숙박 산업
4. **리소스 스케줄러** (팀 관리) - 엔터프라이즈
5. **교대 근무 캘린더** - 24시간 운영 시설

---

**다음 단계**: 이 보고서를 바탕으로 구체적인 Phase 1 구현 계획 수립을 권장합니다.

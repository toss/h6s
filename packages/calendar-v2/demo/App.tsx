/**
 * Demo App - 4개 캘린더 UI 동시 렌더링
 *
 * 동일한 createTimeGrid Core를 사용하여 완전히 다른 4가지 UI 렌더링.
 * 이것이 TanStack 스타일 아키텍처의 핵심 가치를 보여줌.
 */

import React from 'react';
import { MonthCalendar } from './MonthCalendar';
import { GithubGrass } from './GithubGrass';
import { DayTimeline } from './DayTimeline';
import { NDayView } from './NDayView';

// 샘플 데이터 생성
function generateContributionData() {
  const data = [];
  const today = new Date();
  const startDate = new Date(today);
  startDate.setFullYear(startDate.getFullYear() - 1);

  for (let d = new Date(startDate); d <= today; d.setDate(d.getDate() + 1)) {
    // 랜덤 기여도 (0-10)
    const count = Math.floor(Math.random() * 11);
    if (count > 0) {
      data.push({
        date: new Date(d),
        count,
      });
    }
  }
  return { data, startDate: new Date(startDate), endDate: today };
}

function generateTimelineEvents(date: Date) {
  return [
    {
      id: '1',
      title: '팀 스탠드업',
      date,
      hour: 9,
      duration: 1,
      color: '#4285f4',
    },
    {
      id: '2',
      title: '프로젝트 미팅',
      date,
      hour: 10,
      duration: 2,
      color: '#ea4335',
    },
    {
      id: '3',
      title: '점심',
      date,
      hour: 12,
      duration: 1,
      color: '#34a853',
    },
    {
      id: '4',
      title: '코드 리뷰',
      date,
      hour: 14,
      duration: 1,
      color: '#fbbc04',
    },
    {
      id: '5',
      title: '개발 작업',
      date,
      hour: 15,
      duration: 3,
      color: '#9c27b0',
    },
  ];
}

function generateNDayEvents() {
  const events = [];
  const today = new Date();

  for (let dayOffset = 0; dayOffset < 14; dayOffset++) {
    const date = new Date(today);
    date.setDate(date.getDate() + dayOffset);

    // 각 날짜에 랜덤 이벤트 생성
    const eventCount = Math.floor(Math.random() * 4);
    for (let i = 0; i < eventCount; i++) {
      const hour = 8 + Math.floor(Math.random() * 10); // 8시-17시
      events.push({
        id: `${dayOffset}-${i}`,
        title: ['회의', '리뷰', '작업', '미팅', '점심'][Math.floor(Math.random() * 5)],
        date: new Date(date),
        hour,
      });
    }
  }

  return events;
}

export function App() {
  const today = new Date();
  const contribution = generateContributionData();
  const timelineEvents = generateTimelineEvents(today);
  const nDayEvents = generateNDayEvents();

  return (
    <div className="demo-app">
      <h1>@h6s/calendar-v2 PoC Demo</h1>
      <p className="description">
        동일한 <code>createTimeGrid</code> Core를 사용하여
        4가지 완전히 다른 UI를 렌더링합니다.
      </p>

      <div className="demo-grid">
        <section className="demo-section">
          <h3 style={{ marginTop: 0, marginBottom: 16 }}>월간 달력 (Navigation + Selection)</h3>
          <MonthCalendar weekStartsOn={0} />
        </section>

        <section className="demo-section">
          <GithubGrass
            startDate={contribution.startDate}
            endDate={contribution.endDate}
            data={contribution.data}
          />
        </section>

        <section className="demo-section">
          <DayTimeline
            date={today}
            events={timelineEvents}
          />
        </section>

        <section className="demo-section wide">
          <h3 style={{ marginTop: 0, marginBottom: 16 }}>N-Day View (동적 일수 변경)</h3>
          <NDayView events={nDayEvents} initialDays={4} />
        </section>
      </div>

      <footer className="demo-footer">
        <h4>PoC 검증 포인트</h4>
        <ul>
          <li>✅ Core zero-dependency: 외부 의존성 없음</li>
          <li>✅ 4개 UI 패턴: 월간 / 잔디 / 타임라인 / N-Day</li>
          <li>✅ 유틸리티 조합: withPadding, toMatrix, groupBy</li>
          <li>✅ 플러그인 시스템: selection</li>
          <li>✅ 데이터 바인딩: getItemDate로 이벤트 매핑</li>
          <li>✅ Navigation: 이전/다음/오늘 버튼으로 이동</li>
          <li>✅ Selection: 날짜 클릭 시 선택 상태 표시</li>
          <li>✅ 동적 범위: N-Day View에서 표시 일수 변경</li>
        </ul>
      </footer>

      <style>{`
        .demo-app {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }
        .description {
          color: #666;
          margin-bottom: 32px;
        }
        .description code {
          background: #f5f5f5;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 14px;
        }
        .demo-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 32px;
          margin-bottom: 32px;
        }
        .demo-section {
          padding: 20px;
          border: 1px solid #eee;
          border-radius: 8px;
          background: white;
        }
        .demo-section.wide {
          grid-column: 1 / -1;
        }
        .demo-footer {
          margin-top: 32px;
          padding: 20px;
          background: #f9f9f9;
          border-radius: 8px;
        }
        .demo-footer ul {
          list-style: none;
          padding: 0;
        }
        .demo-footer li {
          padding: 4px 0;
        }
      `}</style>
    </div>
  );
}

export default App;

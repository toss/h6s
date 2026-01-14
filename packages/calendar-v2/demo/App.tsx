/**
 * Demo App - 7개 캘린더 UI 동시 렌더링
 *
 * 동일한 createTimeGrid Core를 사용하여 완전히 다른 7가지 UI 렌더링.
 * 이것이 TanStack 스타일 아키텍처의 핵심 가치를 보여줌.
 */

import React from 'react';
import { MonthCalendar } from './MonthCalendar';
import { GithubGrass } from './GithubGrass';
import { NDayView } from './NDayView';
import { GoogleDayView } from './GoogleDayView';
import { YearSelector } from './YearSelector';
import { MonthSelector } from './MonthSelector';
import { AgendaView } from './AgendaView';

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
      const minute = Math.floor(Math.random() * 4) * 15; // 0, 15, 30, 45
      events.push({
        id: `${dayOffset}-${i}`,
        title: ['회의', '리뷰', '작업', '미팅', '점심'][Math.floor(Math.random() * 5)],
        date: new Date(date),
        hour,
        minute,
      });
    }
  }

  return events;
}

// Events Plugin용 샘플 이벤트 (start/end Date 형식)
function generateCalendarEvents(baseDate: Date) {
  const events = [];
  const colors = ['#4285f4', '#ea4335', '#34a853', '#fbbc04', '#9c27b0', '#00acc1'];

  // 오늘 이벤트들 (겹치는 것 포함)
  const todayStart = new Date(baseDate);
  todayStart.setHours(0, 0, 0, 0);

  events.push({
    id: 'ev1',
    title: '팀 스탠드업',
    start: new Date(todayStart.getFullYear(), todayStart.getMonth(), todayStart.getDate(), 9, 0),
    end: new Date(todayStart.getFullYear(), todayStart.getMonth(), todayStart.getDate(), 10, 0),
    color: colors[0],
    description: '일일 팀 미팅',
  });

  events.push({
    id: 'ev2',
    title: '프로젝트 회의',
    start: new Date(todayStart.getFullYear(), todayStart.getMonth(), todayStart.getDate(), 9, 30),
    end: new Date(todayStart.getFullYear(), todayStart.getMonth(), todayStart.getDate(), 11, 30),
    color: colors[1],
    description: '신규 프로젝트 킥오프',
  });

  events.push({
    id: 'ev3',
    title: '1:1 미팅',
    start: new Date(todayStart.getFullYear(), todayStart.getMonth(), todayStart.getDate(), 10, 0),
    end: new Date(todayStart.getFullYear(), todayStart.getMonth(), todayStart.getDate(), 10, 45),
    color: colors[2],
  });

  events.push({
    id: 'ev4',
    title: '점심',
    start: new Date(todayStart.getFullYear(), todayStart.getMonth(), todayStart.getDate(), 12, 0),
    end: new Date(todayStart.getFullYear(), todayStart.getMonth(), todayStart.getDate(), 13, 0),
    color: colors[3],
  });

  events.push({
    id: 'ev5',
    title: '코드 리뷰',
    start: new Date(todayStart.getFullYear(), todayStart.getMonth(), todayStart.getDate(), 14, 0),
    end: new Date(todayStart.getFullYear(), todayStart.getMonth(), todayStart.getDate(), 15, 30),
    color: colors[4],
    description: 'PR #123 리뷰',
  });

  events.push({
    id: 'ev6',
    title: '집중 개발 시간',
    start: new Date(todayStart.getFullYear(), todayStart.getMonth(), todayStart.getDate(), 15, 0),
    end: new Date(todayStart.getFullYear(), todayStart.getMonth(), todayStart.getDate(), 18, 0),
    color: colors[5],
  });

  // 다른 날들에 이벤트 추가 (AgendaView용)
  for (let dayOffset = 1; dayOffset <= 15; dayOffset++) {
    if (Math.random() > 0.4) { // 60% 확률로 이벤트 생성
      const eventDate = new Date(todayStart);
      eventDate.setDate(eventDate.getDate() + dayOffset);

      const hour = 9 + Math.floor(Math.random() * 8);
      const duration = 1 + Math.floor(Math.random() * 2);

      events.push({
        id: `ev-future-${dayOffset}`,
        title: ['팀 미팅', '1:1', '리뷰', '워크샵', '발표'][Math.floor(Math.random() * 5)],
        start: new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate(), hour, 0),
        end: new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate(), hour + duration, 0),
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }
  }

  return events;
}

export function App() {
  const today = new Date();
  const contribution = generateContributionData();
  const nDayEvents = generateNDayEvents();
  const calendarEvents = generateCalendarEvents(today);

  return (
    <div className="demo-app">
      <h1>@h6s/calendar-v2 PoC Demo</h1>
      <p className="description">
        동일한 <code>createTimeGrid</code> Core를 사용하여
        6가지 완전히 다른 UI를 렌더링합니다.
      </p>

      <div className="demo-grid">
        <section className="demo-section">
          <h3 className="section-title">Month Calendar</h3>
          <p className="plugin-info">Plugin: selection, navigation</p>
          <MonthCalendar weekStartsOn={0} />
        </section>

        <section className="demo-section">
          <h3 className="section-title">Github Grass</h3>
          <p className="plugin-info">Plugin: events</p>
          <GithubGrass
            startDate={contribution.startDate}
            endDate={contribution.endDate}
            data={contribution.data}
          />
        </section>

        <section className="demo-section">
          <h3 className="section-title">Month Selector</h3>
          <p className="plugin-info">Plugin: selection, navigation</p>
          <MonthSelector />
        </section>

        <section className="demo-section">
          <h3 className="section-title">Year Selector</h3>
          <p className="plugin-info">Plugin: selection, navigation</p>
          <YearSelector />
        </section>

        <section className="demo-section wide">
          <h3 className="section-title">N-Day View</h3>
          <p className="plugin-info">Plugin: events</p>
          <NDayView events={nDayEvents} initialDays={4} />
        </section>

        <section className="demo-section">
          <h3 className="section-title">Day View</h3>
          <p className="plugin-info">Plugin: events, navigation</p>
          <GoogleDayView initialDate={today} events={calendarEvents} />
        </section>

        <section className="demo-section">
          <h3 className="section-title">Agenda View</h3>
          <p className="plugin-info">Plugin: events, navigation</p>
          <AgendaView initialDate={today} events={calendarEvents} />
        </section>
      </div>

      <footer className="demo-footer">
        <h4>PoC 검증 포인트</h4>
        <ul>
          <li>✅ Core zero-dependency: 외부 의존성 없음 (Native Date only)</li>
          <li>✅ 7개 UI 패턴: Month / Grass / N-Day / Day / Agenda / Year Selector / Month Selector</li>
          <li>✅ 다양한 cellUnit: day, hour, month, year</li>
          <li>✅ 플러그인 시스템: selection, navigation, events</li>
          <li>✅ fillWeeks 옵션: 월간 달력에서 완전한 주 생성</li>
          <li>✅ Navigation Plugin: 이전/다음/오늘 버튼으로 이동</li>
          <li>✅ Selection Plugin: 날짜 클릭 시 선택 상태 표시</li>
          <li>✅ Events Plugin: 시간대별 이벤트 필터링</li>
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
        .section-title {
          margin: 0 0 8px 0;
          font-size: 20px;
          font-weight: 600;
        }
        .plugin-info {
          margin: 0 0 16px 0;
          font-size: 14px;
          color: #888;
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

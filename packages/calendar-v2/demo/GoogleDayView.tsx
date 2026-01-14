/**
 * GoogleDayView - Events + Navigation Plugin을 활용한 일간 캘린더
 *
 * Google Calendar 스타일의 Day View를 구현.
 * useTimeGrid로 상태 관리 자동화, Events Plugin으로 이벤트 필터링.
 */

import React from 'react';
import { useTimeGrid, events, navigation, startOfDay } from '../src';

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  color: string;
}

interface GoogleDayViewProps {
  initialDate?: Date;
  events?: CalendarEvent[];
}

const CELL_HEIGHT = 48; // 1시간 = 48px
const HOURS = Array.from({ length: 24 }, (_, i) => i);

export function GoogleDayView({
  initialDate = new Date(),
  events: initialEvents = [],
}: GoogleDayViewProps) {
  // 초기 범위 (하루)
  const dayStart = startOfDay(initialDate);
  const dayEnd = new Date(dayStart);
  dayEnd.setHours(23, 59, 59, 999);

  // useTimeGrid - 상태 관리 자동화
  const grid = useTimeGrid({
    range: { start: dayStart, end: dayEnd },
    cellUnit: 'hour',
    plugins: [
      events({
        data: initialEvents,
        getEventRange: (e) => ({ start: e.start, end: e.end }),
      }),
      navigation({ unit: 'day' }),
    ] as const,
  });

  const formatDate = (d: Date) => {
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    const day = d.getDate();
    const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
    const weekday = weekdays[d.getDay()];
    return `${year}년 ${month}월 ${day}일 (${weekday})`;
  };

  const formatTime = (d: Date) => {
    const hours = d.getHours().toString().padStart(2, '0');
    const minutes = d.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  // 이벤트 위치 계산
  const getEventStyle = (event: CalendarEvent): React.CSSProperties => {
    const currentDayStart = startOfDay(grid.navigation.state.rangeStart);
    const msPerHour = 60 * 60 * 1000;

    const eventStart = Math.max(event.start.getTime(), currentDayStart.getTime());
    const eventEnd = Math.min(event.end.getTime(), currentDayStart.getTime() + 24 * msPerHour);

    const top = (eventStart - currentDayStart.getTime()) / msPerHour * CELL_HEIGHT;
    const height = Math.max((eventEnd - eventStart) / msPerHour * CELL_HEIGHT - 2, 20);

    return {
      position: 'absolute',
      top,
      height,
      left: 4,
      right: 4,
      backgroundColor: event.color,
      borderRadius: 4,
      padding: '4px 6px',
      color: 'white',
      fontSize: 12,
      overflow: 'hidden',
      boxSizing: 'border-box',
      cursor: 'pointer',
    };
  };

  return (
    <div className="google-day-view">
      <div className="header">
        <div className="nav-buttons">
          <button type="button" onClick={grid.navigation.goPrev}>◀</button>
          <button type="button" onClick={grid.navigation.goToday}>오늘</button>
          <button type="button" onClick={grid.navigation.goNext}>▶</button>
        </div>
        <h3 className="date-title">{formatDate(grid.navigation.state.rangeStart)}</h3>
      </div>

      <div className="timeline-wrapper">
        {/* 시간 라벨 */}
        <div className="time-labels">
          {HOURS.map((hour) => (
            <div key={hour} className="time-label" style={{ height: CELL_HEIGHT }}>
              {hour.toString().padStart(2, '0')}:00
            </div>
          ))}
        </div>

        {/* 메인 그리드 영역 */}
        <div className="grid-area">
          {/* 배경 그리드 라인 */}
          <div className="grid-lines">
            {HOURS.map((hour) => (
              <div key={hour} className="grid-line" style={{ height: CELL_HEIGHT }} />
            ))}
          </div>

          {/* 이벤트 레이어 */}
          <div className="events-layer">
            {grid.events.eventsInView.map((event) => (
              <div
                key={event.id}
                style={getEventStyle(event)}
                title={`${event.title}\n${formatTime(event.start)} - ${formatTime(event.end)}`}
              >
                <div style={{ fontWeight: 500, marginBottom: 2 }}>{event.title}</div>
                <div style={{ fontSize: 10, opacity: 0.9 }}>
                  {formatTime(event.start)} - {formatTime(event.end)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="info">
        <p>총 {grid.events.eventsInView.length}개 이벤트 표시 중</p>
      </div>

      <style>{`
        .google-day-view {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          max-width: 700px;
        }
        .header {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 16px;
        }
        .nav-buttons {
          display: flex;
          gap: 4px;
        }
        .nav-buttons button {
          padding: 6px 12px;
          border: 1px solid #ddd;
          background: white;
          border-radius: 4px;
          cursor: pointer;
        }
        .nav-buttons button:hover {
          background: #f5f5f5;
        }
        .date-title {
          margin: 0;
          font-size: 18px;
          font-weight: 500;
        }
        .timeline-wrapper {
          display: flex;
          border: 1px solid #ddd;
          border-radius: 4px;
          overflow: hidden;
          max-height: 500px;
          overflow-y: auto;
        }
        .time-labels {
          width: 60px;
          flex-shrink: 0;
          background: #f9f9f9;
          border-right: 1px solid #eee;
        }
        .time-label {
          display: flex;
          align-items: flex-start;
          justify-content: flex-end;
          padding: 0 8px;
          font-size: 11px;
          color: #666;
          box-sizing: border-box;
          transform: translateY(-7px);
        }
        .grid-area {
          flex: 1;
          position: relative;
          min-width: 0;
        }
        .grid-lines {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
        }
        .grid-line {
          border-bottom: 1px solid #eee;
          box-sizing: border-box;
        }
        .grid-line:nth-child(even) {
          background: #fafafa;
        }
        .events-layer {
          position: relative;
          height: ${CELL_HEIGHT * 24}px;
        }
        .info {
          margin-top: 16px;
          padding: 12px;
          background: #f5f5f5;
          border-radius: 4px;
          font-size: 13px;
        }
        .info p {
          margin: 4px 0;
        }
      `}</style>
    </div>
  );
}

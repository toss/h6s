/**
 * AgendaView - 리스트 스타일 아젠다 뷰
 *
 * 이벤트가 있는 날만 필터링하여 리스트로 표시.
 * useTimeGrid로 상태 관리 자동화, Events Plugin으로 날짜별 이벤트 그룹핑.
 */

import React, { useMemo } from 'react';
import {
  useTimeGrid,
  events,
  navigation,
  startOfMonth,
  endOfMonth,
  isSameDay,
} from '../src';

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  color: string;
  description?: string;
}

interface AgendaViewProps {
  initialDate?: Date;
  events?: CalendarEvent[];
}

const WEEKDAY_NAMES = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];

export function AgendaView({
  initialDate = new Date(),
  events: initialEvents = [],
}: AgendaViewProps) {
  // 초기 범위 (한 달)
  const monthStart = startOfMonth(initialDate);
  const monthEnd = endOfMonth(initialDate);

  // useTimeGrid - 상태 관리 자동화
  const grid = useTimeGrid({
    range: { start: monthStart, end: monthEnd },
    cellUnit: 'day',
    plugins: [
      events({
        data: initialEvents,
        getEventRange: (e) => ({ start: e.start, end: e.end }),
      }),
      navigation({ unit: 'month' }),
    ] as const,
  });

  // 이벤트가 있는 날만 그룹화
  const daysWithEvents = useMemo(() => {
    const result: Array<{
      date: Date;
      events: CalendarEvent[];
    }> = [];

    for (const cell of grid.cells) {
      const dayEvents = grid.events.getEventsForDate(cell.date);
      if (dayEvents.length > 0) {
        // 시작 시간순 정렬
        const sortedEvents = [...dayEvents].sort(
          (a, b) => a.start.getTime() - b.start.getTime()
        );
        result.push({
          date: cell.date,
          events: sortedEvents,
        });
      }
    }

    return result;
  }, [grid]);

  const formatDate = (d: Date) => {
    const month = d.getMonth() + 1;
    const day = d.getDate();
    const weekday = WEEKDAY_NAMES[d.getDay()];
    return `${month}월 ${day}일 ${weekday}`;
  };

  const formatTime = (d: Date) => {
    const hours = d.getHours().toString().padStart(2, '0');
    const minutes = d.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const formatMonthTitle = (d: Date) => {
    return `${d.getFullYear()}년 ${d.getMonth() + 1}월`;
  };

  const isToday = (date: Date) => isSameDay(date, new Date());

  return (
    <div className="agenda-view">
      <div className="header">
        <div className="nav-buttons">
          <button type="button" onClick={grid.navigation.goPrev}>◀</button>
          <button type="button" onClick={grid.navigation.goToday}>이번 달</button>
          <button type="button" onClick={grid.navigation.goNext}>▶</button>
        </div>
        <h3 className="month-title">{formatMonthTitle(grid.navigation.state.rangeStart)}</h3>
      </div>

      <div className="agenda-list">
        {daysWithEvents.length === 0 ? (
          <div className="no-events">
            이번 달에는 예정된 일정이 없습니다.
          </div>
        ) : (
          daysWithEvents.map(({ date, events: dayEvents }) => (
            <div key={date.toISOString()} className="day-group">
              <div className={`day-header ${isToday(date) ? 'today' : ''}`}>
                <span className="day-date">{formatDate(date)}</span>
                {isToday(date) && <span className="today-badge">오늘</span>}
              </div>
              <div className="events-list">
                {dayEvents.map((event) => (
                  <div
                    key={event.id}
                    className="event-item"
                    style={{ borderLeftColor: event.color }}
                  >
                    <div className="event-time">
                      {formatTime(event.start)} - {formatTime(event.end)}
                    </div>
                    <div className="event-content">
                      <div className="event-title">{event.title}</div>
                      {event.description && (
                        <div className="event-description">{event.description}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="info">
        <p>
          총 {daysWithEvents.length}일에 {grid.events.eventsInView.length}개 이벤트
        </p>
      </div>

      <style>{`
        .agenda-view {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          max-width: 600px;
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
        .month-title {
          margin: 0;
          font-size: 18px;
          font-weight: 500;
        }
        .agenda-list {
          border: 1px solid #ddd;
          border-radius: 8px;
          overflow: hidden;
        }
        .no-events {
          padding: 40px;
          text-align: center;
          color: #666;
        }
        .day-group {
          border-bottom: 1px solid #eee;
        }
        .day-group:last-child {
          border-bottom: none;
        }
        .day-header {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 16px;
          background: #f9f9f9;
          font-weight: 500;
        }
        .day-header.today {
          background: #e3f2fd;
        }
        .day-date {
          color: #333;
        }
        .today-badge {
          font-size: 11px;
          padding: 2px 6px;
          background: #1976d2;
          color: white;
          border-radius: 10px;
        }
        .events-list {
          padding: 8px 0;
        }
        .event-item {
          display: flex;
          gap: 12px;
          padding: 10px 16px;
          border-left: 3px solid #1976d2;
          margin: 4px 16px;
          background: white;
          border-radius: 0 4px 4px 0;
        }
        .event-item:hover {
          background: #f5f5f5;
        }
        .event-time {
          flex-shrink: 0;
          width: 100px;
          font-size: 13px;
          color: #666;
        }
        .event-content {
          flex: 1;
          min-width: 0;
        }
        .event-title {
          font-weight: 500;
          color: #333;
        }
        .event-description {
          font-size: 13px;
          color: #666;
          margin-top: 4px;
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

/**
 * DayTimeline - 일간 타임라인 데모
 *
 * 동일한 createTimeGrid 결과를 사용하여 일간 타임라인 스타일 UI 렌더링.
 * 단일 날짜 범위로 하루의 이벤트들을 시간순 표시.
 */

import React from 'react';
import { createTimeGrid } from '../src';

interface Event {
  id: string;
  title: string;
  date: Date;
  hour: number;
  duration: number; // hours
  color: string;
}

interface DayTimelineProps {
  date: Date;
  events?: Event[];
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);

export function DayTimeline({ date, events = [] }: DayTimelineProps) {
  // 단일 날짜 TimeGrid (PoC에서 edge case 검증)
  const grid = createTimeGrid<Event>({
    range: { start: date, end: date },
    cellUnit: 'day',
    data: events,
    getItemDate: (event) => event.date,
  });

  const cell = grid.cells[0];
  if (!cell) return null;

  // 시간별로 이벤트 그룹화
  const eventsByHour = new Map<number, Event[]>();
  for (const event of cell.data) {
    if (!eventsByHour.has(event.hour)) {
      eventsByHour.set(event.hour, []);
    }
    eventsByHour.get(event.hour)!.push(event);
  }

  const formatDate = (d: Date) => {
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    const day = d.getDate();
    const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
    const weekday = weekdays[d.getDay()];
    return `${year}년 ${month}월 ${day}일 (${weekday})`;
  };

  return (
    <div className="day-timeline">
      <h3>일간 타임라인</h3>
      <p className="date-label">{formatDate(date)}</p>

      <div className="timeline-container">
        {HOURS.map((hour) => {
          const hourEvents = eventsByHour.get(hour) || [];

          return (
            <div key={hour} className="hour-row">
              <div className="hour-label">
                {hour.toString().padStart(2, '0')}:00
              </div>
              <div className="hour-content">
                {hourEvents.map((event) => (
                  <div
                    key={event.id}
                    className="event"
                    style={{
                      backgroundColor: event.color,
                      height: `${event.duration * 40 - 4}px`,
                    }}
                  >
                    {event.title}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        .day-timeline {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          max-width: 600px;
        }
        .date-label {
          color: #666;
          margin-bottom: 16px;
        }
        .timeline-container {
          border: 1px solid #ddd;
          border-radius: 4px;
          overflow: hidden;
        }
        .hour-row {
          display: flex;
          min-height: 40px;
          border-bottom: 1px solid #eee;
        }
        .hour-row:last-child {
          border-bottom: none;
        }
        .hour-label {
          width: 60px;
          padding: 8px;
          background: #f9f9f9;
          color: #666;
          font-size: 12px;
          border-right: 1px solid #eee;
          flex-shrink: 0;
        }
        .hour-content {
          flex: 1;
          padding: 2px;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .event {
          padding: 4px 8px;
          border-radius: 4px;
          color: white;
          font-size: 12px;
          font-weight: 500;
        }
      `}</style>
    </div>
  );
}

/**
 * NDayView - N일 뷰 데모
 *
 * Google Calendar의 "4일" 뷰처럼 연속된 N일을 표시.
 * N 값을 동적으로 변경 가능.
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
  createTimeGrid,
  isWeekend,
  addDays,
} from '../src';
import type { Cell } from '../src';

const WEEKDAY_NAMES = ['일', '월', '화', '수', '목', '금', '토'];

interface Event {
  id: string;
  title: string;
  date: Date;
  hour: number; // 0-23
  minute?: number; // 0-59 (optional)
}

interface NDayViewProps {
  initialDate?: Date;
  initialDays?: number;
  events?: Event[];
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const DAY_OPTIONS = [1, 2, 3, 4, 5, 7, 14];

export function NDayView({
  initialDate,
  initialDays = 4,
  events = [],
}: NDayViewProps) {
  const today = new Date();

  // 상태 관리
  const [startDate, setStartDate] = useState(initialDate ?? today);
  const [days, setDays] = useState(initialDays);

  // N일 범위 계산
  const endDate = useMemo(() => {
    return addDays(startDate, days - 1);
  }, [startDate, days]);

  // TimeGrid 생성
  const grid = useMemo(() => {
    return createTimeGrid<Event>({
      range: { start: startDate, end: endDate },
      cellUnit: 'day',
      data: events,
      getItemDate: (event) => event.date,
    });
  }, [startDate, endDate, events]);

  // Navigation
  const goNext = useCallback(() => {
    setStartDate((prev) => {
      const next = new Date(prev);
      next.setDate(next.getDate() + days);
      return next;
    });
  }, [days]);

  const goPrev = useCallback(() => {
    setStartDate((prev) => {
      const next = new Date(prev);
      next.setDate(next.getDate() - days);
      return next;
    });
  }, [days]);

  const goToday = useCallback(() => {
    setStartDate(new Date());
  }, []);

  // 날짜 포맷
  const formatDate = (cell: Cell<Event>) => {
    return `${cell.month + 1}/${cell.dayOfMonth}`;
  };

  const formatDateRange = () => {
    const start = grid.cells[0];
    const end = grid.cells[grid.cells.length - 1];
    if (!start || !end) return '';

    if (start.month === end.month) {
      return `${start.year}년 ${start.month + 1}월 ${start.dayOfMonth}일 - ${end.dayOfMonth}일`;
    }
    return `${start.month + 1}/${start.dayOfMonth} - ${end.month + 1}/${end.dayOfMonth}`;
  };

  return (
    <div className="n-day-view">
      {/* Header */}
      <div className="header">
        <div className="nav-controls">
          <button onClick={goPrev}>◀</button>
          <button onClick={goToday}>오늘</button>
          <button onClick={goNext}>▶</button>
          <span className="date-range">{formatDateRange()}</span>
        </div>

        <div className="day-selector">
          <span>표시 일수:</span>
          {DAY_OPTIONS.map((n) => (
            <button
              key={n}
              onClick={() => setDays(n)}
              className={days === n ? 'active' : ''}
            >
              {n}일
            </button>
          ))}
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="calendar-grid">
        {/* Day Headers */}
        <div className="day-headers">
          <div className="time-gutter" /> {/* 시간 열 공간 */}
          {grid.cells.map((cell) => (
            <div
              key={cell.key}
              className={`day-header ${cell.isToday ? 'today' : ''} ${isWeekend(cell.weekday) ? 'weekend' : ''}`}
            >
              <span className="weekday">{WEEKDAY_NAMES[cell.weekday]}</span>
              <span className="date">{formatDate(cell)}</span>
            </div>
          ))}
        </div>

        {/* Time Grid */}
        <div className="time-grid">
          {/* Time Labels */}
          <div className="time-column">
            {HOURS.map((hour) => (
              <div key={hour} className="time-label">
                {hour.toString().padStart(2, '0')}:00
              </div>
            ))}
          </div>

          {/* Day Columns */}
          {grid.cells.map((cell) => (
            <div
              key={cell.key}
              className={`day-column ${cell.isToday ? 'today' : ''} ${isWeekend(cell.weekday) ? 'weekend' : ''}`}
            >
              {HOURS.map((hour) => {
                const hourEvents = cell.data.filter((e) => e.hour === hour);
                return (
                  <div key={hour} className="hour-cell">
                    {hourEvents.map((event) => (
                      <div key={event.id} className="event">
                        <span className="event-time">
                          {hour.toString().padStart(2, '0')}:{(event.minute ?? 0).toString().padStart(2, '0')}
                        </span>
                        {' '}{event.title}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .n-day-view {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          border: 1px solid #ddd;
          border-radius: 8px;
          overflow: hidden;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px;
          background: #f5f5f5;
          border-bottom: 1px solid #ddd;
          flex-wrap: wrap;
          gap: 8px;
        }

        .nav-controls {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .nav-controls button {
          padding: 6px 12px;
          border: 1px solid #ddd;
          background: white;
          border-radius: 4px;
          cursor: pointer;
        }

        .nav-controls button:hover {
          background: #e9e9e9;
        }

        .date-range {
          margin-left: 12px;
          font-weight: 600;
        }

        .day-selector {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .day-selector span {
          margin-right: 8px;
          color: #666;
        }

        .day-selector button {
          padding: 4px 8px;
          border: 1px solid #ddd;
          background: white;
          border-radius: 4px;
          cursor: pointer;
        }

        .day-selector button:hover {
          background: #e9e9e9;
        }

        .day-selector button.active {
          background: #1976d2;
          color: white;
          border-color: #1976d2;
        }

        .calendar-grid {
          display: flex;
          flex-direction: column;
        }

        .day-headers {
          display: flex;
          border-bottom: 1px solid #ddd;
          background: #fafafa;
        }

        .time-gutter {
          width: 60px;
          flex-shrink: 0;
        }

        .day-header {
          flex: 1;
          text-align: center;
          padding: 8px 4px;
          border-left: 1px solid #eee;
        }

        .day-header.today {
          background: #e3f2fd;
        }

        .day-header.weekend {
          color: #e53935;
        }

        .day-header .weekday {
          display: block;
          font-size: 12px;
          color: #666;
        }

        .day-header.weekend .weekday {
          color: #e53935;
        }

        .day-header .date {
          display: block;
          font-size: 18px;
          font-weight: 600;
        }

        .day-header.today .date {
          background: #1976d2;
          color: white;
          border-radius: 50%;
          width: 28px;
          height: 28px;
          line-height: 28px;
          margin: 0 auto;
        }

        .time-grid {
          display: flex;
          height: 400px;
          overflow-y: auto;
        }

        .time-column {
          width: 60px;
          flex-shrink: 0;
          border-right: 1px solid #ddd;
        }

        .time-label {
          height: 48px;
          padding: 0 8px;
          font-size: 11px;
          color: #666;
          text-align: right;
          box-sizing: border-box;
          border-bottom: 1px solid transparent;
          display: flex;
          align-items: flex-start;
          justify-content: flex-end;
          transform: translateY(-7px);
        }

        .day-column {
          flex: 1;
          border-left: 1px solid #eee;
        }

        .hour-cell {
          height: 48px;
          border-bottom: 1px solid #eee;
          padding: 2px;
        }

        .day-column.today .hour-cell {
          background: #f5faff;
        }

        .day-column.weekend .hour-cell {
          background: #fff8f8;
        }

        .event {
          background: #1976d2;
          color: white;
          font-size: 11px;
          padding: 2px 4px;
          border-radius: 2px;
          margin-bottom: 1px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .event-time {
          font-weight: 600;
          opacity: 0.9;
        }
      `}</style>
    </div>
  );
}

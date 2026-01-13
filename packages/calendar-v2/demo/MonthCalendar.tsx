/**
 * MonthCalendar - 전통적인 월간 달력 데모
 *
 * createTimeGrid + plugins 옵션 + isWeekend 유틸리티 조합.
 * navigation (이전/다음/오늘) 동작 포함.
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
  createTimeGrid,
  createMockAdapter,
  withPadding,
  toMatrix,
  selection,
  isWeekend,
} from '../src';
import type { Cell, PaddedCell, WeekDay } from '../src';

const WEEKDAY_NAMES = ['일', '월', '화', '수', '목', '금', '토'];

interface MonthCalendarProps {
  initialYear?: number;
  initialMonth?: number; // 0-11
  weekStartsOn?: WeekDay;
}

export function MonthCalendar({
  initialYear,
  initialMonth,
  weekStartsOn = 0,
}: MonthCalendarProps) {
  const today = new Date();

  // Navigation 상태
  const [year, setYear] = useState(initialYear ?? today.getFullYear());
  const [month, setMonth] = useState(initialMonth ?? today.getMonth());

  // Selection 상태 (React 상태로 관리)
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  const adapter = useMemo(() => createMockAdapter({ weekStartsOn }), [weekStartsOn]);

  // 해당 월의 시작일과 끝일 계산
  const { startDate, endDate } = useMemo(() => {
    const start = new Date(year, month, 1);
    const end = new Date(year, month + 1, 0);
    return { startDate: start, endDate: end };
  }, [year, month]);

  // TimeGrid 생성 (plugins 옵션으로 전달)
  const grid = useMemo(() => {
    return createTimeGrid({
      adapter,
      range: { start: startDate, end: endDate },
      cellUnit: 'day',
      weekStartsOn,
      plugins: [selection({ mode: 'single' })],
    });
  }, [adapter, startDate, endDate, weekStartsOn]);

  // 패딩 추가 + 행렬 변환
  const matrix = useMemo(() => {
    const paddedGrid = withPadding(grid, adapter);
    return toMatrix(paddedGrid.cells, 7);
  }, [grid, adapter]);

  // Navigation 핸들러
  const goNext = useCallback(() => {
    setMonth((m) => {
      if (m === 11) {
        setYear((y) => y + 1);
        return 0;
      }
      return m + 1;
    });
  }, []);

  const goPrev = useCallback(() => {
    setMonth((m) => {
      if (m === 0) {
        setYear((y) => y - 1);
        return 11;
      }
      return m - 1;
    });
  }, []);

  const goToday = useCallback(() => {
    const now = new Date();
    setYear(now.getFullYear());
    setMonth(now.getMonth());
  }, []);

  // Selection 핸들러
  const handleCellClick = useCallback((cell: Cell<unknown, Date>) => {
    setSelectedKey((prev) => (prev === cell.key ? null : cell.key));
  }, []);

  // 헤더 생성 (주 시작 요일에 따라 정렬)
  const headers = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const dayIndex = ((weekStartsOn + i) % 7) as WeekDay;
      return { name: WEEKDAY_NAMES[dayIndex], dayIndex };
    });
  }, [weekStartsOn]);

  return (
    <div className="month-calendar">
      {/* Navigation */}
      <div className="calendar-header">
        <button onClick={goPrev} className="nav-btn">◀</button>
        <h3>{year}년 {month + 1}월</h3>
        <button onClick={goNext} className="nav-btn">▶</button>
        <button onClick={goToday} className="today-btn">오늘</button>
      </div>

      <table>
        <thead>
          <tr>
            {headers.map(({ name, dayIndex }) => (
              <th
                key={dayIndex}
                style={{ color: isWeekend(dayIndex) ? '#e53935' : 'inherit' }}
              >
                {name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {matrix.map((week, weekIndex) => (
            <tr key={weekIndex}>
              {week.map((cell) => {
                const paddedCell = cell as PaddedCell<unknown, Date>;
                const isSelected = selectedKey === cell.key;
                const isCellWeekend = isWeekend(cell.weekday);

                return (
                  <td
                    key={cell.key}
                    onClick={() => handleCellClick(cell)}
                    style={{
                      opacity: paddedCell.isPadding ? 0.3 : 1,
                      backgroundColor: isSelected
                        ? '#1976d2'
                        : cell.isToday
                        ? '#e3f2fd'
                        : 'transparent',
                      color: isSelected
                        ? 'white'
                        : isCellWeekend
                        ? '#e53935'
                        : 'inherit',
                      cursor: 'pointer',
                    }}
                  >
                    {cell.dayOfMonth}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      {selectedKey && (
        <div className="selection-info">
          선택된 날짜: {selectedKey}
        </div>
      )}

      <style>{`
        .month-calendar {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
        .calendar-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
        }
        .calendar-header h3 {
          margin: 0;
          min-width: 120px;
          text-align: center;
        }
        .nav-btn, .today-btn {
          padding: 4px 12px;
          border: 1px solid #ddd;
          background: white;
          border-radius: 4px;
          cursor: pointer;
        }
        .nav-btn:hover, .today-btn:hover {
          background: #f5f5f5;
        }
        .month-calendar table {
          border-collapse: collapse;
          width: 100%;
          max-width: 400px;
        }
        .month-calendar th,
        .month-calendar td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: center;
          width: 14.28%;
        }
        .month-calendar th {
          background: #f5f5f5;
          font-weight: bold;
        }
        .month-calendar td:hover {
          background: #f0f0f0;
        }
        .selection-info {
          margin-top: 12px;
          padding: 8px;
          background: #e3f2fd;
          border-radius: 4px;
          font-size: 14px;
        }
      `}</style>
    </div>
  );
}

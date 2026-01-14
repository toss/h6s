/**
 * MonthCalendar - 전통적인 월간 달력 데모
 *
 * useTimeGrid + plugins (selection, navigation) + isWeekend 유틸리티 조합.
 * React Adapter가 상태 관리를 자동으로 처리.
 */

import React, { useMemo } from 'react';
import {
  useTimeGrid,
  selection,
  navigation,
  isWeekend,
  endOfMonth,
} from '../src';
import type { Cell, WeekDay } from '../src';

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
  const year = initialYear ?? today.getFullYear();
  const month = initialMonth ?? today.getMonth();
  const initialDate = new Date(year, month, 1);

  // useTimeGrid - 모든 상태 관리가 자동으로 처리됨
  const grid = useTimeGrid({
    range: { start: initialDate, end: endOfMonth(initialDate) },
    cellUnit: 'day',
    weekStartsOn,
    fillWeeks: true,  // 완전한 주로 확장
    plugins: [
      selection({ mode: 'single' }),
      navigation({ unit: 'month' }),
    ] as const,
  });

  // 현재 표시 중인 월 (padding 판단용)
  const displayMonth = grid.navigation.state.rangeStart.getMonth();

  // 행렬 변환
  const rows = useMemo(() => grid.getRows(7), [grid]);

  // 헤더 생성 (주 시작 요일에 따라 정렬)
  const headers = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const dayIndex = ((weekStartsOn + i) % 7) as WeekDay;
      return { name: WEEKDAY_NAMES[dayIndex], dayIndex };
    });
  }, [weekStartsOn]);

  // 현재 표시 중인 연도
  const displayYear = grid.navigation.state.rangeStart.getFullYear();

  return (
    <div className="month-calendar">
      {/* Navigation - 직접 메서드 호출 */}
      <div className="calendar-header">
        <button type="button" onClick={grid.navigation.goPrev} className="nav-btn">◀</button>
        <h3>{displayYear}년 {displayMonth + 1}월</h3>
        <button type="button" onClick={grid.navigation.goNext} className="nav-btn">▶</button>
        <button type="button" onClick={grid.navigation.goToday} className="today-btn">오늘</button>
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
          {rows.map((week, weekIndex) => (
            <tr key={weekIndex}>
              {week.map((cell) => {
                const isPadding = cell.month !== displayMonth;
                const isSelected = grid.selection.isSelected(cell);
                const isCellWeekend = isWeekend(cell.weekday);

                return (
                  <td
                    key={cell.key}
                    onClick={() => grid.selection.select(cell)}
                    style={{
                      opacity: isPadding ? 0.3 : 1,
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

      {grid.selection.state.selectedKey && (
        <div className="selection-info">
          선택된 날짜: {grid.selection.state.selectedKey}
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

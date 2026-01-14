/**
 * MonthCalendarRangeSelector - 범위 선택 달력 데모
 *
 * selection({ mode: 'range' })를 사용하여 시작-끝 날짜 범위 선택 지원.
 * 첫 클릭: 시작 날짜 선택, 두번째 클릭: 끝 날짜 선택.
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

interface MonthCalendarRangeSelectorProps {
  initialYear?: number;
  initialMonth?: number; // 0-11
  weekStartsOn?: WeekDay;
}

export function MonthCalendarRangeSelector({
  initialYear,
  initialMonth,
  weekStartsOn = 0,
}: MonthCalendarRangeSelectorProps) {
  const today = new Date();
  const year = initialYear ?? today.getFullYear();
  const month = initialMonth ?? today.getMonth();
  const initialDate = new Date(year, month, 1);

  // useTimeGrid - range 모드 선택
  const grid = useTimeGrid({
    range: { start: initialDate, end: endOfMonth(initialDate) },
    cellUnit: 'day',
    weekStartsOn,
    fillWeeks: true,
    plugins: [
      selection({ mode: 'range' }),
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

  // 범위 상태
  const { rangeStartKey, rangeEndKey } = grid.selection.state;

  return (
    <div className="month-calendar-range">
      {/* Navigation */}
      <div className="calendar-header">
        <button type="button" onClick={grid.navigation.goPrev} className="nav-btn">◀</button>
        <h3>{displayYear}년 {displayMonth + 1}월</h3>
        <button type="button" onClick={grid.navigation.goNext} className="nav-btn">▶</button>
        <button type="button" onClick={grid.navigation.goToday} className="today-btn">오늘</button>
        {(rangeStartKey || rangeEndKey) && (
          <button type="button" onClick={grid.selection.clear} className="clear-btn">초기화</button>
        )}
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
                const isInRange = grid.selection.isInRange(cell);
                const isRangeStart = cell.key === rangeStartKey;
                const isRangeEnd = cell.key === rangeEndKey;
                const isCellWeekend = isWeekend(cell.weekday);

                return (
                  <td
                    key={cell.key}
                    onClick={() => grid.selection.select(cell)}
                    style={{
                      opacity: isPadding ? 0.3 : 1,
                      backgroundColor: isRangeStart || isRangeEnd
                        ? '#1976d2'
                        : isInRange
                        ? '#bbdefb'
                        : cell.isToday
                        ? '#e3f2fd'
                        : 'transparent',
                      color: isRangeStart || isRangeEnd
                        ? 'white'
                        : isCellWeekend
                        ? '#e53935'
                        : 'inherit',
                      cursor: 'pointer',
                      fontWeight: isRangeStart || isRangeEnd ? 'bold' : 'normal',
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

      {rangeStartKey && (
        <div className="selection-info">
          {rangeEndKey ? (
            <>범위: {rangeStartKey} ~ {rangeEndKey}</>
          ) : (
            <>시작: {rangeStartKey} (끝 날짜를 선택하세요)</>
          )}
        </div>
      )}

      <style>{`
        .month-calendar-range {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
        .calendar-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
          flex-wrap: wrap;
        }
        .calendar-header h3 {
          margin: 0;
          min-width: 120px;
          text-align: center;
        }
        .nav-btn, .today-btn, .clear-btn {
          padding: 4px 12px;
          border: 1px solid #ddd;
          background: white;
          border-radius: 4px;
          cursor: pointer;
        }
        .clear-btn {
          border-color: #e53935;
          color: #e53935;
        }
        .nav-btn:hover, .today-btn:hover {
          background: #f5f5f5;
        }
        .clear-btn:hover {
          background: #ffebee;
        }
        .month-calendar-range table {
          border-collapse: collapse;
          width: 100%;
          max-width: 400px;
        }
        .month-calendar-range th,
        .month-calendar-range td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: center;
          width: 14.28%;
        }
        .month-calendar-range th {
          background: #f5f5f5;
          font-weight: bold;
        }
        .month-calendar-range td:hover {
          background: #e3f2fd;
        }
        .selection-info {
          margin-top: 12px;
          padding: 8px;
          background: #e8f5e9;
          border-radius: 4px;
          font-size: 14px;
        }
      `}</style>
    </div>
  );
}

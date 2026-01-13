/**
 * MonthCalendar - 전통적인 월간 달력 데모
 *
 * createTimeGrid + plugins (selection, navigation) + isWeekend 유틸리티 조합.
 * navigation 플러그인으로 이전/다음/오늘 동작 구현.
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
  createTimeGrid,
  withPadding,
  toMatrix,
  selection,
  navigation,
  isWeekend,
  startOfMonth,
  endOfMonth,
} from '../src';
import type { Cell, PaddedCell, WeekDay, NavigationState } from '../src';

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

  // 초기 범위 계산
  const initialRange = useMemo(() => {
    const year = initialYear ?? today.getFullYear();
    const month = initialMonth ?? today.getMonth();
    const start = new Date(year, month, 1);
    return {
      start,
      end: endOfMonth(start),
    };
  }, [initialYear, initialMonth, today]);

  // Navigation 상태 (React 상태로 관리 - 범위 변경 시 리렌더링 트리거)
  const [navState, setNavState] = useState<NavigationState>({
    cursor: initialRange.start,
    rangeStart: initialRange.start,
    rangeEnd: initialRange.end,
  });

  // Selection 상태 (React 상태로 관리)
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  // TimeGrid 생성 (plugins 옵션으로 전달)
  const grid = useMemo(() => {
    return createTimeGrid({
      range: { start: navState.rangeStart, end: navState.rangeEnd },
      cellUnit: 'day',
      weekStartsOn,
      plugins: [
        selection({ mode: 'single' }),
        navigation({ unit: 'month' }),
      ],
    });
  }, [navState.rangeStart, navState.rangeEnd, weekStartsOn]);

  // 패딩 추가 + 행렬 변환
  const matrix = useMemo(() => {
    const paddedGrid = withPadding(grid);
    return toMatrix(paddedGrid.cells, 7);
  }, [grid]);

  // Navigation 핸들러 (플러그인 메서드 사용)
  const handleGoNext = useCallback(() => {
    const newState = grid.navigation.goNext();
    setNavState(newState);
  }, [grid]);

  const handleGoPrev = useCallback(() => {
    const newState = grid.navigation.goPrev();
    setNavState(newState);
  }, [grid]);

  const handleGoToday = useCallback(() => {
    const newState = grid.navigation.goToday();
    setNavState(newState);
  }, [grid]);

  // Selection 핸들러
  const handleCellClick = useCallback((cell: Cell<unknown>) => {
    setSelectedKey((prev) => (prev === cell.key ? null : cell.key));
  }, []);

  // 헤더 생성 (주 시작 요일에 따라 정렬)
  const headers = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const dayIndex = ((weekStartsOn + i) % 7) as WeekDay;
      return { name: WEEKDAY_NAMES[dayIndex], dayIndex };
    });
  }, [weekStartsOn]);

  // 현재 표시 중인 연/월
  const displayYear = navState.rangeStart.getFullYear();
  const displayMonth = navState.rangeStart.getMonth();

  return (
    <div className="month-calendar">
      {/* Navigation */}
      <div className="calendar-header">
        <button onClick={handleGoPrev} className="nav-btn">◀</button>
        <h3>{displayYear}년 {displayMonth + 1}월</h3>
        <button onClick={handleGoNext} className="nav-btn">▶</button>
        <button onClick={handleGoToday} className="today-btn">오늘</button>
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
                const paddedCell = cell as PaddedCell<unknown>;
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

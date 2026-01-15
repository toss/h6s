/**
 * DualMonthRangePicker - 2개월 Range 선택 캘린더
 *
 * Airbnb 스타일 날짜 범위 선택기:
 * - 좌우 2개 월 동시 표시
 * - Navigation은 1달씩 이동
 * - Range 선택 모드
 *
 * Note: navigation plugin이 duration을 보존하므로
 *       useTimeGrid만으로 간단하게 구현 가능
 */

import React, { useMemo } from 'react';
import {
  useTimeGrid,
  navigation,
  selection,
  startOfMonth,
  endOfMonth,
  isWeekend,
} from '../src';
import type { Cell, WeekDay } from '../src';

const WEEKDAY_NAMES = ['일', '월', '화', '수', '목', '금', '토'];

// ============ Helper ============

function addMonths(date: Date, amount: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + amount);
  return result;
}

function getTwoMonthRange(baseDate: Date) {
  const firstMonthStart = startOfMonth(baseDate);
  const secondMonthEnd = endOfMonth(addMonths(baseDate, 1));
  return { start: firstMonthStart, end: secondMonthEnd };
}

// ============ MonthTable Component ============

interface MonthTableProps {
  cells: Cell[];
  displayMonth: number;
  weekStartsOn: WeekDay;
  rangeStartKey: string | null;
  rangeEndKey: string | null;
  isInRange: (cell: Cell) => boolean;
  onSelect: (cell: Cell) => void;
}

function MonthTable({
  cells,
  displayMonth,
  weekStartsOn,
  rangeStartKey,
  rangeEndKey,
  isInRange,
  onSelect,
}: MonthTableProps) {
  const weeks: Cell[][] = [];
  let currentWeek: Cell[] = [];

  for (const cell of cells) {
    if (cell.weekday === weekStartsOn && currentWeek.length > 0) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
    currentWeek.push(cell);
  }
  if (currentWeek.length > 0) {
    weeks.push(currentWeek);
  }

  const headers = Array.from({ length: 7 }, (_, i) => {
    const dayIndex = ((weekStartsOn + i) % 7) as WeekDay;
    return { name: WEEKDAY_NAMES[dayIndex], dayIndex };
  });

  return (
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
        {weeks.map((week, weekIndex) => (
          <tr key={weekIndex}>
            {week.map((cell) => {
              const isPadding = cell.month !== displayMonth;
              const inRange = isInRange(cell);
              const isRangeStart = cell.key === rangeStartKey;
              const isRangeEnd = cell.key === rangeEndKey;
              const isCellWeekend = isWeekend(cell.weekday);

              return (
                <td
                  key={cell.key}
                  onClick={() => onSelect(cell)}
                  style={{
                    opacity: isPadding ? 0.3 : 1,
                    backgroundColor: isRangeStart || isRangeEnd
                      ? '#1976d2'
                      : inRange
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
  );
}

// ============ Main Component ============

export function DualMonthRangePicker() {
  const today = new Date();
  const weekStartsOn: WeekDay = 0;

  // 2달 범위로 시작 → goToday도 2달 유지
  const grid = useTimeGrid({
    range: getTwoMonthRange(today),
    cellUnit: 'day',
    weekStartsOn,
    fillWeeks: true,
    plugins: [
      navigation({ unit: 'month', step: 1 }),
      selection({ mode: 'range' }),
    ] as const,
  });

  // 셀을 월별로 분리
  const { leftCells, rightCells, leftMonth, rightMonth } = useMemo(() => {
    const navRange = grid.navigation.getRange();
    const leftMonthIndex = navRange.start.getMonth();
    const rightMonthIndex = addMonths(navRange.start, 1).getMonth();

    const left: Cell[] = [];
    const right: Cell[] = [];

    let foundSecondMonth = false;
    for (const cell of grid.cells) {
      if (!foundSecondMonth) {
        if (cell.month === rightMonthIndex && cell.weekday === weekStartsOn) {
          foundSecondMonth = true;
          right.push(cell);
        } else {
          left.push(cell);
        }
      } else {
        right.push(cell);
      }
    }

    return {
      leftCells: left,
      rightCells: right,
      leftMonth: leftMonthIndex,
      rightMonth: rightMonthIndex,
    };
  }, [grid.cells, grid.navigation]);

  const { rangeStartKey, rangeEndKey } = grid.selection.state;
  const displayYear = grid.navigation.state.rangeStart.getFullYear();
  const rightYear = addMonths(grid.navigation.state.rangeStart, 1).getFullYear();

  return (
    <div className="dual-month-range">
      {/* Header */}
      <div className="calendar-header">
        <button type="button" onClick={grid.navigation.goPrev} className="nav-btn">◀</button>
        <button type="button" onClick={grid.navigation.goToday} className="today-btn">오늘</button>
        <button type="button" onClick={grid.navigation.goNext} className="nav-btn">▶</button>
        {(rangeStartKey || rangeEndKey) && (
          <button type="button" onClick={grid.selection.clear} className="clear-btn">초기화</button>
        )}
      </div>

      {/* Dual Calendar */}
      <div className="calendars">
        <div className="month-panel">
          <h3>{displayYear}년 {leftMonth + 1}월</h3>
          <MonthTable
            cells={leftCells}
            displayMonth={leftMonth}
            weekStartsOn={weekStartsOn}
            rangeStartKey={rangeStartKey}
            rangeEndKey={rangeEndKey}
            isInRange={grid.selection.isInRange}
            onSelect={grid.selection.select}
          />
        </div>

        <div className="month-panel">
          <h3>{rightYear}년 {rightMonth + 1}월</h3>
          <MonthTable
            cells={rightCells}
            displayMonth={rightMonth}
            weekStartsOn={weekStartsOn}
            rangeStartKey={rangeStartKey}
            rangeEndKey={rangeEndKey}
            isInRange={grid.selection.isInRange}
            onSelect={grid.selection.select}
          />
        </div>
      </div>

      {/* Selection Info */}
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
        .dual-month-range {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
        .calendar-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
          flex-wrap: wrap;
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
        .calendars {
          display: flex;
          gap: 32px;
          flex-wrap: wrap;
        }
        .month-panel {
          flex: 1;
          min-width: 300px;
        }
        .month-panel h3 {
          margin: 0 0 12px 0;
          text-align: center;
        }
        .dual-month-range table {
          border-collapse: collapse;
          width: 100%;
        }
        .dual-month-range th,
        .dual-month-range td {
          border: 1px solid #ddd;
          padding: 10px;
          text-align: center;
          width: 14.28%;
        }
        .dual-month-range th {
          background: #f5f5f5;
          font-weight: bold;
        }
        .dual-month-range td:hover {
          background: #e3f2fd;
        }
        .selection-info {
          margin-top: 16px;
          padding: 8px;
          background: #e8f5e9;
          border-radius: 4px;
          font-size: 14px;
        }
      `}</style>
    </div>
  );
}

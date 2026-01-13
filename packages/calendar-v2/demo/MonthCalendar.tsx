/**
 * MonthCalendar - 전통적인 월간 달력 데모
 *
 * 동일한 createTimeGrid 결과를 사용하여 전통적인 월간 달력 UI 렌더링.
 * withPadding + toMatrix + groupBy 유틸리티 조합 사용.
 */

import React from 'react';
import {
  createTimeGrid,
  createMockAdapter,
  withPadding,
  toMatrix,
  pipe,
  selection,
  weekendMarker,
  isWeekend,
} from '../src';
import type { PaddedCell } from '../src';

const WEEKDAY_NAMES = ['일', '월', '화', '수', '목', '금', '토'];

interface MonthCalendarProps {
  year: number;
  month: number; // 0-11
  weekStartsOn?: 0 | 1; // 0=일요일, 1=월요일
}

export function MonthCalendar({
  year,
  month,
  weekStartsOn = 0,
}: MonthCalendarProps) {
  const adapter = createMockAdapter({ weekStartsOn });

  // 해당 월의 시작일과 끝일 계산
  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0); // 다음 달 0일 = 이번 달 마지막 날

  // TimeGrid 생성
  const baseGrid = createTimeGrid<unknown, Date>({
    adapter,
    range: { start: startDate, end: endDate },
    cellUnit: 'day',
    weekStartsOn,
  });

  // 플러그인 적용
  const gridWithPlugins = pipe(baseGrid, [
    selection({ mode: 'single' }),
    weekendMarker(),
  ]);

  // 패딩 추가 (이전/다음 달 날짜)
  const paddedGrid = withPadding(gridWithPlugins, adapter);

  // 7열 행렬로 변환
  const matrix = toMatrix(paddedGrid.cells, 7);

  // 헤더 생성 (주 시작 요일에 따라 정렬)
  const headers = Array.from({ length: 7 }, (_, i) => {
    const dayIndex = (weekStartsOn + i) % 7;
    return WEEKDAY_NAMES[dayIndex];
  });

  return (
    <div className="month-calendar">
      <h3>
        {year}년 {month + 1}월 (월간 달력)
      </h3>

      <table>
        <thead>
          <tr>
            {headers.map((name, i) => (
              <th
                key={i}
                style={{
                  color: isWeekend(((weekStartsOn + i) % 7) as 0 | 1 | 2 | 3 | 4 | 5 | 6)
                    ? '#e53935'
                    : 'inherit',
                }}
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
                return (
                  <td
                    key={cell.key}
                    style={{
                      opacity: paddedCell.isPadding ? 0.3 : 1,
                      backgroundColor: cell.isToday ? '#e3f2fd' : 'transparent',
                      color: isWeekend(cell.weekday) ? '#e53935' : 'inherit',
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

      <style>{`
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
      `}</style>
    </div>
  );
}

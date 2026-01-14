/**
 * YearCalendar - 12개월 연간 달력 데모
 *
 * 동일한 createTimeGrid를 사용하여 12개의 미니 캘린더를 렌더링.
 * 각 월마다 별도의 grid를 생성하고 withPadding + toMatrix로 레이아웃 구성.
 */

import React, { useMemo, useState } from 'react';
import {
  createTimeGrid,
  withPadding,
  toMatrix,
  isWeekend,
  endOfMonth,
} from '../src';
import type { WeekDay, PaddedCell } from '../src';

const MONTH_NAMES = [
  '1월', '2월', '3월', '4월', '5월', '6월',
  '7월', '8월', '9월', '10월', '11월', '12월',
];

const WEEKDAY_SHORT = ['일', '월', '화', '수', '목', '금', '토'];

interface YearCalendarProps {
  initialYear?: number;
  weekStartsOn?: WeekDay;
}

export function YearCalendar({
  initialYear,
  weekStartsOn = 0,
}: YearCalendarProps) {
  const today = new Date();
  const [year, setYear] = useState(initialYear ?? today.getFullYear());

  // 12개월 각각에 대해 grid와 matrix 생성
  const months = useMemo(() => {
    return Array.from({ length: 12 }, (_, monthIndex) => {
      const start = new Date(year, monthIndex, 1);
      const end = endOfMonth(start);

      const grid = createTimeGrid({
        range: { start, end },
        cellUnit: 'day',
        weekStartsOn,
      });

      const paddedGrid = withPadding(grid);
      const matrix = toMatrix(paddedGrid.cells, 7);

      return {
        month: monthIndex,
        name: MONTH_NAMES[monthIndex],
        matrix,
      };
    });
  }, [year, weekStartsOn]);

  // 요일 헤더 생성
  const headers = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const dayIndex = ((weekStartsOn + i) % 7) as WeekDay;
      return { name: WEEKDAY_SHORT[dayIndex], dayIndex };
    });
  }, [weekStartsOn]);

  const handlePrevYear = () => setYear((y) => y - 1);
  const handleNextYear = () => setYear((y) => y + 1);
  const handleCurrentYear = () => setYear(today.getFullYear());

  return (
    <div className="year-calendar">
      <div className="year-header">
        <button type="button" onClick={handlePrevYear}>◀</button>
        <h2>{year}년</h2>
        <button type="button" onClick={handleNextYear}>▶</button>
        <button type="button" onClick={handleCurrentYear} className="today-btn">
          올해
        </button>
      </div>

      <div className="months-grid">
        {months.map(({ month, name, matrix }) => (
          <div key={month} className="mini-calendar">
            <div className="mini-header">{name}</div>
            <table>
              <thead>
                <tr>
                  {headers.map(({ name: dayName, dayIndex }) => (
                    <th
                      key={dayIndex}
                      style={{ color: isWeekend(dayIndex) ? '#e53935' : '#666' }}
                    >
                      {dayName}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {matrix.map((week, weekIndex) => (
                  <tr key={weekIndex}>
                    {week.map((cell) => {
                      const paddedCell = cell as PaddedCell<unknown>;
                      const isCellWeekend = isWeekend(cell.weekday);
                      const isTodayCell = cell.isToday && !paddedCell.isPadding;

                      return (
                        <td
                          key={cell.key}
                          style={{
                            opacity: paddedCell.isPadding ? 0.2 : 1,
                            color: isTodayCell
                              ? 'white'
                              : isCellWeekend
                              ? '#e53935'
                              : 'inherit',
                            backgroundColor: isTodayCell ? '#1976d2' : 'transparent',
                            fontWeight: isTodayCell ? 'bold' : 'normal',
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
          </div>
        ))}
      </div>

      <div className="info">
        <p>
          <strong>YearCalendar</strong>: 12개의 createTimeGrid 인스턴스로 연간 조망
        </p>
        <p>
          각 월마다 withPadding + toMatrix로 7열 그리드 생성
        </p>
      </div>

      <style>{`
        .year-calendar {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
        .year-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
        }
        .year-header h2 {
          margin: 0;
          min-width: 80px;
          text-align: center;
        }
        .year-header button {
          padding: 6px 12px;
          border: 1px solid #ddd;
          background: white;
          border-radius: 4px;
          cursor: pointer;
        }
        .year-header button:hover {
          background: #f5f5f5;
        }
        .today-btn {
          margin-left: auto;
        }
        .months-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
        }
        @media (max-width: 900px) {
          .months-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }
        @media (max-width: 600px) {
          .months-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        .mini-calendar {
          border: 1px solid #eee;
          border-radius: 8px;
          padding: 8px;
          background: white;
        }
        .mini-header {
          font-weight: 600;
          text-align: center;
          margin-bottom: 8px;
          color: #333;
        }
        .mini-calendar table {
          width: 100%;
          border-collapse: collapse;
          font-size: 11px;
        }
        .mini-calendar th {
          padding: 4px 2px;
          font-weight: 500;
          font-size: 10px;
        }
        .mini-calendar td {
          padding: 4px 2px;
          text-align: center;
          border-radius: 2px;
        }
        .info {
          margin-top: 20px;
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

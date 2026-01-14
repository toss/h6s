/**
 * MonthSelector - 월 선택기 데모
 *
 * cellUnit: 'month'를 사용하여 12개월 그리드 생성.
 * selection plugin으로 월 선택, navigation으로 연도 이동.
 */

import React, { useMemo } from 'react';
import { useTimeGrid, selection, navigation, toMatrix } from '../src';

const MONTH_NAMES = [
  '1월', '2월', '3월', '4월', '5월', '6월',
  '7월', '8월', '9월', '10월', '11월', '12월',
];

interface MonthSelectorProps {
  initialYear?: number;
  onSelect?: (year: number, month: number) => void;
}

export function MonthSelector({ initialYear, onSelect }: MonthSelectorProps) {
  const today = new Date();
  const year = initialYear ?? today.getFullYear();

  // 1년 범위 (1월 ~ 12월)
  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year, 11, 31);

  const grid = useTimeGrid({
    range: { start: startDate, end: endDate },
    cellUnit: 'month',
    plugins: [
      selection({ mode: 'single' }),
      navigation({ unit: 'year' }),
    ] as const,
  });

  // 3x4 행렬로 변환
  const matrix = useMemo(() => {
    return toMatrix(grid.cells, 4);
  }, [grid.cells]);

  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();
  const displayYear = grid.navigation.state.rangeStart.getFullYear();

  return (
    <div className="month-selector">
      <div className="selector-header">
        <span className="title">{displayYear}년</span>
        <div className="nav-buttons">
          <button type="button" onClick={grid.navigation.goPrev}>&lt;</button>
          <button type="button" onClick={grid.navigation.goNext}>&gt;</button>
        </div>
      </div>

      <div className="month-grid">
        {matrix.map((row, rowIndex) => (
          <div key={rowIndex} className="month-row">
            {row.map((cell) => {
              const isSelected = grid.selection.isSelected(cell);
              const isCurrent = cell.year === currentYear && cell.month === currentMonth;

              return (
                <button
                  key={cell.key}
                  type="button"
                  className={`month-cell ${isSelected ? 'selected' : ''} ${isCurrent ? 'current' : ''}`}
                  onClick={() => {
                    grid.selection.select(cell);
                    onSelect?.(cell.year, cell.month);
                  }}
                >
                  {MONTH_NAMES[cell.month]}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      <style>{`
        .month-selector {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          width: 320px;
          padding: 20px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }
        .selector-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
        }
        .title {
          font-size: 18px;
          font-weight: 600;
          color: #333;
        }
        .nav-buttons {
          display: flex;
          gap: 4px;
        }
        .nav-buttons button {
          width: 32px;
          height: 32px;
          border: 1px solid #e0e0e0;
          background: white;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          color: #666;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .nav-buttons button:hover {
          background: #f5f5f5;
        }
        .month-grid {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .month-row {
          display: flex;
          gap: 8px;
        }
        .month-cell {
          flex: 1;
          padding: 16px 8px;
          border: none;
          background: transparent;
          border-radius: 8px;
          cursor: pointer;
          font-size: 16px;
          color: #1976d2;
          transition: all 0.15s;
        }
        .month-cell:hover {
          background: #f5f5f5;
        }
        .month-cell.current {
          font-weight: 600;
        }
        .month-cell.selected {
          background: #e3f2fd;
        }
      `}</style>
    </div>
  );
}

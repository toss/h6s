/**
 * MonthSelector - 월 선택기 데모
 *
 * cellUnit: 'month'를 사용하여 12개월 그리드 생성.
 * selection plugin으로 월 선택, navigation으로 연도 이동.
 */

import React, { useMemo } from 'react';
import { useTimeGrid, selection, navigation } from '../src';

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
  const rows = useMemo(() => grid.getRows(4), [grid]);

  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();
  const displayYear = grid.navigation.state.rangeStart.getFullYear();

  return (
    <div className="month-selector">
      <div className="selector-header">
        <button type="button" onClick={grid.navigation.goPrev} className="nav-btn">◀</button>
        <h3>{displayYear}년</h3>
        <button type="button" onClick={grid.navigation.goNext} className="nav-btn">▶</button>
      </div>

      <div className="month-grid">
        {rows.map((row, rowIndex) => (
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

      {grid.selection.state.selectedKey && (
        <div className="selection-info">
          선택된 월: {displayYear}년 {MONTH_NAMES[parseInt(grid.selection.state.selectedKey.split('-')[1]) - 1]}
        </div>
      )}

      <style>{`
        .month-selector {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
        .selector-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
        }
        .selector-header h3 {
          margin: 0;
          flex: 1;
          text-align: center;
        }
        .nav-btn {
          padding: 4px 12px;
          border: 1px solid #ddd;
          background: white;
          border-radius: 4px;
          cursor: pointer;
        }
        .nav-btn:hover {
          background: #f5f5f5;
        }
        .month-grid {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .month-row {
          display: flex;
          gap: 8px;
        }
        .month-cell {
          flex: 1;
          padding: 12px 8px;
          border: 1px solid #ddd;
          background: transparent;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          color: inherit;
          transition: all 0.15s;
        }
        .month-cell:hover {
          background: #f0f0f0;
        }
        .month-cell.current {
          background: #e3f2fd;
        }
        .month-cell.selected {
          background: #1976d2;
          color: white;
          border-color: #1976d2;
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

/**
 * YearSelector - 연도 선택기 데모
 *
 * cellUnit: 'year'를 사용하여 연도 그리드 생성.
 * 12년 범위를 한 번에 표시하고 selection plugin으로 선택.
 */

import React from 'react';
import { useTimeGrid, selection, navigation } from '../src';

interface YearSelectorProps {
  initialYear?: number;
  onSelect?: (year: number) => void;
}

export function YearSelector({ initialYear, onSelect }: YearSelectorProps) {
  const today = new Date();
  const year = initialYear ?? today.getFullYear();

  // 12년 범위 (현재 연도 기준 -5 ~ +6)
  const startYear = Math.floor(year / 12) * 12;
  const startDate = new Date(startYear, 0, 1);
  const endDate = new Date(startYear + 11, 11, 31);

  const grid = useTimeGrid({
    range: { start: startDate, end: endDate },
    cellUnit: 'year',
    plugins: [
      selection({ mode: 'single' }),
      navigation({ unit: 'year', step: 12 }),
    ] as const,
  });

  // 3x4 행렬로 변환
  const rows = grid.getRows(4);

  const currentYear = today.getFullYear();
  const rangeStart = grid.navigation.state.rangeStart.getFullYear();
  const rangeEnd = rangeStart + 11;

  return (
    <div className="year-selector">
      <div className="selector-header">
        <button type="button" onClick={grid.navigation.goPrev} className="nav-btn">◀</button>
        <h3>{rangeStart} - {rangeEnd}</h3>
        <button type="button" onClick={grid.navigation.goNext} className="nav-btn">▶</button>
      </div>

      <div className="year-grid">
        {rows.map((row, rowIndex) => (
          <div key={rowIndex} className="year-row">
            {row.map((cell) => {
              const isSelected = grid.selection.isSelected(cell);
              const isCurrent = cell.year === currentYear;

              return (
                <button
                  key={cell.key}
                  type="button"
                  className={`year-cell ${isSelected ? 'selected' : ''} ${isCurrent ? 'current' : ''}`}
                  onClick={() => {
                    grid.selection.select(cell);
                    onSelect?.(cell.year);
                  }}
                >
                  {cell.year}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {grid.selection.state.selectedKey && (
        <div className="selection-info">
          선택된 연도: {grid.selection.state.selectedKey.split('-')[0]}년
        </div>
      )}

      <style>{`
        .year-selector {
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
        .year-grid {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .year-row {
          display: flex;
          gap: 8px;
        }
        .year-cell {
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
        .year-cell:hover {
          background: #f0f0f0;
        }
        .year-cell.current {
          background: #e3f2fd;
        }
        .year-cell.selected {
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

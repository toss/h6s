/**
 * YearSelector - 연도 선택기 데모
 *
 * cellUnit: 'year'를 사용하여 연도 그리드 생성.
 * 12년 범위를 한 번에 표시하고 selection plugin으로 선택.
 */

import React, { useMemo } from 'react';
import { useTimeGrid, selection, navigation, toMatrix } from '../src';

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
  const matrix = useMemo(() => {
    return toMatrix(grid.cells, 4);
  }, [grid.cells]);

  const currentYear = today.getFullYear();
  const rangeStart = grid.navigation.state.rangeStart.getFullYear();

  return (
    <div className="year-selector">
      <div className="selector-header">
        <span className="title">연도 선택</span>
        <div className="nav-buttons">
          <button type="button" onClick={grid.navigation.goPrev}>&lt;</button>
          <button type="button" onClick={grid.navigation.goNext}>&gt;</button>
        </div>
      </div>

      <div className="year-grid">
        {matrix.map((row, rowIndex) => (
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

      <style>{`
        .year-selector {
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
        .year-grid {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .year-row {
          display: flex;
          gap: 8px;
        }
        .year-cell {
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
        .year-cell:hover {
          background: #f5f5f5;
        }
        .year-cell.current {
          font-weight: 600;
        }
        .year-cell.selected {
          background: #e3f2fd;
        }
      `}</style>
    </div>
  );
}

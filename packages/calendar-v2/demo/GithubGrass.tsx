/**
 * GithubGrass - GitHub 잔디 스타일 데모
 *
 * 동일한 createTimeGrid 결과를 사용하여 GitHub Contribution Graph 스타일 UI 렌더링.
 * getWeeks()로 주 단위 그룹화.
 * Events Plugin으로 날짜별 데이터 조회.
 */

import React from 'react';
import {
  createTimeGrid,
  events,
} from '../src';

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface ContributionData {
  id: string;
  date: Date;
  count: number;
}

interface GithubGrassProps {
  startDate: Date;
  endDate: Date;
  data?: ContributionData[];
}

function getIntensity(count: number): number {
  if (count === 0) return 0;
  if (count <= 3) return 1;
  if (count <= 6) return 2;
  if (count <= 9) return 3;
  return 4;
}

const COLORS = [
  '#ebedf0', // 0: no contributions
  '#9be9a8', // 1: low
  '#40c463', // 2: medium
  '#30a14e', // 3: high
  '#216e39', // 4: very high
];

export function GithubGrass({ startDate, endDate, data = [] }: GithubGrassProps) {
  // TimeGrid 생성 (Events Plugin으로 데이터 바인딩)
  const grid = createTimeGrid({
    range: { start: startDate, end: endDate },
    cellUnit: 'day',
    weekStartsOn: 0, // GitHub은 일요일 시작
    plugins: [
      events({
        data,
        getEventRange: (item) => ({ start: item.date, end: item.date }),
      }),
    ] as const,
  });

  // 주 단위로 그룹화 (열 생성)
  const weeks = grid.getWeeks();

  return (
    <div className="github-grass">
      <div className="grass-container">
        {/* 요일 라벨 */}
        <div className="weekday-labels">
          {[0, 1, 2, 3, 4, 5, 6].map((day) => (
            <div key={day} className="label">
              {day % 2 === 1 ? WEEKDAY_LABELS[day] : ''}
            </div>
          ))}
        </div>

        {/* 잔디 그리드 */}
        <div className="grass-grid">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="week-column">
              {/* 주 내 7개 셀을 요일 순으로 정렬 */}
              {Array.from({ length: 7 }, (_, dayIndex) => {
                const cell = week.find((c) => c.weekday === dayIndex);
                if (!cell) {
                  return <div key={dayIndex} className="cell empty" />;
                }

                const cellData = grid.events.getEventsForCell(cell);
                const totalCount = cellData.reduce(
                  (sum, item) => sum + item.count,
                  0
                );
                const intensity = getIntensity(totalCount);

                return (
                  <div
                    key={cell.key}
                    className="cell"
                    style={{ backgroundColor: COLORS[intensity] }}
                    title={`${cell.key}: ${totalCount} contributions`}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="legend">
        <span>Less</span>
        {COLORS.map((color, i) => (
          <div
            key={i}
            className="legend-cell"
            style={{ backgroundColor: color }}
          />
        ))}
        <span>More</span>
      </div>

      <style>{`
        .github-grass {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
        .grass-container {
          display: flex;
          gap: 6px;
        }
        .weekday-labels {
          display: flex;
          flex-direction: column;
          gap: 3px;
          font-size: 12px;
          color: #586069;
        }
        .weekday-labels .label {
          height: 18px;
          line-height: 18px;
        }
        .grass-grid {
          display: flex;
          gap: 3px;
        }
        .week-column {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }
        .cell {
          width: 18px;
          height: 18px;
          border-radius: 3px;
        }
        .cell.empty {
          background: transparent;
        }
        .legend {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-top: 12px;
          font-size: 12px;
          color: #586069;
        }
        .legend-cell {
          width: 18px;
          height: 18px;
          border-radius: 3px;
        }
      `}</style>
    </div>
  );
}

/**
 * CircularSchedule - 24시간 원형 시간표
 *
 * 방학 일과표 스타일의 원형 UI.
 * cellUnit: 'hour'로 24개 셀 생성 후 원형 배치.
 *
 * 이 데모는 TimeGrid가 grid 레이아웃에 국한되지 않음을 보여줌.
 */

import React, { useMemo } from 'react';
import { createTimeGrid, events } from '../src';

// 시간대별 활동 데이터
interface Activity {
  id: string;
  title: string;
  start: Date;
  end: Date;
  color: string;
}

// 오늘 날짜 기준으로 활동 데이터 생성
function createSchedule(baseDate: Date): Activity[] {
  const y = baseDate.getFullYear();
  const m = baseDate.getMonth();
  const d = baseDate.getDate();

  return [
    { id: '1', title: '😴 수면', start: new Date(y, m, d, 0), end: new Date(y, m, d, 8), color: '#5c6bc0' },
    { id: '2', title: '🍳 아침', start: new Date(y, m, d, 8), end: new Date(y, m, d, 9), color: '#ffb74d' },
    { id: '3', title: '📚 공부', start: new Date(y, m, d, 9), end: new Date(y, m, d, 12), color: '#4db6ac' },
    { id: '4', title: '🍜 점심', start: new Date(y, m, d, 12), end: new Date(y, m, d, 13), color: '#ffb74d' },
    { id: '5', title: '🎮 자유시간', start: new Date(y, m, d, 13), end: new Date(y, m, d, 15), color: '#f06292' },
    { id: '6', title: '📚 공부', start: new Date(y, m, d, 15), end: new Date(y, m, d, 18), color: '#4db6ac' },
    { id: '7', title: '🍽️ 저녁', start: new Date(y, m, d, 18), end: new Date(y, m, d, 19), color: '#ffb74d' },
    { id: '8', title: '🏃 운동', start: new Date(y, m, d, 19), end: new Date(y, m, d, 20), color: '#81c784' },
    { id: '9', title: '📺 자유시간', start: new Date(y, m, d, 20), end: new Date(y, m, d, 23), color: '#f06292' },
    { id: '10', title: '🌙 취침준비', start: new Date(y, m, d, 23), end: new Date(y, m, d + 1, 0), color: '#9575cd' },
  ];
}

export function CircularSchedule() {
  const today = new Date();
  const dayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
  const dayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

  // 활동 데이터
  const schedule = useMemo(() => createSchedule(today), []);

  // 24시간 hour 단위 셀 생성 + Events Plugin
  const grid = useMemo(() => {
    return createTimeGrid({
      range: { start: dayStart, end: dayEnd },
      cellUnit: 'hour',
      plugins: [
        events({
          data: schedule,
          getEventRange: (activity) => ({ start: activity.start, end: activity.end }),
        }),
      ] as const,
    });
  }, [schedule]);

  // 현재 시간
  const currentHour = today.getHours();

  // 원형 좌표 계산 (시계 방향, 0시가 12시 위치)
  // 시계: 12시=상단, 시계방향 회전
  // 24시간: 0시=상단, 6시=우측, 12시=하단, 18시=좌측
  const hourToAngle = (hour: number) => {
    // hour * 15도 (360/24), -90도 오프셋으로 0시가 상단
    return (hour * 15 - 90) * (Math.PI / 180);
  };

  const getPosition = (hour: number, radius: number) => {
    const angle = hourToAngle(hour);
    return {
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
    };
  };

  const size = 450;
  const center = size / 2;
  const outerRadius = 160;
  const innerRadius = 90;

  return (
    <div className="circular-schedule">
      <h4>🏖️ 방학 일과표</h4>

      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* 배경 원 */}
        <circle
          cx={center}
          cy={center}
          r={outerRadius}
          fill="#f5f5f5"
          stroke="#e0e0e0"
          strokeWidth="2"
        />
        <circle
          cx={center}
          cy={center}
          r={innerRadius}
          fill="white"
          stroke="#e0e0e0"
          strokeWidth="1"
        />

        {/* 시간 세그먼트 */}
        {grid.cells.map((cell) => {
          const hour = cell.hour;
          const cellActivities = grid.events.getEventsForCell(cell);
          const activity = cellActivities[0]; // 첫 번째 활동 사용
          const isCurrentHour = hour === currentHour;

          // 부채꼴 경로 계산 (시계 방향: hour → hour+1)
          const startAngle = hourToAngle(hour);
          const endAngle = hourToAngle(hour + 1);

          const x1 = center + Math.cos(startAngle) * innerRadius;
          const y1 = center + Math.sin(startAngle) * innerRadius;
          const x2 = center + Math.cos(startAngle) * outerRadius;
          const y2 = center + Math.sin(startAngle) * outerRadius;
          const x3 = center + Math.cos(endAngle) * outerRadius;
          const y3 = center + Math.sin(endAngle) * outerRadius;
          const x4 = center + Math.cos(endAngle) * innerRadius;
          const y4 = center + Math.sin(endAngle) * innerRadius;

          const pathD = `
            M ${x1} ${y1}
            L ${x2} ${y2}
            A ${outerRadius} ${outerRadius} 0 0 1 ${x3} ${y3}
            L ${x4} ${y4}
            A ${innerRadius} ${innerRadius} 0 0 0 ${x1} ${y1}
            Z
          `;

          return (
            <g key={cell.key}>
              <path
                d={pathD}
                fill={activity?.color || '#e0e0e0'}
                stroke="white"
                strokeWidth="1"
                opacity={isCurrentHour ? 1 : 0.7}
              />
              {isCurrentHour && (
                <path
                  d={pathD}
                  fill="none"
                  stroke="#333"
                  strokeWidth="3"
                />
              )}
            </g>
          );
        })}

        {/* 시간 라벨 */}
        {[0, 3, 6, 9, 12, 15, 18, 21].map((hour) => {
          const pos = getPosition(hour, outerRadius + 25);
          return (
            <text
              key={hour}
              x={center + pos.x}
              y={center + pos.y}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="12"
              fill="#666"
              fontWeight={hour % 6 === 0 ? 'bold' : 'normal'}
            >
              {hour}시
            </text>
          );
        })}

        {/* 중앙 현재 시간 */}
        {(() => {
          const currentCell = grid.cells.find((c) => c.hour === currentHour);
          const currentActivity = currentCell
            ? grid.events.getEventsForCell(currentCell)[0]
            : undefined;
          return (
            <>
              <text
                x={center}
                y={center - 10}
                textAnchor="middle"
                fontSize="24"
                fontWeight="bold"
                fill="#333"
              >
                {currentHour}:00
              </text>
              <text
                x={center}
                y={center + 15}
                textAnchor="middle"
                fontSize="14"
                fill="#666"
              >
                {currentActivity?.title || ''}
              </text>
            </>
          );
        })()}
      </svg>

      {/* 범례 */}
      <div className="legend">
        {Array.from(new Set(schedule.map((a) => a.title))).map((title) => {
          const activity = schedule.find((a) => a.title === title);
          return (
            <div key={title} className="legend-item">
              <span
                className="color-dot"
                style={{ backgroundColor: activity?.color }}
              />
              {title}
            </div>
          );
        })}
      </div>

      <style>{`
        .circular-schedule {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .circular-schedule h4 {
          margin: 0 0 16px 0;
          font-size: 18px;
        }
        .circular-schedule svg {
          filter: drop-shadow(0 2px 8px rgba(0,0,0,0.1));
        }
        .legend {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-top: 20px;
          justify-content: center;
          max-width: 400px;
        }
        .legend-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: #555;
        }
        .color-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
        }
      `}</style>
    </div>
  );
}

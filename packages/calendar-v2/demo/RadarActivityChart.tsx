/**
 * RadarActivityChart - 레이더 차트 스타일 주간 활동량
 *
 * 7일간의 활동량을 레이더/폴라 차트로 시각화.
 * cellUnit: 'day'로 7개 셀 생성 후 방사형 배치.
 * navigation plugin으로 12주간 데이터 탐색 가능.
 */

import React, { useMemo } from 'react';
import { useTimeGrid, events, navigation, startOfWeek, addDays, startOfDay } from '../src';

const WEEKDAY_NAMES = ['일', '월', '화', '수', '목', '금', '토'];

// 활동 데이터
interface Activity {
  id: string;
  date: Date;
  hours: number; // 활동 시간
  type: 'study' | 'exercise' | 'work' | 'hobby';
}

// 시드 기반 의사 난수 생성기 (일관된 결과를 위해)
function seededRandom(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 1103515245 + 12345) & 0x7fffffff;
    return state / 0x7fffffff;
  };
}

// 12주간 샘플 데이터 생성 (랜덤하지만 일관된 데이터)
function generateActivities(baseWeekStart: Date): Activity[] {
  const activities: Activity[] = [];
  const random = seededRandom(42); // 시드 고정으로 새로고침해도 같은 데이터

  // 12주간 데이터: 6주 전 ~ 5주 후
  for (let week = -6; week <= 5; week++) {
    const weekStart = addDays(baseWeekStart, week * 7);

    for (let i = 0; i < 7; i++) {
      const date = startOfDay(addDays(weekStart, i));
      const dayOfWeek = date.getDay();
      const dayKey = `${week}-${i}`;

      // 요일별 기본 패턴 + 랜덤 변동
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

      // 각 활동마다 랜덤 시간 (0~최대값 사이)
      const studyBase = isWeekend ? 2 : 5;
      const exerciseBase = isWeekend ? 3 : 1.5;
      const workBase = isWeekend ? 1 : 7;
      const hobbyBase = isWeekend ? 5 : 2;

      // 랜덤 변동 (0.2~1.5배)
      const randomFactor = () => 0.2 + random() * 1.3;

      activities.push({
        id: `study-${dayKey}`,
        date,
        hours: Math.round(studyBase * randomFactor() * 10) / 10,
        type: 'study',
      });
      activities.push({
        id: `exercise-${dayKey}`,
        date,
        hours: Math.round(exerciseBase * randomFactor() * 10) / 10,
        type: 'exercise',
      });
      activities.push({
        id: `work-${dayKey}`,
        date,
        hours: Math.round(workBase * randomFactor() * 10) / 10,
        type: 'work',
      });
      activities.push({
        id: `hobby-${dayKey}`,
        date,
        hours: Math.round(hobbyBase * randomFactor() * 10) / 10,
        type: 'hobby',
      });
    }
  }

  return activities;
}

const TYPE_COLORS: Record<Activity['type'], string> = {
  study: '#4db6ac',
  exercise: '#81c784',
  work: '#64b5f6',
  hobby: '#f06292',
};

const TYPE_LABELS: Record<Activity['type'], string> = {
  study: '📚 공부',
  exercise: '🏃 운동',
  work: '💼 업무',
  hobby: '🎮 취미',
};

export function RadarActivityChart() {
  const today = new Date();
  const weekStart = startOfWeek(today, 0);
  const weekEnd = addDays(weekStart, 6);

  // 12주간 데이터 (6주 전 ~ 5주 후)
  const activities = useMemo(() => generateActivities(weekStart), []);

  // useTimeGrid + navigation으로 주간 이동 지원
  const grid = useTimeGrid({
    range: { start: weekStart, end: weekEnd },
    cellUnit: 'day',
    plugins: [
      navigation({ unit: 'week' }),
      events({
        data: activities,
        getEventRange: (a) => {
          const end = new Date(a.date);
          end.setDate(end.getDate() + 1);
          return { start: a.date, end };
        },
      }),
    ] as const,
  });

  // 현재 표시 중인 주의 날짜 범위
  const currentWeekStart = grid.navigation.state.rangeStart;

  const size = 400;
  const center = size / 2;
  const maxRadius = 150;
  const maxHours = 10; // 최대 활동 시간 (스케일링용)

  // 각도 계산 (7일, 일요일이 상단)
  const dayToAngle = (dayIndex: number) => {
    return ((dayIndex * 360) / 7 - 90) * (Math.PI / 180);
  };

  // 좌표 계산
  const getPoint = (dayIndex: number, radius: number) => {
    const angle = dayToAngle(dayIndex);
    return {
      x: center + Math.cos(angle) * radius,
      y: center + Math.sin(angle) * radius,
    };
  };

  // 타입별 폴리곤 경로 생성
  const getPolygonPath = (type: Activity['type']) => {
    const points = grid.cells.map((cell, index) => {
      const cellActivities = grid.events.getEventsForCell(cell);
      const typeActivity = cellActivities.find((a) => a.type === type);
      const hours = typeActivity?.hours || 0;
      const radius = (hours / maxHours) * maxRadius;
      return getPoint(index, radius);
    });

    return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';
  };

  // 그리드 라인 (동심원)
  const gridCircles = [0.25, 0.5, 0.75, 1].map((ratio) => ratio * maxRadius);

  // 주 레이블 생성
  const formatWeekLabel = (date: Date) => {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const endDate = addDays(date, 6);
    const endMonth = endDate.getMonth() + 1;
    const endDay = endDate.getDate();

    if (month === endMonth) {
      return `${month}/${day} ~ ${endDay}`;
    }
    return `${month}/${day} ~ ${endMonth}/${endDay}`;
  };

  return (
    <div className="radar-chart">
      <div className="header">
        <button onClick={grid.navigation.goPrev}>◀</button>
        <h4>📊 {formatWeekLabel(currentWeekStart)}</h4>
        <button onClick={grid.navigation.goNext}>▶</button>
        <button onClick={grid.navigation.goToday} className="today-btn">이번주</button>
      </div>

      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* 배경 그리드 - 동심원 */}
        {gridCircles.map((r, i) => (
          <circle
            key={i}
            cx={center}
            cy={center}
            r={r}
            fill="none"
            stroke="#e0e0e0"
            strokeWidth="1"
            strokeDasharray={i < gridCircles.length - 1 ? '4,4' : 'none'}
          />
        ))}

        {/* 배경 그리드 - 방사선 */}
        {grid.cells.map((_, index) => {
          const outer = getPoint(index, maxRadius);
          return (
            <line
              key={index}
              x1={center}
              y1={center}
              x2={outer.x}
              y2={outer.y}
              stroke="#e0e0e0"
              strokeWidth="1"
            />
          );
        })}

        {/* 타입별 영역 (뒤에서부터 그리기) */}
        {(['work', 'study', 'hobby', 'exercise'] as Activity['type'][]).map((type) => (
          <path
            key={type}
            d={getPolygonPath(type)}
            fill={TYPE_COLORS[type]}
            fillOpacity="0.3"
            stroke={TYPE_COLORS[type]}
            strokeWidth="2"
          />
        ))}

        {/* 데이터 포인트 */}
        {grid.cells.map((cell, index) => {
          const cellActivities = grid.events.getEventsForCell(cell);

          return cellActivities.map((activity) => {
            const radius = (activity.hours / maxHours) * maxRadius;
            const point = getPoint(index, radius);

            return (
              <circle
                key={activity.id}
                cx={point.x}
                cy={point.y}
                r="4"
                fill={TYPE_COLORS[activity.type]}
                stroke="white"
                strokeWidth="1"
              />
            );
          });
        })}

        {/* 요일 라벨 */}
        {grid.cells.map((cell, index) => {
          const point = getPoint(index, maxRadius + 25);
          const isToday = cell.isToday;

          return (
            <text
              key={cell.key}
              x={point.x}
              y={point.y}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="14"
              fontWeight={isToday ? 'bold' : 'normal'}
              fill={isToday ? '#1976d2' : '#666'}
            >
              {WEEKDAY_NAMES[cell.weekday]}
            </text>
          );
        })}

        {/* 중앙 텍스트 */}
        <text
          x={center}
          y={center - 8}
          textAnchor="middle"
          fontSize="12"
          fill="#999"
        >
          이번 주
        </text>
        <text
          x={center}
          y={center + 10}
          textAnchor="middle"
          fontSize="11"
          fill="#999"
        >
          활동량
        </text>
      </svg>

      {/* 범례 */}
      <div className="legend">
        {(Object.keys(TYPE_COLORS) as Activity['type'][]).map((type) => (
          <div key={type} className="legend-item">
            <span
              className="color-box"
              style={{ backgroundColor: TYPE_COLORS[type] }}
            />
            {TYPE_LABELS[type]}
          </div>
        ))}
      </div>

      {/* 스케일 범례 */}
      <div className="scale-info">
        반지름 = 활동 시간 (최대 {maxHours}시간)
      </div>

      <style>{`
        .radar-chart {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
        }
        .header h4 {
          margin: 0;
          font-size: 18px;
          min-width: 140px;
          text-align: center;
        }
        .header button {
          padding: 6px 12px;
          border: 1px solid #ddd;
          background: white;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
        }
        .header button:hover {
          background: #f5f5f5;
        }
        .today-btn {
          font-size: 12px !important;
        }
        .radar-chart svg {
          filter: drop-shadow(0 2px 8px rgba(0,0,0,0.1));
        }
        .legend {
          display: flex;
          gap: 16px;
          margin-top: 20px;
          flex-wrap: wrap;
          justify-content: center;
        }
        .legend-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: #555;
        }
        .color-box {
          width: 14px;
          height: 14px;
          border-radius: 3px;
        }
        .scale-info {
          margin-top: 12px;
          font-size: 11px;
          color: #999;
        }
      `}</style>
    </div>
  );
}

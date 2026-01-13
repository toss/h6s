/**
 * toMatrix - 1D → 2D 배열 변환 유틸리티
 *
 * 1차원 셀 배열을 지정된 열 수로 2차원 행렬로 변환.
 * 월간 달력(7열), 3개월 뷰(21열) 등에 사용.
 */

import type { Cell } from '../core/types';

/**
 * 1D 셀 배열을 2D 행렬로 변환
 *
 * @param cells - 1차원 셀 배열
 * @param columns - 열 수 (기본값: 7)
 * @returns 2차원 셀 배열
 *
 * @example
 * // 월간 달력용 7열 행렬
 * const matrix = toMatrix(grid.cells, 7);
 * // [[월, 화, 수, 목, 금, 토, 일], [...], ...]
 */
export function toMatrix<TData>(
  cells: Cell<TData>[],
  columns: number = 7
): Cell<TData>[][] {
  if (columns <= 0) {
    throw new Error('columns must be positive');
  }

  const matrix: Cell<TData>[][] = [];

  for (let i = 0; i < cells.length; i += columns) {
    matrix.push(cells.slice(i, i + columns));
  }

  return matrix;
}

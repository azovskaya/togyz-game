import { TOTAL } from "./gameConstants.js";

export function getSowingPath(board, tuzdyk, player, holeIdx) {
  const t = [...tuzdyk];
  let stones = board[holeIdx];
  if (stones === 0) return [];

  const path = [];
  if (stones === 1) {
    stones = 0;
  } else {
    stones--;
  }

  let cur = holeIdx;
  while (stones > 0) {
    cur = (cur + 1) % TOTAL;
    const toKazan =
      (t[player] !== -1 && cur === t[player]) ||
      (t[1 - player] !== -1 && cur === t[1 - player]);
    if (!toKazan) path.push(cur);
    stones--;
  }
  return path;
}

/** Параметры формы для «речных камней» — стабильно по индексу */
export function kumalakStyle(i) {
  const shapes = [
    { w: 88, h: 76, rot: -14, x: 2, y: 0 },
    { w: 92, h: 70, rot: 8, x: -1, y: 1 },
    { w: 78, h: 86, rot: 22, x: 0, y: -1 },
    { w: 95, h: 72, rot: -6, x: 1, y: 2 },
    { w: 82, h: 90, rot: 16, x: -2, y: 0 },
    { w: 90, h: 80, rot: -18, x: 0, y: 1 },
  ];
  const s = shapes[i % shapes.length];
  const variant = i % 3;
  return { ...s, variant };
}

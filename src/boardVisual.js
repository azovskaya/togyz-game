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

/** Форма «речного камня» — только сдвиг/поворот, размер задаётся в CSS */
export function kumalakStyle(i) {
  const shapes = [
    { rot: -14, x: 0, y: 0 },
    { rot: 10, x: 1, y: 0 },
    { rot: 18, x: -1, y: 1 },
    { rot: -8, x: 0, y: -1 },
    { rot: 14, x: -1, y: 0 },
    { rot: -20, x: 1, y: 1 },
  ];
  const s = shapes[i % shapes.length];
  return { ...s, variant: i % 3 };
}

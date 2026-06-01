export const TOTAL = 18;
export const INIT = 9;

export const topRowIndices = [17, 16, 15, 14, 13, 12, 11, 10, 9];
export const bottomRowIndices = [0, 1, 2, 3, 4, 5, 6, 7, 8];

export const owner = (h) => (h < 9 ? 0 : 1);
export const nextHole = (h) => (h + 1) % TOTAL;
export const initBoard = () => Array(TOTAL).fill(INIT);
export const getDisplayNumber = (h) => (h < 9 ? h + 1 : h - 8);

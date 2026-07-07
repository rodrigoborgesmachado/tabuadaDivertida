export type Direction = 'left' | 'right' | 'up' | 'down';

export type Board = number[][];

export interface MoveResult {
  board: Board;
  moved: boolean;
  scoreDelta: number;
}

const createEmptyBoard = (): Board => Array.from({ length: 4 }, () => Array(4).fill(0));

const slideAndMerge = (row: number[]): { row: number[]; scoreDelta: number; moved: boolean } => {
  const values = row.filter(Boolean);
  const merged: number[] = [];
  let scoreDelta = 0;
  let index = 0;

  while (index < values.length) {
    if (index + 1 < values.length && values[index] === values[index + 1]) {
      const mergedValue = values[index] * 2;
      merged.push(mergedValue);
      scoreDelta += mergedValue;
      index += 2;
    } else {
      merged.push(values[index]);
      index += 1;
    }
  }

  while (merged.length < 4) {
    merged.push(0);
  }

  const moved = JSON.stringify(row) !== JSON.stringify(merged);

  return { row: merged, scoreDelta, moved };
};

export const createInitialBoard = (): Board => {
  const board = createEmptyBoard();
  const positions = [
    [Math.floor(Math.random() * 4), Math.floor(Math.random() * 4)],
    [Math.floor(Math.random() * 4), Math.floor(Math.random() * 4)],
  ];

  positions.forEach(([rowIndex, colIndex], index) => {
    if (board[rowIndex][colIndex] === 0) {
      board[rowIndex][colIndex] = index === 0 ? 2 : 4;
    }
  });

  return board;
};

export const moveBoard = (board: Board, direction: Direction): MoveResult => {
  const nextBoard = board.map((row) => [...row]);
  const rows = nextBoard.length;
  const cols = nextBoard[0].length;

  const transformed: number[][] = Array.from({ length: rows }, () => Array(cols).fill(0));
  let moved = false;
  let scoreDelta = 0;

  const applyLine = (line: number[]) => {
    const { row, scoreDelta: lineScoreDelta, moved: lineMoved } = slideAndMerge(line);
    scoreDelta += lineScoreDelta;
    moved = moved || lineMoved;
    return row;
  };

  if (direction === 'left' || direction === 'right') {
    for (let rowIndex = 0; rowIndex < rows; rowIndex += 1) {
      const row = [...nextBoard[rowIndex]];
      const processed = direction === 'left' ? applyLine(row) : applyLine([...row].reverse());
      transformed[rowIndex] = direction === 'left' ? processed : processed.reverse();
    }
  } else {
    for (let colIndex = 0; colIndex < cols; colIndex += 1) {
      const col = nextBoard.map((row) => row[colIndex]);
      const processed = direction === 'up' ? applyLine(col) : applyLine([...col].reverse());
      processed.forEach((value, rowIndex) => {
        if (direction === 'up') {
          transformed[rowIndex][colIndex] = value;
        } else {
          transformed[rows - 1 - rowIndex][colIndex] = value;
        }
      });
    }
  }

  return {
    board: transformed,
    moved,
    scoreDelta,
  };
};

export const addRandomTile = (board: Board): Board => {
  const emptyCells = board.flatMap((row, rowIndex) => row.map((value, colIndex) => ({ rowIndex, colIndex, value }))).filter((cell) => cell.value === 0);

  if (emptyCells.length === 0) {
    return board;
  }

  const target = emptyCells[Math.floor(Math.random() * emptyCells.length)];
  const nextBoard = board.map((row) => [...row]);
  nextBoard[target.rowIndex][target.colIndex] = Math.random() < 0.9 ? 2 : 4;
  return nextBoard;
};

export const hasNoMoves = (board: Board): boolean => {
  for (let rowIndex = 0; rowIndex < board.length; rowIndex += 1) {
    for (let colIndex = 0; colIndex < board[rowIndex].length; colIndex += 1) {
      const value = board[rowIndex][colIndex];
      const hasNeighbor =
        (rowIndex > 0 && board[rowIndex - 1][colIndex] === value) ||
        (rowIndex < board.length - 1 && board[rowIndex + 1][colIndex] === value) ||
        (colIndex > 0 && board[rowIndex][colIndex - 1] === value) ||
        (colIndex < board[rowIndex].length - 1 && board[rowIndex][colIndex + 1] === value);

      if (value === 0 || hasNeighbor) {
        return false;
      }
    }
  }

  return true;
};

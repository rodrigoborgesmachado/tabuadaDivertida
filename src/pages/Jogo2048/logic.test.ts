import { moveBoard } from './logic';

describe('2048 move logic', () => {
  it('merges matching tiles to the left and adds score', () => {
    const board = [
      [2, 2, 0, 0],
      [4, 0, 4, 0],
      [2, 4, 4, 2],
      [0, 0, 0, 0],
    ];

    const result = moveBoard(board, 'left');

    expect(result.moved).toBe(true);
    expect(result.board).toEqual([
      [4, 0, 0, 0],
      [8, 0, 0, 0],
      [2, 8, 2, 0],
      [0, 0, 0, 0],
    ]);
    expect(result.scoreDelta).toBe(20);
  });

  it('keeps the board unchanged when no merge is possible', () => {
    const board = [
      [2, 4, 8, 16],
      [32, 64, 128, 256],
      [512, 1024, 2048, 4096],
      [8192, 16384, 32768, 65536],
    ];

    const result = moveBoard(board, 'left');

    expect(result.moved).toBe(false);
    expect(result.board).toEqual(board);
    expect(result.scoreDelta).toBe(0);
  });

  it('merges tiles correctly when moving up and down', () => {
    const board = [
      [2, 0, 0, 0],
      [2, 0, 0, 0],
      [4, 0, 0, 0],
      [4, 0, 0, 0],
    ];

    const upResult = moveBoard(board, 'up');
    expect(upResult.moved).toBe(true);
    expect(upResult.board).toEqual([
      [4, 0, 0, 0],
      [8, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ]);
    expect(upResult.scoreDelta).toBe(12);

    const downResult = moveBoard(board, 'down');
    expect(downResult.moved).toBe(true);
    expect(downResult.board).toEqual([
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [4, 0, 0, 0],
      [8, 0, 0, 0],
    ]);
    expect(downResult.scoreDelta).toBe(12);
  });
});

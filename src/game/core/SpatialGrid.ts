import { Enemy } from '../entities/Enemy';

export class SpatialGrid {
  private cellSize: number;
  private grid: Map<string, Enemy[]> = new Map();

  constructor(cellSize: number = 120) {
    this.cellSize = cellSize;
  }

  clear() {
    this.grid.clear();
  }

  private getKey(cx: number, cy: number): string {
    return `${cx},${cy}`;
  }

  insert(enemy: Enemy) {
    const cx = Math.floor(enemy.x / this.cellSize);
    const cy = Math.floor(enemy.y / this.cellSize);
    const key = this.getKey(cx, cy);

    if (!this.grid.has(key)) {
      this.grid.set(key, []);
    }
    this.grid.get(key)!.push(enemy);
  }

  query(x: number, y: number, radius: number): Enemy[] {
    const minCX = Math.floor((x - radius) / this.cellSize);
    const maxCX = Math.floor((x + radius) / this.cellSize);
    const minCY = Math.floor((y - radius) / this.cellSize);
    const maxCY = Math.floor((y + radius) / this.cellSize);

    const results: Enemy[] = [];

    for (let cx = minCX; cx <= maxCX; cx++) {
      for (let cy = minCY; cy <= maxCY; cy++) {
        const key = this.getKey(cx, cy);
        const cell = this.grid.get(key);
        if (cell) {
          for (let i = 0; i < cell.length; i++) {
            results.push(cell[i]);
          }
        }
      }
    }

    return results;
  }
}

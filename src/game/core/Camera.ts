import type { Vector2D } from '../../types/game';

export class Camera {
  public x: number = 0;
  public y: number = 0;
  public viewportWidth: number = 0;
  public viewportHeight: number = 0;
  public readonly worldWidth: number = 3200;
  public readonly worldHeight: number = 3200;

  update(targetX: number, targetY: number, viewportWidth: number, viewportHeight: number) {
    this.viewportWidth = viewportWidth;
    this.viewportHeight = viewportHeight;

    // Giữ nhân vật ở chính giữa màn hình
    this.x = targetX - viewportWidth / 2;
    this.y = targetY - viewportHeight / 2;

    // Giới hạn trong kích thước thế giới
    this.x = Math.max(0, Math.min(this.worldWidth - viewportWidth, this.x));
    this.y = Math.max(0, Math.min(this.worldHeight - viewportHeight, this.y));
  }

  worldToScreen(worldX: number, worldY: number): Vector2D {
    return {
      x: worldX - this.x,
      y: worldY - this.y
    };
  }

  screenToWorld(screenX: number, screenY: number): Vector2D {
    return {
      x: screenX + this.x,
      y: screenY + this.y
    };
  }

  isVisible(worldX: number, worldY: number, radius: number): boolean {
    return (
      worldX + radius >= this.x &&
      worldX - radius <= this.x + this.viewportWidth &&
      worldY + radius >= this.y &&
      worldY - radius <= this.y + this.viewportHeight
    );
  }
}

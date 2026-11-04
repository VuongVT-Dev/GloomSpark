import { Particle } from './Particle';
import type { Enemy } from './Enemy';

export class Projectile {
  public x: number;
  public y: number;
  public vx: number;
  public vy: number;
  public radius: number = 6;
  public damage: number;
  public speed: number = 550;
  public alive: boolean = true;
  public lifeTime: number = 2.5;
  public currentLife: number = 0;
  public piercesLeft: number = 0;
  public hitEnemies: Set<number> = new Set();

  constructor(x: number, y: number, targetX: number, targetY: number, damage: number, pierces: number = 0) {
    this.x = x;
    this.y = y;
    this.damage = damage;
    this.piercesLeft = pierces;

    const dx = targetX - x;
    const dy = targetY - y;
    const dist = Math.hypot(dx, dy) || 1;

    this.vx = (dx / dist) * this.speed;
    this.vy = (dy / dist) * this.speed;
  }

  /**
   * Hook xử lý khi đạn va chạm vào quái vật (dành cho các lớp con như IceArrow ghi đè)
   */
  onHit(_enemy: Enemy): void {
    // Mặc định không có hiệu ứng đặc biệt
  }

  update(deltaTime: number, particles: Particle[]) {
    this.currentLife += deltaTime;
    if (this.currentLife >= this.lifeTime) {
      this.alive = false;
      return;
    }

    this.x += this.vx * deltaTime;
    this.y += this.vy * deltaTime;

    // Hiệu ứng đuôi tia ma thuật lấp lánh (sparkles trail)
    if (Math.random() < 0.6) {
      particles.push(
        new Particle(
          this.x,
          this.y,
          (Math.random() - 0.5) * 40,
          (Math.random() - 0.5) * 40,
          Math.random() * 3 + 2,
          '#a855f7',
          0.35
        )
      );
    }
  }

  draw(ctx: CanvasRenderingContext2D, cameraX: number, cameraY: number) {
    const screenX = this.x - cameraX;
    const screenY = this.y - cameraY;

    ctx.save();
    ctx.shadowColor = '#c084fc';
    ctx.shadowBlur = 12;

    // Lõi năng lượng phát sáng
    ctx.fillStyle = '#a855f7';
    ctx.beginPath();
    ctx.arc(screenX, screenY, this.radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(screenX, screenY, this.radius * 0.45, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}

import { Projectile } from './Projectile';
import { Particle } from './Particle';
import type { Enemy } from './Enemy';

export class IceArrow extends Projectile {
  public slowDuration: number;
  public slowPercentage: number;

  constructor(
    x: number,
    y: number,
    targetX: number,
    targetY: number,
    damage: number,
    pierces: number = 0,
    slowDuration: number = 3.0,
    slowPercentage: number = 0.4
  ) {
    // Mũi tên băng bay chậm hơn đạn thường một chút (420px/s so với 550px/s)
    super(x, y, targetX, targetY, damage, pierces);
    this.speed = 420;
    this.radius = 8;
    this.lifeTime = 2.8;
    this.slowDuration = slowDuration;
    this.slowPercentage = slowPercentage;

    // Tính toán lại vận tốc theo tốc độ mới
    const dx = targetX - x;
    const dy = targetY - y;
    const dist = Math.hypot(dx, dy) || 1;
    this.vx = (dx / dist) * this.speed;
    this.vy = (dy / dist) * this.speed;
  }

  /**
   * Kích hoạt hiệu ứng làm chậm khi mũi tên băng cắm vào kẻ địch
   */
  override onHit(enemy: Enemy): void {
    enemy.applySlow(this.slowDuration, this.slowPercentage);
  }

  override update(deltaTime: number, particles: Particle[]) {
    this.currentLife += deltaTime;
    if (this.currentLife >= this.lifeTime) {
      this.alive = false;
      return;
    }

    this.x += this.vx * deltaTime;
    this.y += this.vy * deltaTime;

    // Hiệu ứng bụi tuyết / tinh thể băng lấp lánh bay theo sau mũi tên
    if (Math.random() < 0.75) {
      const colors = ['#38bdf8', '#7dd3fc', '#e0f2fe', '#ffffff'];
      const chosenColor = colors[Math.floor(Math.random() * colors.length)];
      particles.push(
        new Particle(
          this.x + (Math.random() - 0.5) * 6,
          this.y + (Math.random() - 0.5) * 6,
          (Math.random() - 0.5) * 30,
          (Math.random() - 0.5) * 30,
          Math.random() * 2.5 + 1.5,
          chosenColor,
          0.35
        )
      );
    }
  }

  override draw(ctx: CanvasRenderingContext2D, cameraX: number, cameraY: number) {
    const screenX = this.x - cameraX;
    const screenY = this.y - cameraY;

    // Tính góc xoay của mũi tên theo hướng bay
    const angle = Math.atan2(this.vy, this.vx);

    ctx.save();
    ctx.translate(screenX, screenY);
    ctx.rotate(angle);

    // Hào quang băng giá phát sáng màu xanh ngọc lam (Frost Glow)
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 14;

    // 1. Thân mũi tên băng (Arrow Shaft)
    ctx.strokeStyle = '#7dd3fc';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-16, 0);
    ctx.lineTo(6, 0);
    ctx.stroke();

    // Lõi sáng trắng bên trong thân tên
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(-12, 0);
    ctx.lineTo(5, 0);
    ctx.stroke();

    // 2. Đầu mũi tên pha lê băng nhọn (Crystal Arrowhead)
    ctx.fillStyle = '#0284c7';
    ctx.beginPath();
    ctx.moveTo(14, 0);
    ctx.lineTo(2, -7);
    ctx.lineTo(5, 0);
    ctx.lineTo(2, 7);
    ctx.closePath();
    ctx.fill();

    // Lớp phủ sáng trên đầu mũi tên
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.moveTo(13, 0);
    ctx.lineTo(4, -5);
    ctx.lineTo(6, 0);
    ctx.lineTo(4, 5);
    ctx.closePath();
    ctx.fill();

    // Điểm mũi nhọn cực sáng màu trắng
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(14, 0);
    ctx.lineTo(6, -2);
    ctx.lineTo(7, 0);
    ctx.lineTo(6, 2);
    ctx.closePath();
    ctx.fill();

    // 3. Đuôi cánh tiễn bằng tinh thể tuyết (Frost Fletching)
    ctx.strokeStyle = '#bae6fd';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-13, 0);
    ctx.lineTo(-19, -5);
    ctx.moveTo(-9, 0);
    ctx.lineTo(-14, -5);

    ctx.moveTo(-13, 0);
    ctx.lineTo(-19, 5);
    ctx.moveTo(-9, 0);
    ctx.lineTo(-14, 5);
    ctx.stroke();

    ctx.restore();
  }
}

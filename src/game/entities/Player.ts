import type { PlayerStats, Vector2D } from '../../types/game';
import { Camera } from '../core/Camera';

export class Player {
  public x: number;
  public y: number;
  public radius: number = 18;
  public stats: PlayerStats;
  public invulnerableTimer: number = 0;
  private animTimer: number = 0;

  constructor(startX: number, startY: number) {
    this.x = startX;
    this.y = startY;
    this.stats = {
      maxHp: 100,
      currentHp: 100,
      moveSpeed: 230,
      damageMultiplier: 1.0,
      attackSpeedMultiplier: 1.0,
      projectileCount: 1,
      pickupRadius: 90,
      level: 1,
      currentExp: 0,
      maxExp: 30,
      kills: 0,
      timeSurvived: 0,
    };
  }

  takeDamage(amount: number) {
    if (this.invulnerableTimer > 0) return false;

    this.stats.currentHp = Math.max(0, this.stats.currentHp - amount);
    this.invulnerableTimer = 0.5; // 0.5s i-frames
    return true;
  }

  addExp(amount: number): boolean {
    this.stats.currentExp += amount;
    if (this.stats.currentExp >= this.stats.maxExp) {
      this.stats.currentExp -= this.stats.maxExp;
      this.stats.level += 1;
      // Công thức tăng EXP mỗi cấp
      this.stats.maxExp = Math.floor(this.stats.maxExp * 1.35 + 15);
      return true; // Kích hoạt Level Up
    }
    return false;
  }

  update(deltaTime: number, moveVector: Vector2D, camera: Camera) {
    this.stats.timeSurvived += deltaTime;
    this.animTimer += deltaTime * 3;

    if (this.invulnerableTimer > 0) {
      this.invulnerableTimer -= deltaTime;
    }

    // Di chuyển
    this.x += moveVector.x * this.stats.moveSpeed * deltaTime;
    this.y += moveVector.y * this.stats.moveSpeed * deltaTime;

    // Giữ trong biên giới bản đồ
    this.x = Math.max(this.radius, Math.min(camera.worldWidth - this.radius, this.x));
    this.y = Math.max(this.radius, Math.min(camera.worldHeight - this.radius, this.y));
  }

  draw(ctx: CanvasRenderingContext2D, cameraX: number, cameraY: number) {
    const screenX = this.x - cameraX;
    const screenY = this.y - cameraY;

    ctx.save();

    // Nhấp nháy khi đang miễn nhiễm sát thương (i-frames)
    if (this.invulnerableTimer > 0 && Math.floor(this.invulnerableTimer * 20) % 2 === 0) {
      ctx.globalAlpha = 0.4;
    }

    // Vòng ma thuật xoay dưới chân (Arcane magic seal)
    ctx.save();
    ctx.translate(screenX, screenY);
    ctx.rotate(this.animTimer);
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.arc(0, 0, this.radius + 10, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // Vòng hào quang phát sáng
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 15;

    // Thân pháp sư bóng đêm (Dark Sorcerer)
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(screenX, screenY, this.radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Lõi năng lượng GloomSpark ở giữa ngực
    ctx.fillStyle = '#0284c7';
    ctx.beginPath();
    ctx.arc(screenX, screenY, this.radius * 0.45, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#e0f2fe';
    ctx.beginPath();
    ctx.arc(screenX, screenY, this.radius * 0.2, 0, Math.PI * 2);
    ctx.fill();

    // Bán kính hút ngọc (vòng mờ chỉ hiện rất nhẹ)
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.08)';
    ctx.lineWidth = 1;
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.arc(screenX, screenY, this.stats.pickupRadius, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
  }
}

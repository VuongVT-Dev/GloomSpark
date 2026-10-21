import type { EnemyConfig } from '../../types/game';
import { Particle, FloatingText } from './Particle';
import { ExpGem } from './ExpGem';

let enemyIdCounter = 0;

export class Enemy {
  public id: number;
  public x: number;
  public y: number;
  public radius: number;
  public hp: number;
  public maxHp: number;
  public speed: number;
  public damage: number;
  public expValue: number;
  public color: string;
  public eyeColor: string;
  public alive: boolean = true;
  public slowTimer: number = 0;
  public slowFactor: number = 0;
  private flashTimer: number = 0;
  private knockbackVx: number = 0;
  private knockbackVy: number = 0;

  constructor(x: number, y: number, config: EnemyConfig) {
    this.id = ++enemyIdCounter;
    this.x = x;
    this.y = y;
    this.radius = config.radius;
    this.hp = config.hp;
    this.maxHp = config.maxHp;
    this.speed = config.speed;
    this.damage = config.damage;
    this.expValue = config.expValue;
    this.color = config.color;
    this.eyeColor = config.eyeColor;
  }

  takeDamage(amount: number, fromX: number, fromY: number, particles: Particle[], floatingTexts: FloatingText[], expGems: ExpGem[]) {
    this.hp -= amount;
    this.flashTimer = 0.12; // Chớp trắng khi trúng đạn

    // Lực đẩy lùi nhẹ (Knockback)
    const dx = this.x - fromX;
    const dy = this.y - fromY;
    const dist = Math.hypot(dx, dy) || 1;
    this.knockbackVx = (dx / dist) * 140;
    this.knockbackVy = (dy / dist) * 140;

    // Hiển thị số sát thương nhảy lên
    floatingTexts.push(new FloatingText(this.x, this.y, Math.round(amount).toString(), '#f87171', 15));

    // Tia máu / bụi bóng tối khi bị đánh trúng
    for (let i = 0; i < 4; i++) {
      particles.push(
        new Particle(
          this.x,
          this.y,
          (Math.random() - 0.5) * 120,
          (Math.random() - 0.5) * 120,
          Math.random() * 3 + 1,
          this.color,
          0.3
        )
      );
    }

    if (this.hp <= 0) {
      this.alive = false;
      // Rơi ngọc kinh nghiệm
      expGems.push(new ExpGem(this.x, this.y, this.expValue));

      // Hiệu ứng nổ tan biến
      for (let i = 0; i < 8; i++) {
        particles.push(
          new Particle(
            this.x,
            this.y,
            (Math.random() - 0.5) * 200,
            (Math.random() - 0.5) * 200,
            Math.random() * 4 + 2,
            this.eyeColor,
            0.45
          )
        );
      }
    }
  }

  /**
   * Áp dụng hiệu ứng làm chậm (Slow debuff)
   * @param duration Thời gian làm chậm tính bằng giây
   * @param factor Phần trăm làm chậm (ví dụ: 0.4 = giảm 40% tốc chạy)
   */
  applySlow(duration: number, factor: number) {
    this.slowTimer = Math.max(this.slowTimer, duration);
    this.slowFactor = Math.min(0.7, Math.max(this.slowFactor, factor)); // Tối đa làm chậm 70%
  }

  update(deltaTime: number, playerX: number, playerY: number) {
    if (this.flashTimer > 0) {
      this.flashTimer -= deltaTime;
    }

    // Xử lý hiệu ứng làm chậm
    if (this.slowTimer > 0) {
      this.slowTimer -= deltaTime;
      if (this.slowTimer <= 0) {
        this.slowFactor = 0;
      }
    }

    // Giảm dần lực đẩy lùi
    this.knockbackVx *= 0.88;
    this.knockbackVy *= 0.88;

    // Di chuyển thẳng về phía người chơi (áp dụng tốc độ sau khi bị làm chậm)
    const effectiveSpeed = this.slowTimer > 0
      ? this.speed * (1 - this.slowFactor)
      : this.speed;

    const dx = playerX - this.x;
    const dy = playerY - this.y;
    const dist = Math.hypot(dx, dy) || 1;

    this.x += (dx / dist) * effectiveSpeed * deltaTime + this.knockbackVx * deltaTime;
    this.y += (dy / dist) * effectiveSpeed * deltaTime + this.knockbackVy * deltaTime;
  }

  draw(ctx: CanvasRenderingContext2D, cameraX: number, cameraY: number) {
    const screenX = this.x - cameraX;
    const screenY = this.y - cameraY;

    ctx.save();

    // Thân quái vật
    ctx.fillStyle = this.flashTimer > 0 ? '#ffffff' : this.color;
    ctx.beginPath();
    ctx.arc(screenX, screenY, this.radius, 0, Math.PI * 2);
    ctx.fill();

    // Hiệu ứng băng giá khi bị làm chậm
    if (this.slowTimer > 0) {
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.85)';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      ctx.fillStyle = 'rgba(56, 189, 248, 0.25)';
      ctx.fill();
    } else {
      // Viền bóng đêm thông thường
      ctx.strokeStyle = '#020617';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Mắt quái vật phát sáng rực lửa / quỷ dị
    ctx.fillStyle = this.eyeColor;
    ctx.beginPath();
    ctx.arc(screenX - this.radius * 0.35, screenY - this.radius * 0.2, this.radius * 0.25, 0, Math.PI * 2);
    ctx.arc(screenX + this.radius * 0.35, screenY - this.radius * 0.2, this.radius * 0.25, 0, Math.PI * 2);
    ctx.fill();

    // Thanh máu trên đầu quái nếu bị mất máu
    if (this.hp < this.maxHp) {
      const barW = this.radius * 2;
      const barH = 3;
      const barX = screenX - this.radius;
      const barY = screenY - this.radius - 7;

      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.fillRect(barX, barY, barW, barH);

      ctx.fillStyle = '#ef4444';
      ctx.fillRect(barX, barY, barW * (this.hp / this.maxHp), barH);
    }

    ctx.restore();
  }
}

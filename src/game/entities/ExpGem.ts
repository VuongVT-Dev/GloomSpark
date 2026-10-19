export class ExpGem {
  public x: number;
  public y: number;
  public radius: number = 7;
  public value: number;
  public alive: boolean = true;
  private isAttracted: boolean = false;
  private speed: number = 300;
  private pulseTime: number = Math.random() * Math.PI;

  constructor(x: number, y: number, value: number = 10) {
    this.x = x;
    this.y = y;
    this.value = value;
  }

  attract() {
    this.isAttracted = true;
  }

  update(deltaTime: number, playerX: number, playerY: number) {
    this.pulseTime += deltaTime * 4;

    if (this.isAttracted) {
      const dx = playerX - this.x;
      const dy = playerY - this.y;
      const dist = Math.hypot(dx, dy);

      if (dist < 15) {
        this.alive = false;
        return;
      }

      this.speed += 800 * deltaTime;
      this.x += (dx / dist) * this.speed * deltaTime;
      this.y += (dy / dist) * this.speed * deltaTime;
    }
  }

  draw(ctx: CanvasRenderingContext2D, cameraX: number, cameraY: number) {
    const screenX = this.x - cameraX;
    const screenY = this.y - cameraY;

    const scale = 1 + Math.sin(this.pulseTime) * 0.15;
    const r = this.radius * scale;

    ctx.save();
    // Glowing emerald/cyan gem
    ctx.shadowColor = '#06b6d4';
    ctx.shadowBlur = 10;

    ctx.fillStyle = '#22d3ee';
    ctx.beginPath();
    ctx.moveTo(screenX, screenY - r);
    ctx.lineTo(screenX + r, screenY);
    ctx.lineTo(screenX, screenY + r);
    ctx.lineTo(screenX - r, screenY);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#cffafe';
    ctx.beginPath();
    ctx.arc(screenX, screenY, r * 0.4, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}

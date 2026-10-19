export class Particle {
  public x: number;
  public y: number;
  public vx: number;
  public vy: number;
  public radius: number;
  public color: string;
  public alpha: number = 1;
  public maxLife: number;
  public currentLife: number = 0;
  public alive: boolean = true;

  constructor(x: number, y: number, vx: number, vy: number, radius: number, color: string, life: number) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.radius = radius;
    this.color = color;
    this.maxLife = life;
  }

  update(deltaTime: number) {
    this.currentLife += deltaTime;
    if (this.currentLife >= this.maxLife) {
      this.alive = false;
      return;
    }
    this.x += this.vx * deltaTime;
    this.y += this.vy * deltaTime;
    this.alpha = Math.max(0, 1 - this.currentLife / this.maxLife);
  }

  draw(ctx: CanvasRenderingContext2D, cameraX: number, cameraY: number) {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x - cameraX, this.y - cameraY, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

export class FloatingText {
  public x: number;
  public y: number;
  public text: string;
  public color: string;
  public fontSize: number;
  public alpha: number = 1;
  public life: number = 0.8;
  public currentLife: number = 0;
  public alive: boolean = true;

  constructor(x: number, y: number, text: string, color: string = '#f87171', fontSize: number = 16) {
    this.x = x + (Math.random() * 20 - 10);
    this.y = y - 10;
    this.text = text;
    this.color = color;
    this.fontSize = fontSize;
  }

  update(deltaTime: number) {
    this.currentLife += deltaTime;
    if (this.currentLife >= this.life) {
      this.alive = false;
      return;
    }
    this.y -= 30 * deltaTime;
    this.alpha = 1 - this.currentLife / this.life;
  }

  draw(ctx: CanvasRenderingContext2D, cameraX: number, cameraY: number) {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.font = `bold ${this.fontSize}px sans-serif`;
    ctx.fillStyle = this.color;
    ctx.strokeStyle = '#050508';
    ctx.lineWidth = 3;
    ctx.strokeText(this.text, this.x - cameraX, this.y - cameraY);
    ctx.fillText(this.text, this.x - cameraX, this.y - cameraY);
    ctx.restore();
  }
}

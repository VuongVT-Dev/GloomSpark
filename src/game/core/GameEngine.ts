import type { GameState, UpgradeCard, EnemyConfig } from '../../types/game';
import { GameEvents, EVENTS } from '../events/GameEvents';
import { Camera } from './Camera';
import { InputManager } from './InputManager';
import { SpatialGrid } from './SpatialGrid';
import { Player } from '../entities/Player';
import { Enemy } from '../entities/Enemy';
import { Projectile } from '../entities/Projectile';
import { ExpGem } from '../entities/ExpGem';
import { Particle, FloatingText } from '../entities/Particle';
import { SpellManager } from '../spells/SpellManager';

export class GameEngine {
  public canvas: HTMLCanvasElement;
  public ctx: CanvasRenderingContext2D;
  public gameState: GameState = 'PLAYING';
  public camera: Camera;
  public input: InputManager;
  public player: Player;
  public spatialGrid: SpatialGrid;
  public spellManager: SpellManager;

  public enemies: Enemy[] = [];
  public projectiles: Projectile[] = [];
  public expGems: ExpGem[] = [];
  public particles: Particle[] = [];
  public floatingTexts: FloatingText[] = [];

  private lastTime: number = 0;
  private animationFrameId: number | null = null;
  private spawnTimer: number = 0;
  private spawnInterval: number = 0.8; // Quái spawn mỗi 0.8s lúc đầu
  private hudUpdateTimer: number = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.camera = new Camera();
    this.input = new InputManager();
    this.spatialGrid = new SpatialGrid(120);
    this.spellManager = new SpellManager();

    // Khởi tạo nhân vật ở giữa bản đồ
    this.player = new Player(this.camera.worldWidth / 2, this.camera.worldHeight / 2);

    this.loop = this.loop.bind(this);
  }

  start() {
    this.input.init(this.canvas);
    this.resizeCanvas();
    this.gameState = 'PLAYING';
    this.lastTime = performance.now();
    this.animationFrameId = requestAnimationFrame(this.loop);

    // Bắn event khởi tạo trạng thái
    GameEvents.emit(EVENTS.STATE_CHANGE, this.gameState);
    this.emitStatsUpdate();
  }

  stop() {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    this.input.destroy();
  }

  pause() {
    this.gameState = 'PAUSED';
    GameEvents.emit(EVENTS.STATE_CHANGE, this.gameState);
  }

  resume() {
    this.gameState = 'PLAYING';
    this.lastTime = performance.now();
    GameEvents.emit(EVENTS.STATE_CHANGE, this.gameState);
  }

  restart() {
    this.enemies = [];
    this.projectiles = [];
    this.expGems = [];
    this.particles = [];
    this.floatingTexts = [];
    this.player = new Player(this.camera.worldWidth / 2, this.camera.worldHeight / 2);
    this.spellManager.initDefaultSpells();
    this.spawnTimer = 0;
    this.spawnInterval = 0.8;
    this.resume();
    this.emitStatsUpdate();
  }

  resizeCanvas() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  private loop(currentTime: number) {
    if (this.gameState === 'PLAYING') {
      const deltaTime = Math.min((currentTime - this.lastTime) / 1000, 0.1);
      this.update(deltaTime);
      this.render();
    }
    this.lastTime = currentTime;
    this.animationFrameId = requestAnimationFrame(this.loop);
  }

  private update(deltaTime: number) {
    // 1. Cập nhật vị trí di chuyển nhân vật
    const moveVec = this.input.getMovementVector(
      { x: this.player.x, y: this.player.y },
      { x: this.camera.x, y: this.camera.y }
    );
    this.player.update(deltaTime, moveVec, this.camera);

    // 2. Camera bám theo nhân vật
    this.camera.update(this.player.x, this.player.y, this.canvas.width, this.canvas.height);

    // 3. Spawner: Sinh quái vật theo thời gian
    this.updateSpawner(deltaTime);

    // 4. Cập nhật quái vật & đưa vào Spatial Grid
    this.spatialGrid.clear();
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];
      if (!enemy.alive) {
        this.enemies.splice(i, 1);
        continue;
      }
      enemy.update(deltaTime, this.player.x, this.player.y);
      this.spatialGrid.insert(enemy);

      // Kiểm tra va chạm quái chạm vào người chơi
      const distToPlayer = Math.hypot(enemy.x - this.player.x, enemy.y - this.player.y);
      if (distToPlayer < enemy.radius + this.player.radius) {
        const tookDmg = this.player.takeDamage(enemy.damage);
        if (tookDmg) {
          this.floatingTexts.push(
            new FloatingText(this.player.x, this.player.y, `-${enemy.damage}`, '#ef4444', 18)
          );
          if (this.player.stats.currentHp <= 0) {
            this.handleGameOver();
            return;
          }
        }
      }
    }

    // 5. Cập nhật Kỹ năng tự động bắn (BaseSpell polymorph)
    this.spellManager.update(deltaTime, this.player, {
      projectiles: this.projectiles,
      particles: this.particles,
      floatingTexts: this.floatingTexts,
      expGems: this.expGems,
      enemies: this.enemies
    });

    // 6. Cập nhật Đạn ma thuật & Kiểm tra va chạm qua Spatial Grid
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const proj = this.projectiles[i];
      if (!proj.alive) {
        this.projectiles.splice(i, 1);
        continue;
      }
      proj.update(deltaTime, this.particles);

      // Tìm quái trong ô lân cận để kiểm tra va chạm
      const nearbyEnemies = this.spatialGrid.query(proj.x, proj.y, proj.radius + 30);
      for (const enemy of nearbyEnemies) {
        if (!enemy.alive || proj.hitEnemies.has(enemy.id)) continue;

        const dist = Math.hypot(proj.x - enemy.x, proj.y - enemy.y);
        if (dist <= proj.radius + enemy.radius) {
          proj.hitEnemies.add(enemy.id);
          // Kích hoạt hiệu ứng va chạm (ví dụ IceArrow làm chậm quái vật)
          proj.onHit(enemy);

          enemy.takeDamage(
            proj.damage,
            proj.x,
            proj.y,
            this.particles,
            this.floatingTexts,
            this.expGems
          );

          if (!enemy.alive) {
            this.player.stats.kills += 1;
          }

          if (proj.piercesLeft > 0) {
            proj.piercesLeft -= 1;
          } else {
            proj.alive = false;
            break;
          }
        }
      }
    }

    // 7. Cập nhật Ngọc EXP
    for (let i = this.expGems.length - 1; i >= 0; i--) {
      const gem = this.expGems[i];
      if (!gem.alive) {
        // Người chơi đã hút viên ngọc thành công
        const leveledUp = this.player.addExp(gem.value);
        this.expGems.splice(i, 1);

        if (leveledUp) {
          this.handleLevelUp();
        }
        continue;
      }

      // Kiểm tra bán kính hút ngọc
      const dist = Math.hypot(gem.x - this.player.x, gem.y - this.player.y);
      if (dist <= this.player.stats.pickupRadius) {
        gem.attract();
      }
      gem.update(deltaTime, this.player.x, this.player.y);
    }

    // 8. Cập nhật Hạt hiệu ứng & Chữ nhảy sát thương
    for (let i = this.particles.length - 1; i >= 0; i--) {
      this.particles[i].update(deltaTime);
      if (!this.particles[i].alive) this.particles.splice(i, 1);
    }
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      this.floatingTexts[i].update(deltaTime);
      if (!this.floatingTexts[i].alive) this.floatingTexts.splice(i, 1);
    }

    // 9. Cập nhật thông số HUD sang React định kỳ mỗi 0.1s
    this.hudUpdateTimer += deltaTime;
    if (this.hudUpdateTimer >= 0.1) {
      this.hudUpdateTimer = 0;
      this.emitStatsUpdate();
    }
  }

  private updateSpawner(deltaTime: number) {
    this.spawnTimer += deltaTime;

    // Giảm thời gian spawn theo thời gian sống (quái ngày càng đông)
    const timeMins = this.player.stats.timeSurvived / 60;
    this.spawnInterval = Math.max(0.18, 0.8 - timeMins * 0.12);

    if (this.spawnTimer >= this.spawnInterval) {
      this.spawnTimer = 0;
      this.spawnEnemyWave();
    }
  }

  private spawnEnemyWave() {
    // Giới hạn số quái tối đa trên màn hình để giữ 60 FPS
    if (this.enemies.length >= 350) return;

    const timeMins = this.player.stats.timeSurvived / 60;

    // Chọn vị trí xuất hiện ngoài màn hình
    const angle = Math.random() * Math.PI * 2;
    const spawnDist = Math.max(this.canvas.width, this.canvas.height) * 0.65;
    const spawnX = this.player.x + Math.cos(angle) * spawnDist;
    const spawnY = this.player.y + Math.sin(angle) * spawnDist;

    // 3 Loại quái xuất hiện theo thời gian
    const rand = Math.random();
    let config: EnemyConfig;

    if (timeMins >= 2 && rand < 0.2) {
      // Abyssal Brute (Quái to, máu trâu)
      config = {
        name: 'Abyssal Brute',
        radius: 24,
        hp: Math.round((120 + timeMins * 50)),
        maxHp: Math.round((120 + timeMins * 50)),
        speed: 95,
        damage: 18,
        expValue: 35,
        color: '#4c1d95',
        eyeColor: '#f43f5e'
      };
    } else if (timeMins >= 0.5 && rand < 0.5) {
      // Void Fiend (Quái vừa)
      config = {
        name: 'Void Fiend',
        radius: 15,
        hp: Math.round((45 + timeMins * 25)),
        maxHp: Math.round((45 + timeMins * 25)),
        speed: 135,
        damage: 10,
        expValue: 15,
        color: '#1e1b4b',
        eyeColor: '#a855f7'
      };
    } else {
      // Shadow Crawler (Quái nhanh, máu giấy)
      config = {
        name: 'Shadow Crawler',
        radius: 11,
        hp: Math.round((18 + timeMins * 15)),
        maxHp: Math.round((18 + timeMins * 15)),
        speed: 165,
        damage: 6,
        expValue: 10,
        color: '#0f172a',
        eyeColor: '#38bdf8'
      };
    }

    this.enemies.push(new Enemy(spawnX, spawnY, config));
  }

  private handleLevelUp() {
    this.pause();

    // Lấy các thẻ nâng cấp / mở khóa phép thuật từ SpellManager
    const spellCards = this.spellManager.getAvailableUpgradeCards();

    // Danh sách thẻ nâng cấp chỉ số cơ bản
    const statCards: UpgradeCard[] = [
      {
        id: 'dmg_up',
        title: 'Tăng Sát Thương Phép',
        description: 'Tăng thêm +25% sát thương ma thuật.',
        rarity: 'COMMON',
        iconName: 'Sparkles',
        type: 'DAMAGE',
        apply: (stats) => { stats.damageMultiplier += 0.25; }
      },
      {
        id: 'atk_spd_up',
        title: 'Tăng Tốc Độ Bắn',
        description: 'Giảm thời gian hồi chiêu, bắn nhanh hơn +20%.',
        rarity: 'RARE',
        iconName: 'Zap',
        type: 'ATTACK_SPEED',
        apply: (stats) => { stats.attackSpeedMultiplier += 0.20; }
      },
      {
        id: 'proj_count_up',
        title: 'Thêm 1 Tia Đạn Ma Pháp',
        description: 'Mỗi lần tấn công của đạn cơ bản bắn thêm +1 tia đạn.',
        rarity: 'EPIC',
        iconName: 'Wand2',
        type: 'PROJECTILES',
        apply: (stats) => { stats.projectileCount += 1; }
      },
      {
        id: 'move_spd_up',
        title: 'Thân Pháp Linh Hoạt',
        description: 'Tăng thêm +15% tốc độ di chuyển.',
        rarity: 'COMMON',
        iconName: 'Footprints',
        type: 'MOVE_SPEED',
        apply: (stats) => { stats.moveSpeed += 30; }
      },
      {
        id: 'magnet_up',
        title: 'Bí Thuật Hút Ngọc',
        description: 'Tăng +40% bán kính tự động hút tinh thể EXP.',
        rarity: 'COMMON',
        iconName: 'Magnet',
        type: 'MAGNET',
        apply: (stats) => { stats.pickupRadius += 35; }
      },
      {
        id: 'max_hp_up',
        title: 'Tăng Thể Lực Tối Đa',
        description: 'Tăng +35 Máu tối đa và hồi phục ngay 35 HP.',
        rarity: 'RARE',
        iconName: 'Heart',
        type: 'MAX_HP',
        apply: (stats) => {
          stats.maxHp += 35;
          stats.currentHp = Math.min(stats.maxHp, stats.currentHp + 35);
        }
      }
    ];

    const allChoices: UpgradeCard[] = [...spellCards, ...statCards];

    // Xáo trộn và lấy 3 thẻ ngẫu nhiên
    const shuffled = [...allChoices].sort(() => Math.random() - 0.5);
    const selectedChoices = shuffled.slice(0, 3);

    GameEvents.emit(EVENTS.LEVEL_UP, {
      choices: selectedChoices,
      level: this.player.stats.level
    });
  }

  applyUpgrade(card: UpgradeCard) {
    card.apply(this.player.stats);
    this.resume();
    this.emitStatsUpdate();
  }

  private handleGameOver() {
    this.gameState = 'GAMEOVER';
    GameEvents.emit(EVENTS.STATE_CHANGE, this.gameState);
    GameEvents.emit(EVENTS.GAME_OVER, {
      timeSurvived: this.player.stats.timeSurvived,
      kills: this.player.stats.kills,
      level: this.player.stats.level
    });
  }

  private emitStatsUpdate() {
    GameEvents.emit(EVENTS.STATS_UPDATE, {
      ...this.player.stats,
      controlMode: this.input.controlMode
    });
  }

  private render() {
    const { ctx, canvas, camera } = this;

    // Xóa màn hình
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Vẽ nền đấu trường tăm tối (Dark Arena Floor & Grid)
    this.renderBackground(ctx, camera);

    // Vẽ ngọc EXP
    for (const gem of this.expGems) {
      if (camera.isVisible(gem.x, gem.y, gem.radius)) {
        gem.draw(ctx, camera.x, camera.y);
      }
    }

    // Vẽ Quái vật
    for (const enemy of this.enemies) {
      if (camera.isVisible(enemy.x, enemy.y, enemy.radius)) {
        enemy.draw(ctx, camera.x, camera.y);
      }
    }

    // Vẽ Người chơi
    this.player.draw(ctx, camera.x, camera.y);

    // Vẽ Đạn ma thuật (Bao gồm cả IceArrow kế thừa Projectile)
    for (const proj of this.projectiles) {
      if (camera.isVisible(proj.x, proj.y, proj.radius)) {
        proj.draw(ctx, camera.x, camera.y);
      }
    }

    // Vẽ Hạt hiệu ứng
    for (const p of this.particles) {
      p.draw(ctx, camera.x, camera.y);
    }

    // Vẽ Chữ nhảy sát thương
    for (const ft of this.floatingTexts) {
      ft.draw(ctx, camera.x, camera.y);
    }

    // Vẽ con trỏ chỉ hướng nếu ở chế độ MOUSE
    if (this.input.controlMode === 'MOUSE') {
      this.renderMouseGuide(ctx);
    }
  }

  private renderBackground(ctx: CanvasRenderingContext2D, camera: Camera) {
    // Màu nền u tối của GloomSpark
    ctx.fillStyle = '#06060c';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Lưới đá cổ xưa (Dark Stone Grid)
    const gridSize = 100;
    const startX = -((camera.x % gridSize) + gridSize) % gridSize;
    const startY = -((camera.y % gridSize) + gridSize) % gridSize;

    ctx.strokeStyle = 'rgba(30, 27, 75, 0.4)';
    ctx.lineWidth = 1;
    ctx.beginPath();

    for (let x = startX; x < this.canvas.width; x += gridSize) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, this.canvas.height);
    }
    for (let y = startY; y < this.canvas.height; y += gridSize) {
      ctx.moveTo(0, y);
      ctx.lineTo(this.canvas.width, y);
    }
    ctx.stroke();

    // Viền biên giới bản đồ (Ranh giới cấm địa ma thuật)
    const worldScreenLeft = -camera.x;
    const worldScreenTop = -camera.y;

    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 4;
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = 15;
    ctx.strokeRect(worldScreenLeft, worldScreenTop, camera.worldWidth, camera.worldHeight);
    ctx.shadowBlur = 0;
  }

  private renderMouseGuide(ctx: CanvasRenderingContext2D) {
    const mouseX = this.input.mousePosScreen.x;
    const mouseY = this.input.mousePosScreen.y;
    const playerScreen = this.camera.worldToScreen(this.player.x, this.player.y);

    // Tia định hướng từ nhân vật tới con trỏ
    ctx.save();
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    ctx.moveTo(playerScreen.x, playerScreen.y);
    ctx.lineTo(mouseX, mouseY);
    ctx.stroke();

    // Vòng ngắm con trỏ chuột
    ctx.setLineDash([]);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(mouseX, mouseY, 8, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
}

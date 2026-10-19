import { Player } from '../entities/Player';
import { Enemy } from '../entities/Enemy';
import { Projectile } from '../entities/Projectile';

export class SpellManager {
  private baseCooldown: number = 0.9; // 0.9s mỗi đợt bắn
  private cooldownTimer: number = 0;
  private baseDamage: number = 22;

  update(deltaTime: number, player: Player, enemies: Enemy[], projectiles: Projectile[]) {
    // Tốc độ bắn ảnh hưởng bởi attackSpeedMultiplier
    const actualCooldown = Math.max(0.2, this.baseCooldown / player.stats.attackSpeedMultiplier);
    this.cooldownTimer += deltaTime;

    if (this.cooldownTimer >= actualCooldown) {
      this.cooldownTimer = 0;
      this.castMagicMissiles(player, enemies, projectiles);
    }
  }

  private castMagicMissiles(player: Player, enemies: Enemy[], projectiles: Projectile[]) {
    if (enemies.length === 0) return;

    // Sắp xếp quái theo khoảng cách gần nhất
    const sorted = enemies
      .map(e => ({
        enemy: e,
        distSq: (e.x - player.x) ** 2 + (e.y - player.y) ** 2
      }))
      .filter(item => item.distSq <= 600 ** 2) // Tầm bắn 600px
      .sort((a, b) => a.distSq - b.distSq);

    if (sorted.length === 0) return;

    const count = player.stats.projectileCount;
    const finalDamage = this.baseDamage * player.stats.damageMultiplier;

    for (let i = 0; i < count; i++) {
      // Phân chia đạn vào các quái gần nhất hoặc dồn vào quái gần nhất nếu ít quái
      const target = sorted[i % sorted.length].enemy;

      // Độ lệch nhẹ giữa các tia nếu bắn nhiều đạn
      const spread = (i - (count - 1) / 2) * 16;
      const targetX = target.x + (Math.random() - 0.5) * spread;
      const targetY = target.y + (Math.random() - 0.5) * spread;

      projectiles.push(
        new Projectile(player.x, player.y, targetX, targetY, finalDamage, 0)
      );
    }
  }
}

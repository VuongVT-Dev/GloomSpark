import { BaseSpell, type SpellContext } from './BaseSpell';
import type { Player } from '../entities/Player';
import { Projectile } from '../entities/Projectile';

export class MagicMissileSpell extends BaseSpell {
  public readonly id = 'magic_missile';
  public readonly name = 'Tia Ma Thuật';
  public readonly description = 'Bắn ra các tia năng lượng huyền bí tự động tìm diệt kẻ địch gần nhất.';
  public readonly iconName = 'Wand2';

  public bonusProjectiles: number = 0;
  public pierces: number = 0;

  constructor(initialLevel: number = 1) {
    // Sát thương gốc: 22, Hồi chiêu gốc: 0.9s, Cấp khởi đầu: 1
    super(22, 0.9, initialLevel);
  }

  cast(player: Player, context: SpellContext): boolean {
    const { enemies, projectiles } = context;
    if (enemies.length === 0) return false;

    // Sắp xếp quái theo khoảng cách gần nhất trong tầm 600px
    const sorted = enemies
      .map(e => ({
        enemy: e,
        distSq: (e.x - player.x) ** 2 + (e.y - player.y) ** 2
      }))
      .filter(item => item.distSq <= 600 ** 2)
      .sort((a, b) => a.distSq - b.distSq);

    if (sorted.length === 0) return false;

    // Tổng số lượng đạn = số lượng của Player + bonus từ cấp độ kỹ năng
    const totalCount = player.stats.projectileCount + this.bonusProjectiles;
    const finalDamage = this.getActualDamage(player);

    for (let i = 0; i < totalCount; i++) {
      const target = sorted[i % sorted.length].enemy;

      // Độ tản đạn nhẹ nếu bắn nhiều tia
      const spread = (i - (totalCount - 1) / 2) * 16;
      const targetX = target.x + (Math.random() - 0.5) * spread;
      const targetY = target.y + (Math.random() - 0.5) * spread;

      projectiles.push(
        new Projectile(player.x, player.y, targetX, targetY, finalDamage, this.pierces)
      );
    }

    return true;
  }

  protected onUpgrade(newLevel: number): void {
    switch (newLevel) {
      case 2:
        // Cấp 2: Tăng mạnh sát thương
        this.baseDamage = Math.round(this.baseDamage * 1.3);
        break;
      case 3:
        // Cấp 3: Bắn thêm 1 tia đạn
        this.bonusProjectiles += 1;
        break;
      case 4:
        // Cấp 4: Giảm hồi chiêu 20%
        this.baseCooldown = Number((this.baseCooldown * 0.8).toFixed(2));
        break;
      case 5:
        // Cấp 5 (Tối đa): Xuyên 1 mục tiêu và tăng thêm sát thương
        this.pierces += 1;
        this.baseDamage = Math.round(this.baseDamage * 1.25);
        break;
    }
  }

  getNextUpgradeDescription(): string {
    switch (this.level + 1) {
      case 2: return 'Tăng +30% Sát thương của mỗi tia ma thuật.';
      case 3: return 'Bắn thêm +1 tia đạn ma thuật trong mỗi đợt tấn công.';
      case 4: return 'Giảm 20% thời gian hồi chiêu, bắn liên hồi hơn.';
      case 5: return 'Cấp tối đa: Đạn có khả năng xuyên qua 1 mục tiêu và +25% sát thương.';
      default: return 'Cường hóa uy lực của Tia Ma Thuật.';
    }
  }
}

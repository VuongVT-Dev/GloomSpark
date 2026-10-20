import { BaseSpell, type SpellContext } from './BaseSpell';
import type { Player } from '../entities/Player';
import { IceArrow } from '../entities/IceArrow';

export class IceArrowSpell extends BaseSpell {
  public readonly id = 'ice_arrow';
  public readonly name = 'Mũi Tên Băng';
  public readonly description = 'Bắn ra những mũi tên băng giá sắc nhọn, sát thương lớn và làm chậm kẻ địch.';
  public readonly iconName = 'Snowflake';

  public arrowCount: number = 1;
  public pierces: number = 0;
  public slowDuration: number = 3.0;
  public slowPercentage: number = 0.4;

  constructor(initialLevel: number = 0) {
    // Sát thương gốc: 38 (cao), Hồi chiêu: 1.35s (chậm hơn), Cấp khởi đầu: 0 (chờ mở khóa)
    super(38, 1.35, initialLevel);
  }

  cast(player: Player, context: SpellContext): boolean {
    const { enemies, projectiles } = context;
    if (enemies.length === 0) return false;

    // Sắp xếp quái theo khoảng cách gần nhất trong phạm vi 650px
    const sorted = enemies
      .map(e => ({
        enemy: e,
        distSq: (e.x - player.x) ** 2 + (e.y - player.y) ** 2
      }))
      .filter(item => item.distSq <= 650 ** 2)
      .sort((a, b) => a.distSq - b.distSq);

    if (sorted.length === 0) return false;

    const finalDamage = this.getActualDamage(player);

    for (let i = 0; i < this.arrowCount; i++) {
      // Nhắm vào các mục tiêu gần nhất
      const target = sorted[i % sorted.length].enemy;

      // Góc tản nhẹ khi bắn nhiều mũi tên
      const spread = (i - (this.arrowCount - 1) / 2) * 18;
      const targetX = target.x + (Math.random() - 0.5) * spread;
      const targetY = target.y + (Math.random() - 0.5) * spread;

      projectiles.push(
        new IceArrow(
          player.x,
          player.y,
          targetX,
          targetY,
          finalDamage,
          this.pierces,
          this.slowDuration,
          this.slowPercentage
        )
      );
    }

    return true;
  }

  protected onUpgrade(newLevel: number): void {
    switch (newLevel) {
      case 1:
        // Mở khóa kỹ năng
        this.arrowCount = 1;
        break;
      case 2:
        // Cấp 2: Tăng hiệu ứng làm chậm và thời gian đóng băng
        this.slowPercentage = 0.55;
        this.slowDuration = 4.0;
        this.baseDamage = Math.round(this.baseDamage * 1.2);
        break;
      case 3:
        // Cấp 3: Bắn thêm 1 mũi tên băng
        this.arrowCount = 2;
        break;
      case 4:
        // Cấp 4: Mũi tên băng xuyên qua 1 kẻ địch và bắn nhanh hơn
        this.pierces += 1;
        this.baseCooldown = Number((this.baseCooldown * 0.82).toFixed(2));
        break;
      case 5:
        // Cấp 5 (Tối thượng): Bắn 3 mũi tên băng, làm chậm 65% trong 5 giây, sát thương cực mạnh
        this.arrowCount = 3;
        this.slowPercentage = 0.65;
        this.slowDuration = 5.0;
        this.baseDamage = Math.round(this.baseDamage * 1.35);
        break;
    }
  }

  getNextUpgradeDescription(): string {
    switch (this.level + 1) {
      case 1: return 'Mở khóa: Bắn Mũi Tên Băng gây 38 sát thương và làm chậm kẻ địch 40% trong 3 giây.';
      case 2: return 'Tăng hiệu ứng làm chậm lên 55% kéo dài 4 giây và +20% sát thương.';
      case 3: return 'Bắn thêm +1 Mũi Tên Băng đồng thời (tổng cộng 2 mũi tên).';
      case 4: return 'Mũi tên băng có khả năng xuyên qua 1 kẻ địch và giảm 18% hồi chiêu.';
      case 5: return 'Cấp tối đa: Bắn 3 Mũi Tên Băng, làm chậm cực mạnh 65% trong 5s và +35% sát thương!';
      default: return 'Cường hóa uy lực của Mũi Tên Băng.';
    }
  }
}

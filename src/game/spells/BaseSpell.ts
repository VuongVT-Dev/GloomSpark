import type { Player } from '../entities/Player';
import type { Enemy } from '../entities/Enemy';
import type { Projectile } from '../entities/Projectile';
import type { Particle, FloatingText } from '../entities/Particle';
import type { ExpGem } from '../entities/ExpGem';

/**
 * Ngữ cảnh dữ liệu cung cấp cho các phép thuật khi thi triển
 */
export interface SpellContext {
  projectiles: Projectile[];
  particles: Particle[];
  floatingTexts: FloatingText[];
  expGems: ExpGem[];
  enemies: Enemy[];
}

/**
 * Abstract Base Class cho toàn bộ hệ thống kỹ năng / phép thuật trong GloomSpark.
 * Bất kỳ kỹ năng mới nào đều phải kế thừa từ lớp này và định nghĩa mốc nâng cấp từ Level 1 đến 5.
 */
export abstract class BaseSpell {
  public abstract readonly id: string;
  public abstract readonly name: string;
  public abstract readonly description: string;
  public abstract readonly iconName: string;
  public readonly maxLevel: number = 5;

  public level: number = 0; // 0: chưa mở khóa, 1-5: cấp độ hiện tại
  public cooldownTimer: number = 0;
  public baseDamage: number;
  public baseCooldown: number;

  constructor(baseDamage: number, baseCooldown: number, initialLevel: number = 0) {
    this.baseDamage = baseDamage;
    this.baseCooldown = baseCooldown;
    this.level = initialLevel;
  }

  get isUnlocked(): boolean {
    return this.level > 0;
  }

  get isMaxLevel(): boolean {
    return this.level >= this.maxLevel;
  }

  /**
   * Tính toán thời gian hồi chiêu thực tế (kết hợp chỉ số tốc đánh của Player)
   */
  getActualCooldown(player: Player): number {
    return Math.max(0.15, this.baseCooldown / player.stats.attackSpeedMultiplier);
  }

  /**
   * Tính toán sát thương thực tế (cộng dồn hệ số sát thương của Player)
   */
  getActualDamage(player: Player): number {
    return this.baseDamage * player.stats.damageMultiplier;
  }

  /**
   * Vòng lặp cập nhật mỗi frame 60 FPS
   */
  update(deltaTime: number, player: Player, context: SpellContext): void {
    if (!this.isUnlocked) return;

    this.cooldownTimer += deltaTime;
    const cooldown = this.getActualCooldown(player);

    if (this.cooldownTimer >= cooldown) {
      const castSuccess = this.cast(player, context);
      if (castSuccess) {
        this.cooldownTimer = 0;
      }
    }
  }

  /**
   * Kích hoạt thi triển phép thuật (lớp con bắt buộc cài đặt)
   * @returns true nếu thi triển thành công để reset bộ đếm hồi chiêu
   */
  abstract cast(player: Player, context: SpellContext): boolean;

  /**
   * Nâng cấp phép thuật lên cấp tiếp theo
   */
  upgrade(): boolean {
    if (this.isMaxLevel) return false;
    this.level += 1;
    this.onUpgrade(this.level);
    return true;
  }

  /**
   * Xử lý chỉ số thay đổi tương ứng theo từng mốc cấp độ (Level 1..5)
   */
  protected abstract onUpgrade(newLevel: number): void;

  /**
   * Trả về mô tả của mốc nâng cấp kế tiếp (dành cho thẻ bài LevelUp)
   */
  abstract getNextUpgradeDescription(): string;
}

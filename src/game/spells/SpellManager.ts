import type { Player } from '../entities/Player';
import type { UpgradeCard } from '../../types/game';
import { BaseSpell, type SpellContext } from './BaseSpell';
import { MagicMissileSpell } from './MagicMissileSpell';
import { IceArrowSpell } from './IceArrowSpell';

export class SpellManager {
  public spells: Map<string, BaseSpell> = new Map();

  constructor() {
    this.initDefaultSpells();
  }

  /**
   * Khởi tạo bộ kỹ năng ban đầu
   */
  public initDefaultSpells() {
    this.spells.clear();

    // 1. Phép thuật khởi đầu của người chơi (Level 1)
    const magicMissile = new MagicMissileSpell(1);
    this.spells.set(magicMissile.id, magicMissile);

    // 2. Mũi tên băng (Level 0 - chưa mở khóa, chờ nhặt được khi lên cấp)
    const iceArrow = new IceArrowSpell(0);
    this.spells.set(iceArrow.id, iceArrow);
  }

  getSpell(id: string): BaseSpell | undefined {
    return this.spells.get(id);
  }

  getAllSpells(): BaseSpell[] {
    return Array.from(this.spells.values());
  }

  getActiveSpells(): BaseSpell[] {
    return this.getAllSpells().filter(spell => spell.isUnlocked);
  }

  /**
   * Cập nhật toàn bộ các phép thuật đang kích hoạt trong vòng lặp game loop 60 FPS
   */
  update(deltaTime: number, player: Player, context: SpellContext) {
    for (const spell of this.spells.values()) {
      spell.update(deltaTime, player, context);
    }
  }

  /**
   * Tự động sinh danh sách thẻ nâng cấp phép thuật (Mở khóa hoặc Thăng cấp Level 1 -> 5)
   * cho cửa sổ Level Up Modal của React UI.
   */
  getAvailableUpgradeCards(): UpgradeCard[] {
    const cards: UpgradeCard[] = [];

    for (const spell of this.spells.values()) {
      if (spell.isMaxLevel) continue;

      if (!spell.isUnlocked) {
        // Thẻ mở khóa kỹ năng mới
        cards.push({
          id: `unlock_${spell.id}`,
          title: `Học Kỹ Năng: ${spell.name}`,
          description: spell.getNextUpgradeDescription(),
          rarity: 'RARE',
          iconName: spell.iconName,
          type: 'SPELL',
          apply: () => {
            spell.upgrade();
          }
        });
      } else {
        // Thẻ nâng cấp kỹ năng hiện có
        const nextLv = spell.level + 1;
        const rarity = nextLv === spell.maxLevel ? 'LEGENDARY' : nextLv >= 4 ? 'EPIC' : 'RARE';
        cards.push({
          id: `upgrade_${spell.id}_lv${nextLv}`,
          title: `${spell.name} (Cấp ${nextLv})`,
          description: spell.getNextUpgradeDescription(),
          rarity,
          iconName: spell.iconName,
          type: 'SPELL',
          apply: () => {
            spell.upgrade();
          }
        });
      }
    }

    return cards;
  }
}

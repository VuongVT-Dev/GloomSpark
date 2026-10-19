export type ControlMode = 'KEYBOARD' | 'MOUSE';

export type GameState = 'START' | 'PLAYING' | 'PAUSED' | 'GAMEOVER';

export interface Vector2D {
  x: number;
  y: number;
}

export interface PlayerStats {
  maxHp: number;
  currentHp: number;
  moveSpeed: number;
  damageMultiplier: number;
  attackSpeedMultiplier: number;
  projectileCount: number;
  pickupRadius: number;
  level: number;
  currentExp: number;
  maxExp: number;
  kills: number;
  timeSurvived: number;
}

export type UpgradeRarity = 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';

export interface UpgradeCard {
  id: string;
  title: string;
  description: string;
  rarity: UpgradeRarity;
  iconName: string;
  type: 'DAMAGE' | 'ATTACK_SPEED' | 'MOVE_SPEED' | 'MAX_HP' | 'PROJECTILES' | 'MAGNET';
  apply: (stats: PlayerStats) => void;
}

export interface EnemyConfig {
  name: string;
  radius: number;
  hp: number;
  maxHp: number;
  speed: number;
  damage: number;
  expValue: number;
  color: string;
  eyeColor: string;
}

import React from 'react';
import type { UpgradeCard } from '../../types/game';
import { Sparkles, Zap, Wand2, Footprints, Magnet, Heart, Snowflake } from 'lucide-react';

interface LevelUpModalProps {
  level: number;
  choices: UpgradeCard[];
  onSelect: (card: UpgradeCard) => void;
}

const getIcon = (iconName: string) => {
  switch (iconName) {
    case 'Sparkles': return <Sparkles size={28} className="card-icon text-purple-400" />;
    case 'Zap': return <Zap size={28} className="card-icon text-yellow-400" />;
    case 'Wand2': return <Wand2 size={28} className="card-icon text-cyan-400" />;
    case 'Footprints': return <Footprints size={28} className="card-icon text-emerald-400" />;
    case 'Magnet': return <Magnet size={28} className="card-icon text-blue-400" />;
    case 'Heart': return <Heart size={28} className="card-icon text-rose-400" />;
    case 'Snowflake': return <Snowflake size={28} className="card-icon text-cyan-300" />;
    default: return <Sparkles size={28} className="card-icon text-purple-400" />;
  }
};

const getRarityBadge = (rarity: string) => {
  switch (rarity) {
    case 'LEGENDARY': return <span className="rarity-badge legendary">HUYỀN THOẠI</span>;
    case 'EPIC': return <span className="rarity-badge epic">SỬ THI</span>;
    case 'RARE': return <span className="rarity-badge rare">HIẾM</span>;
    default: return <span className="rarity-badge common">CƠ BẢN</span>;
  }
};

export const LevelUpModal: React.FC<LevelUpModalProps> = ({ level, choices, onSelect }) => {
  return (
    <div className="modal-backdrop">
      <div className="modal-content levelup-content">
        <div className="modal-header">
          <div className="levelup-subtitle">ĐỘT PHÁ MA LỰC</div>
          <h2 className="levelup-title">THĂNG CẤP {level}!</h2>
          <p className="levelup-desc">Hãy chọn 1 bí thuật để cường hóa sức mạnh sinh tồn</p>
        </div>

        <div className="cards-grid">
          {choices.map((card, idx) => (
            <div
              key={card.id || idx}
              id={`upgrade-card-${card.id}`}
              className={`upgrade-card ${card.rarity.toLowerCase()}`}
              onClick={() => onSelect(card)}
            >
              <div className="card-top">
                <div className="icon-wrapper">
                  {getIcon(card.iconName)}
                </div>
                {getRarityBadge(card.rarity)}
              </div>
              <h3 className="card-title">{card.title}</h3>
              <p className="card-description">{card.description}</p>
              <div className="card-action">CHỌN NÂNG CẤP</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

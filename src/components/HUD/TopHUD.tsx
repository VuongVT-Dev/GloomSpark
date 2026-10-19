import React from 'react';
import type { ControlMode } from '../../types/game';
import { Heart, Skull, Clock, MousePointer, Keyboard } from 'lucide-react';

interface TopHUDProps {
  currentHp: number;
  maxHp: number;
  currentExp: number;
  maxExp: number;
  level: number;
  kills: number;
  timeSurvived: number;
  controlMode: ControlMode;
  onToggleControlMode: () => void;
}

export const TopHUD: React.FC<TopHUDProps> = ({
  currentHp,
  maxHp,
  currentExp,
  maxExp,
  level,
  kills,
  timeSurvived,
  controlMode,
  onToggleControlMode
}) => {
  const hpPercent = Math.max(0, Math.min(100, (currentHp / maxHp) * 100));
  const expPercent = Math.max(0, Math.min(100, (currentExp / maxExp) * 100));

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="hud-container">
      {/* 1. Thanh EXP chạy dài toàn màn hình trên cùng */}
      <div className="exp-bar-wrapper">
        <div className="exp-bar-fill" style={{ width: `${expPercent}%` }} />
        <div className="exp-text">
          CẤP ĐỘ {level} &bull; {currentExp} / {maxExp} EXP ({Math.round(expPercent)}%)
        </div>
      </div>

      {/* 2. Thanh trạng thái & Nút điều khiển */}
      <div className="hud-header">
        {/* Khối Máu & Chỉ số */}
        <div className="hud-stats-group">
          {/* Thanh máu */}
          <div className="hp-bar-wrapper">
            <div className="hp-bar-icon">
              <Heart size={18} color="#ef4444" fill="#ef4444" />
            </div>
            <div className="hp-bar-track">
              <div className="hp-bar-fill" style={{ width: `${hpPercent}%` }} />
            </div>
            <div className="hp-bar-label">
              {Math.round(currentHp)} / {maxHp}
            </div>
          </div>
        </div>

        {/* Đồng hồ sống sót & Số lượng diệt quái */}
        <div className="hud-center-group">
          <div className="hud-badge">
            <Clock size={16} className="text-cyan-400" />
            <span>{formatTime(timeSurvived)}</span>
          </div>
          <div className="hud-badge">
            <Skull size={16} className="text-rose-400" />
            <span>{kills}</span>
          </div>
        </div>

        {/* Nút chuyển đổi Chế độ di chuyển: WASD <-> Chuột */}
        <div className="hud-controls-group">
          <button
            id="control-toggle-btn"
            className="control-toggle-btn"
            onClick={onToggleControlMode}
            title="Bấm hoặc nhấn phím TAB để đổi cách di chuyển"
          >
            {controlMode === 'KEYBOARD' ? (
              <>
                <Keyboard size={16} className="text-cyan-300" />
                <span>Di chuyển: <strong>WASD / Phím</strong></span>
              </>
            ) : (
              <>
                <MousePointer size={16} className="text-emerald-300" />
                <span>Di chuyển: <strong>Theo Chuột</strong></span>
              </>
            )}
            <span className="key-hint">[TAB]</span>
          </button>
        </div>
      </div>
    </div>
  );
};

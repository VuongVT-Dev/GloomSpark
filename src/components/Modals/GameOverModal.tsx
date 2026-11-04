import React from 'react';
import { Skull, Clock, Trophy, RotateCcw } from 'lucide-react';

interface GameOverModalProps {
  timeSurvived: number;
  kills: number;
  level: number;
  onRestart: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  timeSurvived,
  kills,
  level,
  onRestart
}) => {
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m} phút ${s} giây`;
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content gameover-content">
        <div className="gameover-header">
          <div className="skull-icon-wrapper">
            <Skull size={48} className="text-rose-500 animate-pulse" />
          </div>
          <h1 className="gameover-title">LỤI TÀN <br /> TRONG BÓNG TỐI</h1>
          <p className="gameover-subtitle">Tia sáng ma thuật của bạn đã bị màn đêm nuốt chửng...</p>
        </div>

        <div className="stats-summary-grid">
          <div className="stat-card">
            <Clock size={20} className="text-cyan-400" />
            <span className="stat-label">Thời gian sống sót</span>
            <span className="stat-val">{formatTime(timeSurvived)}</span>
          </div>

          <div className="stat-card">
            <Skull size={20} className="text-rose-400" />
            <span className="stat-label">Quái vật tiêu diệt</span>
            <span className="stat-val">{kills}</span>
          </div>

          <div className="stat-card">
            <Trophy size={20} className="text-amber-400" />
            <span className="stat-label">Cấp độ đạt được</span>
            <span className="stat-val">Cấp {level}</span>
          </div>
        </div>

        <div className="gameover-actions">
          <button id="restart-btn" className="restart-btn" onClick={onRestart}>
            <RotateCcw size={20} />
            <span>CHIẾN TIẾP TRẬN MỚI</span>
          </button>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { Play } from 'lucide-react';

interface PauseModalProps {
  onResume: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({ onResume }) => {
  return (
    <div className="modal-backdrop">
      <div className="modal-content pause-content">
        <h2 className="pause-title">TẠM DỪNG</h2>
        <p className="pause-desc">Nhấn phím ESC hoặc nút bên dưới để tiếp tục chiến đấu</p>
        <button id="resume-btn" className="restart-btn" onClick={onResume}>
          <Play size={20} />
          <span>TIẾP TỤC</span>
        </button>
      </div>
    </div>
  );
};

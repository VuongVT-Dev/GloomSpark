import React, { useState, useEffect, useCallback } from 'react';
import { GameCanvas } from './components/GameCanvas';
import { TopHUD } from './components/HUD/TopHUD';
import { LevelUpModal } from './components/Modals/LevelUpModal';
import { GameOverModal } from './components/Modals/GameOverModal';
import { PauseModal } from './components/Modals/PauseModal';
import { GameEngine } from './game/core/GameEngine';
import { GameEvents, EVENTS } from './game/events/GameEvents';
import type { ControlMode, GameState, PlayerStats, UpgradeCard } from './types/game';
import './styles/index.css';

export const App: React.FC = () => {
  const [engine, setEngine] = useState<GameEngine | null>(null);
  const [gameState, setGameState] = useState<GameState>('PLAYING');
  const [controlMode, setControlMode] = useState<ControlMode>('KEYBOARD');

  const [stats, setStats] = useState<PlayerStats>({
    maxHp: 100,
    currentHp: 100,
    moveSpeed: 230,
    damageMultiplier: 1.0,
    attackSpeedMultiplier: 1.0,
    projectileCount: 1,
    pickupRadius: 90,
    level: 1,
    currentExp: 0,
    maxExp: 30,
    kills: 0,
    timeSurvived: 0,
  });

  const [levelUpData, setLevelUpData] = useState<{ level: number; choices: UpgradeCard[] } | null>(null);
  const [gameOverData, setGameOverData] = useState<{ timeSurvived: number; kills: number; level: number } | null>(null);

  const handleEngineReady = useCallback((eng: GameEngine) => {
    setEngine(eng);
  }, []);

  const handleToggleControlMode = () => {
    if (engine) {
      engine.input.toggleControlMode();
    }
  };

  const handleSelectUpgrade = (card: UpgradeCard) => {
    if (engine) {
      engine.applyUpgrade(card);
      setLevelUpData(null);
    }
  };

  const handleRestart = () => {
    if (engine) {
      engine.restart();
      setGameOverData(null);
    }
  };

  const handleResume = () => {
    if (engine) {
      engine.resume();
    }
  };

  useEffect(() => {
    const unsubState = GameEvents.on(EVENTS.STATE_CHANGE, (state: GameState) => {
      setGameState(state);
    });

    const unsubStats = GameEvents.on(EVENTS.STATS_UPDATE, (data: any) => {
      setStats({
        maxHp: data.maxHp,
        currentHp: data.currentHp,
        moveSpeed: data.moveSpeed,
        damageMultiplier: data.damageMultiplier,
        attackSpeedMultiplier: data.attackSpeedMultiplier,
        projectileCount: data.projectileCount,
        pickupRadius: data.pickupRadius,
        level: data.level,
        currentExp: data.currentExp,
        maxExp: data.maxExp,
        kills: data.kills,
        timeSurvived: data.timeSurvived,
      });
      if (data.controlMode) {
        setControlMode(data.controlMode);
      }
    });

    const unsubControl = GameEvents.on(EVENTS.CONTROL_MODE_CHANGE, (mode: ControlMode) => {
      setControlMode(mode);
    });

    const unsubLevelUp = GameEvents.on(EVENTS.LEVEL_UP, (data: any) => {
      setLevelUpData(data);
    });

    const unsubGameOver = GameEvents.on(EVENTS.GAME_OVER, (data: any) => {
      setGameOverData(data);
    });

    // Bắt phím Escape để Tạm dừng/Tiếp tục
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Escape') {
        if (engine) {
          if (engine.gameState === 'PLAYING') {
            engine.pause();
          } else if (engine.gameState === 'PAUSED' && !levelUpData) {
            engine.resume();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      unsubState();
      unsubStats();
      unsubControl();
      unsubLevelUp();
      unsubGameOver();
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [engine, levelUpData]);

  return (
    <div id="game-app-root">
      {/* 1. Canvas 2D Game Loop thuần */}
      <GameCanvas onEngineReady={handleEngineReady} />

      {/* 2. HUD Giao diện trên cùng */}
      <TopHUD
        currentHp={stats.currentHp}
        maxHp={stats.maxHp}
        currentExp={stats.currentExp}
        maxExp={stats.maxExp}
        level={stats.level}
        kills={stats.kills}
        timeSurvived={stats.timeSurvived}
        controlMode={controlMode}
        onToggleControlMode={handleToggleControlMode}
      />

      {/* 3. Modal Thăng Cấp chọn 1 trong 3 thẻ kỹ năng */}
      {gameState === 'PAUSED' && levelUpData && (
        <LevelUpModal
          level={levelUpData.level}
          choices={levelUpData.choices}
          onSelect={handleSelectUpgrade}
        />
      )}

      {/* 4. Modal Tạm Dừng Game khi nhấn phím ESC */}
      {gameState === 'PAUSED' && !levelUpData && !gameOverData && (
        <PauseModal onResume={handleResume} />
      )}

      {/* 5. Modal Game Over khi hết máu */}
      {gameState === 'GAMEOVER' && gameOverData && (
        <GameOverModal
          timeSurvived={gameOverData.timeSurvived}
          kills={gameOverData.kills}
          level={gameOverData.level}
          onRestart={handleRestart}
        />
      )}
    </div>
  );
};

export default App;

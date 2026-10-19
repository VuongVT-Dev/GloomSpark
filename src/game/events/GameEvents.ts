type EventCallback<T = any> = (data: T) => void;

class GameEventEmitter {
  private listeners: Map<string, Set<EventCallback>> = new Map();

  on<T>(event: string, callback: EventCallback<T>) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
    return () => this.off(event, callback);
  }

  off(event: string, callback: EventCallback) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.delete(callback);
    }
  }

  emit<T>(event: string, data?: T) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(cb => {
        try {
          cb(data);
        } catch (err) {
          console.error(`Error in event listener for ${event}:`, err);
        }
      });
    }
  }
}

export const GameEvents = new GameEventEmitter();

export const EVENTS = {
  STATE_CHANGE: 'STATE_CHANGE',
  LEVEL_UP: 'LEVEL_UP',
  STATS_UPDATE: 'STATS_UPDATE',
  CONTROL_MODE_CHANGE: 'CONTROL_MODE_CHANGE',
  GAME_OVER: 'GAME_OVER',
  RESUME_GAME: 'RESUME_GAME',
  RESTART_GAME: 'RESTART_GAME',
} as const;

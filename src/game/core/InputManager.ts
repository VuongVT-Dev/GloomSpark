import type { ControlMode, Vector2D } from '../../types/game';
import { GameEvents, EVENTS } from '../events/GameEvents';

export class InputManager {
  public controlMode: ControlMode = 'KEYBOARD';
  private keys: Set<string> = new Set();
  public mousePosScreen: Vector2D = { x: 0, y: 0 };
  public mousePosWorld: Vector2D = { x: 0, y: 0 };
  public isMouseDown: boolean = false;
  private canvas: HTMLCanvasElement | null = null;

  constructor() {
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
  }

  init(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
    canvas.addEventListener('mousemove', this.handleMouseMove);
    canvas.addEventListener('mousedown', this.handleMouseDown);
    window.addEventListener('mouseup', this.handleMouseUp);
  }

  destroy() {
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
    if (this.canvas) {
      this.canvas.removeEventListener('mousemove', this.handleMouseMove);
      this.canvas.removeEventListener('mousedown', this.handleMouseDown);
    }
    window.removeEventListener('mouseup', this.handleMouseUp);
    this.keys.clear();
  }

  setControlMode(mode: ControlMode) {
    this.controlMode = mode;
    GameEvents.emit(EVENTS.CONTROL_MODE_CHANGE, mode);
  }

  toggleControlMode() {
    const nextMode = this.controlMode === 'KEYBOARD' ? 'MOUSE' : 'KEYBOARD';
    this.setControlMode(nextMode);
  }

  private handleKeyDown(e: KeyboardEvent) {
    this.keys.add(e.code);
    if (e.code === 'Tab') {
      e.preventDefault();
      this.toggleControlMode();
    }
  }

  private handleKeyUp(e: KeyboardEvent) {
    this.keys.delete(e.code);
  }

  private handleMouseMove(e: MouseEvent) {
    if (!this.canvas) return;
    const rect = this.canvas.getBoundingClientRect();
    this.mousePosScreen = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  }

  private handleMouseDown(e: MouseEvent) {
    if (e.button === 0) {
      this.isMouseDown = true;
    }
  }

  private handleMouseUp() {
    this.isMouseDown = false;
  }

  /**
   * Tính toán vector di chuyển chuẩn hóa (dx, dy)
   */
  getMovementVector(playerWorldPos: Vector2D, cameraOffset: Vector2D): Vector2D {
    if (this.controlMode === 'KEYBOARD') {
      let dx = 0;
      let dy = 0;

      if (this.keys.has('KeyW') || this.keys.has('ArrowUp')) dy -= 1;
      if (this.keys.has('KeyS') || this.keys.has('ArrowDown')) dy += 1;
      if (this.keys.has('KeyA') || this.keys.has('ArrowLeft')) dx -= 1;
      if (this.keys.has('KeyD') || this.keys.has('ArrowRight')) dx += 1;

      if (dx === 0 && dy === 0) return { x: 0, y: 0 };

      const len = Math.hypot(dx, dy);
      return { x: dx / len, y: dy / len };
    } else {
      // MOUSE MODE: Di chuyển theo vị trí con trỏ chuột trong tọa độ thế giới
      const targetWorldX = this.mousePosScreen.x + cameraOffset.x;
      const targetWorldY = this.mousePosScreen.y + cameraOffset.y;

      const diffX = targetWorldX - playerWorldPos.x;
      const diffY = targetWorldY - playerWorldPos.y;
      const dist = Math.hypot(diffX, diffY);

      // Dead-zone: nếu chuột ở quá gần tâm nhân vật (< 20px) thì dừng lại để tránh giật hình
      if (dist < 20) {
        return { x: 0, y: 0 };
      }

      // Chuẩn hóa vector di chuyển
      return {
        x: diffX / dist,
        y: diffY / dist
      };
    }
  }
}

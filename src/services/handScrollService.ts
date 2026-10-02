/**
 * Cosmic handScrollService
 * 
 * Maps structural hand tracking coordinates (from Webcams or simulated streams)
 * to smooth, dampened scroll events across designated scroll containers.
 * Optimized for Layer 3/4 navigation.
 */

interface HandUpdateDetail {
  landmarks?: Array<{ x: number; y: number; z: number }>;
  isSimulator: boolean;
  handSide?: string;
  gesture?: string;
  simulatedDeltaY?: number;
}

class HandScrollService {
  private lastY: number | null = null;
  private targetScrollElement: HTMLElement | null = null;
  private isEnabled: boolean = true;
  private scrollSpeedMultiplier: number = 2.5; // Controls flight/scroll velocity
  private sensitivity: number = 1.0; // Hand-tracking sensitivity threshold
  private scrollVelocity: number = 0;
  private friction: number = 0.92; // Natural momentum slow-down
  private animationFrameId: number | null = null;
  
  public setSensitivity(val: number) {
    this.sensitivity = val;
  }

  constructor() {
    this.startControlLoop();
    window.addEventListener('hand-tracking-update', this.handleHandTrackingUpdate as EventListener);
  }

  public enable() {
    this.isEnabled = true;
  }

  public disable() {
    this.isEnabled = false;
    this.scrollVelocity = 0;
  }

  /**
   * Sets the active scroll container targeted by the gestural movements.
   * If null, defaults to the primary scrolling window page.
   */
  public setTargetContainer(element: HTMLElement | null) {
    this.targetScrollElement = element;
  }

  /**
   * Register direct scroll displacement simulation.
   */
  public triggerSimulatedScroll(deltaY: number) {
    if (!this.isEnabled) return;
    this.scrollVelocity += deltaY * 0.15 * this.sensitivity;
    // Cap scroll speed for visual comfort
    this.scrollVelocity = Math.max(-45, Math.min(this.scrollVelocity, 45));
  }

  private handleHandTrackingUpdate = (event: CustomEvent<HandUpdateDetail>) => {
    if (!this.isEnabled) return;

    const { landmarks, isSimulator, simulatedDeltaY } = event.detail;

    // 1. Physical landmark continuous updates are disabled to prevent unwanted screen drifting
    // and layout movement during simple hover or gesture actions.
    if (landmarks && landmarks.length > 0) {
      // Continuous vertical scroll based on raw wrist position movement is deactivated
      // to secure the interface and keep elements steady.
      this.lastY = null;
    } 
    // 2. If it's a simulated or explicit scroll update, apply the scrolling impulses
    else if (isSimulator && simulatedDeltaY !== undefined) {
      this.triggerSimulatedScroll(simulatedDeltaY);
    }
  };

  /**
   * Internal velocity decay and smooth continuous scrolling renderer
   */
  private startControlLoop = () => {
    const tick = () => {
      if (Math.abs(this.scrollVelocity) > 0.05) {
        const container = this.targetScrollElement || document.querySelector('#codex-scroll-container') || window;
        
        if (container) {
          if (container === window) {
            window.scrollBy({ top: this.scrollVelocity, behavior: 'auto' });
          } else {
            (container as HTMLElement).scrollTop += this.scrollVelocity;
          }
        }
        
        // Apply friction decay
        this.scrollVelocity *= this.friction;
      } else {
        this.scrollVelocity = 0;
        this.lastY = null; // Reset track to avoid giant leaps when hand returns to view
      }

      this.animationFrameId = requestAnimationFrame(tick);
    };
    
    tick();
  };

  /**
   * Safe destructor to unbind events and cancel active animations
   */
  public destroy() {
    window.removeEventListener('hand-tracking-update', this.handleHandTrackingUpdate as EventListener);
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }
}

// Export singleton instance for unified app access
export const handScrollService = new HandScrollService();

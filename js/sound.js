export class SoundManager {
  constructor(enabled = true) {
    this.enabled = enabled;
    this.ctx = null;
  }

  setEnabled(enabled) {
    this.enabled = enabled;
  }

  ensureContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) {
        return null;
      }
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  beep({ freq = 400, duration = 0.08, type = "square", gain = 0.03 } = {}) {
    if (!this.enabled) {
      return;
    }
    const ctx = this.ensureContext();
    if (!ctx) {
      return;
    }

    const osc = ctx.createOscillator();
    const amp = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    amp.gain.value = gain;
    amp.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
    osc.connect(amp);
    amp.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  }

  playShoot() {
    this.beep({ freq: 740, duration: 0.045, type: "sawtooth", gain: 0.02 });
  }

  playHit() {
    this.beep({ freq: 260, duration: 0.08, type: "square", gain: 0.028 });
  }

  playExplosion() {
    this.beep({ freq: 120, duration: 0.2, type: "triangle", gain: 0.045 });
  }

  playPickup() {
    this.beep({ freq: 990, duration: 0.09, type: "sine", gain: 0.03 });
  }

  playGameOver() {
    this.beep({ freq: 85, duration: 0.3, type: "sawtooth", gain: 0.05 });
  }
}

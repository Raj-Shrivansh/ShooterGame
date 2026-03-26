export class UIManager {
  constructor() {
    this.shell = document.getElementById("game-shell");
    this.hud = document.getElementById("hud");
    this.floatingLayer = document.getElementById("floating-layer");

    this.startScreen = document.getElementById("start-screen");
    this.pauseScreen = document.getElementById("pause-screen");
    this.gameOverScreen = document.getElementById("gameover-screen");
    this.settingsPanel = document.getElementById("settings-panel");

    this.scoreValue = document.getElementById("score-value");
    this.waveValue = document.getElementById("wave-value");
    this.healthFill = document.getElementById("health-fill");
    this.healthText = document.getElementById("health-text");
    this.finalScore = document.getElementById("final-score");
    this.bestScore = document.getElementById("best-score");

    this.startBtn = document.getElementById("start-btn");
    this.restartBtn = document.getElementById("restart-btn");
    this.pauseBtn = document.getElementById("pause-btn");
    this.resumeBtn = document.getElementById("resume-btn");
    this.openSettingsBtn = document.getElementById("open-settings-btn");
    this.pauseSettingsBtn = document.getElementById("pause-settings-btn");
    this.gameoverSettingsBtn = document.getElementById("gameover-settings-btn");
    this.closeSettingsBtn = document.getElementById("close-settings-btn");

    this.soundToggle = document.getElementById("sound-toggle");
    this.shakeToggle = document.getElementById("shake-toggle");
  }

  on(eventName, callback) {
    const map = {
      start: this.startBtn,
      restart: this.restartBtn,
      pause: this.pauseBtn,
      resume: this.resumeBtn,
      openSettings: this.openSettingsBtn,
      openSettingsPause: this.pauseSettingsBtn,
      openSettingsGameover: this.gameoverSettingsBtn,
      closeSettings: this.closeSettingsBtn,
      soundToggle: this.soundToggle,
      shakeToggle: this.shakeToggle
    };

    const element = map[eventName];
    if (!element) {
      return;
    }

    if (eventName === "soundToggle" || eventName === "shakeToggle") {
      element.addEventListener("change", callback);
      return;
    }
    element.addEventListener("click", callback);
  }

  setSettings({ sound, shake }) {
    this.soundToggle.checked = sound;
    this.shakeToggle.checked = shake;
  }

  showStart() {
    this.startScreen.classList.remove("hidden");
    this.pauseScreen.classList.add("hidden");
    this.gameOverScreen.classList.add("hidden");
    this.hud.classList.add("hidden");
  }

  showGame() {
    this.startScreen.classList.add("hidden");
    this.pauseScreen.classList.add("hidden");
    this.gameOverScreen.classList.add("hidden");
    this.hud.classList.remove("hidden");
  }

  showPause() {
    this.pauseScreen.classList.remove("hidden");
  }

  hidePause() {
    this.pauseScreen.classList.add("hidden");
  }

  showGameOver(score, bestScore) {
    this.finalScore.textContent = String(score);
    this.bestScore.textContent = String(bestScore);
    this.gameOverScreen.classList.remove("hidden");
    this.hud.classList.add("hidden");
  }

  toggleSettings(show) {
    this.settingsPanel.classList.toggle("hidden", !show);
  }

  updateHud({ score, wave, health, maxHealth }) {
    this.scoreValue.textContent = String(score);
    this.waveValue.textContent = String(wave);
    const ratio = Math.max(0, Math.min(1, health / maxHealth));
    this.healthFill.style.width = `${ratio * 100}%`;
    this.healthText.textContent = `${Math.round(health)} / ${maxHealth}`;
  }

  flashDamage() {
    this.shell.classList.remove("flash-damage");
    requestAnimationFrame(() => {
      this.shell.classList.add("flash-damage");
    });
  }

  floatScore(canvasX, canvasY, value, canvas) {
    const rect = canvas.getBoundingClientRect();
    const xRatio = canvasX / canvas.width;
    const yRatio = canvasY / canvas.height;
    const node = document.createElement("div");
    node.className = "float-score";
    node.style.left = `${xRatio * rect.width}px`;
    node.style.top = `${yRatio * rect.height}px`;
    node.textContent = `+${value}`;
    this.floatingLayer.appendChild(node);
    setTimeout(() => node.remove(), 700);
  }

  hideAllOverlays() {
    this.startScreen.classList.add("hidden");
    this.pauseScreen.classList.add("hidden");
    this.gameOverScreen.classList.add("hidden");
  }
}

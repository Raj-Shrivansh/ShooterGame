import { Game } from "./game.js";
import { SoundManager } from "./sound.js";
import { UIManager } from "./ui.js";

const SETTINGS_KEY = "neon_siege_settings";

const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");
const ui = new UIManager();

const settings = loadSettings();
const sound = new SoundManager(settings.sound);
ui.setSettings({ sound: settings.sound, shake: settings.screenShake });

const game = new Game(canvas, ctx, ui, sound, settings);
ui.showStart();

const input = {
  up: false,
  down: false,
  left: false,
  right: false,
  fire: false,
  hasAim: false,
  aimX: 0,
  aimY: -1
};

bindUIEvents();
bindKeyboardEvents();
bindPointerAim();

let previous = performance.now();
requestAnimationFrame(loop);

function loop(now) {
  const delta = Math.min(0.033, (now - previous) / 1000);
  previous = now;
  game.update(delta, input);
  game.render();
  requestAnimationFrame(loop);
}

function bindUIEvents() {
  ui.on("start", () => {
    game.startNew();
  });
  ui.on("restart", () => {
    game.restart();
  });
  ui.on("pause", () => {
    game.togglePause(true);
  });
  ui.on("resume", () => {
    game.togglePause(false);
  });

  const openSettings = () => ui.toggleSettings(true);
  ui.on("openSettings", openSettings);
  ui.on("openSettingsPause", openSettings);
  ui.on("openSettingsGameover", openSettings);
  ui.on("closeSettings", () => ui.toggleSettings(false));

  ui.on("soundToggle", (event) => {
    settings.sound = event.currentTarget.checked;
    sound.setEnabled(settings.sound);
    persistSettings(settings);
  });
  ui.on("shakeToggle", (event) => {
    settings.screenShake = event.currentTarget.checked;
    persistSettings(settings);
  });
}

function bindKeyboardEvents() {
  const keyMap = {
    ArrowUp: "up",
    KeyW: "up",
    ArrowDown: "down",
    KeyS: "down",
    ArrowLeft: "left",
    KeyA: "left",
    ArrowRight: "right",
    KeyD: "right",
    Space: "fire"
  };

  window.addEventListener("keydown", (event) => {
    const inputKey = keyMap[event.code];
    if (inputKey) {
      input[inputKey] = true;
      if (event.code === "Space") {
        event.preventDefault();
      }
    }

    if ((event.code === "Enter" || event.code === "NumpadEnter") && !game.isRunning() && !game.isPaused()) {
      game.startNew();
      return;
    }

    if ((event.code === "KeyP" || event.code === "Escape") && (game.isRunning() || game.isPaused())) {
      game.togglePause();
    }
  });

  window.addEventListener("keyup", (event) => {
    const inputKey = keyMap[event.code];
    if (inputKey) {
      input[inputKey] = false;
    }
  });

  window.addEventListener("blur", () => {
    Object.keys(input).forEach((key) => {
      if (typeof input[key] === "boolean") {
        input[key] = false;
      }
    });
    input.aimX = 0;
    input.aimY = -1;
    if (game.isRunning()) {
      game.togglePause(true);
    }
  });
}

function bindPointerAim() {
  canvas.addEventListener("mousemove", (event) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const canvasX = (event.clientX - rect.left) * scaleX;
    const canvasY = (event.clientY - rect.top) * scaleY;
    const dx = canvasX - game.player.x;
    const dy = canvasY - game.player.y;
    const len = Math.hypot(dx, dy);
    if (len > 1) {
      input.hasAim = true;
      input.aimX = dx / len;
      input.aimY = dy / len;
    }
  });

  canvas.addEventListener("mouseleave", () => {
    input.hasAim = false;
  });
}

function loadSettings() {
  const defaults = { sound: true, screenShake: true };
  const raw = localStorage.getItem(SETTINGS_KEY);
  if (!raw) {
    return defaults;
  }

  try {
    const parsed = JSON.parse(raw);
    return {
      sound: parsed.sound ?? defaults.sound,
      screenShake: parsed.screenShake ?? defaults.screenShake
    };
  } catch {
    return defaults;
  }
}

function persistSettings(nextSettings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(nextSettings));
}

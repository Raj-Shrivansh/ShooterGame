import { Bullet } from "./bullet.js";
import { circlesIntersect } from "./collision.js";
import { Enemy, chooseEnemyType } from "./enemy.js";
import { Player } from "./player.js";
import { PowerUp } from "./powerup.js";

export class Game {
  constructor(canvas, ctx, ui, sound, settings) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.ui = ui;
    this.sound = sound;
    this.settings = settings;

    this.width = canvas.width;
    this.height = canvas.height;

    this.state = "start";
    this.player = new Player(this.width, this.height);
    this.bullets = [];
    this.enemies = [];
    this.powerups = [];

    this.score = 0;
    this.highScore = this.loadHighScore();
    this.wave = 1;
    this.elapsed = 0;
    this.spawnTimer = 0;
    this.baseSpawnInterval = 1.1;
    this.waveDuration = 18;
    this.enemySpeedScale = 1;
    this.shake = 0;
    this.autoAimStrength = 0.26;
  }

  startNew() {
    this.player = new Player(this.width, this.height);
    this.bullets = [];
    this.enemies = [];
    this.powerups = [];
    this.score = 0;
    this.wave = 1;
    this.elapsed = 0;
    this.spawnTimer = 0.25;
    this.enemySpeedScale = 1;
    this.shake = 0;
    this.state = "running";
    this.ui.showGame();
    this.ui.toggleSettings(false);
    this.ui.updateHud({
      score: this.score,
      wave: this.wave,
      health: this.player.health,
      maxHealth: this.player.maxHealth
    });
  }

  restart() {
    this.startNew();
  }

  togglePause(forceState) {
    if (this.state !== "running" && this.state !== "paused") {
      return;
    }
    if (typeof forceState === "boolean") {
      this.state = forceState ? "paused" : "running";
    } else {
      this.state = this.state === "running" ? "paused" : "running";
    }

    if (this.state === "paused") {
      this.ui.showPause();
    } else {
      this.ui.hidePause();
    }
  }

  isRunning() {
    return this.state === "running";
  }

  isPaused() {
    return this.state === "paused";
  }

  isGameOver() {
    return this.state === "gameover";
  }

  update(dt, input) {
    if (this.state !== "running") {
      return;
    }

    this.elapsed += dt;
    this.updateWave();
    this.player.update(dt, input, this.width, this.height);

    if (input.fire && this.player.canShoot()) {
      const fireDir = this.getFireDirection(input);
      const shot = this.player.muzzlePoint();
      this.bullets.push(new Bullet(shot.x, shot.y, fireDir.x, fireDir.y));
      this.player.markShot();
      this.sound.playShoot();
    }

    this.spawnTimer -= dt;
    const interval = Math.max(0.26, this.baseSpawnInterval - this.wave * 0.06);
    if (this.spawnTimer <= 0) {
      this.spawnEnemy();
      this.spawnTimer = interval;
    }

    for (const bullet of this.bullets) {
      bullet.update(dt, this.width, this.height);
    }
    for (const enemy of this.enemies) {
      enemy.update(dt, this.player, this.enemySpeedScale);
    }
    for (const powerup of this.powerups) {
      powerup.update(dt, this.width, this.height);
    }

    this.handleCollisions();
    this.cleanup();

    if (this.shake > 0) {
      this.shake = Math.max(0, this.shake - dt * 4);
    }

    this.ui.updateHud({
      score: this.score,
      wave: this.wave,
      health: this.player.health,
      maxHealth: this.player.maxHealth
    });

    if (this.player.isDead()) {
      this.endGame();
    }
  }

  updateWave() {
    this.wave = Math.max(1, Math.floor(this.elapsed / this.waveDuration) + 1);
    this.enemySpeedScale = 1 + (this.wave - 1) * 0.085;
  }

  spawnEnemy() {
    const side = Math.floor(Math.random() * 4);
    let x = 0;
    let y = 0;
    const margin = 30;
    if (side === 0) {
      x = Math.random() * this.width;
      y = -margin;
    } else if (side === 1) {
      x = this.width + margin;
      y = Math.random() * this.height;
    } else if (side === 2) {
      x = Math.random() * this.width;
      y = this.height + margin;
    } else {
      x = -margin;
      y = Math.random() * this.height;
    }

    this.enemies.push(new Enemy(x, y, chooseEnemyType(this.wave)));
  }

  maybeSpawnHealthDrop(enemy) {
    const missingHealth = this.player.maxHealth - this.player.health;
    const baseChance = missingHealth > 35 ? 0.23 : 0.08;
    const chance = baseChance + Math.min(0.12, this.wave * 0.008);
    if (Math.random() < chance) {
      this.powerups.push(new PowerUp(enemy.x, enemy.y, "health"));
    }
  }

  handleCollisions() {
    for (const bullet of this.bullets) {
      if (bullet.dead) {
        continue;
      }
      for (const enemy of this.enemies) {
        if (enemy.dead || bullet.dead) {
          continue;
        }
        if (!circlesIntersect(bullet, enemy)) {
          continue;
        }

        bullet.dead = true;
        const dead = enemy.takeDamage(bullet.damage);
        this.sound.playHit();
        if (dead) {
          this.score += enemy.score;
          this.ui.floatScore(enemy.x, enemy.y, enemy.score, this.canvas);
          this.sound.playExplosion();
          if (this.settings.screenShake) {
            this.shake = Math.min(1, this.shake + 0.35);
          }
          this.maybeSpawnHealthDrop(enemy);
        }
      }
    }

    for (const enemy of this.enemies) {
      if (enemy.dead) {
        continue;
      }
      if (!circlesIntersect(this.player, enemy)) {
        continue;
      }
      enemy.dead = true;
      const damaged = this.player.takeDamage(enemy.damage);
      if (damaged) {
        this.ui.flashDamage();
        if (this.settings.screenShake) {
          this.shake = Math.min(1, this.shake + 0.6);
        }
      }
    }

    for (const powerup of this.powerups) {
      if (powerup.dead) {
        continue;
      }
      if (!circlesIntersect(this.player, powerup)) {
        continue;
      }
      powerup.dead = true;
      this.player.heal(24);
      this.sound.playPickup();
      this.ui.floatScore(powerup.x, powerup.y, 25, this.canvas);
      this.score += 25;
    }
  }

  cleanup() {
    this.bullets = this.bullets.filter((item) => !item.dead);
    this.enemies = this.enemies.filter((item) => !item.dead);
    this.powerups = this.powerups.filter((item) => !item.dead);
  }

  endGame() {
    this.state = "gameover";
    this.sound.playGameOver();
    this.highScore = Math.max(this.highScore, this.score);
    this.saveHighScore(this.highScore);
    this.ui.showGameOver(this.score, this.highScore);
  }

  render() {
    const ctx = this.ctx;
    const offset = this.getShakeOffset();
    ctx.save();
    ctx.translate(offset.x, offset.y);
    this.drawBackground(ctx);

    for (const bullet of this.bullets) {
      bullet.draw(ctx);
    }
    for (const enemy of this.enemies) {
      enemy.draw(ctx);
    }
    for (const powerup of this.powerups) {
      powerup.draw(ctx);
    }
    this.player.draw(ctx);
    ctx.restore();
  }

  drawBackground(ctx) {
    const gradient = ctx.createLinearGradient(0, 0, 0, this.height);
    gradient.addColorStop(0, "#060b1c");
    gradient.addColorStop(1, "#0a1330");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, this.width, this.height);

    const step = 48;
    ctx.strokeStyle = "rgba(116, 174, 255, 0.09)";
    ctx.lineWidth = 1;
    for (let x = 0; x < this.width; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, this.height);
      ctx.stroke();
    }
    for (let y = 0; y < this.height; y += step) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(this.width, y);
      ctx.stroke();
    }

    const pulse = 0.55 + Math.sin(this.elapsed * 0.8) * 0.08;
    ctx.fillStyle = `rgba(84, 218, 255, ${pulse * 0.12})`;
    ctx.beginPath();
    ctx.arc(this.width * 0.15, this.height * 0.2, 180, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(this.width * 0.78, this.height * 0.74, 210, 0, Math.PI * 2);
    ctx.fill();
  }

  getFireDirection(input) {
    let dirX = this.player.aimX;
    let dirY = this.player.aimY;

    if (input.hasAim) {
      dirX = input.aimX;
      dirY = input.aimY;
    } else {
      const target = this.findNearestEnemy(this.player.x, this.player.y);
      if (target) {
        const tx = target.x - this.player.x;
        const ty = target.y - this.player.y;
        const tLen = Math.hypot(tx, ty) || 1;
        const blendX = dirX * (1 - this.autoAimStrength) + (tx / tLen) * this.autoAimStrength;
        const blendY = dirY * (1 - this.autoAimStrength) + (ty / tLen) * this.autoAimStrength;
        const bLen = Math.hypot(blendX, blendY) || 1;
        dirX = blendX / bLen;
        dirY = blendY / bLen;
      }
    }

    const len = Math.hypot(dirX, dirY) || 1;
    this.player.aimX = dirX / len;
    this.player.aimY = dirY / len;
    return { x: this.player.aimX, y: this.player.aimY };
  }

  findNearestEnemy(x, y) {
    let closest = null;
    let minDistSq = Number.POSITIVE_INFINITY;
    for (const enemy of this.enemies) {
      if (enemy.dead) {
        continue;
      }
      const dx = enemy.x - x;
      const dy = enemy.y - y;
      const distSq = dx * dx + dy * dy;
      if (distSq < minDistSq) {
        minDistSq = distSq;
        closest = enemy;
      }
    }
    return closest;
  }

  getShakeOffset() {
    if (!this.settings.screenShake || this.shake <= 0) {
      return { x: 0, y: 0 };
    }
    const mag = 8 * this.shake;
    return {
      x: (Math.random() * 2 - 1) * mag,
      y: (Math.random() * 2 - 1) * mag
    };
  }

  loadHighScore() {
    const raw = localStorage.getItem("neon_siege_highscore");
    const parsed = Number.parseInt(raw ?? "0", 10);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  saveHighScore(value) {
    localStorage.setItem("neon_siege_highscore", String(value));
  }
}

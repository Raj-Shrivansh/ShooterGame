const ENEMY_TYPES = {
  scout: {
    speed: 130,
    maxHealth: 1,
    radius: 15,
    damage: 12,
    score: 100,
    color: "#ff7d9d"
  },
  stinger: {
    speed: 165,
    maxHealth: 2,
    radius: 12,
    damage: 10,
    score: 140,
    color: "#ffb36d"
  },
  brute: {
    speed: 80,
    maxHealth: 4,
    radius: 22,
    damage: 24,
    score: 260,
    color: "#ff5d6f"
  }
};

export class Enemy {
  constructor(x, y, type = "scout") {
    const cfg = ENEMY_TYPES[type] ?? ENEMY_TYPES.scout;
    this.type = type;
    this.x = x;
    this.y = y;
    this.radius = cfg.radius;
    this.speed = cfg.speed;
    this.maxHealth = cfg.maxHealth;
    this.health = cfg.maxHealth;
    this.damage = cfg.damage;
    this.score = cfg.score;
    this.color = cfg.color;
    this.dead = false;
  }

  update(dt, target, speedScale = 1) {
    const dx = target.x - this.x;
    const dy = target.y - this.y;
    const len = Math.hypot(dx, dy) || 1;
    this.x += (dx / len) * this.speed * speedScale * dt;
    this.y += (dy / len) * this.speed * speedScale * dt;
  }

  takeDamage(amount) {
    this.health -= amount;
    if (this.health <= 0) {
      this.dead = true;
      return true;
    }
    return false;
  }

  draw(ctx) {
    const hpRatio = this.health / this.maxHealth;
    ctx.save();
    ctx.translate(this.x, this.y);

    ctx.shadowBlur = 18;
    ctx.shadowColor = this.color;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    if (this.type === "stinger") {
      ctx.moveTo(this.radius, 0);
      ctx.lineTo(-this.radius * 0.7, this.radius * 0.8);
      ctx.lineTo(-this.radius * 0.7, -this.radius * 0.8);
      ctx.closePath();
    } else {
      ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
    }
    ctx.fill();

    if (this.maxHealth > 1) {
      ctx.fillStyle = "rgba(8, 14, 28, 0.7)";
      ctx.fillRect(-this.radius, -this.radius - 8, this.radius * 2, 4);
      ctx.fillStyle = "#8cffaa";
      ctx.fillRect(-this.radius, -this.radius - 8, this.radius * 2 * hpRatio, 4);
    }
    ctx.restore();
  }
}

export function chooseEnemyType(wave) {
  const roll = Math.random();
  if (wave >= 6 && roll > 0.7) {
    return "brute";
  }
  if (wave >= 3 && roll > 0.45) {
    return "stinger";
  }
  return "scout";
}

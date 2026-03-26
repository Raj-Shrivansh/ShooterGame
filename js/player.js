import { clamp } from "./collision.js";

export class Player {
  constructor(width, height) {
    this.x = width * 0.5;
    this.y = height * 0.82;
    this.radius = 18;
    this.speed = 320;
    this.maxHealth = 100;
    this.health = this.maxHealth;
    this.shotCooldown = 0.14;
    this.shotTimer = 0;
    this.invulnTimer = 0;
    this.invulnDuration = 0.45;
    this.aimX = 0;
    this.aimY = -1;
  }

  update(dt, input, width, height) {
    this.shotTimer -= dt;
    this.invulnTimer -= dt;

    const mx = (input.right ? 1 : 0) - (input.left ? 1 : 0);
    const my = (input.down ? 1 : 0) - (input.up ? 1 : 0);

    if (mx !== 0 || my !== 0) {
      const len = Math.hypot(mx, my) || 1;
      const vx = mx / len;
      const vy = my / len;
      this.x += vx * this.speed * dt;
      this.y += vy * this.speed * dt;
    }

    if (input.hasAim) {
      const len = Math.hypot(input.aimX, input.aimY) || 1;
      this.aimX = input.aimX / len;
      this.aimY = input.aimY / len;
    } else if (mx !== 0 || my !== 0) {
      const len = Math.hypot(mx, my) || 1;
      this.aimX = mx / len;
      this.aimY = my / len;
    }

    this.x = clamp(this.x, this.radius, width - this.radius);
    this.y = clamp(this.y, this.radius, height - this.radius);
  }

  canShoot() {
    return this.shotTimer <= 0;
  }

  markShot() {
    this.shotTimer = this.shotCooldown;
  }

  muzzlePoint() {
    return {
      x: this.x + this.aimX * (this.radius + 6),
      y: this.y + this.aimY * (this.radius + 6)
    };
  }

  takeDamage(amount) {
    if (this.invulnTimer > 0) {
      return false;
    }
    this.health = clamp(this.health - amount, 0, this.maxHealth);
    this.invulnTimer = this.invulnDuration;
    return true;
  }

  heal(amount) {
    this.health = clamp(this.health + amount, 0, this.maxHealth);
  }

  isDead() {
    return this.health <= 0;
  }

  draw(ctx) {
    if (this.invulnTimer > 0 && Math.floor(this.invulnTimer * 18) % 2 === 0) {
      return;
    }

    const angle = Math.atan2(this.aimY, this.aimX);
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(angle + Math.PI / 2);

    ctx.shadowBlur = 24;
    ctx.shadowColor = "rgba(66, 231, 255, 0.95)";
    ctx.fillStyle = "#4ee9ff";
    ctx.beginPath();
    ctx.moveTo(0, -this.radius - 6);
    ctx.lineTo(this.radius * 0.75, this.radius);
    ctx.lineTo(0, this.radius * 0.55);
    ctx.lineTo(-this.radius * 0.75, this.radius);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "rgba(0, 13, 24, 0.8)";
    ctx.beginPath();
    ctx.arc(0, this.radius * 0.1, this.radius * 0.45, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

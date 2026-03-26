export class Bullet {
  constructor(x, y, dx, dy) {
    this.x = x;
    this.y = y;
    this.dx = dx;
    this.dy = dy;
    this.radius = 4;
    this.speed = 680;
    this.damage = 1;
    this.life = 0;
    this.maxLife = 1.6;
    this.dead = false;
  }

  update(dt, width, height) {
    this.x += this.dx * this.speed * dt;
    this.y += this.dy * this.speed * dt;
    this.life += dt;

    if (
      this.life > this.maxLife ||
      this.x < -12 ||
      this.x > width + 12 ||
      this.y < -12 ||
      this.y > height + 12
    ) {
      this.dead = true;
    }
  }

  draw(ctx) {
    ctx.save();
    ctx.fillStyle = "#8ff2ff";
    ctx.shadowBlur = 14;
    ctx.shadowColor = "rgba(88, 234, 255, 0.85)";
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

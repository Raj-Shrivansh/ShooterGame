export class PowerUp {
  constructor(x, y, type = "health") {
    this.x = x;
    this.y = y;
    this.type = type;
    this.radius = 12;
    this.speedY = 56;
    this.life = 0;
    this.maxLife = 9;
    this.dead = false;
  }

  update(dt, width, height) {
    this.y += this.speedY * dt;
    this.life += dt;
    if (this.life > this.maxLife || this.y > height + 30 || this.x < -30 || this.x > width + 30) {
      this.dead = true;
    }
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.shadowBlur = 18;
    ctx.shadowColor = "rgba(128, 255, 152, 0.9)";
    ctx.fillStyle = "#98ff9f";
    ctx.beginPath();
    ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "rgba(9, 35, 18, 0.85)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, -5);
    ctx.lineTo(0, 5);
    ctx.moveTo(-5, 0);
    ctx.lineTo(5, 0);
    ctx.stroke();
    ctx.restore();
  }
}

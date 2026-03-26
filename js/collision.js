export function circlesIntersect(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const distanceSq = dx * dx + dy * dy;
  const radiusSum = a.radius + b.radius;
  return distanceSq <= radiusSum * radiusSum;
}

export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

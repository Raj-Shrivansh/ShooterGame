# Neon Siege

## Run Locally
1. Open `index.html` in a modern browser (Chrome, Firefox, Edge).
2. For best module-loading compatibility, serve the folder with a local static server:
   - `npx serve .`
   - or `python -m http.server`

## Controls
- Move: `WASD` or `Arrow Keys`
- Shoot: `Space`
- Pause/Resume: `P` or `Esc`
- Start/Restart: `Enter` or UI buttons

## Project Structure
- `index.html`: Game shell, screens, HUD, settings UI
- `style.css`: Responsive visual design and UI polish
- `js/main.js`: App bootstrapping, input/state wiring, loop
- `js/game.js`: Core game systems (waves, spawns, collision, scoring, health, game states)
- `js/player.js`: Player behavior and combat controls
- `js/enemy.js`: Enemy types, movement, damage, scoring values
- `js/bullet.js`: Projectile behavior
- `js/powerup.js`: Health pickup behavior
- `js/collision.js`: Collision/math helpers
- `js/ui.js`: Overlay and HUD management
- `js/sound.js`: Procedural placeholder SFX manager
- `REQUIREMENT.MD`: Source-of-truth specification

## Assumptions
- Power-ups are implemented as health drops to satisfy player-power-up collision requirements.
- Shooting direction follows current movement direction; default is upward when stationary.
- Sound effects use generated WebAudio tones as placeholders where asset files are not provided.

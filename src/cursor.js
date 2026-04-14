// Magnetic Ground Particles — triangles scattered across screen, rise toward cursor
export function initCursor() {
  const canvas = document.getElementById('cursor-orbit');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    scatter(); // re-scatter on resize
  }
  window.addEventListener('resize', resize);

  // Mouse
  let mouseX = -9999;
  let mouseY = -9999;
  window.addEventListener('mousemove', e => { mouseX = e.clientX; mouseY = e.clientY; });
  window.addEventListener('mouseleave', () => { mouseX = -9999; mouseY = -9999; });

  // ── Particle pool ────────────────────────────────────────────────
  const COUNT = 900;
  const INFLUENCE_RADIUS = 220; // px — how far the magnet reaches
  let particles = [];

  function scatter() {
    particles = [];
    for (let i = 0; i < COUNT; i++) {
      particles.push({
        // Fixed world position
        x   : Math.random() * canvas.width,
        y   : Math.random() * canvas.height,
        // Current visual state (lerped each frame)
        angle     : Math.random() * Math.PI * 2, // current draw angle
        scale     : 0.05 + Math.random() * 0.1, // resting = very small
        alpha     : 0.08 + Math.random() * 0.12, // resting = barely visible
        // Size gradient: power curve so most are tiny, few are large
        // Math.random() ** 2.5 biases toward small values
        baseSize  : 2 + Math.pow(Math.random(), 2.5) * 16, // range 2px → 18px, skewed small
      });
    }
  }

  resize(); // also calls scatter()

  function lerp(a, b, t) { return a + (b - a) * t; }

  function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const signalColor = getComputedStyle(document.documentElement)
      .getPropertyValue('--signal-start').trim() || '#667eea';

    particles.forEach(p => {
      const dx   = mouseX - p.x;
      const dy   = mouseY - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Influence falloff: 1 at cursor, 0 at INFLUENCE_RADIUS
      const influence = Math.max(0, 1 - dist / INFLUENCE_RADIUS);
      const influence2 = influence * influence; // quadratic — snappier near center

      // Target angle: triangle tip points TOWARD cursor
      const targetAngle = Math.atan2(dy, dx) - Math.PI / 2;
      // Target scale: 1.0 at cursor, tiny at rest
      const targetScale = 0.08 + influence2 * 0.92;
      // Target alpha: dim at rest, bright near cursor
      const targetAlpha = 0.08 + influence2 * 0.85;

      // Smooth lerp speed: faster when attracted, slower when relaxing
      const lerpSpeed = influence > 0 ? 0.14 : 0.04;

      // Angle lerp needs shortest-path unwrap
      let angleDiff = targetAngle - p.angle;
      while (angleDiff >  Math.PI) angleDiff -= Math.PI * 2;
      while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
      p.angle += angleDiff * lerpSpeed;

      p.scale = lerp(p.scale, targetScale, lerpSpeed);
      p.alpha = lerp(p.alpha, targetAlpha, lerpSpeed);

      // "Rising" effect: slightly shift toward cursor as influence grows
      // We draw the triangle displaced a bit toward the cursor
      const riseAmount = influence2 * 12;
      const drawX = p.x + (dx / (dist || 1)) * riseAmount;
      const drawY = p.y + (dy / (dist || 1)) * riseAmount;

      const s = p.baseSize * p.scale;

      // Draw solid triangle pointing toward cursor
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle   = signalColor;
      if (influence2 > 0.3) {
        ctx.shadowColor = signalColor;
        ctx.shadowBlur  = 4 * influence2;
      }
      ctx.translate(drawX, drawY);
      ctx.rotate(p.angle);
      ctx.beginPath();
      ctx.moveTo(0,  -s * 1.4);   // tip → toward cursor
      ctx.lineTo(-s,  s * 0.8);   // base left
      ctx.lineTo( s,  s * 0.8);   // base right
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    });

    requestAnimationFrame(render);
  }

  render();
}

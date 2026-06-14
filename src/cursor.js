export function initCursor() {
  const canvas = document.getElementById('cursor-orbit');
  if (!canvas) return;
  if ('ontouchstart' in window || navigator.maxTouchPoints > 0) return;

  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    scatter();
  }
  window.addEventListener('resize', resize);

  let mouseX = -9999;
  let mouseY = -9999;
  let cursorColor = '#c8956c';
  let cursorScale = 1;

  window.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });
  window.addEventListener('mouseleave', () => {
    mouseX = -9999;
    mouseY = -9999;
  });

  // ── Interactive element color mapping ────────────────────────────────
  const colorMap = {
    'a': '#c8956c',
    'button': '#c8956c',
    '.btn': '#c8956c',
    '.btn-primary': '#7fb069',
    '.btn-gradient': '#c8956c',
    '.btn-outline': '#c8956c',
    '.project-card': '#a07850',
    '.service-card': 'var(--signal-start, #c8956c)',
    '.social-icon': '#ffffff',
    '.balloon-sphere': '#c8956c',
    '.nav-links a': '#ffffff',
    '.mbn-item': '#c8956c',
    '[data-project]': '#a07850',
    '.service-explore-btn': 'var(--signal-start, #c8956c)',
    '.cs-close': '#ffffff',
    '.sp-close': '#ffffff',
  };

  function getHoverColor(el) {
    for (const [selector, color] of Object.entries(colorMap)) {
      if (el.closest(selector)) {
        if (color.startsWith('var(')) {
          const varName = color.match(/var\((--[^)]+)\)/)?.[1];
          return varName ? getComputedStyle(document.documentElement).getPropertyValue(varName).trim() || '#c8956c' : '#c8956c';
        }
        return color;
      }
    }
    return '#c8956c';
  }

  // Listen for hover on interactive elements
  document.addEventListener('mouseover', (e) => {
    const target = e.target.closest('a, button, .btn, .project-card, .service-card, .social-icon, .balloon-sphere, [data-project]');
    if (target) {
      cursorColor = getHoverColor(target);
      cursorScale = 1.6;
    }
  });

  document.addEventListener('mouseout', (e) => {
    const target = e.target.closest('a, button, .btn, .project-card, .service-card, .social-icon, .balloon-sphere, [data-project]');
    if (target) {
      cursorColor = '#c8956c';
      cursorScale = 1;
    }
  });

  // ── Particle pool ────────────────────────────────────────────────────
  const COUNT = 1000;
  const INFLUENCE_RADIUS = 240;
  let particles = [];

  function scatter() {
    particles = [];
    for (let i = 0; i < COUNT; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        angle: Math.random() * Math.PI * 2,
        scale: 0.05 + Math.random() * 0.1,
        alpha: 0.06 + Math.random() * 0.1,
        baseSize: 1.5 + Math.pow(Math.random(), 2.5) * 14,
        drift: {
          x: (Math.random() - 0.5) * 0.15,
          y: (Math.random() - 0.5) * 0.15,
        }
      });
    }
  }

  resize();

  function lerp(a, b, t) { return a + (b - a) * t; }

  function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Subtle ambient drift when no mouse
    const hasMouse = mouseX > -999;

    particles.forEach(p => {
      const dx = mouseX - p.x;
      const dy = mouseY - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      const influence = Math.max(0, 1 - dist / INFLUENCE_RADIUS);
      const influence2 = influence * influence;

      const targetAngle = Math.atan2(dy, dx) - Math.PI / 2;
      const targetScale = 0.08 + influence2 * 0.92 * cursorScale;
      const targetAlpha = 0.06 + influence2 * 0.88;

      const lerpSpeed = influence > 0 ? 0.16 : 0.035;

      let angleDiff = targetAngle - p.angle;
      while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
      while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
      p.angle += angleDiff * lerpSpeed;

      p.scale = lerp(p.scale, targetScale, lerpSpeed);
      p.alpha = lerp(p.alpha, targetAlpha, lerpSpeed);

      // Ambient drift
      if (!hasMouse || influence === 0) {
        p.x += p.drift.x;
        p.y += p.drift.y;
        if (p.x < 0 || p.x > canvas.width) p.drift.x *= -1;
        if (p.y < 0 || p.y > canvas.height) p.drift.y *= -1;
      }

      const riseAmount = influence2 * 14;
      const drawX = hasMouse ? p.x + (dx / (dist || 1)) * riseAmount : p.x;
      const drawY = hasMouse ? p.y + (dy / (dist || 1)) * riseAmount : p.y;

      const s = p.baseSize * p.scale;

      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = cursorColor;

      if (influence2 > 0.25) {
        ctx.shadowColor = cursorColor;
        ctx.shadowBlur = 6 * influence2;
      }

      ctx.translate(drawX, drawY);
      ctx.rotate(p.angle);
      ctx.beginPath();
      ctx.moveTo(0, -s * 1.4);
      ctx.lineTo(-s, s * 0.8);
      ctx.lineTo(s, s * 0.8);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    });

    requestAnimationFrame(render);
  }

  render();
}

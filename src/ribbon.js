import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// ─────────────────────────────────────────────────────────────────────────────
//  CONFIG
// ─────────────────────────────────────────────────────────────────────────────
const MSG      = "EXCELLENCE ISN'T AN OPTION.   IT'S MY STANDARD.   ";
const SPACING  = 20;       // arc-length between character centres (px) — tighter
const BAND_CLR = '#6c63ff';
const TEXT_CLR = '#04040e';
const N_SEGS   = 500;
const MARQUEE_SPEED = 1.5;  // px per animation frame (fast march)

// Responsive ribbon config — thinner + smaller text on mobile
function getRibbonConfig() {
  const mobile = window.innerWidth <= 768;
  return {
    BAND_H  : mobile ? 48 : 90,   // px — ribbon thickness
    FONT_PX : mobile ? 13 : 23,   // px — marquee text size
  };
}

// ─────────────────────────────────────────────────────────────────────────────
export function initRibbon() {
  const canvas = document.getElementById('ribbon-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  // ── state ──────────────────────────────────────────────────────────────────
  let W = 0, H = 0;
  let yShift     = 0;    // ribbon rise (H+30 → 0)
  let arcReveal  = 0;    // grows 0 → totalArcL (snake entrance, path-based)
  let autoOffset = 0;    // continuously grows → text marches along path (never exits ribbon)
  let raf        = null;
  let live       = false;

  // ── sizing ─────────────────────────────────────────────────────────────────
  function setSize() {
    const wrapper = canvas.parentElement;
    W = canvas.width  = wrapper ? wrapper.clientWidth  : window.innerWidth;
    H = canvas.height = wrapper ? wrapper.clientHeight : 320;
  }

  // ── bezier spine: sharper S-curve ─────────────────────────────────────────
  function makeSpine() {
    return {
      p0 : { x: -60,      y: H * 0.72 },
      cp1: { x: W * 0.25, y: H * 0.15 },
      cp2: { x: W * 0.72, y: H * 0.85 },
      p3 : { x: W + 60,   y: H * 0.28 },
    };
  }

  function bAt(s, t) {
    const u = 1 - t;
    return {
      x: u*u*u*s.p0.x + 3*u*u*t*s.cp1.x + 3*u*t*t*s.cp2.x + t*t*t*s.p3.x,
      y: u*u*u*s.p0.y + 3*u*u*t*s.cp1.y + 3*u*t*t*s.cp2.y + t*t*t*s.p3.y,
    };
  }

  function bTan(s, t) {
    const u = 1 - t;
    return {
      x: 3*(u*u*(s.cp1.x-s.p0.x) + 2*u*t*(s.cp2.x-s.cp1.x) + t*t*(s.p3.x-s.cp2.x)),
      y: 3*(u*u*(s.cp1.y-s.p0.y) + 2*u*t*(s.cp2.y-s.cp1.y) + t*t*(s.p3.y-s.cp2.y)),
    };
  }

  // ── arc-parameterised spine cache ──────────────────────────────────────────
  let _samples = [], _arcL = [], _totalArcL = 0;

  function buildSpine() {
    const sp = makeSpine();
    _samples = [];
    _arcL    = [0];
    for (let i = 0; i <= N_SEGS; i++) {
      const t   = i / N_SEGS;
      const pt  = bAt(sp, t);
      const tan = bTan(sp, t);
      const mag = Math.hypot(tan.x, tan.y) || 1;
      _samples.push({
        x  : pt.x,
        y  : pt.y,
        nx : -tan.y / mag,
        ny :  tan.x / mag,
        ang: Math.atan2(tan.y, tan.x),
      });
      if (i > 0) {
        const dx = _samples[i].x - _samples[i-1].x;
        const dy = _samples[i].y - _samples[i-1].y;
        _arcL.push(_arcL[i-1] + Math.hypot(dx, dy));
      }
    }
    _totalArcL = _arcL[N_SEGS];
  }

  // ── arc lookup ─────────────────────────────────────────────────────────────
  function atArc(d) {
    if (d < 0 || d > _totalArcL) return null;
    let lo = 0, hi = N_SEGS;
    while (lo < hi - 1) {
      const m = (lo + hi) >> 1;
      _arcL[m] <= d ? (lo = m) : (hi = m);
    }
    const f = _arcL[hi] === _arcL[lo] ? 0 : (d - _arcL[lo]) / (_arcL[hi] - _arcL[lo]);
    const a = _samples[lo], b = _samples[hi];
    return {
      x  : a.x   + (b.x   - a.x)   * f,
      y  : a.y   + (b.y   - a.y)   * f,
      ang: a.ang + (b.ang - a.ang) * f,
    };
  }

  // ── ribbon band outline ────────────────────────────────────────────────────
  function ribbonPath(half) {
    ctx.beginPath();
    for (let i = 0; i <= N_SEGS; i++) {
      const s = _samples[i];
      i === 0
        ? ctx.moveTo(s.x + s.nx * half, s.y + s.ny * half)
        : ctx.lineTo(s.x + s.nx * half, s.y + s.ny * half);
    }
    for (let i = N_SEGS; i >= 0; i--) {
      const s = _samples[i];
      ctx.lineTo(s.x - s.nx * half, s.y - s.ny * half);
    }
    ctx.closePath();
  }

  // ── render ─────────────────────────────────────────────────────────────────
  function draw() {
    ctx.clearRect(0, 0, W, H);
    buildSpine();

    ctx.save();
    ctx.translate(0, yShift);    // rise animation

    // 1. filled violet band
    const { BAND_H, FONT_PX } = getRibbonConfig();
    ribbonPath(BAND_H / 2);
    ctx.fillStyle = BAND_CLR;
    ctx.fill();

    // 2. text — always positioned on the bezier SPINE (never translated off-path)
    ctx.save();
    ribbonPath(BAND_H / 2 - 4);
    ctx.clip();                  // hard-clip to ribbon interior

    ctx.font         = `400 ${FONT_PX}px "Anton", "Impact", "Arial Narrow", sans-serif`;
    ctx.fillStyle    = TEXT_CLR;
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';

    // ── arc-position strategy ──────────────────────────────────────────────
    // wrapArc  = one full text repeat in arc-space
    // shift    = autoOffset wrapped → seamless loop
    // baseArc  = char's "original" arc (for reveal check)
    // arcPos   = baseArc + shift → actual position on spine
    //
    // Key: NEVER ctx.translate() text horizontally.  All motion is arc-based,
    // so every char is ALWAYS on the spine, always inside the ribbon band.
    // ──────────────────────────────────────────────────────────────────────

    const wrapArc  = MSG.length * SPACING;
    const shift    = autoOffset % wrapArc;

    // Iterate an index range wide enough to fill the visible path + margins
    const startIdx = Math.floor((-shift - SPACING) / SPACING);
    const endIdx   = Math.ceil((_totalArcL - shift + SPACING) / SPACING);

    for (let i = startIdx; i <= endIdx; i++) {
      const baseArc = i * SPACING + SPACING * 0.5;

      // ── snake entrance reveal ────────────────────────────────────────────
      // arcReveal grows 0 → totalArcL; only show chars whose base position
      // has already been "revealed" from the left
      if (baseArc > arcReveal) continue;

      const arcPos = baseArc + shift;
      if (arcPos < 0 || arcPos > _totalArcL) continue; // off either end of path

      const pt = atArc(arcPos);
      if (!pt) continue;

      // Wrap negative indices safely
      const charIdx = ((i % MSG.length) + MSG.length) % MSG.length;

      ctx.save();
      ctx.translate(pt.x, pt.y);
      ctx.rotate(pt.ang);       // character rotates to follow spine tangent
      ctx.fillText(MSG[charIdx], 0, 0);
      ctx.restore();
    }

    ctx.restore(); // end ribbon clip
    ctx.restore(); // end yShift
  }

  // ── animation loop ─────────────────────────────────────────────────────────
  function loop() {
    autoOffset += MARQUEE_SPEED;   // advance text along spine every frame
    draw();
    if (live) raf = requestAnimationFrame(loop);
  }
  function startLoop() { if (!live) { live = true; loop(); } }
  function stopLoop()  { live = false; cancelAnimationFrame(raf); raf = null; }

  // ── initial state ──────────────────────────────────────────────────────────
  setSize();
  buildSpine();
  yShift    = H + 30;    // ribbon hidden below canvas initially
  arcReveal = 0;
  draw();

  window.addEventListener('resize', () => { setSize(); buildSpine(); if (!live) draw(); });

  // ── TRIGGER 1: ribbon entrance ────────────────────────────────────────────
  ScrollTrigger.create({
    trigger: '.ribbon-wrapper',
    start  : 'top 92%',

    onEnter() {
      startLoop();
      yShift    = H + 30;
      arcReveal = 0;

      // Step 1 — ribbon rises from below quickly
      gsap.to({ v: H + 30 }, {
        v        : 0,
        duration : 0.48,
        ease     : 'expo.out',
        onUpdate : function () { yShift = this.targets()[0].v; },
      });

      // Step 2 — at 70% of rise (~0.34s), text snakes in from left
      //           (arcReveal grows → chars revealed progressively along path)
      gsap.delayedCall(0.34, () => {
        gsap.to({ v: 0 }, {
          v        : _totalArcL + SPACING * 8,   // ensure all chars revealed
          duration : 1.7,
          ease     : 'power2.out',
          onUpdate : function () { arcReveal = this.targets()[0].v; },
        });
      });
    },

    onLeaveBack() {
      gsap.killTweensOf({});
      gsap.to({ v: yShift }, {
        v        : H + 30,
        duration : 0.28,
        ease     : 'power2.in',
        onUpdate : function () { yShift = this.targets()[0].v; },
        onComplete() { arcReveal = 0; stopLoop(); },
      });
    },
  });

  // Note: no scroll-driven text translation — text always stays on spine.
  // The continuous autoOffset marquee gives life to the ribbon while scrolling.
}

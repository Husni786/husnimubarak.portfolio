import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { prepareWithSegments, layoutNextLineRange, materializeLineRange } from '@chenglou/pretext';

export function initCutout() {
  const canvas = document.getElementById('cutout-canvas');
  const sourceEl = document.getElementById('pretext-source');
  if (!canvas || !sourceEl) return;

  const ctx = canvas.getContext('2d');
  const wrapper = canvas.parentElement;

  const isMobile = () => window.innerWidth <= 768;

  // ── Size ─────────────────────────────────────────────────────
  function setSize() {
    const w = wrapper.clientWidth  || window.innerWidth;
    const h = wrapper.clientHeight || Math.round(window.innerHeight * 0.85);
    canvas.width  = w;
    canvas.height = h;
  }
  setSize();
  window.addEventListener('resize', () => {
    setSize();
    buildFragments();
    positionRibbon();
    prepareText();
    draw();
  });

  // ── Text config ───────────────────────────────────────────────
  // Desktop: fixed 18px, vertically centred, yLimit = full canvas
  // Mobile:  auto-fit 8–11px, top-aligned, yLimit = portrait bottom edge
  function getTextConfig(fontPx) {
    const mobile = isMobile();
    const px = fontPx || (mobile ? 11 : 18);
    return {
      FONT         : `${px}px "DM Sans", sans-serif`,
      LINE_H       : mobile ? Math.round(px * 1.55) : 30,
      HPAD         : mobile ? 20 : 50,
      maxTextY     : mobile ? 1.0 : 1.0,   // yLimit computed manually in draw()
      startFromTop : mobile,
      mobile,
      fontPx       : px,
    };
  }

  const rawText = sourceEl.innerText.replace(/\s+/g, ' ').trim();
  ctx.textBaseline = 'top';

  let preparedText = null;
  let lastPrepFont = '';

  function prepareText(forceFONT) {
    const FONT = forceFONT || getTextConfig().FONT;
    if (FONT === lastPrepFont && preparedText) return;
    ctx.font = FONT;
    try { preparedText = prepareWithSegments(rawText, FONT); }
    catch (e) { console.error('Pretext init failed', e); }
    lastPrepFont = FONT;
  }
  prepareText();

  // ── Fragments ────────────────────────────────────────────────
  const COLS = 60, ROWS = 60;
  let fragments = [];
  let imgDrawW = 0, imgDrawH = 0, imgScale = 1;
  let assembledX = 0, assembledY = 0;

  const img = new Image();
  img.src = '/cutout.png';

  function buildFragments() {
    if (!img.naturalWidth) return;
    fragments = [];
    const mobile = isMobile();
    // Desktop: 52% wide, 88% tall, vertically centred
    // Mobile:  55% wide, 75% tall, top at 30% of canvas (long column-wrap zone)
    const maxW = canvas.width  * (mobile ? 0.55 : 0.52);
    const maxH = canvas.height * (mobile ? 0.75 : 0.88);
    imgScale = Math.min(maxW / img.naturalWidth, maxH / img.naturalHeight);
    if (imgScale > 1) imgScale = 1;
    imgDrawW = img.naturalWidth  * imgScale;
    imgDrawH = img.naturalHeight * imgScale;
    assembledX = (canvas.width  - imgDrawW) / 2;
    assembledY = mobile
      ? canvas.height * 0.30                  // mobile: portrait top at 30% of canvas
      : (canvas.height - imgDrawH) / 2;       // desktop: vertically centred

    const pW = img.naturalWidth  / COLS;
    const pH = img.naturalHeight / ROWS;
    for (let ry = 0; ry < ROWS; ry++) {
      for (let rx = 0; rx < COLS; rx++) {
        fragments.push({
          sx: rx * pW, sy: ry * pH, sw: pW, sh: pH,
          dx: assembledX + rx * pW * imgScale,
          dy: assembledY + ry * pH * imgScale,
          dw: pW * imgScale, dh: pH * imgScale,
          ox: (Math.random() - 0.5) * window.innerWidth  * 1.6,
          oy: (Math.random() - 0.5) * window.innerHeight * 1.6,
          rot: (Math.random() - 0.5) * Math.PI * 4,
        });
      }
    }
  }

  // ── Pin ribbon to portrait bottom (mobile only) ───────────────
  function positionRibbon() {
    if (!isMobile() || !imgDrawH) return;
    const ribbonEl = document.querySelector('.about-canvas-wrapper .ribbon-wrapper');
    if (!ribbonEl) return;
    const portraitBottom = assembledY + imgDrawH;
    const fromBottom = canvas.height - portraitBottom;
    ribbonEl.style.bottom = `${Math.max(0, fromBottom)}px`;
    ribbonEl.style.top    = 'auto';
  }

  // ── Progress ─────────────────────────────────────────────────
  let fragP = 0;

  img.onload  = () => { buildFragments(); positionRibbon(); setupScrollTrigger(); draw(); };
  img.onerror = () => { draw(); };

  function setupScrollTrigger() {
    const mobile = isMobile();
    ScrollTrigger.create({
      trigger : '.about-section',
      // Desktop: starts as section enters view, fully assembled when section fills screen (matches image)
      // Mobile:  starts before section is visible, fully assembled 150px after section top passes viewport top
      start   : mobile ? 'top 200%' : 'top 80%',
      end     : mobile ? 'top+=150 top' : 'top 25%',
      scrub   : 1,
      onUpdate(self) { fragP = self.progress; draw(); }
    });
  }

  // ── Mobile: measure total text height for auto-fit ────────────
  function measureTextHeight(cfg, yLimit, imgTop, imgBot, halfW) {
    const { LINE_H, HPAD } = cfg;
    const textW = canvas.width - HPAD * 2;
    let th = 0, tc = { segmentIndex: 0, graphemeIndex: 0 };
    while (true) {
      const absY = 10 + th;
      if (absY >= yLimit) break;
      const inZone = absY >= imgTop && absY <= imgBot && imgDrawW > 0;
      if (inZone) {
        const lw = textW / 2 - halfW;
        const rw = textW / 2 - halfW;
        if (lw > 10) { const r = layoutNextLineRange(preparedText, tc, lw); if (r) tc = r.end; }
        if (rw > 10) { const r = layoutNextLineRange(preparedText, tc, rw); if (r) tc = r.end; }
      } else {
        const r = layoutNextLineRange(preparedText, tc, textW);
        if (!r) break;
        tc = r.end;
      }
      th += LINE_H;
    }
    const allConsumed = !layoutNextLineRange(preparedText, tc, textW);
    return { height: th, allConsumed };
  }

  // ── Draw ─────────────────────────────────────────────────────
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!canvas.width || !canvas.height) return;

    const mobile = isMobile();
    const p      = 1 - Math.pow(1 - fragP, 3); // ease-out cubic
    const PAD    = 8;

    // ─── DESKTOP rendering (clean original) ───────────────────
    if (!mobile) {
      prepareText();
      const { FONT, LINE_H, HPAD } = getTextConfig();
      const textW  = canvas.width - HPAD * 2;
      const yLimit = canvas.height;

      // halfW scales smoothly with p → wrap zone expands as portrait assembles
      const halfW  = (imgDrawW / 2 + PAD) * p;
      const imgTop = assembledY - PAD;
      const imgBot = assembledY + imgDrawH + PAD;

      if (preparedText && textW > 100) {
        // Dry-run: measure total height for vertical centering
        let th = 0, tc = { segmentIndex: 0, graphemeIndex: 0 };
        while (th < yLimit) {
          const inZone = th >= imgTop && th <= imgBot && p > 0.1;
          if (inZone) {
            const lw = textW / 2 - halfW;
            const rw = textW / 2 - halfW;
            if (lw > 10) { const r = layoutNextLineRange(preparedText, tc, lw); if (r) tc = r.end; }
            if (rw > 10) { const r = layoutNextLineRange(preparedText, tc, rw); if (r) tc = r.end; }
          } else {
            const r = layoutNextLineRange(preparedText, tc, textW);
            if (!r) break;
            tc = r.end;
          }
          th += LINE_H;
        }

        let y = (canvas.height - th) / 2;
        if (y < 10) y = 10;
        let cursor = { segmentIndex: 0, graphemeIndex: 0 };

        ctx.globalAlpha = 1;
        ctx.fillStyle   = getComputedStyle(document.documentElement)
          .getPropertyValue('--text-primary').trim() || '#f0f0f5';
        ctx.font = FONT;

        while (y < canvas.height + LINE_H) {
          const inZone = y >= imgTop && y <= imgBot && p > 0.1;
          if (inZone) {
            const lw = textW / 2 - halfW;
            if (lw > 10) {
              const r = layoutNextLineRange(preparedText, cursor, lw);
              if (r) { ctx.fillText(materializeLineRange(preparedText, r).text, HPAD, y); cursor = r.end; }
            }
            const rxStart = HPAD + textW / 2 + halfW;
            const rw = HPAD + textW - rxStart;
            if (rw > 10) {
              const r = layoutNextLineRange(preparedText, cursor, rw);
              if (r) { ctx.fillText(materializeLineRange(preparedText, r).text, rxStart, y); cursor = r.end; }
            }
          } else {
            const r = layoutNextLineRange(preparedText, cursor, textW);
            if (!r) break;
            ctx.fillText(materializeLineRange(preparedText, r).text, HPAD, y);
            cursor = r.end;
          }
          y += LINE_H;
        }
      }
    }

    // ─── MOBILE rendering (auto-fit, top-aligned, always-on wrap) ─
    if (mobile) {
      const halfW  = imgDrawW > 0 ? (imgDrawW / 2 + PAD) : 0;
      const imgTop = assembledY - PAD;
      const imgBot = assembledY + imgDrawH + PAD;
      // yLimit = portrait bottom edge (ribbon sits here)
      const yLimit = imgDrawH > 0 ? (assembledY + imgDrawH - 10) : (canvas.height - 120);

      if (preparedText && (canvas.width - 40) > 100) {
        // Auto-fit: find largest font (8–11px) where all text fits above yLimit
        let bestPx = 8;
        for (let tryPx = 11; tryPx >= 8; tryPx--) {
          const cfg = getTextConfig(tryPx);
          prepareText(cfg.FONT);
          const m = measureTextHeight(cfg, yLimit, imgTop, imgBot, halfW);
          if (m.allConsumed) { bestPx = tryPx; break; }
        }
        const cfg = getTextConfig(bestPx);
        prepareText(cfg.FONT);

        const { FONT, LINE_H, HPAD } = cfg;
        const textW  = canvas.width - HPAD * 2;

        let y      = 10;
        let cursor = { segmentIndex: 0, graphemeIndex: 0 };

        ctx.globalAlpha = 1;
        ctx.fillStyle   = getComputedStyle(document.documentElement)
          .getPropertyValue('--text-primary').trim() || '#f0f0f5';
        ctx.font = FONT;

        while (y < yLimit) {
          const inZone = y >= imgTop && y <= imgBot;
          if (inZone) {
            const lw = textW / 2 - halfW;
            if (lw > 10) {
              const r = layoutNextLineRange(preparedText, cursor, lw);
              if (r) { ctx.fillText(materializeLineRange(preparedText, r).text, HPAD, y); cursor = r.end; }
            }
            const rxStart = HPAD + textW / 2 + halfW;
            const rw = HPAD + textW - rxStart;
            if (rw > 10) {
              const r = layoutNextLineRange(preparedText, cursor, rw);
              if (r) { ctx.fillText(materializeLineRange(preparedText, r).text, rxStart, y); cursor = r.end; }
            }
          } else {
            const r = layoutNextLineRange(preparedText, cursor, textW);
            if (!r) break;
            ctx.fillText(materializeLineRange(preparedText, r).text, HPAD, y);
            cursor = r.end;
          }
          y += LINE_H;
        }
      }
    }

    // ─ Fragments (shared) ────────────────────────────────────
    if (!img.naturalWidth || fragments.length === 0) return;
    fragments.forEach(f => {
      const posX = f.ox * (1 - p) + f.dx;
      const posY = f.oy * (1 - p) + f.dy;
      ctx.save();
      ctx.globalAlpha = Math.min(1, p + 0.05);
      ctx.translate(posX + f.dw / 2, posY + f.dh / 2);
      ctx.rotate(f.rot * (1 - p));
      ctx.drawImage(img, f.sx, f.sy, f.sw, f.sh, -f.dw / 2, -f.dh / 2, f.dw, f.dh);
      ctx.restore();
    });
  }

  // Draw immediately so text is visible before any scroll
  draw();
}

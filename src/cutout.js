import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { prepareWithSegments, layoutNextLineRange, materializeLineRange } from '@chenglou/pretext';

export function initCutout() {
  const canvas  = document.getElementById('cutout-canvas');
  const sourceEl = document.getElementById('pretext-source');
  if (!canvas || !sourceEl) return;

  // willReadFrequently:false is better for pure-write canvases (no getImageData)
  const ctx = canvas.getContext('2d', { willReadFrequently: false });
  const wrapper = canvas.parentElement;

  const isMobile = () => window.innerWidth <= 768;

  // ── Fragment grid: fewer tiles on mobile for GPU headroom ─────
  // Desktop: 60×60 = 3 600 draw calls → rich detail
  // Mobile : 22×22 =   484 draw calls → smooth 60 fps
  const COLS = () => isMobile() ? 22 : 60;
  const ROWS = () => isMobile() ? 22 : 60;

  // ── Size ──────────────────────────────────────────────────────
  function setSize() {
    const w = wrapper.clientWidth  || window.innerWidth;
    const h = wrapper.clientHeight || Math.round(window.innerHeight * 0.85);
    canvas.width  = w;
    canvas.height = h;
    // Invalidate cached values that depend on canvas size
    _cachedBestPx   = null;
    _cachedTextColor = null;
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
  function getTextConfig(fontPx) {
    const mobile = isMobile();
    const px = fontPx || (mobile ? 11 : 18);
    return {
      FONT         : `${px}px "DM Sans", sans-serif`,
      LINE_H       : mobile ? Math.round(px * 1.55) : 30,
      HPAD         : mobile ? 20 : 50,
      startFromTop : mobile,
      mobile,
      fontPx       : px,
    };
  }

  const rawText = sourceEl.innerText.replace(/\s+/g, ' ').trim();
  ctx.textBaseline = 'top';

  let preparedText  = null;
  let lastPrepFont  = '';

  function prepareText(forceFONT) {
    const FONT = forceFONT || getTextConfig().FONT;
    if (FONT === lastPrepFont && preparedText) return;
    ctx.font = FONT;
    try { preparedText = prepareWithSegments(rawText, FONT); }
    catch (e) { console.error('Pretext init failed', e); }
    lastPrepFont = FONT;
  }
  prepareText();

  // ── Cache: text color (no getComputedStyle every frame) ───────
  let _cachedTextColor = null;
  function getTextColor() {
    if (_cachedTextColor) return _cachedTextColor;
    _cachedTextColor = getComputedStyle(document.documentElement)
      .getPropertyValue('--text-primary').trim() || '#f0f0f5';
    return _cachedTextColor;
  }

  // ── Cache: mobile best font size (no re-measure every frame) ──
  let _cachedBestPx   = null;

  // ── Fragments ─────────────────────────────────────────────────
  let fragments  = [];
  let imgDrawW   = 0, imgDrawH = 0, imgScale = 1;
  let assembledX = 0, assembledY = 0;

  const img = new Image();
  img.src = `${import.meta.env.BASE_URL}cutout.png`;

  function buildFragments() {
    if (!img.naturalWidth) return;
    fragments = [];
    _cachedBestPx = null; // force font-size re-measure after layout change

    const mobile = isMobile();
    const cols   = COLS();
    const rows   = ROWS();

    const maxW = canvas.width  * (mobile ? 0.55 : 0.52);
    const maxH = canvas.height * (mobile ? 0.75 : 0.88);
    imgScale = Math.min(maxW / img.naturalWidth, maxH / img.naturalHeight);
    if (imgScale > 1) imgScale = 1;
    imgDrawW   = img.naturalWidth  * imgScale;
    imgDrawH   = img.naturalHeight * imgScale;
    assembledX = (canvas.width  - imgDrawW) / 2;
    assembledY = mobile
      ? canvas.height * 0.30
      : (canvas.height - imgDrawH) / 2;

    const pW = img.naturalWidth  / cols;
    const pH = img.naturalHeight / rows;

    // Scatter radius: smaller on mobile so fragments don't fly too far (less repainting)
    const scatterX = window.innerWidth  * (mobile ? 1.0 : 1.6);
    const scatterY = window.innerHeight * (mobile ? 1.0 : 1.6);

    for (let ry = 0; ry < rows; ry++) {
      for (let rx = 0; rx < cols; rx++) {
        fragments.push({
          sx: rx * pW, sy: ry * pH, sw: pW, sh: pH,
          dx: assembledX + rx * pW * imgScale,
          dy: assembledY + ry * pH * imgScale,
          dw: pW * imgScale, dh: pH * imgScale,
          ox: (Math.random() - 0.5) * scatterX,
          oy: (Math.random() - 0.5) * scatterY,
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
    const fromBottom     = canvas.height - portraitBottom;
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
      start   : mobile ? 'top 200%' : 'top 80%',
      end     : mobile ? 'top+=150 top' : 'top 25%',
      // Mobile: scrub:0.5 feels snappier and wastes fewer frames chasing the value
      scrub   : mobile ? 0.5 : 1,
      onUpdate(self) { fragP = self.progress; draw(); }
    });
  }

  // ── Mobile: measure total text height for auto-fit ────────────
  function measureTextHeight(cfg, yLimit, imgTop, imgBot, halfW) {
    const { LINE_H, HPAD } = cfg;
    const textW = canvas.width - HPAD * 2;
    let th = 0, tc = { segmentIndex: 0, graphemeIndex: 0 };
    while (true) {
      const absY  = 10 + th;
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

  // ── Draw ──────────────────────────────────────────────────────
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!canvas.width || !canvas.height) return;

    const mobile = isMobile();
    const p      = 1 - Math.pow(1 - fragP, 3); // ease-out cubic
    const PAD    = 8;

    // ─── DESKTOP rendering ────────────────────────────────────
    if (!mobile) {
      prepareText();
      const { FONT, LINE_H, HPAD } = getTextConfig();
      const textW  = canvas.width - HPAD * 2;
      const yLimit = canvas.height;
      const halfW  = (imgDrawW / 2 + PAD) * p;
      const imgTop = assembledY - PAD;
      const imgBot = assembledY + imgDrawH + PAD;

      if (preparedText && textW > 100) {
        // Dry-run for vertical centering
        let th = 0, tc = { segmentIndex: 0, graphemeIndex: 0 };
        while (th < yLimit) {
          const inZone = th >= imgTop && th <= imgBot && p > 0.1;
          if (inZone) {
            const lw = textW / 2 - halfW, rw = textW / 2 - halfW;
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
        ctx.fillStyle   = getTextColor();
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

    // ─── MOBILE rendering ────────────────────────────────────
    if (mobile) {
      const halfW  = imgDrawW > 0 ? (imgDrawW / 2 + PAD) : 0;
      const imgTop = assembledY - PAD;
      const imgBot = assembledY + imgDrawH + PAD;
      const yLimit = imgDrawH > 0 ? (assembledY + imgDrawH - 10) : (canvas.height - 120);

      if (preparedText && (canvas.width - 40) > 100) {
        // Auto-fit: find bestPx ONCE, cache until canvas resizes
        if (_cachedBestPx === null) {
          let bestPx = 8;
          for (let tryPx = 11; tryPx >= 8; tryPx--) {
            const cfg = getTextConfig(tryPx);
            prepareText(cfg.FONT);
            const m = measureTextHeight(cfg, yLimit, imgTop, imgBot, halfW);
            if (m.allConsumed) { bestPx = tryPx; break; }
          }
          _cachedBestPx = bestPx;
        }

        const cfg = getTextConfig(_cachedBestPx);
        prepareText(cfg.FONT);
        const { FONT, LINE_H, HPAD } = cfg;
        const textW = canvas.width - HPAD * 2;
        let y = 10, cursor = { segmentIndex: 0, graphemeIndex: 0 };

        ctx.globalAlpha = 1;
        ctx.fillStyle   = getTextColor();
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

    // ─── Fragments (shared, GPU-optimised) ───────────────────
    if (!img.naturalWidth || fragments.length === 0) return;

    // globalAlpha is identical for every fragment — set it once outside the loop
    ctx.globalAlpha = Math.min(1, p + 0.05);

    // Disable smoothing on mobile: saves GPU fill-rate bandwidth
    ctx.imageSmoothingEnabled = !mobile;

    const nearlyAssembled = p > 0.97; // skip rotation math when almost done

    for (let i = 0; i < fragments.length; i++) {
      const f    = fragments[i];
      const posX = f.ox * (1 - p) + f.dx;
      const posY = f.oy * (1 - p) + f.dy;
      const cx   = posX + f.dw * 0.5;
      const cy   = posY + f.dh * 0.5;

      if (nearlyAssembled) {
        // No rotation needed — use simple translation (fastest possible path)
        ctx.setTransform(1, 0, 0, 1, cx, cy);
      } else {
        const angle = f.rot * (1 - p);
        const cos   = Math.cos(angle);
        const sin   = Math.sin(angle);
        // setTransform is ~4× faster than save()+translate()+rotate()+restore()
        ctx.setTransform(cos, sin, -sin, cos, cx, cy);
      }
      ctx.drawImage(img, f.sx, f.sy, f.sw, f.sh, -f.dw * 0.5, -f.dh * 0.5, f.dw, f.dh);
    }

    // Reset transform once for everything that follows (text, etc.)
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = 1;
  }

  // Draw immediately so text is visible before any scroll
  draw();
}

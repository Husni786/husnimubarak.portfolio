import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export function initSkills() {
  const section = document.querySelector('.skills-section');
  if (!section) return;

  const oldCanvas = document.getElementById('skills-constellation');
  if (oldCanvas) oldCanvas.remove();

  // ── Skill data ──────────────────────────────────────────────
  const SKILLS = [
    // Cluster 1: Frontend Ecosystem (Top-Left)
    { name:'HTML5',         cat:'Frontend',   hue:20,  pct:96, sx:-6.5, sy: 3.5, desc:'Semantic, accessible markup — the bedrock of every web product I build.' },
    { name:'CSS3',          cat:'Frontend',   hue:195, pct:94, sx:-4.5, sy: 4.2, desc:'Advanced animations, glassmorphism, grid & flexbox layouts, and custom design systems.' },
    { name:'JavaScript',    cat:'Frontend',   hue:52,  pct:91, sx:-4.0, sy: 1.8, desc:'ES6+, async/await, DOM APIs, and dynamic browser interactions on every project.' },
    { name:'React',         cat:'Framework',  hue:193, pct:92, sx:-1.5, sy: 3.2, desc:'Component architecture and hooks — the foundation of 5+ production applications.' },
    { name:'Next.js',       cat:'Framework',  hue:208, pct:88, sx:-0.5, sy: 1.0, desc:'SSR, SSG, and API routes — backbone of all SEO-first web products.' },
    
    // Cluster 2: Mobile, Payments & Growth (Bottom-Left / Center-Bottom)
    { name:'React\nNative', cat:'Mobile',     hue:183, pct:86, sx: 1.5, sy:-2.5, desc:'Built Grocee Plus — acquired for $800, generating $500+ MRR within weeks of launch.' },
    { name:'Flutter',       cat:'Mobile',     hue:200, pct:71, sx: 4.5, sy:-4.5, desc:'Dart-powered cross-platform apps with native iOS and Android performance.' },
    { name:'Stripe',        cat:'Payments',   hue:233, pct:83, sx: 6.5, sy:-2.5, desc:'Subscriptions, usage billing & webhooks — monetisation layer in Grocee Plus & AI SaaS.' },
    { name:'SEO',           cat:'Growth',     hue:178, pct:83, sx:-0.5, sy:-4.5, desc:'Federal Updates hit Google Page 1 in 3 months — zero backlinks, zero paid ads.' },

    // Cluster 3: Backend & DevOps (Top-Right / Mid-Right)
    { name:'Node.js',       cat:'Backend',    hue:122, pct:87, sx: 3.5, sy: 3.0, desc:'Scalable server-side JS — REST APIs, cron jobs, concurrency, and real-time servers.' },
    { name:'REST API',      cat:'Backend',    hue:198, pct:91, sx: 2.0, sy: 0.5, desc:'Designing and consuming REST APIs with auth, rate limiting, and versioned endpoints.' },
    { name:'Firebase',      cat:'Database',   hue:37,  pct:89, sx: 6.5, sy: 3.8, desc:'Realtime Firestore, auth & cloud functions — live backend in Grocee Plus and more.' },
    { name:'Supabase',      cat:'Database',   hue:152, pct:85, sx: 4.5, sy: 1.2, desc:'PostgreSQL-powered backend with built-in auth, real-time subscriptions & storage.' },
    { name:'Vercel',        cat:'DevOps',     hue:208, pct:89, sx: 5.5, sy:-0.8, desc:'Zero-config CI/CD deployments, edge functions, and instant preview URLs.' },
    { name:'GitHub',        cat:'DevOps',     hue:242, pct:91, sx: 7.5, sy: 1.5, desc:'CI/CD pipelines, code review workflows, and open-source project management.' },

    // Cluster 4: AI & Python (Bottom-Left Outer)
    { name:'Python',        cat:'Backend',    hue:47,  pct:84, sx:-4.5, sy:-1.5, desc:'AI integrations, FastAPI backends, automation scripts, and SaaS product logic.' },
    { name:'OpenAI',        cat:'AI',         hue:158, pct:87, sx:-6.5, sy:-3.5, desc:'GPT-4 API for content generation, intelligent automation, and full AI SaaS products.' },
    { name:'Gemini',        cat:'AI',         hue:202, pct:81, sx:-2.5, sy:-4.0, desc:'Google Gemini for multimodal tasks — vision, code, and text reasoning at scale.' },
  ];

  const bubbleSizes = SKILLS.map(s => s.pct >= 88 ? 88 : s.pct >= 78 ? 76 : 66);

  // ── Build scene ─────────────────────────────────────────────
  const scene = document.createElement('div');
  scene.className = 'bubbles-scene';
  section.appendChild(scene);

  // SVG string layer (z-index below bubbles)
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.classList.add('bubbles-svg');
  scene.appendChild(svg);

  // ── Network Edges (Connections) ───────────────────────────
  // Arranged into distinct, un-repeated structural links mimicking a clustered force-graph
  const edges = [
    // Frontend Cluster (indices 0 to 4)
    [0,1], [0,2], [0,4], [1,2], [1,3], [2,3], [2,4], [3,4],
    // Mobile/Growth Cluster (indices 5 to 8)
    [5,6], [5,7], [5,8], [6,7], [7,8],
    // Backend/DevOps Cluster (indices 9 to 14)
    [9,10], [9,12], [9,13], [9,14], [10,12], [10,13], [11,12], [11,14], [12,13], [13,14],
    // AI/Python Cluster (indices 15 to 17)
    [15,16], [15,17], [16,17],
    // Cross-Cluster Web (Sparse inter-links to tie the ecosystem)
    [2,15], [2,12], [3,5], [3,9], [4,10], [4,13], [5,11], [6,10], [15,10], [16,8]
  ];

  const edgeLines = edges.map(() => {
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('stroke', 'hsl(260 80% 75%)');
    line.setAttribute('stroke-width', '1.2');
    line.setAttribute('stroke-opacity', '0.35');
    line.setAttribute('stroke-linecap', 'round');
    line.style.filter = 'drop-shadow(0 0 5px hsl(260 80% 65% / 0.40))';
    svg.appendChild(line);
    return line;
  });

  // ── Create bubble elements ──────────────────────────────────
  const bubbleEls = [];
  SKILLS.forEach((skill, i) => {
    const size  = bubbleSizes[i];
    const label = skill.name.replace('\n', '<br>');
    const wrap  = document.createElement('div');
    wrap.className = 'bubble-wrap';
    wrap.style.setProperty('--bal-size', size + 'px');
    wrap.innerHTML = `
      <div class="balloon-sphere" style="--hue:${skill.hue}">
        <span class="balloon-label">${label}</span>
      </div>
    `;
    wrap.addEventListener('click', () => openPopup(skill));
    scene.appendChild(wrap);
    bubbleEls.push(wrap);
  });

  // ── Position helpers ────────────────────────────────────────

  // Normalize sx (-8…+8) → [padFrac … 1-padFrac] of W
  // Normalize sy (-5…+5) → [padFrac … 1-padFrac] of H (y inverted: sy>0 = higher on screen)
  function computePositions() {
    const W = scene.offsetWidth;
    const H = scene.offsetHeight;
    const padX = 0.06, padY = 0.08;

    // Scatter: normalise the pre-set sx/sy values to fraction of container
    const SXMIN = -8, SXMAX = 8, SYMIN = -5, SYMAX = 5;
    const scatter = SKILLS.map((s, i) => ({
      x: (( s.sx - SXMIN) / (SXMAX - SXMIN)) * (1 - 2 * padX) * W + padX * W - bubbleSizes[i] / 2,
      y: ((SYMAX - s.sy) / (SYMAX - SYMIN)) * (1 - 2 * padY) * H + padY * H - bubbleSizes[i] / 2,
    }));

    // Grid: 7 cols × ⌈n/7⌉ rows
    const COLS = 7;
    const rows = Math.ceil(SKILLS.length / COLS);
    const gPadX = 64, gPadY = 52;
    const colStep = (W - gPadX * 2) / (COLS - 1);
    const rowStep = rows > 1 ? (H - gPadY * 2) / (rows - 1) : 0;
    const grid = SKILLS.map((_, i) => ({
      x: gPadX + (i % COLS) * colStep - bubbleSizes[i] / 2,
      y: gPadY + Math.floor(i / COLS) * rowStep - bubbleSizes[i] / 2,
    }));

    return { scatter, grid };
  }

  // ── Draw Network Helper ────────────────────────────────────
  function updateNetwork(positions) {
    edges.forEach(([i, j], idx) => {
      const p1 = positions[i];
      const p2 = positions[j];
      const line = edgeLines[idx];
      line.setAttribute('x1', p1.x + bubbleSizes[i] / 2);
      line.setAttribute('y1', p1.y + bubbleSizes[i] / 2);
      line.setAttribute('x2', p2.x + bubbleSizes[j] / 2);
      line.setAttribute('y2', p2.y + bubbleSizes[j] / 2);
    });
  }

  // ── Core state ──────────────────────────────────────────────
  let scatterPos, gridPos, scrollProgress = 0, floatEnabled = true;
  let tickerFn;

  // ── Deferred init: WAIT for browser layout ──────────────────
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {   // 2 rAF frames = guaranteed post-paint
      const pos = computePositions();
      scatterPos = pos.scatter;
      gridPos    = pos.grid;

      // Apply starting positions
      bubbleEls.forEach((b, i) => {
        gsap.set(b, { x: scatterPos[i].x, y: scatterPos[i].y, rotation: 0 });
      });
      updateNetwork(scatterPos);

      // ── Floating ticker ─────────────────────────────────────
      tickerFn = () => {
        if (!floatEnabled) return;
        const t = Date.now() * 0.002;
        const floatPos = scatterPos.map((p, i) => ({
          x: p.x,
          y: p.y + Math.sin(t + i * 0.75) * 9,
        }));
        bubbleEls.forEach((b, i) => {
          gsap.set(b, {
            x: floatPos[i].x,
            y: floatPos[i].y,
            rotation: Math.sin(t * 0.6 + i * 0.5) * 2,
          });
        });
        updateNetwork(floatPos);
      };
      gsap.ticker.add(tickerFn);

      // ── ScrollTrigger: scatter → grid ──────────────────────
      ScrollTrigger.create({
        trigger: section,
        start: 'top center',
        end:   'bottom center',
        onUpdate: (self) => {
          scrollProgress = self.progress;
          if (self.progress > 0.02) floatEnabled = false;

          const curPos = SKILLS.map((_, i) => ({
            x: gsap.utils.interpolate(scatterPos[i].x, gridPos[i].x, self.progress),
            y: gsap.utils.interpolate(scatterPos[i].y, gridPos[i].y, self.progress),
          }));
          bubbleEls.forEach((b, i) => {
            gsap.set(b, { x: curPos[i].x, y: curPos[i].y, rotation: 0 });
          });
          updateNetwork(curPos);
          
          const newOpacity = (0.60 + self.progress * 0.20).toFixed(2);
          edgeLines.forEach(l => l.setAttribute('stroke-opacity', newOpacity));
        },
        onLeaveBack: () => { floatEnabled = true; },
      });

      // ── Resize handler ─────────────────────────────────────
      window.addEventListener('resize', () => {
        const p = computePositions();
        scatterPos = p.scatter;
        gridPos    = p.grid;
        if (!floatEnabled) {
          const curPos = SKILLS.map((_, i) => ({
            x: gsap.utils.interpolate(scatterPos[i].x, gridPos[i].x, scrollProgress),
            y: gsap.utils.interpolate(scatterPos[i].y, gridPos[i].y, scrollProgress),
          }));
          bubbleEls.forEach((b, i) => gsap.set(b, { x: curPos[i].x, y: curPos[i].y }));
          updateNetwork(curPos);
        }
      });
    });
  });

  // ── Popup DOM ───────────────────────────────────────────────
  const backdrop = document.createElement('div');
  backdrop.className = 'skill-backdrop';
  document.body.appendChild(backdrop);

  const popupOuter = document.createElement('div');
  popupOuter.className = 'skill-popup-outer';
  popupOuter.style.pointerEvents = 'none';
  popupOuter.innerHTML = `
    <div class="skill-popup-circle">
      <div class="sp-cat"  id="sp-cat"></div>
      <h3  class="sp-name" id="sp-name"></h3>
      <div class="sp-pct-wrap">
        <span class="sp-pct"  id="sp-pct"></span>
        <div class="sp-bar-track">
          <div class="sp-bar-fill" id="sp-bar-fill"></div>
        </div>
      </div>
      <p class="sp-desc" id="sp-desc"></p>
    </div>
    <button class="sp-close" aria-label="Close">×</button>
  `;
  document.body.appendChild(popupOuter);

  const spCat   = document.getElementById('sp-cat');
  const spName  = document.getElementById('sp-name');
  const spPct   = document.getElementById('sp-pct');
  const spBar   = document.getElementById('sp-bar-fill');
  const spDesc  = document.getElementById('sp-desc');
  const spClose = popupOuter.querySelector('.sp-close');

  function openPopup(skill) {
    spCat.textContent  = skill.cat;
    spCat.style.background = `linear-gradient(90deg, hsl(${skill.hue} 80% 60%), hsl(${(skill.hue + 30) % 360} 70% 55%))`;
    spName.textContent = skill.name.replace('\n', ' ');
    spPct.textContent  = skill.pct + '%';
    spBar.style.cssText = `width:0%; background:hsl(${skill.hue} 72% 62%)`;
    spDesc.textContent = skill.desc;

    backdrop.classList.add('is-visible');
    window.__lenis?.stop();
    popupOuter.style.pointerEvents = 'all';

    gsap.fromTo(popupOuter,
      { scale: 0.72, opacity: 0, y: 28 },
      { scale: 1,    opacity: 1, y: 0, duration: 0.5, ease: 'back.out(1.6)' }
    );
    setTimeout(() => {
      gsap.to(spBar, { width: skill.pct + '%', duration: 0.85, ease: 'power2.out' });
    }, 220);
  }

  function closePopup() {
    gsap.to(popupOuter, {
      scale: 0.78, opacity: 0, y: 18, duration: 0.28, ease: 'power2.in',
      onComplete: () => { popupOuter.style.pointerEvents = 'none'; },
    });
    backdrop.classList.remove('is-visible');
    window.__lenis?.start();
  }

  spClose.addEventListener('click', closePopup);
  backdrop.addEventListener('click', closePopup);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closePopup(); });
}

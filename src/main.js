import './style.css';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

import { initPreloader } from './preloader.js';
import { initCursor } from './cursor.js';
import { initParticles } from './particles.js';
import { initTheming } from './theming.js';
import { initPreText } from './typography.js';
import { initCutout } from './cutout.js';
import { initProjects } from './projects.js';
import { initSkills } from './skills.js';
import { initRibbon } from './ribbon.js';
import { initStats } from './stats.js';
import { initTransitions } from './transitions.js';

gsap.registerPlugin(ScrollTrigger);

// 1. Initialize Lenis Smooth Scrolling
const lenis = new Lenis({
  lerp: 0.07,
  duration: 1.6,
  smoothWheel: true,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
});

window.__lenis = lenis;
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => { lenis.raf(time * 1000); });
gsap.ticker.lagSmoothing(0);

// 2. Preloader → then initialize everything
async function boot() {
  // Show preloader
  await initPreloader();

  // Initialize all modules
  initCursor();
  initParticles();
  initTheming();
  initPreText();
  initCutout();
  initProjects();
  initSkills();
  initRibbon();
  initStats();
  initTransitions();

  // ── Mobile Bottom Nav ──────────────────────────────────────────────
  initMobileBottomNav();

  // ── Nav Indicator ──────────────────────────────────────────────────
  initNavIndicator();

  // ── Hero Entrance Animation ────────────────────────────────────────
  initHeroEntrance();

  // ── 3D Tilt Button ─────────────────────────────────────────────────
  initViewWorkBtn();

  // ── Service Card Expand/Collapse ───────────────────────────────────
  initServiceCards();

  // ── Case Study Modal ───────────────────────────────────────────────
  initCaseStudyModal();

  // ── Contact Form ───────────────────────────────────────────────────
  initContactForm();

  // ── Interactive Buttons & Links ────────────────────────────────────
  initMicroInteractions();
}

// ── HERO ENTRANCE ───────────────────────────────────────────────────────
function initHeroEntrance() {
  const tl = gsap.timeline({ delay: 0.1 });

  // Nav entrance
  tl.fromTo('.site-nav',
    { y: -100, opacity: 0, filter: 'blur(10px)' },
    { y: 0, opacity: 1, filter: 'blur(0px)', duration: 1, ease: 'power3.out' }
  );

  // Monogram draw
  tl.fromTo('.hm-monogram path',
    { strokeDasharray: 200, strokeDashoffset: 200 },
    { strokeDashoffset: 0, duration: 1.5, ease: 'power3.inOut' },
    '<0.3'
  );

  // Vignette
  tl.fromTo('.vignette-overlay',
    { opacity: 0 },
    { opacity: 1, duration: 1.2 },
    '<'
  );

  // Hero meta label
  tl.fromTo('.hero-top-meta',
    { opacity: 0, x: -30 },
    { opacity: 1, x: 0, duration: 0.8, ease: 'power3.out' },
    '-=0.5'
  );

  // Hero title (PreText handles this if available, otherwise GSAP)
  tl.fromTo('.hero-title',
    { opacity: 0, y: 40 },
    { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' },
    '-=0.3'
  );

  // Hero subtitle
  tl.fromTo('.hero-subtitle',
    { opacity: 0, y: 20, filter: 'blur(4px)' },
    { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.7, ease: 'power3.out' },
    '-=0.4'
  );

  // Bottom meta
  tl.fromTo('.hero-bottom-meta',
    { opacity: 0, y: 30 },
    { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' },
    '-=0.3'
  );

  // Stat badges stagger
  tl.fromTo('.stat-badge',
    { opacity: 0, scale: 0.8, y: 15 },
    { opacity: 1, scale: 1, y: 0, stagger: 0.12, duration: 0.5, ease: 'back.out(1.6)' },
    '-=0.4'
  );

  // Specialization line
  tl.fromTo('.hero-specialization',
    { opacity: 0, x: -20 },
    { opacity: 0.85, x: 0, duration: 0.6, ease: 'power3.out' },
    '-=0.3'
  );

  // CTA buttons
  tl.fromTo('.hero-ctas .btn',
    { scale: 0.9, opacity: 0 },
    { scale: 1, opacity: 1, stagger: 0.2, duration: 0.7, ease: 'back.out(1.7)' },
    '-=0.3'
  );

  // Hero parallax on scroll
  gsap.to('.hero-title', {
    yPercent: 30,
    ease: 'none',
    scrollTrigger: {
      trigger: '.hero-section',
      start: 'top top',
      end: 'bottom top',
      scrub: true
    }
  });
}

// ── NAV INDICATOR ──────────────────────────────────────────────────────
function initNavIndicator() {
  const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
  const indicator = document.querySelector('.nav-indicator');
  const navLinksEl = document.querySelector('.nav-links');

  const expoOut = (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t));

  function moveIndicator(link, instant = false) {
    if (!link || !indicator || !navLinksEl) return;

    const navRect = navLinksEl.getBoundingClientRect();
    const linkRect = link.getBoundingClientRect();
    const targetX = linkRect.left - navRect.left;
    const targetW = linkRect.width;
    const targetH = linkRect.height;
    const targetY = linkRect.top - navRect.top;

    indicator.classList.add('is-visible');

    if (instant) {
      gsap.set(indicator, {
        x: targetX, y: targetY,
        width: targetW, height: targetH,
        transformOrigin: 'center center',
      });
      return;
    }

    const fromX = Number(gsap.getProperty(indicator, 'x')) || 0;
    const fromW = Number(gsap.getProperty(indicator, 'width')) || targetW;
    const bridgeX = Math.min(fromX, targetX);
    const bridgeW = Math.max(fromX + fromW, targetX + targetW) - bridgeX;

    gsap.to(indicator, {
      x: bridgeX, width: bridgeW,
      duration: 0.16, ease: 'power3.out', overwrite: 'auto',
    });
    gsap.to(indicator, {
      y: targetY, height: targetH,
      duration: 0.14, ease: 'power2.out', overwrite: 'auto',
    });
    gsap.to(indicator, {
      x: targetX, width: targetW,
      duration: 0.58, ease: 'elastic.out(1, 0.62)', delay: 0.10, overwrite: false,
    });
  }

  navLinks.forEach((link) => {
    link.addEventListener('mousedown', () => {
      indicator.classList.add('is-pressing');
      gsap.to(indicator, {
        scaleX: 1.12, scaleY: 0.82,
        duration: 0.12, ease: 'power2.out',
        transformOrigin: 'center center', overwrite: 'auto',
      });
    });

    const springBack = () => {
      indicator.classList.remove('is-pressing');
      gsap.to(indicator, {
        scaleX: 1, scaleY: 1,
        duration: 0.45, ease: 'elastic.out(1.2, 0.5)', overwrite: 'auto',
      });
    };
    link.addEventListener('mouseup', springBack);
    link.addEventListener('mouseleave', springBack);

    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('href').slice(1);
      const target = document.getElementById(targetId);
      if (target) {
        lenis.scrollTo(target, { offset: -72, duration: 2.2, easing: expoOut });
      }
      navLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
      moveIndicator(link, true);
      gsap.fromTo(link,
        { y: 0 },
        { y: -3, duration: 0.12, ease: 'power2.out',
          onComplete: () => gsap.to(link, { y: 0, duration: 0.4, ease: 'elastic.out(1, 0.5)' })
        }
      );
    });
  });

  const sections = [...navLinks].map(l =>
    document.getElementById(l.getAttribute('href').slice(1))
  ).filter(Boolean);

  lenis.on('scroll', ({ scroll }) => {
    let currentSection = sections[0];
    sections.forEach(sec => {
      if (scroll >= sec.offsetTop - 120) currentSection = sec;
    });
    const id = `#${currentSection?.id}`;
    navLinks.forEach(l => {
      const matches = l.getAttribute('href') === id;
      if (matches && !l.classList.contains('active')) {
        navLinks.forEach(x => x.classList.remove('active'));
        l.classList.add('active');
        moveIndicator(l);
      }
    });
  });

  requestAnimationFrame(() => {
    const firstLink = document.querySelector('.nav-links a');
    if (firstLink) {
      firstLink.classList.add('active');
      moveIndicator(firstLink, true);
    }
  });
}

// ── MOBILE BOTTOM NAV ─────────────────────────────────────────────────
function initMobileBottomNav() {
  const mq = window.matchMedia('(max-width: 768px)');
  if (!mq.matches) return;

  const nav = document.getElementById('mobile-bottom-nav');
  const indicator = document.getElementById('mbn-indicator');
  const items = Array.from(nav.querySelectorAll('.mbn-item'));
  if (!nav || !indicator || !items.length) return;

  function setIndicator(el) {
    const navRect = nav.getBoundingClientRect();
    const itemRect = el.getBoundingClientRect();
    const offsetX = itemRect.left - navRect.left;
    indicator.style.width = itemRect.width + 'px';
    indicator.style.transform = `translateX(${offsetX}px)`;
  }

  function activate(index) {
    items.forEach((item, i) => item.classList.toggle('active', i === index));
    setIndicator(items[index]);
  }

  requestAnimationFrame(() => {
    const activeItem = items.find(i => i.classList.contains('active')) || items[0];
    setIndicator(activeItem);
  });

  items.forEach((item, i) => {
    item.addEventListener('click', () => activate(i));
  });

  const sectionIds = ['hero', 'about', 'services', 'skills', 'contact'];
  const sectionEls = sectionIds.map(id => document.getElementById(id)).filter(Boolean);

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const idx = sectionIds.indexOf(entry.target.id);
        if (idx !== -1) activate(idx);
      }
    });
  }, { threshold: 0.35 });

  sectionEls.forEach(el => observer.observe(el));

  window.addEventListener('resize', () => {
    const active = items.findIndex(i => i.classList.contains('active'));
    if (active !== -1) setIndicator(items[active]);
  });
}

// ── 3D TILT VIEW WORK BUTTON ──────────────────────────────────────────
function initViewWorkBtn() {
  const viewWorkBtn = document.getElementById('btn-view-work');
  if (!viewWorkBtn) return;

  viewWorkBtn.addEventListener('mousemove', (e) => {
    const rect = viewWorkBtn.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) / (rect.width / 2);
    const dy = (e.clientY - cy) / (rect.height / 2);
    const maxTilt = 18;
    viewWorkBtn.style.setProperty('--rx', `${-dy * maxTilt}deg`);
    viewWorkBtn.style.setProperty('--ry', `${dx * maxTilt}deg`);
    const bx = ((e.clientX - rect.left) / rect.width * 100).toFixed(1);
    const by = ((e.clientY - rect.top) / rect.height * 100).toFixed(1);
    viewWorkBtn.style.setProperty('--bx', `${bx}%`);
    viewWorkBtn.style.setProperty('--by', `${by}%`);
  });

  viewWorkBtn.addEventListener('mouseleave', () => {
    viewWorkBtn.style.setProperty('--rx', '0deg');
    viewWorkBtn.style.setProperty('--ry', '0deg');
  });

  viewWorkBtn.addEventListener('click', () => {
    const target = document.getElementById('projects');
    if (target) {
      lenis.scrollTo(target, { offset: 0, duration: 2, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
    }
  });
}

// ── LET'S TALK → CONTACT ──────────────────────────────────────────────
const letsTalkBtn = document.querySelector('.hero-ctas .btn-outline');
if (letsTalkBtn) {
  letsTalkBtn.addEventListener('click', () => {
    const target = document.getElementById('contact');
    if (target && window.__lenis) {
      window.__lenis.scrollTo(target, { duration: 1.6, easing: (t) => 1 - Math.pow(1 - t, 3) });
    }
  });
}

// ── CASE STUDY MODAL ──────────────────────────────────────────────────
function initCaseStudyModal() {
  const csOverlay = document.getElementById('cs-overlay');
  const csModal = document.getElementById('cs-modal');
  const csBody = document.getElementById('cs-body');
  const csClose = document.getElementById('cs-close');

  const caseStudies = {
    'grocee-plus': {
      number: '01', badge: 'FEATURED PROJECT', title: 'Grocee Plus',
      tagline: 'A cross-platform grocery app I built in 4 weeks — a Silicon Valley company bought the code for $800, and it\'s now generating $500+ in monthly recurring revenue.',
      metrics: [
        { value: '$800', label: 'Acquisition Price' },
        { value: '$500+', label: 'Monthly MRR' },
        { value: '4 wks', label: 'Time to Build' },
      ],
      sections: [
        { title: '\u26A1 The Problem', body: `Managing groceries with a family shouldn't require 17 WhatsApp messages, three forgotten items, and someone inevitably buying the wrong brand of yoghurt. Lists get duplicated. Budgets get ignored. Nobody knows what's already in the cart.<br><br>I built Grocee Plus to fix that for my own family — and what started as a personal weekend project quietly turned into a product someone paid real money for.` },
        { title: '\uD83D\uDEE0 What I Built', body: `<ul><li>Cross-platform app (iOS &amp; Android) built with React Native</li><li>Real-time family sharing — one shared list, synced across every member's device</li><li>Link sharing — invite anyone without requiring them to create an account</li><li>Smooth iOS-style transitions and physics-based animations throughout</li><li>Payment requests — a family member can flag that they spent money on an item and request reimbursement</li><li>Tiered subscription: Free (limited items) / $12/mo (30 items) / $28/mo (80 items)</li></ul><br>Backend: <strong>Supabase</strong> for real-time data sync, <strong>Firebase</strong> for authentication. Version control on <strong>GitHub</strong>, deployed on <strong>Vercel</strong>.` },
        { title: '\uD83D\uDCC8 The Outcome', body: `A small software company near Silicon Valley came across my APK demo online. They tested the UI, ran the app on a real device, and within 48 hours made an offer: <strong>$800 for the full codebase</strong>.<br><br>After some targeted Instagram marketing on their end, they've now crossed <strong>$500 in monthly recurring revenue</strong> — with a real subscriber base, real retention, and a product that solves a problem people actually have every week.` },
        { title: '\uD83D\uDCA1 What This Means For You', body: `A well-built MVP with a real use case doesn't need a massive team or years of development. It needs to solve one problem clearly, look polished, and work reliably.<br><br>If you have an app idea — even one that sounds small — this is proof that it can become a genuine income stream. I specialise in taking ideas from concept to working product, fast. <em>Let's talk.</em>` },
      ],
      stack: ['React Native', 'Supabase', 'Firebase', 'Stripe', 'Vercel', 'GitHub'],
      ctaText: 'Have an app idea? I build MVPs that feel premium, launch quickly, and can be monetised from day one.',
    },
    'corporate-dashboard': {
      number: '02', badge: 'ENTERPRISE', title: 'Corporate Dashboard',
      tagline: 'A custom analytics platform that replaced 5 spreadsheets and saved a logistics company 6 hours every single week — delivered in 3 weeks, paid \u20B91,00,000.',
      metrics: [
        { value: '$1.2k', label: 'Project Value' },
        { value: '6 hrs', label: 'Saved Per Week' },
        { value: '3 wks', label: 'Delivered In' },
      ],
      sections: [
        { title: '\u26A1 The Problem', body: `A growing logistics company in India was running their entire operations reporting across 5 different Excel files — emailed around on WhatsApp every Monday morning. By the time all five department heads had compared numbers and replied back, it was Tuesday and half the data was already outdated.` },
        { title: '\uD83D\uDEE0 What I Built', body: `<ul><li>Role-based views — separate dashboard interfaces for management and warehouse operations teams</li><li>Live shipment tracking widget, pulling real-time data via REST API from their existing logistics platform</li><li>Revenue vs. cost heatmap with monthly trend lines and variance highlighting</li><li>Individual team performance scorecards — KPI accountability at a glance</li><li>Automated Monday morning email digest — system sends it at 7am, no manual action needed</li></ul><br>Built with <strong>Next.js + TypeScript</strong> for the frontend, <strong>Recharts</strong> for all data visualisation, and REST API integration connecting to their existing tools.` },
        { title: '\uD83D\uDCC8 The Outcome', body: `Delivered in 6 weeks. <strong>Client paid \u20B91,00,000 (~$1,200) for the full build.</strong><br><br>Weekly reporting time dropped from 6 hours to <strong>under 20 minutes</strong>. Twelve team members now use the dashboard daily — with no training documentation needed.` },
        { title: '\uD83D\uDCA1 What This Means For You', body: `If your team is making decisions from spreadsheets sent via WhatsApp, you are losing money every single week. A custom dashboard built for your specific workflow pays for itself within 30 days. <em>I can build yours.</em>` },
      ],
      stack: ['Next.js', 'TypeScript', 'Recharts', 'REST API', 'Tailwind', 'Vercel'],
      ctaText: 'Still on spreadsheets? A custom dashboard built for your workflow pays for itself in 30 days.',
    },
    'ai-saas': {
      number: '03', badge: 'LIVE PRODUCT', title: 'AI SaaS Platform',
      tagline: 'An AI content tool I built for myself that turned into a product — 3 paying customers and $87 MRR within 6 weeks, with zero advertising.',
      metrics: [
        { value: '$87', label: 'MRR @ 6 Weeks' },
        { value: '0', label: 'Ad Spend' },
        { value: '6 wks', label: 'To First Revenue' },
      ],
      sections: [
        { title: '\u26A1 The Problem', body: `I was spending 3+ hours a day writing captions, cold email sequences, repurposed blog content, and outreach scripts for client projects. The tasks were different. The process was identical. Every single day.` },
        { title: '\uD83D\uDEE0 What I Built', body: `<ul><li>Brand voice profiles — the AI learns your tone, your style, your vocabulary</li><li>Bulk content generation: captions, cold emails, blog intros, ad copy, LinkedIn posts</li><li>Team workspaces with role-based permissions</li><li>Usage analytics — see exactly which content types are being used</li><li>Direct Notion export integration</li></ul><br>Stack: <strong>Python + FastAPI</strong> backend, <strong>React</strong> frontend, <strong>OpenAI GPT-4 API</strong>, <strong>PostgreSQL on Supabase</strong>, <strong>Stripe</strong> for usage-based billing.` },
        { title: '\uD83D\uDCC8 The Outcome', body: `<strong>3 paying customers within 6 weeks at $29/month — $87 MRR, zero paid advertising.</strong><br><br>One user cancelled their Jasper subscription the same day they signed up. Another told me it was the first time AI had written something in their actual voice.` },
        { title: '\uD83D\uDCA1 What This Means For You', body: `Generic AI is everywhere. <em>Specific</em> AI — trained on a niche, solving one problem precisely — is rare and genuinely valuable right now. <em>Let's find your niche.</em>` },
      ],
      stack: ['Python', 'FastAPI', 'OpenAI GPT-4', 'React', 'PostgreSQL', 'Supabase', 'Stripe'],
      ctaText: 'The highest-margin software products right now are AI tools built for a specific problem. I build them fast.',
    },
    'federal-updates': {
      number: '04', badge: 'LIVE SITE', title: 'Federal Updates',
      tagline: 'A political news aggregator I built in 2 weeks — now hitting 8,000+ monthly visitors organically, ranking Page 1 on Google, with zero ad spend.',
      metrics: [
        { value: '8k+', label: 'Monthly Visitors' },
        { value: 'Pg 1', label: 'Google Ranking' },
        { value: '2 wks', label: 'Built In' },
      ],
      sections: [
        { title: '\u26A1 The Opportunity', body: `During the Trump 2.0 era, political news was either partisan and emotional, buried under pop-ups, or fragmented across 12 different impossible-to-navigate government sites. There was no clean, fast, neutral place to check executive orders, policy changes, and federal updates in one feed.` },
        { title: '\uD83D\uDEE0 What I Built', body: `<ul><li>Next.js SSR site — server-side rendered for maximum SEO performance</li><li>Node.js RSS parser aggregating 12+ official government and trusted news feeds automatically</li><li>Cron jobs updating content every 30 minutes — always fresh, never manual</li><li>Category filtering: executive orders, immigration, economy, defence, healthcare</li><li>Mobile-first design — sub-1 second load time on a 4G connection</li></ul>` },
        { title: '\uD83D\uDCC8 The Outcome', body: `<strong>8,000+ organic monthly visitors within 3 months of launch.</strong> No paid advertising. No backlink outreach. Currently ranking on Page 1 of Google for multiple long-tail keywords.` },
        { title: '\uD83D\uDCA1 What This Means For You', body: `Content sites built with strong technical SEO foundations are compounding assets. I can build, deploy, and optimise the entire SEO foundation in 2 weeks. <em>You own a site that grows while you sleep.</em>` },
      ],
      stack: ['Next.js', 'Node.js', 'RSS API', 'Vercel', 'Schema Markup', 'Google Search Console'],
      ctaText: 'Want a content site that ranks on Google and compounds over time? I build the whole thing — 2 weeks, start to live.',
    },
  };

  function buildModalHTML(data) {
    return `
      <div class="cs-header-row">
        <span class="cs-number">${data.number}</span>
        <span class="cs-badge-tag">${data.badge}</span>
      </div>
      <h2 class="cs-title">${data.title}</h2>
      <p class="cs-tagline">${data.tagline}</p>
      <div class="cs-metrics-strip">
        ${data.metrics.map(m => `
          <div class="cs-metric-card">
            <span class="cs-metric-val">${m.value}</span>
            <span class="cs-metric-lbl">${m.label}</span>
          </div>`).join('')}
      </div>
      <div class="cs-divider"></div>
      <div class="cs-sections">
        ${data.sections.map(s => `
          <div class="cs-section">
            <h3 class="cs-sec-title">${s.title}</h3>
            <div class="cs-sec-body">${s.body}</div>
          </div>`).join('')}
      </div>
      <div class="cs-stack-row">
        ${data.stack.map(t => `<span class="cs-stack-chip">${t}</span>`).join('')}
      </div>
      <div class="cs-cta-block">
        <p class="cs-cta-copy">${data.ctaText}</p>
        <button class="cs-cta-btn" id="cs-contact-link">Let's Build Something Like This &rarr;</button>
      </div>
    `;
  }

  function openCaseStudy(projectId) {
    const data = caseStudies[projectId];
    if (!data || !csOverlay) return;
    csBody.innerHTML = buildModalHTML(data);
    csModal.scrollTop = 0;
    gsap.set(csOverlay, { pointerEvents: 'all' });
    gsap.to(csOverlay, { opacity: 1, duration: 0.30, ease: 'power2.out' });
    gsap.fromTo(csModal,
      { y: 80, scale: 0.92, opacity: 0, rotateX: -5 },
      { y: 0, scale: 1, opacity: 1, rotateX: 0, duration: 0.65, ease: 'expo.out', delay: 0.04 }
    );
    csOverlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    window.__lenis?.stop();
  }

  function closeCaseStudy() {
    gsap.to(csModal, { y: 60, scale: 0.94, opacity: 0, duration: 0.32, ease: 'power3.in' });
    gsap.to(csOverlay, {
      opacity: 0, duration: 0.28, delay: 0.06,
      onComplete: () => {
        gsap.set(csOverlay, { pointerEvents: 'none' });
        csOverlay.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        window.__lenis?.start();
        csBody.innerHTML = '';
      }
    });
  }

  csClose?.addEventListener('click', closeCaseStudy);
  csOverlay?.addEventListener('click', (e) => { if (e.target === csOverlay) closeCaseStudy(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeCaseStudy(); });

  csBody?.addEventListener('click', (e) => {
    if (e.target.closest('#cs-contact-link')) {
      closeCaseStudy();
      setTimeout(() => {
        window.__lenis?.start();
        const target = document.getElementById('contact');
        if (target) window.__lenis?.scrollTo(target, { offset: -80, duration: 2.4 });
      }, 380);
    }
  });

  document.querySelectorAll('[data-project]').forEach(btn => {
    btn.addEventListener('click', () => openCaseStudy(btn.dataset.project));
  });
}

// ── SERVICE CARDS ─────────────────────────────────────────────────────
function initServiceCards() {
  const serviceCards = document.querySelectorAll('.service-card');

  function closeAllDrawers() {
    serviceCards.forEach(c => {
      c.querySelector('.service-drawer').classList.remove('is-open');
      c.querySelector('.service-drawer').setAttribute('aria-hidden', 'true');
      c.querySelector('.service-explore-btn').setAttribute('aria-expanded', 'false');
      c.querySelector('.service-explore-btn').textContent = 'EXPLORE \u2192';
      c.classList.remove('is-open');
    });
  }

  document.querySelectorAll('.service-explore-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const card = btn.closest('.service-card');
      const drawer = card.querySelector('.service-drawer');
      const isOpen = drawer.classList.contains('is-open');
      closeAllDrawers();
      if (!isOpen) {
        drawer.classList.add('is-open');
        drawer.setAttribute('aria-hidden', 'false');
        btn.setAttribute('aria-expanded', 'true');
        btn.textContent = 'CLOSE \u2715';
        card.classList.add('is-open');
      }
    });
  });

  document.addEventListener('click', (e) => {
    const openCard = document.querySelector('.service-card.is-open');
    if (openCard && !openCard.contains(e.target)) closeAllDrawers();
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeAllDrawers();
  });
}

// ── CONTACT FORM ──────────────────────────────────────────────────────
function initContactForm() {
  const contactForm = document.getElementById('contact-form');
  const formStatus = document.getElementById('form-status');

  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = contactForm.querySelector('#btn-send');
      const originalText = btn.textContent;
      btn.textContent = 'SENDING\u2026';
      btn.disabled = true;
      formStatus.textContent = '';
      formStatus.className = 'form-status';

      try {
        const formData = new FormData(contactForm);
        const data = Object.fromEntries(formData);
        const res = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(data),
        });
        const result = await res.json();
        if (result.success) {
          formStatus.textContent = "\u2705 Message sent! I'll get back to you soon.";
          formStatus.classList.add('success');
          contactForm.reset();
        } else {
          formStatus.textContent = '\u274C Something went wrong. Please try again.';
          formStatus.classList.add('error');
        }
      } catch (err) {
        formStatus.textContent = '\u274C Network error. Please check your connection.';
        formStatus.classList.add('error');
      }

      btn.textContent = originalText;
      btn.disabled = false;
    });
  }
}

// ── MICRO-INTERACTIONS ────────────────────────────────────────────────
function initMicroInteractions() {
  // Magnetic effect on all .btn elements
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) * 0.15;
      const dy = (e.clientY - cy) * 0.15;
      gsap.to(btn, { x: dx, y: dy, duration: 0.3, ease: 'power2.out' });
    });
    btn.addEventListener('mouseleave', () => {
      gsap.to(btn, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.5)' });
    });
  });

  // Social icon hover glow
  document.querySelectorAll('.social-icon').forEach(icon => {
    icon.addEventListener('mouseenter', () => {
      gsap.to(icon, { scale: 1.15, duration: 0.3, ease: 'back.out(1.6)' });
    });
    icon.addEventListener('mouseleave', () => {
      gsap.to(icon, { scale: 1, duration: 0.4, ease: 'elastic.out(1, 0.5)' });
    });
  });

  // Form field focus animations
  document.querySelectorAll('.contact-form input, .contact-form textarea').forEach(field => {
    field.addEventListener('focus', () => {
      gsap.to(field, {
        borderColor: 'rgba(102, 126, 234, 0.6)',
        boxShadow: '0 0 20px rgba(102, 126, 234, 0.15)',
        duration: 0.3,
      });
    });
    field.addEventListener('blur', () => {
      gsap.to(field, {
        borderColor: 'rgba(255, 255, 255, 0.1)',
        boxShadow: 'none',
        duration: 0.3,
      });
    });
  });
}

// Boot the site
boot();

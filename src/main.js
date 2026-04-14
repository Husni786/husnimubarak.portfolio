import './style.css';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

import { initCursor } from './cursor.js';
import { initParticles } from './particles.js';
import { initTheming } from './theming.js';
import { initPreText } from './typography.js';
import { initCutout } from './cutout.js';
import { initProjects } from './projects.js';
import { initSkills } from './skills.js';
import { initRibbon } from './ribbon.js';
import { initStats } from './stats.js';

gsap.registerPlugin(ScrollTrigger);

// 1. Initialize Lenis Smooth Scrolling
const lenis = new Lenis({
  lerp: 0.07,          // slightly softer interpolation for silkier feel
  duration: 1.6,
  smoothWheel: true,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // expo-out
});

// Expose globally so any module can trigger smooth scrolls
window.__lenis = lenis;

lenis.on('scroll', ScrollTrigger.update);

gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});

gsap.ticker.lagSmoothing(0);

// 2. Initializations
document.addEventListener('DOMContentLoaded', () => {
  initCursor();
  initParticles();
  initTheming();
  initPreText();
  initCutout();
  initProjects();
  initSkills();
  initRibbon();
  initStats();

  // ── MOBILE HAMBURGER TOGGLE ──────────────────────────────────────────────
  const hamburger = document.getElementById('nav-hamburger');
  const navLinksContainer = document.getElementById('nav-links');

  if (hamburger && navLinksContainer) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('is-open');
      navLinksContainer.classList.toggle('is-open');
    });

    // Close menu when a nav link is clicked
    navLinksContainer.querySelectorAll('a[href^="#"]').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('is-open');
        navLinksContainer.classList.remove('is-open');
      });
    });
  }

  // ── iOS 26 MOBILE BOTTOM NAV ─────────────────────────────────────────────
  (function initMobileBottomNav() {
    const mq = window.matchMedia('(max-width: 768px)');
    if (!mq.matches) return; // desktop: skip entirely

    const nav       = document.getElementById('mobile-bottom-nav');
    const indicator = document.getElementById('mbn-indicator');
    const items     = Array.from(nav.querySelectorAll('.mbn-item'));
    if (!nav || !indicator || !items.length) return;

    /** Move indicator to the active item */
    function setIndicator(el) {
      const navRect  = nav.getBoundingClientRect();
      const itemRect = el.getBoundingClientRect();
      const offsetX  = itemRect.left - navRect.left;
      indicator.style.width     = itemRect.width + 'px';
      indicator.style.transform = `translateX(${offsetX}px)`;
    }

    /** Update active class + indicator */
    function activate(index) {
      items.forEach((item, i) => item.classList.toggle('active', i === index));
      setIndicator(items[index]);
    }

    // Init on first render (after layout settles)
    requestAnimationFrame(() => {
      const activeItem = items.find(i => i.classList.contains('active')) || items[0];
      setIndicator(activeItem);
    });

    // Click: activate immediately
    items.forEach((item, i) => {
      item.addEventListener('click', () => activate(i));
    });

    // Scroll: watch sections & update active tab
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

    // Re-position indicator on resize
    window.addEventListener('resize', () => {
      const active = items.findIndex(i => i.classList.contains('active'));
      if (active !== -1) setIndicator(items[active]);
    });
  })();

  // ── "LET'S TALK" → smooth scroll to #contact ─────────────────────────────
  const letsTalkBtn = document.querySelector('.hero-ctas .btn-outline');
  if (letsTalkBtn) {
    letsTalkBtn.addEventListener('click', () => {
      const target = document.getElementById('contact');
      if (target && window.__lenis) {
        window.__lenis.scrollTo(target, { duration: 1.6, easing: (t) => 1 - Math.pow(1 - t, 3) });
      }
    });
  }

  // ── LIQUID GLASS NAV INDICATOR ───────────────────────────────────────────
  const navLinks  = document.querySelectorAll('.nav-links a[href^="#"]');
  const indicator = document.querySelector('.nav-indicator');
  const navLinksEl = document.querySelector('.nav-links');

  // Easing: expo out — fast start, silk deceleration
  const expoOut = (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t));

  /**
   * Move the liquid indicator to a given link element.
   * @param {Element} link   — the <a> to move to
   * @param {boolean} instant — skip animation on first paint
   */
  function moveIndicator(link, instant = false) {
    if (!link || !indicator || !navLinksEl) return;

    const navRect  = navLinksEl.getBoundingClientRect();
    const linkRect = link.getBoundingClientRect();

    const targetX = linkRect.left - navRect.left;
    const targetW = linkRect.width;
    const targetH = linkRect.height;
    const targetY = linkRect.top - navRect.top; // top edge — indicator fills down

    indicator.classList.add('is-visible');

    // ── Instant snap (first paint / no animation) ──────────────────────────
    if (instant) {
      gsap.set(indicator, {
        x: targetX, y: targetY,
        width: targetW, height: targetH,
        transformOrigin: 'center center',
      });
      return;
    }

    // ── Read current indicator state ────────────────────────────────────────
    const fromX = Number(gsap.getProperty(indicator, 'x')) || 0;
    const fromW = Number(gsap.getProperty(indicator, 'width')) || targetW;

    // Liquid bridge: span from leftmost to rightmost edge of both pills
    const bridgeX = Math.min(fromX, targetX);
    const bridgeW = Math.max(fromX + fromW, targetX + targetW) - bridgeX;

    // ── Phase 1: STRETCH — blob expands to bridge both positions ──────────
    gsap.to(indicator, {
      x: bridgeX, width: bridgeW,
      duration: 0.16,
      ease: 'power3.out',
      overwrite: 'auto',
    });
    gsap.to(indicator, {
      y: targetY, height: targetH,
      duration: 0.14,
      ease: 'power2.out',
      overwrite: 'auto',
    });

    // ── Phase 2: SNAP — elastic spring contracts to target ────────────────
    gsap.to(indicator, {
      x: targetX, width: targetW,
      duration: 0.58,
      ease: 'elastic.out(1, 0.62)',
      delay: 0.10,
      overwrite: false,
    });
  }

  // ── Press squish + release bounce on the link itself ──────────────────────
  navLinks.forEach((link) => {
    // Mousedown: squish the indicator (wider, shorter — like the toggle press)
    link.addEventListener('mousedown', () => {
      indicator.classList.add('is-pressing');
      gsap.to(indicator, {
        scaleX: 1.12, scaleY: 0.82,
        duration: 0.12,
        ease: 'power2.out',
        transformOrigin: 'center center',
        overwrite: 'auto',
      });
    });

    // Mouseup / mouseleave: spring back
    const springBack = () => {
      indicator.classList.remove('is-pressing');
      gsap.to(indicator, {
        scaleX: 1, scaleY: 1,
        duration: 0.45,
        ease: 'elastic.out(1.2, 0.5)',
        overwrite: 'auto',
      });
    };
    link.addEventListener('mouseup',    springBack);
    link.addEventListener('mouseleave', springBack);

    // Click: scroll + move indicator + bounce the link text
    link.addEventListener('click', (e) => {
      e.preventDefault();

      // Scroll via Lenis
      const targetId = link.getAttribute('href').slice(1);
      const target   = document.getElementById(targetId);
      if (target) {
        lenis.scrollTo(target, { offset: -72, duration: 2.2, easing: expoOut });
      }

      // Active class
      navLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');

      // Move indicator INSTANTLY — scroll is already handling smooth movement
      moveIndicator(link, true);

      // Bounce the link text up then back
      gsap.fromTo(link,
        { y: 0 },
        { y: -3, duration: 0.12, ease: 'power2.out',
          onComplete: () => gsap.to(link, { y: 0, duration: 0.4, ease: 'elastic.out(1, 0.5)' })
        }
      );
    });
  });

  // Hover handled by CSS text glow only — indicator moves on click/scroll.

  // ── Scroll sync: keep indicator on current section ────────────────────────
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
        moveIndicator(l); // slide to new section
      }
    });
  });

  // ── Initial position on page load ─────────────────────────────────────────
  // Wait one frame so layout is settled, then snap to the first/active link
  requestAnimationFrame(() => {
    const firstLink = document.querySelector('.nav-links a') ;
    if (firstLink) {
      firstLink.classList.add('active');
      moveIndicator(firstLink, true);
    }
  });
  // ──────────────────────────────────────────────────────────────────────────

  // Basic Animation Sequence
  const tl = gsap.timeline();
  
  // Scene 0: Page Load Animations
  tl.fromTo('.vignette-overlay', { opacity: 0 }, { opacity: 1, duration: 1 })
    .fromTo('.hm-monogram path', 
      { strokeDasharray: 200, strokeDashoffset: 200 }, 
      { strokeDashoffset: 0, duration: 1.5, ease: 'power3.inOut' }, 
      "<0.3"
    )
    .fromTo('.site-nav', 
      { y: -100, opacity: 0, filter: 'blur(10px)' }, 
      { y: 0, opacity: 1, filter: 'blur(0px)', duration: 1, ease: 'power3.out' }, 
      "-=0.5"
    )
    .fromTo('.hero-ctas .btn', 
      { scale: 0.9, opacity: 0 }, 
      { scale: 1, opacity: 1, stagger: 0.2, duration: 0.8, ease: 'back.out(1.7)' }, 
      "-=0.5"
    );

  // ── VIEW MY WORK: 3D tilt + smooth scroll ──────────────────────────────────
  const viewWorkBtn = document.getElementById('btn-view-work');

  if (viewWorkBtn) {
    // 3D tilt
    viewWorkBtn.addEventListener('mousemove', (e) => {
      const rect = viewWorkBtn.getBoundingClientRect();
      const cx = rect.left + rect.width  / 2;
      const cy = rect.top  + rect.height / 2;
      const dx = (e.clientX - cx) / (rect.width  / 2); // -1 … 1
      const dy = (e.clientY - cy) / (rect.height / 2); // -1 … 1
      const maxTilt = 18; // degrees

      viewWorkBtn.style.setProperty('--rx', `${-dy * maxTilt}deg`);
      viewWorkBtn.style.setProperty('--ry', `${ dx * maxTilt}deg`);

      // Shine highlight follows cursor
      const bx = ((e.clientX - rect.left) / rect.width  * 100).toFixed(1);
      const by = ((e.clientY - rect.top)  / rect.height * 100).toFixed(1);
      viewWorkBtn.style.setProperty('--bx', `${bx}%`);
      viewWorkBtn.style.setProperty('--by', `${by}%`);
    });

    // Reset on mouse leave
    viewWorkBtn.addEventListener('mouseleave', () => {
      viewWorkBtn.style.setProperty('--rx', '0deg');
      viewWorkBtn.style.setProperty('--ry', '0deg');
    });

    // Smooth scroll to #projects via Lenis
    viewWorkBtn.addEventListener('click', () => {
      const target = document.getElementById('projects');
      if (target) {
        lenis.scrollTo(target, { offset: 0, duration: 2, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
      }
    });
  }
  // ──────────────────────────────────────────────────────────────────────────

  // Implement Parallax for Hero
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

  // ════════════════════════════════════════════════════════════
  // CASE STUDY MODAL
  // ════════════════════════════════════════════════════════════

  const csOverlay = document.getElementById('cs-overlay');
  const csModal   = document.getElementById('cs-modal');
  const csBody    = document.getElementById('cs-body');
  const csClose   = document.getElementById('cs-close');

  // ── Case study content data ────────────────────────────────
  const caseStudies = {

    'grocee-plus': {
      number: '01',  badge: 'FEATURED PROJECT',  title: 'Grocee Plus',
      tagline: 'A cross-platform grocery app I built in 4 weeks — a Silicon Valley company bought the code for $800, and it\'s now generating $500+ in monthly recurring revenue.',
      metrics: [
        { value: '$800',  label: 'Acquisition Price' },
        { value: '$500+', label: 'Monthly MRR' },
        { value: '4 wks', label: 'Time to Build' },
      ],
      sections: [
        { title: '⚡ The Problem',
          body: `Managing groceries with a family shouldn't require 17 WhatsApp messages, three forgotten items, and someone inevitably buying the wrong brand of yoghurt. Lists get duplicated. Budgets get ignored. Nobody knows what's already in the cart.<br><br>I built Grocee Plus to fix that for my own family — and what started as a personal weekend project quietly turned into a product someone paid real money for.` },
        { title: '🛠 What I Built',
          body: `<ul>
            <li>Cross-platform app (iOS &amp; Android) built with React Native</li>
            <li>Real-time family sharing — one shared list, synced across every member's device</li>
            <li>Link sharing — invite anyone without requiring them to create an account</li>
            <li>Smooth iOS-style transitions and physics-based animations throughout</li>
            <li>Payment requests — a family member can flag that they spent money on an item and request reimbursement</li>
            <li>Tiered subscription: Free (limited items) / $12/mo (30 items) / $28/mo (80 items)</li>
          </ul><br>Backend: <strong>Supabase</strong> for real-time data sync, <strong>Firebase</strong> for authentication. Version control on <strong>GitHub</strong>, deployed on <strong>Vercel</strong>. I used VS Code alongside Antigravity and Claude Code to accelerate the development cycle significantly.` },
        { title: '📈 The Outcome',
          body: `A small software company near Silicon Valley came across my APK demo online. They tested the UI, ran the app on a real device, and within 48 hours made an offer: <strong>$800 for the full codebase</strong>.<br><br>After some targeted Instagram marketing on their end, they've now crossed <strong>$500 in monthly recurring revenue</strong> — with a real subscriber base, real retention, and a product that solves a problem people actually have every week.` },
        { title: '💡 What This Means For You',
          body: `A well-built MVP with a real use case doesn't need a massive team or years of development. It needs to solve one problem clearly, look polished, and work reliably.<br><br>If you have an app idea — even one that sounds small — this is proof that it can become a genuine income stream. I specialise in taking ideas from concept to working product, fast. <em>Let's talk.</em>` },
      ],
      stack: ['React Native', 'Supabase', 'Firebase', 'Stripe', 'Vercel', 'GitHub'],
      ctaText: 'Have an app idea? I build MVPs that feel premium, launch quickly, and can be monetised from day one.',
    },

    'corporate-dashboard': {
      number: '02',  badge: 'ENTERPRISE',  title: 'Corporate Dashboard',
      tagline: 'A custom analytics platform that replaced 5 spreadsheets and saved a logistics company 6 hours every single week — delivered in 3 weeks, paid ₹1,00,000.',
      metrics: [
        { value: '$1.2k', label: 'Project Value' },
        { value: '6 hrs', label: 'Saved Per Week' },
        { value: '3 wks', label: 'Delivered In' },
      ],
      sections: [
        { title: '⚡ The Problem',
          body: `A growing logistics company in India was running their entire operations reporting across 5 different Excel files — emailed around on WhatsApp every Monday morning. By the time all five department heads had compared numbers and replied back, it was Tuesday and half the data was already outdated.<br><br>Their COO called it <em>"the weekly Excel nightmare."</em> It was consuming 6 hours of senior time every single week — time that could have been spent on actual decisions.` },
        { title: '🛠 What I Built',
          body: `<ul>
            <li>Role-based views — separate dashboard interfaces for management and warehouse operations teams</li>
            <li>Live shipment tracking widget, pulling real-time data via REST API from their existing logistics platform</li>
            <li>Revenue vs. cost heatmap with monthly trend lines and variance highlighting</li>
            <li>Individual team performance scorecards — KPI accountability at a glance</li>
            <li>Automated Monday morning email digest — system sends it at 7am, no manual action needed</li>
          </ul><br>Built with <strong>Next.js + TypeScript</strong> for the frontend, <strong>Recharts</strong> for all data visualisation, and REST API integration connecting to their existing tools. Deployed on <strong>Vercel</strong> with zero downtime during handover.` },
        { title: '📈 The Outcome',
          body: `Delivered in 6 weeks. <strong>Client paid ₹1,00,000 (~$1,200) for the full build.</strong><br><br>Weekly reporting time dropped from 6 hours to <strong>under 20 minutes</strong>. Twelve team members now use the dashboard daily — with no training documentation needed. The system simply made sense.<br><br>The COO's exact words during handover: <em>"This is the best investment we made this year."</em>` },
        { title: '💡 What This Means For You',
          body: `If your team is making decisions from spreadsheets sent via WhatsApp, you are losing money every single week. In saved hours. In delayed decisions. In avoidable mistakes.<br><br>A custom dashboard built for your specific workflow pays for itself within 30 days — not theoretically, but in actual recovered time and faster leadership decisions. <em>I can build yours.</em>` },
      ],
      stack: ['Next.js', 'TypeScript', 'Recharts', 'REST API', 'Tailwind', 'Vercel'],
      ctaText: 'Still on spreadsheets? A custom dashboard built for your workflow pays for itself in 30 days.',
    },

    'ai-saas': {
      number: '03',  badge: 'LIVE PRODUCT',  title: 'AI SaaS Platform',
      tagline: 'An AI content tool I built for myself that turned into a product — 3 paying customers and $87 MRR within 6 weeks, with zero advertising.',
      metrics: [
        { value: '$87',   label: 'MRR @ 6 Weeks' },
        { value: '0',     label: 'Ad Spend' },
        { value: '6 wks', label: 'To First Revenue' },
      ],
      sections: [
        { title: '⚡ The Problem',
          body: `I was spending 3+ hours a day writing captions, cold email sequences, repurposed blog content, and outreach scripts for client projects. The tasks were different. The process was identical. Every single day.<br><br>I built a tool to stop doing that manually. Then I realised about a hundred other people had the exact same problem and no great solution for it.` },
        { title: '🛠 What I Built',
          body: `<ul>
            <li>Brand voice profiles — the AI learns your tone, your style, your vocabulary. It doesn't write like a generic chatbot</li>
            <li>Bulk content generation: captions, cold emails, blog intros, ad copy, LinkedIn posts — all in your voice</li>
            <li>Team workspaces with role-based permissions</li>
            <li>Usage analytics — see exactly which content types are being used and what's performing</li>
            <li>Direct Notion export integration</li>
          </ul><br>Stack: <strong>Python + FastAPI</strong> backend, <strong>React</strong> frontend, <strong>OpenAI GPT-4 API</strong> for generation, <strong>PostgreSQL on Supabase</strong>, <strong>Stripe</strong> for usage-based billing. Multi-tenant architecture from day one — built to scale.` },
        { title: '📈 The Outcome',
          body: `Shared a private demo link in a small online community. <strong>3 paying customers within 6 weeks at $29/month — $87 MRR, zero paid advertising.</strong><br><br>One user cancelled their Jasper subscription the same day they signed up. Another told me it was the first time AI had written something in their actual voice.<br><br>The AI tools market is growing at 35% year on year. This product is early — which is exactly the right time to be in it.` },
        { title: '💡 What This Means For You',
          body: `Generic AI is everywhere. <em>Specific</em> AI — trained on a niche, solving one problem precisely, branded and subscription-ready — is rare and genuinely valuable right now.<br><br>Whether it's legal, medical, real estate, e-commerce, or any industry with repetitive content tasks, there is a product waiting to be built. I can build it, design it, and get it to paying customers. <em>Let's find your niche.</em>` },
      ],
      stack: ['Python', 'FastAPI', 'OpenAI GPT-4', 'React', 'PostgreSQL', 'Supabase', 'Stripe'],
      ctaText: 'The highest-margin software products right now are AI tools built for a specific problem. I build them fast.',
    },

    'federal-updates': {
      number: '04',  badge: 'LIVE SITE',  title: 'Federal Updates',
      tagline: 'A political news aggregator I built in 2 weeks — now hitting 8,000+ monthly visitors organically, ranking Page 1 on Google, with zero ad spend.',
      metrics: [
        { value: '8k+',   label: 'Monthly Visitors' },
        { value: 'Pg 1',  label: 'Google Ranking' },
        { value: '2 wks', label: 'Built In' },
      ],
      sections: [
        { title: '⚡ The Opportunity',
          body: `During the Trump 2.0 era, political news was either partisan and emotional, buried under pop-ups, or fragmented across 12 different impossible-to-navigate government sites. There was no clean, fast, neutral place to check executive orders, policy changes, and federal updates in one feed.<br><br>I gave myself 2 weeks to build that place. It now gets more monthly traffic than most agency-built sites that cost $30,000.` },
        { title: '🛠 What I Built',
          body: `<ul>
            <li>Next.js SSR site — server-side rendered for maximum SEO performance, indexed by Google within 48 hours</li>
            <li>Node.js RSS parser aggregating 12+ official government and trusted news feeds automatically</li>
            <li>Cron jobs updating content every 30 minutes — always fresh, never manual</li>
            <li>Category filtering: executive orders, immigration, economy, defence, healthcare</li>
            <li>Mobile-first design — sub-1 second load time on a 4G connection</li>
            <li>Auto-generated Open Graph metadata for every article — optimised for social sharing</li>
          </ul><br>Google Search Console verified and fully indexed within 48 hours of launch. Schema markup for news articles added from day one.` },
        { title: '📈 The Outcome',
          body: `<strong>8,000+ organic monthly visitors within 3 months of launch.</strong> No paid advertising. No backlink outreach. No PR campaigns.<br><br>Currently ranking on Page 1 of Google for multiple long-tail keywords around federal policy, executive orders, and US government news. The site grows every week on its own — exactly what SEO-first development is designed to do.` },
        { title: '💡 What This Means For You',
          body: `Content sites built with strong technical SEO foundations are compounding assets. Month 1 is quiet. Month 3 you start to notice. Month 6 you're getting traffic you didn't ask for.<br><br>This same model works for any niche — local news, legal updates, industry insights, crypto, real estate, sports. I can build, deploy, and optimise the entire SEO foundation in 2 weeks. <em>You own a site that grows while you sleep.</em>` },
      ],
      stack: ['Next.js', 'Node.js', 'RSS API', 'Vercel', 'Schema Markup', 'Google Search Console'],
      ctaText: 'Want a content site that ranks on Google and compounds over time? I build the whole thing — 2 weeks, start to live.',
    },
  };

  // ── Build HTML from data ───────────────────────────────────
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

  // ── Open modal ────────────────────────────────────────────
  function openCaseStudy(projectId) {
    const data = caseStudies[projectId];
    if (!data || !csOverlay) return;

    csBody.innerHTML = buildModalHTML(data);
    csModal.scrollTop = 0;

    // Show overlay, give pointer events
    gsap.set(csOverlay, { pointerEvents: 'all' });
    gsap.to(csOverlay, { opacity: 1, duration: 0.30, ease: 'power2.out' });

    // Card slides up with spring
    gsap.fromTo(csModal,
      { y: 80, scale: 0.92, opacity: 0 },
      { y: 0, scale: 1, opacity: 1, duration: 0.65, ease: 'expo.out', delay: 0.04 }
    );

    csOverlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    window.__lenis?.stop(); // freeze background scroll

    // CTA handled via delegation below (see csBody click listener)
  }

  // ── Close modal ───────────────────────────────────────────
  function closeCaseStudy() {
    gsap.to(csModal,   { y: 60, scale: 0.94, opacity: 0, duration: 0.32, ease: 'power3.in' });
    gsap.to(csOverlay, {
      opacity: 0, duration: 0.28, delay: 0.06,
      onComplete: () => {
        gsap.set(csOverlay, { pointerEvents: 'none' });
        csOverlay.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        window.__lenis?.start(); // resume background scroll
        csBody.innerHTML = '';
      }
    });
  }

  // ── Event listeners ───────────────────────────────────────
  csClose?.addEventListener('click', closeCaseStudy);
  csOverlay?.addEventListener('click', (e) => { if (e.target === csOverlay) closeCaseStudy(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeCaseStudy(); });

  // CTA button — event delegation handles dynamically injected content
  csBody?.addEventListener('click', (e) => {
    if (e.target.closest('#cs-contact-link')) {
      closeCaseStudy();
      // Wait for close animation to finish, then start Lenis + scroll
      setTimeout(() => {
        window.__lenis?.start();
        const target = document.getElementById('contact');
        if (target) window.__lenis?.scrollTo(target, { offset: -80, duration: 2.4 });
      }, 380);
    }
  });

  // Wire all [data-project] buttons
  document.querySelectorAll('[data-project]').forEach(btn => {
    btn.addEventListener('click', () => openCaseStudy(btn.dataset.project));
  });

  // ── SERVICE CARD EXPAND / COLLAPSE (in-place symmetric grow) ──────────────
  const serviceCards = document.querySelectorAll('.service-card');

  function closeAllDrawers() {
    serviceCards.forEach(c => {
      c.querySelector('.service-drawer').classList.remove('is-open');
      c.querySelector('.service-drawer').setAttribute('aria-hidden', 'true');
      c.querySelector('.service-explore-btn').setAttribute('aria-expanded', 'false');
      c.querySelector('.service-explore-btn').textContent = 'EXPLORE →';
      c.classList.remove('is-open');
    });
  }

  document.querySelectorAll('.service-explore-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const card   = btn.closest('.service-card');
      const drawer = card.querySelector('.service-drawer');
      const isOpen = drawer.classList.contains('is-open');

      closeAllDrawers();

      if (!isOpen) {
        drawer.classList.add('is-open');
        drawer.setAttribute('aria-hidden', 'false');
        btn.setAttribute('aria-expanded', 'true');
        btn.textContent = 'CLOSE ✕';
        card.classList.add('is-open');
      }
    });
  });

  // Click anywhere outside an open card → close it
  document.addEventListener('click', (e) => {
    const openCard = document.querySelector('.service-card.is-open');
    if (openCard && !openCard.contains(e.target)) closeAllDrawers();
  });

  // Escape → close
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeAllDrawers();
  });

  // ── CONTACT FORM — Web3Forms submission ──────────────────────────────────
  const contactForm = document.getElementById('contact-form');
  const formStatus  = document.getElementById('form-status');

  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const btn = contactForm.querySelector('#btn-send');
      const originalText = btn.textContent;
      btn.textContent = 'SENDING…';
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
          formStatus.textContent = "✅ Message sent! I'll get back to you soon.";
          formStatus.classList.add('success');
          contactForm.reset();
        } else {
          formStatus.textContent = '❌ Something went wrong. Please try again.';
          formStatus.classList.add('error');
        }
      } catch (err) {
        formStatus.textContent = '❌ Network error. Please check your connection.';
        formStatus.classList.add('error');
      }

      btn.textContent = originalText;
      btn.disabled = false;
    });
  }

});

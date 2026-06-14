import SplitType from 'split-type';
import gsap from 'gsap';

export function initPreText() {
  // ── Hero Title — Cinematic Staggered Reveal ──────────────────────────
  const heroName = document.getElementById('hero-name');
  if (heroName && window.PreText) {
    new window.PreText(heroName, {
      effect: 'scramble',
      duration: 1400,
      characters: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*',
      trigger: 'load',
    });
  } else if (heroName) {
    // Fallback: manual stagger with GSAP
    const split = new SplitType('#hero-name', { types: 'chars' });
    gsap.fromTo(split.chars,
      { opacity: 0, y: 50, rotationX: -90, filter: 'blur(8px)' },
      {
        opacity: 1, y: 0, rotationX: 0, filter: 'blur(0px)',
        duration: 0.6, stagger: 0.03, ease: 'back.out(1.4)',
        delay: 0.3
      }
    );
  }

  // ── Role Morph — Enhanced with blur transition ───────────────────────
  const roleEl = document.getElementById('hero-role');
  if (roleEl && window.PreText) {
    new window.PreText(roleEl, {
      effect: 'morph',
      words: [
        'Full-Stack Developer',
        'App Entrepreneur',
        'Creative Technologist',
        'Digital Architect',
        'Business Builder',
      ],
      interval: 3000,
      morphDuration: 800,
    });
  } else if (roleEl) {
    // Fallback: simple word cycling
    const words = [
      'Full-Stack Developer',
      'App Entrepreneur',
      'Creative Technologist',
      'Digital Architect',
      'Business Builder',
    ];
    let idx = 0;
    setInterval(() => {
      gsap.to(roleEl, {
        opacity: 0, y: -10, filter: 'blur(4px)',
        duration: 0.3,
        onComplete: () => {
          idx = (idx + 1) % words.length;
          roleEl.textContent = words[idx];
          gsap.fromTo(roleEl,
            { opacity: 0, y: 10, filter: 'blur(4px)' },
            { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.4 }
          );
        }
      });
    }, 3000);
  }

  // ── About Wave Effect ────────────────────────────────────────────────
  const aboutHeadline = document.getElementById('about-headline');
  if (aboutHeadline && window.PreText) {
    new window.PreText(aboutHeadline, {
      effect: 'wave',
      amplitude: 10,
      frequency: 0.35,
      trigger: 'scroll',
      triggerOffset: '80%',
    });
  }

  // ── Ghost Text Parallax on Section Titles ────────────────────────────
  const ghostTexts = document.querySelectorAll('.ghost-heading, .ghost-text-bg');
  ghostTexts.forEach(el => {
    gsap.to(el, {
      xPercent: -5,
      ease: 'none',
      scrollTrigger: {
        trigger: el,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1,
      }
    });
  });

  // ── Section Number Animations ────────────────────────────────────────
  const monoLabels = document.querySelectorAll('.mono-label');
  monoLabels.forEach(label => {
    gsap.fromTo(label,
      { opacity: 0, x: -20 },
      {
        opacity: 1, x: 0,
        duration: 0.8, ease: 'power3.out',
        scrollTrigger: {
          trigger: label,
          start: 'top 85%',
          toggleActions: 'play none none reverse'
        }
      }
    );
  });
}

// Handles Typography and PreText logic
import SplitType from 'split-type';

export function initPreText() {
  // We use PreText if it's available via CDN (window.PreText), otherwise fallback to SplitType
  
  if (window.PreText) {
    // 1. Hero Title Scramble
    const heroName = document.getElementById('hero-name');
    if (heroName) {
      new window.PreText(heroName, {
        effect: 'scramble',
        duration: 1200,
        characters: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$',
        trigger: 'load',
      });
    }

    // 2. Role Morph
    const roleEl = document.getElementById('hero-role');
    if (roleEl) {
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
        morphDuration: 700,
      });
    }

    // 3. About Wave
    const aboutHeadline = document.getElementById('about-headline');
    if (aboutHeadline) {
      new window.PreText(aboutHeadline, {
        effect: 'wave',
        amplitude: 8,
        frequency: 0.4,
        trigger: 'scroll',
        triggerOffset: '80%',
      });
    }
  } else {
    // Fallback using SplitType + GSAP built into Main if needed
    console.warn("PreText not found on window. Ensure CDN is loaded.");
    const heroTitle = new SplitType('#hero-name', { types: 'chars' });
  }
}

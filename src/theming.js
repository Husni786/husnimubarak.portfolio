import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export function initTheming() {
  const themePhases = [
    { bg: [15,15,15],     text: [232,228,223], accent: [200,149,108] },  // Void
    { bg: [18,18,18],     text: [228,224,219], accent: [190,140,100] },  // Dusk
    { bg: [22,20,18],     text: [220,216,211], accent: [180,130,95] },   // Dawn
    { bg: [26,26,26],     text: [210,206,201], accent: [170,120,90] },   // Morning
    { bg: [30,28,26],     text: [200,196,191], accent: [160,110,85] },   // Noon
  ];

  const rootStyles = document.documentElement.style;
  const progressLine = document.querySelector('.scroll-progress-line');

  ScrollTrigger.create({
    trigger: 'body',
    start: 'top top',
    end: 'bottom bottom',
    onUpdate: (self) => {
      const progress = self.progress; // 0 to 1
      
      // Update Scroll Line
      if (progressLine) {
        progressLine.style.height = `${progress * 100}%`;
      }

      const phaseRaw = progress * 4; // 0 to 4 (5 phases)
      const phaseIndex = Math.min(Math.floor(phaseRaw), 3);
      const phaseProgress = phaseRaw % 1;
      
      const from = themePhases[phaseIndex];
      const to = themePhases[phaseIndex + 1];

      if (!from || !to) return;

      const lerp = (a, b, t) => Math.round(a + (b - a) * t);
      const lerpColor = (a, b, t) => a.map((v, i) => lerp(v, b[i], t));

      const bg = lerpColor(from.bg, to.bg, phaseProgress);
      const text = lerpColor(from.text, to.text, phaseProgress);
      const accent = lerpColor(from.accent, to.accent, phaseProgress);

      rootStyles.setProperty('--bg-void', `rgb(${bg[0]}, ${bg[1]}, ${bg[2]})`);
      rootStyles.setProperty('--text-primary', `rgb(${text[0]}, ${text[1]}, ${text[2]})`);
      rootStyles.setProperty('--signal-start', `rgb(${accent[0]}, ${accent[1]}, ${accent[2]})`);
    }
  });
}

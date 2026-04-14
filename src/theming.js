import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export function initTheming() {
  const themePhases = [
    { bg: [6,6,8],       text: [240,240,245], accent: [102,126,234] },  // Void
    { bg: [15,15,26],    text: [224,223,245], accent: [130,100,240] },  // Dusk
    { bg: [30,21,53],    text: [212,207,240], accent: [160,80,220] },   // Dawn
    { bg: [245,240,255], text: [26,18,40],    accent: [100,80,200] },   // Morning
    { bg: [255,255,255], text: [13,13,18],    accent: [80,60,180] },    // Noon
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

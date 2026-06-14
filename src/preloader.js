import gsap from 'gsap';

export function initPreloader() {
  return new Promise((resolve) => {
    const overlay = document.getElementById('preloader');
    if (!overlay) { resolve(); return; }

    const monogram = overlay.querySelector('.pl-monogram');
    const letters = overlay.querySelectorAll('.pl-letter');
    const tagline = overlay.querySelector('.pl-tagline');
    const progressFill = overlay.querySelector('.pl-progress-fill');
    const progressGlow = overlay.querySelector('.pl-progress-glow');

    const tl = gsap.timeline({
      onComplete: () => {
        gsap.to(overlay, {
          opacity: 0,
          duration: 0.6,
          ease: 'power2.inOut',
          onComplete: () => {
            overlay.style.display = 'none';
            overlay.style.pointerEvents = 'none';
            resolve();
          }
        });
      }
    });

    // Phase 1: Monogram draw-in
    tl.fromTo(monogram,
      { opacity: 0, scale: 0.5, rotation: -10 },
      { opacity: 1, scale: 1, rotation: 0, duration: 0.8, ease: 'back.out(1.7)' }
    );

    // Phase 2: Letters stagger in with 3D flip
    tl.fromTo(letters,
      { opacity: 0, y: 40, rotationX: -90, filter: 'blur(8px)' },
      {
        opacity: 1, y: 0, rotationX: 0, filter: 'blur(0px)',
        duration: 0.5, stagger: 0.04, ease: 'back.out(1.4)'
      },
      '-=0.3'
    );

    // Phase 3: Tagline fade in
    tl.fromTo(tagline,
      { opacity: 0, y: 10 },
      { opacity: 0.6, y: 0, duration: 0.5, ease: 'power2.out' },
      '-=0.2'
    );

    // Phase 4: Progress bar fill
    tl.to(progressFill, {
      width: '100%',
      duration: 1.2,
      ease: 'power2.inOut',
    }, '-=0.3');

    tl.to(progressGlow, {
      opacity: 1,
      duration: 0.3,
    }, '-=0.8');

    // Phase 5: Exit - letters scatter
    tl.to(letters, {
      opacity: 0,
      y: -30,
      rotationX: 90,
      filter: 'blur(6px)',
      duration: 0.35,
      stagger: 0.02,
      ease: 'power2.in'
    }, '+=0.2');

    tl.to(tagline, {
      opacity: 0,
      y: -15,
      duration: 0.25,
      ease: 'power2.in'
    }, '-=0.25');

    tl.to(monogram, {
      scale: 1.3,
      opacity: 0,
      duration: 0.4,
      ease: 'power2.in'
    }, '-=0.2');
  });
}

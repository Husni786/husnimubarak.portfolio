import gsap from 'gsap';

export function initProjects() {
  const cards = document.querySelectorAll('.project-card');

  cards.forEach(card => {
    let bounds;

    card.addEventListener('mouseenter', () => {
      bounds = card.getBoundingClientRect();

      const h3 = card.querySelector('h3');
      if (h3) {
        gsap.to(h3, {
          textShadow: "2px 0 0 #c76f5b, -2px 0 0 #c8956c, 0 0 20px rgba(200,149,108,0.4)",
          duration: 0.1,
          yoyo: true,
          repeat: 5,
          onComplete: () => {
            gsap.to(h3, { textShadow: "0 1px 0 hsl(0 0% 100% / 0.40)", duration: 0.15 });
          }
        });
      }
    });

    card.addEventListener('mousemove', (e) => {
      if (!bounds) return;

      const cx = bounds.left + bounds.width / 2;
      const cy = bounds.top + bounds.height / 2;
      const dx = (e.clientX - cx) / (bounds.width / 2);
      const dy = (e.clientY - cy) / (bounds.height / 2);

      const maxTilt = 8;
      const rotateX = -dy * maxTilt;
      const rotateY = dx * maxTilt;

      gsap.to(card, {
        rotateX: rotateX,
        rotateY: rotateY,
        transformPerspective: 800,
        duration: 0.4,
        ease: 'power2.out',
      });

      const bx = ((e.clientX - bounds.left) / bounds.width * 100).toFixed(1);
      const by = ((e.clientY - bounds.top) / bounds.height * 100).toFixed(1);
      card.style.setProperty('--glow-x', `${bx}%`);
      card.style.setProperty('--glow-y', `${by}%`);
    });

    card.addEventListener('mouseleave', () => {
      gsap.to(card, {
        rotateX: 0,
        rotateY: 0,
        duration: 0.6,
        ease: 'elastic.out(1, 0.6)',
      });
      card.style.removeProperty('--glow-x');
      card.style.removeProperty('--glow-y');
    });
  });
}

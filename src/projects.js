import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export function initProjects() {
  const container = document.querySelector('.projects-section');
  const rail = document.querySelector('.projects-rail');

  if (!container || !rail) return;

  // Calculate the amount to scroll horizontally
  function getScrollAmount() {
    let railWidth = rail.scrollWidth;
    return -(railWidth - window.innerWidth);
  }

  // Pin the section and move rail horizontally
  const tween = gsap.to(rail, {
    x: getScrollAmount,
    ease: "none"
  });

  ScrollTrigger.create({
    trigger: container,
    start: "top top",
    end: () => `+=${getScrollAmount() * -1}`,
    pin: true,
    animation: tween,
    scrub: 1,
    invalidateOnRefresh: true
  });
  
  // Per-card dynamic glitch effect on hover
  const cards = document.querySelectorAll('.project-card');
  cards.forEach(card => {
    card.addEventListener('mouseenter', () => {
      // Small manual glitch text-shadow
      gsap.to(card.querySelector('h3'), {
        textShadow: "2px 0 0 red, -2px 0 0 blue", // simplified static glitch CSS approximation
        duration: 0.1,
        yoyo: true,
        repeat: 3,
        onComplete: () => {
          gsap.to(card.querySelector('h3'), { textShadow: "none", duration: 0.1 });
        }
      });
    });
  });
}

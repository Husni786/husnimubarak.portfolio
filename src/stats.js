/**
 * stats.js — Enhanced scroll-triggered stat animations with glow effects
 */

const easeOutExpo = (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));
const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

function animateCounter(el, target, suffix = '', duration = 1800) {
  const start = performance.now();
  const step = (now) => {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const value = Math.round(easeOutExpo(progress) * target);
    el.textContent = value + suffix;
    if (progress < 1) requestAnimationFrame(step);
    else el.textContent = target + suffix;
  };
  requestAnimationFrame(step);
}

function animateSlot(reelEl, target = 700, duration = 2400) {
  const SPIN_ROUNDS = 18;
  const numbers = [];
  for (let i = 0; i < SPIN_ROUNDS; i++) {
    numbers.push(Math.floor(Math.random() * (target + 200)));
  }
  const landing = [target + 150, target + 80, target + 40, target + 15, target + 5, target];
  numbers.push(...landing);
  numbers.push(target);

  reelEl.innerHTML = '';
  numbers.forEach(n => {
    const span = document.createElement('span');
    span.textContent = n;
    reelEl.appendChild(span);
  });

  const totalSteps = numbers.length - 1;
  const start = performance.now();
  let lastStep = -1;

  const step = (now) => {
    const elapsed = now - start;
    const raw = elapsed / duration;

    if (raw >= 1) {
      const finalY = -(totalSteps);
      reelEl.style.transform = `translateY(${finalY}em)`;
      reelEl.style.transition = 'none';
      return;
    }

    let currentStep;
    if (raw < 0.65) {
      currentStep = Math.floor((raw / 0.65) * SPIN_ROUNDS);
    } else {
      const phase2 = (raw - 0.65) / 0.35;
      const eased = easeOutCubic(phase2);
      currentStep = SPIN_ROUNDS + Math.floor(eased * (landing.length));
    }

    currentStep = Math.min(currentStep, totalSteps);

    if (currentStep !== lastStep) {
      lastStep = currentStep;
      reelEl.style.transition = 'transform 0.07s linear';
      reelEl.style.transform = `translateY(-${currentStep}em)`;
    }

    requestAnimationFrame(step);
  };

  requestAnimationFrame(step);
}

export function initStats() {
  const counters = document.querySelectorAll('.counter[data-target]');
  const slotReel = document.getElementById('slot-reel');
  if (!counters.length && !slotReel) return;

  const container = document.querySelector('.about-stats-container');
  if (!container) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Add glow pulse to stat boxes
        const statBoxes = container.querySelectorAll('.stat-box');
        statBoxes.forEach((box, i) => {
          setTimeout(() => {
            box.classList.add('stat-glow');
            setTimeout(() => box.classList.remove('stat-glow'), 1200);
          }, i * 200);
        });

        counters.forEach(el => {
          const target = parseInt(el.dataset.target, 10);
          const suffix = el.dataset.suffix || '';
          el.textContent = '0' + suffix;
          animateCounter(el, target, suffix);
        });

        if (slotReel) {
          setTimeout(() => animateSlot(slotReel, 700, 2400), 300);
        }
      }
    });
  }, { threshold: 0.3 });

  observer.observe(container);
}

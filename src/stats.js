/**
 * stats.js — Scroll-triggered stat animations
 *
 * • .counter[data-target][data-suffix]  → smooth ease-out count-up
 * • #slot-reel                          → casino-style vertical slot spin to 700
 */

// ── Easing ────────────────────────────────────────────────────────────────────
const easeOutExpo = (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));
const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

// ── Generic count-up ──────────────────────────────────────────────────────────
function animateCounter(el, target, suffix = '', duration = 1800) {
  const start = performance.now();
  const step = (now) => {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const value = Math.round(easeOutExpo(progress) * target);
    el.textContent = value + suffix;
    if (progress < 1) requestAnimationFrame(step);
    else el.textContent = target + suffix; // guarantee exact final value
  };
  requestAnimationFrame(step);
}

// ── Casino slot machine ────────────────────────────────────────────────────────
function animateSlot(reelEl, target = 700, duration = 2400) {
  // Build reel: rapid random digits then decelerate to target
  // Strategy: animate a long vertical strip of numbers, each 1em tall.
  // We pre-fill the strip with random intermediate values, then the final target.
  const SPIN_ROUNDS = 18;        // how many fake numbers spin before settling
  const numbers = [];

  // Fast spin phase: random numbers
  for (let i = 0; i < SPIN_ROUNDS; i++) {
    numbers.push(Math.floor(Math.random() * (target + 200)));
  }
  // Final deceleration: approach from slightly above (landing sequence)
  const landing = [target + 150, target + 80, target + 40, target + 15, target + 5, target];
  numbers.push(...landing);
  numbers.push(target); // final settled value

  // Populate DOM
  reelEl.innerHTML = '';
  numbers.forEach(n => {
    const span = document.createElement('span');
    span.textContent = n;
    reelEl.appendChild(span);
  });

  // Total reel height in "em units" = numbers.length items * 1em each
  // We want to scroll from top (translateY = 0) to last item
  const totalSteps = numbers.length - 1;

  // Use requestAnimationFrame for variable-speed spin
  const start = performance.now();
  let lastStep = -1;

  const step = (now) => {
    const elapsed = now - start;
    const raw = elapsed / duration; // 0→1 over duration

    if (raw >= 1) {
      // Settle exactly on target
      const finalY = -(totalSteps); // in em
      reelEl.style.transform = `translateY(${finalY}em)`;
      reelEl.style.transition = 'none';
      return;
    }

    // During fast phase use linear; towards end use easeOutCubic per-step
    // We treat the spin in two phases:
    // Phase 1 (0–0.65): fast linear spin through random numbers
    // Phase 2 (0.65–1): slow deceleration to final landing numbers
    let currentStep;
    if (raw < 0.65) {
      // Linear through SPIN_ROUNDS items
      currentStep = Math.floor((raw / 0.65) * SPIN_ROUNDS);
    } else {
      // Ease into landing sequence
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

// ── Intersection Observer: fire animations when stats enter view ────────────
export function initStats() {
  const counters = document.querySelectorAll('.counter[data-target]');
  const slotReel = document.getElementById('slot-reel');

  if (!counters.length && !slotReel) return;

  // Use one observer on the stats container
  const container = document.querySelector('.about-stats-container');
  if (!container) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // 1. Count-up counters — replay from 0 each time
        counters.forEach(el => {
          const target = parseInt(el.dataset.target, 10);
          const suffix = el.dataset.suffix || '';
          el.textContent = '0' + suffix; // reset visually before re-animating
          animateCounter(el, target, suffix);
        });

        // 2. Slot machine — rebuild reel and spin again
        if (slotReel) {
          setTimeout(() => animateSlot(slotReel, 700, 2400), 300);
        }
      }
    });
  }, { threshold: 0.3 });

  observer.observe(container);
}

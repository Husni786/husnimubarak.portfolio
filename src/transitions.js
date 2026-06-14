import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export function initTransitions() {
  // ── Section Reveal Animations ──────────────────────────────────────
  // Each section content staggers in when it enters the viewport

  // Hero section - already handled by main.js timeline

  // About section
  const aboutReveal = document.querySelector('.about-section');
  if (aboutReveal) {
    gsap.fromTo(aboutReveal.querySelector('#about-headline'),
      { opacity: 0, y: 60, filter: 'blur(8px)' },
      {
        opacity: 1, y: 0, filter: 'blur(0px)',
        duration: 1, ease: 'power3.out',
        scrollTrigger: {
          trigger: aboutReveal,
          start: 'top 75%',
          toggleActions: 'play none none reverse'
        }
      }
    );

    gsap.fromTo(aboutReveal.querySelectorAll('.stat-box'),
      { opacity: 0, y: 40, scale: 0.9 },
      {
        opacity: 1, y: 0, scale: 1,
        duration: 0.7, stagger: 0.15, ease: 'back.out(1.4)',
        scrollTrigger: {
          trigger: aboutReveal.querySelector('.about-stats-container'),
          start: 'top 85%',
          toggleActions: 'play none none reverse'
        }
      }
    );
  }

  // Services section — sticky stack handled by CSS, just animate the heading
  const servicesSection = document.querySelector('.services-section');
  if (servicesSection) {
    gsap.fromTo(servicesSection.querySelector('.ghost-heading'),
      { opacity: 0, x: -80, filter: 'blur(6px)' },
      {
        opacity: 1, x: 0, filter: 'blur(0px)',
        duration: 1, ease: 'power3.out',
        scrollTrigger: {
          trigger: servicesSection,
          start: 'top 70%',
          toggleActions: 'play none none reverse'
        }
      }
    );
  }

  // Projects section — sticky stack handled by CSS, just animate the intro
  const projectsSection = document.querySelector('.projects-section');
  if (projectsSection) {
    gsap.fromTo(projectsSection.querySelector('.project-intro'),
      { opacity: 0, x: -60 },
      {
        opacity: 1, x: 0,
        duration: 0.8, ease: 'power3.out',
        scrollTrigger: {
          trigger: projectsSection,
          start: 'top 60%',
          toggleActions: 'play none none reverse'
        }
      }
    );
  }

  // Skills section
  const skillsSection = document.querySelector('.skills-section');
  if (skillsSection) {
    gsap.fromTo(skillsSection.querySelector('.skill-name'),
      { opacity: 0, y: 50, filter: 'blur(6px)' },
      {
        opacity: 1, y: 0, filter: 'blur(0px)',
        duration: 1, ease: 'power3.out',
        scrollTrigger: {
          trigger: skillsSection,
          start: 'top 70%',
          toggleActions: 'play none none reverse'
        }
      }
    );
  }

  // Contact section
  const contactSection = document.querySelector('.contact-section');
  if (contactSection) {
    gsap.fromTo(contactSection.querySelector('.ghost-text-bg'),
      { opacity: 0, x: 80, filter: 'blur(6px)' },
      {
        opacity: 1, x: 0, filter: 'blur(0px)',
        duration: 1, ease: 'power3.out',
        scrollTrigger: {
          trigger: contactSection,
          start: 'top 70%',
          toggleActions: 'play none none reverse'
        }
      }
    );

    gsap.fromTo(contactSection.querySelector('.contact-box'),
      { opacity: 0, y: 50, scale: 0.97 },
      {
        opacity: 1, y: 0, scale: 1,
        duration: 0.9, ease: 'power3.out',
        scrollTrigger: {
          trigger: contactSection.querySelector('.contact-box'),
          start: 'top 85%',
          toggleActions: 'play none none reverse'
        }
      }
    );
  }

  // ── Floating Section Breadcrumbs ───────────────────────────────────
  const breadcrumbs = document.getElementById('section-breadcrumbs');
  if (breadcrumbs) {
    const items = breadcrumbs.querySelectorAll('.bc-item');
    const sectionIds = ['hero', 'about', 'services', 'projects', 'skills', 'contact'];

    sectionIds.forEach((id, i) => {
      const section = document.getElementById(id);
      if (!section || !items[i]) return;

      ScrollTrigger.create({
        trigger: section,
        start: 'top center',
        end: 'bottom center',
        onToggle: (self) => {
          if (self.isActive) {
            items.forEach((item, j) => {
              item.classList.toggle('active', j === i);
            });
          }
        }
      });
    });
  }

  // ── Enhanced Scroll Progress with Section Markers ──────────────────
  const progressLine = document.querySelector('.scroll-progress-line');
  const progressGlow = document.querySelector('.scroll-progress-glow');

  if (progressLine) {
    ScrollTrigger.create({
      trigger: 'body',
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        const p = self.progress;
        progressLine.style.height = `${p * 100}%`;
        if (progressGlow) {
          progressGlow.style.height = `${p * 100}%`;
        }
      }
    });
  }
}

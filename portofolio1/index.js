'use strict';

/* PARTICLES */
(() => {
  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  let width = 0;
  let height = 0;
  let particles = [];
  let animationId = null;
  const mouse = { x: null, y: null };
  const colors = ['0,245,255', '123,47,255', '255,45,120'];
  const particleCount = window.innerWidth < 600 ? 40 : 80;

  const random = (min, max) => Math.random() * (max - min) + min;

  function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    width = rect.width;
    height = rect.height;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function createParticles() {
    particles = Array.from({ length: particleCount }, () => ({
      x: random(0, 1),
      y: random(0, 1),
      vx: random(-0.08, 0.08),
      vy: random(-0.08, 0.08),
      radius: random(1, 2.5),
      alpha: random(0.2, 0.7)
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);

    particles.forEach((particle, index) => {
      particle.x += particle.vx * 0.003;
      particle.y += particle.vy * 0.003;

      if (particle.x < 0) particle.x = 1;
      if (particle.x > 1) particle.x = 0;
      if (particle.y < 0) particle.y = 1;
      if (particle.y > 1) particle.y = 0;

      const x = particle.x * width;
      const y = particle.y * height;

      if (mouse.x !== null && mouse.y !== null) {
        const dx = x - mouse.x;
        const dy = y - mouse.y;
        const distance = Math.hypot(dx, dy);

        if (distance > 0 && distance < 100) {
          particle.x += (dx / distance) * 0.0012;
          particle.y += (dy / distance) * 0.0012;
        }
      }

      ctx.beginPath();
      ctx.arc(x, y, particle.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${colors[index % colors.length]},${particle.alpha})`;
      ctx.fill();

      for (let j = index + 1; j < particles.length; j++) {
        const other = particles[j];
        const otherX = other.x * width;
        const otherY = other.y * height;
        const distance = Math.hypot(x - otherX, y - otherY);

        if (distance < 140) {
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(otherX, otherY);
          ctx.strokeStyle = `rgba(0,245,255,${0.07 * (1 - distance / 140)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    });

    animationId = requestAnimationFrame(draw);
  }

  // Event listener dipasang pada elemen hero/parent agar dapat menangkap event mouse
  // meskipun canvas dikonfigurasi dengan `pointer-events: none`.
  const heroSection = document.getElementById('hero') || canvas.parentElement;

  if (heroSection) {
    heroSection.addEventListener('pointermove', (event) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = event.clientX - rect.left;
      mouse.y = event.clientY - rect.top;
    });

    heroSection.addEventListener('pointerleave', () => {
      mouse.x = null;
      mouse.y = null;
    });
  }

  window.addEventListener('resize', resizeCanvas);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (animationId !== null) cancelAnimationFrame(animationId);
      animationId = null;
    } else if (animationId === null) {
      draw();
    }
  });

  resizeCanvas();
  createParticles();
  draw();
})();

/* COUNTER ANIMATION */
function animateCounters() {
  document.querySelectorAll('[data-count]').forEach((element) => {
    if (element.dataset.animated === 'true') return;

    const target = Number.parseInt(element.dataset.count, 10);
    if (!Number.isFinite(target) || target < 0) return;

    element.dataset.animated = 'true';
    const duration = 1200;
    const startTime = performance.now();

    function updateCounter(now) {
      const progress = Math.min((now - startTime) / duration, 1);
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      element.textContent = `${Math.round(target * easedProgress)}+`;

      if (progress < 1) requestAnimationFrame(updateCounter);
    }

    requestAnimationFrame(updateCounter);
  });
}

/* REVEAL ANIMATION */
const fadeElements = document.querySelectorAll('.fade-in');

if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      entry.target.classList.add('visible');
      entry.target.querySelectorAll('.skill-fill').forEach((bar) => {
        const width = bar.style.getPropertyValue('--w').trim();
        if (width) bar.style.transform = `scaleX(${Number.parseFloat(width)})`;
        bar.classList.add('animated');
      });

      observer.unobserve(entry.target);
    });
  }, { threshold: 0.1 });

  fadeElements.forEach((element) => revealObserver.observe(element));
} else {
  fadeElements.forEach((element) => element.classList.add('visible'));
}

/* HERO COUNTERS */
const hero = document.getElementById('hero');

if (hero && 'IntersectionObserver' in window) {
  const counterObserver = new IntersectionObserver((entries, observer) => {
    if (entries.some((entry) => entry.isIntersecting)) {
      animateCounters();
      observer.disconnect();
    }
  }, { threshold: 0.3 });

  counterObserver.observe(hero);
} else {
  animateCounters();
}

/* MOBILE MENU */
const menuButton = document.getElementById('menuBtn');
const mobileMenu = document.getElementById('mobileMenu');
const closeButton = document.getElementById('menuClose');

function openMobileMenu() {
  if (!mobileMenu || !menuButton) return;
  mobileMenu.classList.add('open');
  menuButton.setAttribute('aria-expanded', 'true');
}

function closeMobile() {
  if (!mobileMenu || !menuButton) return;
  mobileMenu.classList.remove('open');
  menuButton.setAttribute('aria-expanded', 'false');
}

if (menuButton) menuButton.addEventListener('click', openMobileMenu);
if (closeButton) closeButton.addEventListener('click', closeMobile);

if (mobileMenu) {
  mobileMenu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeMobile);
  });
}

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeMobile();
});

/* CONTACT FORM
   Menggunakan mailto. Ganti alamat di bawah dengan email aktif.
   Untuk pengiriman tanpa aplikasi email, diperlukan backend/API. */
const contactForm = document.querySelector('.contact-form');
const contactEmail = 'revaldi@email.com';

if (contactForm) {
  contactForm.addEventListener('submit', (event) => {
    event.preventDefault();

    if (!contactForm.reportValidity()) return;

    const name = contactForm.querySelector('[name="name"]')?.value.trim() || '';
    const email = contactForm.querySelector('[name="email"]')?.value.trim() || '';
    const message = contactForm.querySelector('[name="message"]')?.value.trim() || '';

    const subject = encodeURIComponent(`Pesan portfolio dari ${name}`);
    const body = encodeURIComponent(
      `Nama: ${name}\nEmail: ${email}\n\nPesan:\n${message}`
    );

    const mailtoUrl = `mailto:${contactEmail}?subject=${subject}&body=${body}`;
    window.location.href = mailtoUrl;
  });
}

/* NAV SCROLL COMPACT */
const nav = document.querySelector('nav');

function updateNavOnScroll() {
  if (!nav) return;
  nav.classList.toggle('scrolled', window.scrollY > 50);
}

window.addEventListener('scroll', updateNavOnScroll, { passive: true });
updateNavOnScroll();

/* SKILL BAR TARGET */
document.querySelectorAll('.skill-fill').forEach((bar) => {
  const width = Number.parseFloat(bar.style.getPropertyValue('--w'));
  if (Number.isFinite(width)) {
    bar.style.setProperty('--target', String(Math.max(0, Math.min(width, 1))));
  }
});

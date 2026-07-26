/* Ruales Vélez — main.js */

const header    = document.getElementById('site-header');
const navToggle = document.getElementById('nav-toggle');
const navMenu   = document.getElementById('nav-menu');
const backToTop = document.getElementById('back-to-top');

/* ===== SCROLL ===== */
window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 20);
  backToTop.toggleAttribute('hidden', window.scrollY <= 400);
  highlightNav();
}, { passive: true });

/* ===== NAV ACTIVO ===== */
function highlightNav() {
  const sections = document.querySelectorAll('section[id], div[id]');
  const links    = document.querySelectorAll('.nav-link');
  let current    = '';
  sections.forEach(sec => { if (sec.offsetTop - 100 <= window.scrollY) current = sec.id; });
  links.forEach(link => link.classList.toggle('active', link.getAttribute('href') === `#${current}`));
}

/* ===== MENÚ HAMBURGUESA ===== */
navToggle.addEventListener('click', () => {
  const open = navMenu.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', open);
});
navMenu.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    navMenu.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  });
});
document.addEventListener('click', e => {
  if (!header.contains(e.target)) {
    navMenu.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  }
});

/* ===== VOLVER ARRIBA ===== */
backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

/* ===== SMOOTH SCROLL CON OFFSET ===== */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const id = anchor.getAttribute('href');
    if (!id || id === '#') return;
    const target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    const headerH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 72;
    window.scrollTo({ top: target.offsetTop - headerH, behavior: 'smooth' });
  });
});

/* ===== ANIMACIONES DE ENTRADA ===== */
const animTargets = document.querySelectorAll(
  '.service-card, .value-item, .process-step, .about-col, .process-col, .contact-cta, .contact-info, .section-header'
);
animTargets.forEach(el => el.classList.add('fade-in'));

const fadeObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('visible'), i * 70);
      fadeObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });
animTargets.forEach(el => fadeObserver.observe(el));

/* ===== SLIDER ANTES/DESPUÉS ===== */
class BASlider {
  constructor(card) {
    this.card    = card;
    this.target  = 50;
    this.current = 50;
    this.running = false;
    this.hinted  = false;

    card.addEventListener('mouseenter',  () => this.start());
    card.addEventListener('mousemove',   e  => this.onMove(e));
    card.addEventListener('mouseleave',  () => { this.target = 50; });
    card.addEventListener('touchmove',   e  => this.onTouch(e), { passive: true });
    card.addEventListener('touchstart',  () => this.start(), { passive: true });
  }

  onMove(e) {
    const r = this.card.getBoundingClientRect();
    this.target = Math.max(3, Math.min(97, ((e.clientX - r.left) / r.width) * 100));
  }

  onTouch(e) {
    const r = this.card.getBoundingClientRect();
    this.target = Math.max(3, Math.min(97, ((e.touches[0].clientX - r.left) / r.width) * 100));
    this.start();
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.tick();
  }

  tick() {
    this.current += (this.target - this.current) * 0.1;   // factor lerp
    this.card.style.setProperty('--split', this.current.toFixed(2) + '%');

    if (Math.abs(this.target - this.current) < 0.05) {
      this.current = this.target;
      this.card.style.setProperty('--split', this.current + '%');
      this.running = false;
      return;
    }
    requestAnimationFrame(() => this.tick());
  }
}

/* Hint de entrada: anima la primera vez que la tarjeta entra en viewport */
const baCards = document.querySelectorAll('.project-card');
baCards.forEach(card => new BASlider(card));

const hintObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => {
        entry.target.classList.add('ba-hint');
        entry.target.addEventListener('animationend', () => {
          entry.target.classList.remove('ba-hint');
        }, { once: true });
      }, 300 + i * 150);
      hintObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.3 });
baCards.forEach(card => hintObserver.observe(card));

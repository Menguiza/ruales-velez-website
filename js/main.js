/* Ruales Vélez — main.js */

/* ===== REFERENCIAS ===== */
const header      = document.getElementById('site-header');
const navToggle   = document.getElementById('nav-toggle');
const navMenu     = document.getElementById('nav-menu');
const backToTop   = document.getElementById('back-to-top');
const progressBar = document.querySelector('.scroll-progress');

/* ===== SCROLL: progress + header + back-to-top + nav activo ===== */
window.addEventListener('scroll', () => {
  const y   = window.scrollY;
  const max = document.documentElement.scrollHeight - window.innerHeight;

  progressBar.style.transform = `scaleX(${y / max})`;
  header.classList.toggle('scrolled', y > 80);
  backToTop.toggleAttribute('hidden', y <= 400);
  highlightNav();
}, { passive: true });

function highlightNav() {
  const sections = document.querySelectorAll('section[id], div[id]');
  const links    = document.querySelectorAll('.nav-link');
  let current    = '';
  sections.forEach(sec => { if (sec.offsetTop - 120 <= window.scrollY) current = sec.id; });
  links.forEach(link => link.classList.toggle('active', link.getAttribute('href') === `#${current}`));
}

/* ===== MENÚ HAMBURGUESA ===== */
navToggle.addEventListener('click', () => {
  const open = navMenu.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', open);
});
navMenu.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => { navMenu.classList.remove('open'); navToggle.setAttribute('aria-expanded', 'false'); });
});
document.addEventListener('click', e => {
  if (!header.contains(e.target)) { navMenu.classList.remove('open'); navToggle.setAttribute('aria-expanded', 'false'); }
});

/* ===== BACK TO TOP ===== */
backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

/* ===== SMOOTH SCROLL CON OFFSET ===== */
// Recorre la cadena offsetParent para obtener la posición de layout real
// (getBoundingClientRect incluye transforms del fade-in y da posición incorrecta)
function absoluteTop(el) {
  let top = 0;
  while (el) { top += el.offsetTop; el = el.offsetParent; }
  return top;
}

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const id = anchor.getAttribute('href');
    if (!id || id === '#') return;
    const target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    const headerH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 72;
    window.scrollTo({ top: absoluteTop(target) - headerH, behavior: 'smooth' });
  });
});

/* ===== HERO SLIDESHOW ===== */
(function initSlideshow() {
  const slides   = document.querySelectorAll('.hero-slide');
  const dotsWrap = document.getElementById('hero-dots');
  if (!slides.length) return;

  let current = 0;
  let timer   = null;
  const DELAY = 5000;

  // Mostrar la primera diapositiva SIN transición para evitar flash negro inicial
  const firstSlide = slides[0];
  firstSlide.style.transition = 'none';
  firstSlide.style.opacity    = '1';
  firstSlide.style.transform  = 'scale(1)';
  // Tras dos frames re-habilitar transiciones para las siguientes diapositivas
  requestAnimationFrame(() => requestAnimationFrame(() => {
    firstSlide.style.transition = '';
  }));

  // Crear dots
  slides.forEach((_, i) => {
    const btn = document.createElement('button');
    btn.className = 'hero-dot' + (i === 0 ? ' active' : '');
    btn.setAttribute('aria-label', `Diapositiva ${i + 1}`);
    btn.addEventListener('click', () => goTo(i));
    dotsWrap.appendChild(btn);
  });

  function goTo(index) {
    const prevIdx = current;
    slides[prevIdx].classList.remove('active');
    slides[prevIdx].classList.add('prev');
    dotsWrap.querySelectorAll('.hero-dot')[prevIdx].classList.remove('active');
    setTimeout(() => slides[prevIdx].classList.remove('prev'), 1600);

    current = index;
    slides[current].classList.add('active');
    dotsWrap.querySelectorAll('.hero-dot')[current].classList.add('active');
  }

  function next() { goTo((current + 1) % slides.length); }

  timer = setInterval(next, DELAY);

  const hero = document.querySelector('.hero');
  hero.addEventListener('mouseenter', () => clearInterval(timer));
  hero.addEventListener('mouseleave', () => { timer = setInterval(next, DELAY); });
})();

/* ===== ANTES/DESPUÉS — Slider con lerp ===== */
class BASlider {
  constructor(card) {
    this.card    = card;
    this.after   = card.querySelector('.ba-after');
    this.divider = card.querySelector('.ba-divider');
    this.target  = 50;
    this.current = 50;
    this.running = false;

    card.addEventListener('mouseenter',  () => this.start());
    card.addEventListener('mousemove',   e  => this.onMove(e));
    card.addEventListener('mouseleave',  () => { this.target = 50; });
    card.addEventListener('touchmove',   e  => this.onTouch(e), { passive: true });
    card.addEventListener('touchstart',  () => this.start(), { passive: true });
  }

  onMove(e) {
    const r = this.card.getBoundingClientRect();
    this.target = Math.max(2, Math.min(98, ((e.clientX - r.left) / r.width) * 100));
    this.start(); // reactiva el loop si ya terminó
  }

  onTouch(e) {
    const r = this.card.getBoundingClientRect();
    this.target = Math.max(2, Math.min(98, ((e.touches[0].clientX - r.left) / r.width) * 100));
    this.start();
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.tick();
  }

  tick() {
    this.current += (this.target - this.current) * 0.10;
    const pct = this.current.toFixed(2);

    // Aplica clip-path directamente: muestra "después" a la DERECHA del cursor
    this.after.style.clipPath   = `inset(0 0 0 ${pct}%)`;
    this.divider.style.left     = pct + '%';

    if (Math.abs(this.target - this.current) < 0.05) {
      this.current = this.target;
      this.after.style.clipPath = `inset(0 0 0 ${this.target}%)`;
      this.divider.style.left   = this.target + '%';
      this.running = false;
      return;
    }
    requestAnimationFrame(() => this.tick());
  }

  /* Animación de "hint": revela después → esconde → vuelve al centro */
  async hint() {
    await this.lerpTo(22, 700);
    await this.lerpTo(78, 900);
    await this.lerpTo(50, 600);
  }

  lerpTo(target, duration) {
    return new Promise(resolve => {
      const start = this.current;
      const begin = performance.now();
      const step  = now => {
        const t   = Math.min((now - begin) / duration, 1);
        const ease = 1 - Math.pow(1 - t, 3);  // ease-out-cubic
        this.current = start + (target - start) * ease;
        this.after.style.clipPath = `inset(0 0 0 ${this.current.toFixed(2)}%)`;
        this.divider.style.left   = this.current.toFixed(2) + '%';
        if (t < 1) requestAnimationFrame(step);
        else { this.current = target; resolve(); }
      };
      requestAnimationFrame(step);
    });
  }
}

// Inicializar sliders y hint al entrar en viewport
const baCards = document.querySelectorAll('.project-card');
const sliders = [];
baCards.forEach(card => sliders.push(new BASlider(card)));

const hintObs = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      const slider = sliders[Array.from(baCards).indexOf(entry.target)];
      setTimeout(() => { if (slider && !slider.running) slider.hint(); }, 400 + i * 180);
      hintObs.unobserve(entry.target);
    }
  });
}, { threshold: 0.4 });
baCards.forEach(card => hintObs.observe(card));

/* ===== ANIMACIONES DE ENTRADA (fade-in) ===== */
const fadeTargets = document.querySelectorAll('.service-card, .value-item, .process-step, .about-col, .process-col, .contact-cta, .contact-info, .section-header');
fadeTargets.forEach(el => el.classList.add('fade-in'));
const fadeObs = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('visible'), i * 70);
      fadeObs.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });
fadeTargets.forEach(el => fadeObs.observe(el));

/* ===== CONTADOR DE NÚMEROS ===== */
function animateCounter(el) {
  const target = parseInt(el.dataset.target);
  const suffix = el.dataset.suffix || '';
  const duration = 1800;
  const start = performance.now();

  function step(now) {
    const progress = Math.min((now - start) / duration, 1);
    const ease     = 1 - Math.pow(1 - progress, 4);  // ease-out-quart
    el.textContent = Math.floor(ease * target) + suffix;
    if (progress < 1) requestAnimationFrame(step);
    else el.textContent = target + suffix;
  }
  requestAnimationFrame(step);
}

const counterObs = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCounter(entry.target);
      counterObs.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.value-number').forEach(el => counterObs.observe(el));

/* ===== TILT 3D EN TARJETAS DE SERVICIO ===== */
document.querySelectorAll('.service-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width  - 0.5) * 16;
    const y = ((e.clientY - r.top)  / r.height - 0.5) * 16;
    card.style.transform = `perspective(600px) rotateY(${x}deg) rotateX(${-y}deg) translateZ(6px)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
  });
});

/* Ruales Vélez — main.js */

const header    = document.getElementById('site-header');
const navToggle = document.getElementById('nav-toggle');
const navMenu   = document.getElementById('nav-menu');
const backToTop = document.getElementById('back-to-top');

/* ===== SCROLL: nav sombra + botón volver arriba + link activo ===== */
window.addEventListener('scroll', () => {
  const y = window.scrollY;
  header.classList.toggle('scrolled', y > 20);
  if (y > 400) { backToTop.removeAttribute('hidden'); }
  else         { backToTop.setAttribute('hidden', ''); }
  highlightNav();
}, { passive: true });

/* ===== NAV ACTIVO ===== */
function highlightNav() {
  const sections = document.querySelectorAll('section[id], div[id]');
  const links    = document.querySelectorAll('.nav-link');
  let current    = '';

  sections.forEach(sec => {
    if (sec.offsetTop - 100 <= window.scrollY) current = sec.id;
  });

  links.forEach(link => {
    link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
  });
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

/* ===== SMOOTH SCROLL CON OFFSET (header fijo) ===== */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const id = anchor.getAttribute('href');
    if (!id || id === '#') return;
    const target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    window.scrollTo({ top: target.offsetTop - parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-h')), behavior: 'smooth' });
  });
});

/* ===== ANIMACIONES DE ENTRADA (Intersection Observer) ===== */
const animTargets = document.querySelectorAll(
  '.service-card, .project-card, .value-item, .process-step, .about-col, .process-col, .contact-cta, .contact-info, .section-header'
);

animTargets.forEach(el => el.classList.add('fade-in'));

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('visible'), i * 70);
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });

animTargets.forEach(el => observer.observe(el));

const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('#main-nav');

function closeMenu() {
  nav?.classList.remove('is-open');
  toggle?.setAttribute('aria-expanded', 'false');
  toggle?.setAttribute('aria-label', 'Abrir menu');
}

toggle?.addEventListener('click', () => {
  const open = toggle.getAttribute('aria-expanded') !== 'true';
  nav?.classList.toggle('is-open', open);
  toggle.setAttribute('aria-expanded', String(open));
  toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
});

nav?.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });
document.addEventListener('click', event => {
  if (nav?.classList.contains('is-open') && !nav.contains(event.target) && !toggle?.contains(event.target)) closeMenu();
});
document.querySelector('#year').textContent = String(new Date().getFullYear());

const motionAllowed = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const revealTargets = document.querySelectorAll('.section-top, .intro-grid, .section-heading, .problem-list, .method-intro, .steps, .solutions-grid, .solution-bottom, .contact-grid');
if (motionAllowed && 'IntersectionObserver' in window) {
  revealTargets.forEach(el => {
    el.classList.add('reveal');
    const children = el.matches('.problem-list, .solutions-grid') ? el.querySelectorAll('article') : el.matches('.steps') ? el.querySelectorAll('li') : [];
    children.forEach((child, i) => { child.classList.add('reveal-item'); child.style.setProperty('--reveal-delay', `${Math.min(i * 80, 240)}ms`); });
  });
  document.documentElement.classList.add('motion-ready');
  const reveals = new IntersectionObserver(entries => {
    entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('in-view'); reveals.unobserve(entry.target); } });
  }, { threshold: .08, rootMargin: '0px 0px -35px 0px' });
  revealTargets.forEach(el => reveals.observe(el));
}

const header = document.querySelector('.site-header');
const navLinks = document.querySelectorAll('.nav a[href^="#"]');
const sections = document.querySelectorAll('main section[id]');
if ('IntersectionObserver' in window) {
  const current = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      navLinks.forEach(link => link.removeAttribute('aria-current'));
      document.querySelector(`.nav a[href="#${entry.target.id}"]`)?.setAttribute('aria-current', 'location');
    });
  }, { rootMargin: '-25% 0px -60% 0px' });
  sections.forEach(section => current.observe(section));
}
let scrollQueued = false;
window.addEventListener('scroll', () => {
  if (scrollQueued) return;
  scrollQueued = true;
  requestAnimationFrame(() => { header?.classList.toggle('is-scrolled', window.scrollY > 24); scrollQueued = false; });
}, { passive: true });

const steps = [...document.querySelectorAll('.steps li')];
if ('IntersectionObserver' in window) {
  const activeStep = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) { steps.forEach(step => step.classList.remove('is-active')); entry.target.classList.add('is-active'); }
    });
  }, { rootMargin: '-28% 0px -45% 0px' });
  steps.forEach(step => activeStep.observe(step));
}
const solutionCards = [...document.querySelectorAll('.solutions-grid article')];
function activateSolution(card) { solutionCards.forEach(item => item.classList.toggle('is-active', item === card)); }
solutionCards.forEach(card => {
  card.addEventListener('pointerenter', () => activateSolution(card));
  card.addEventListener('click', () => activateSolution(card));
});
solutionCards[1]?.classList.add('is-active');

const art = document.querySelector('.hero-art');
if (motionAllowed && window.matchMedia('(pointer:fine)').matches) {
  art?.addEventListener('pointermove', event => {
    const bounds = art.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - .5;
    const y = (event.clientY - bounds.top) / bounds.height - .5;
    art.style.setProperty('--pointer-x', `${(x * 16).toFixed(1)}px`);
    art.style.setProperty('--pointer-y', `${(y * 12).toFixed(1)}px`);
  });
  art?.addEventListener('pointerleave', () => { art.style.setProperty('--pointer-x', '0px'); art.style.setProperty('--pointer-y', '0px'); });
}

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
const railLinks = document.querySelectorAll('.chapter-rail a[href^="#"]');
const sections = document.querySelectorAll('main section[id]');
if ('IntersectionObserver' in window) {
  const current = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      navLinks.forEach(link => link.removeAttribute('aria-current'));
      document.querySelector(`.nav a[href="#${entry.target.id}"]`)?.setAttribute('aria-current', 'location');
      railLinks.forEach(link => link.removeAttribute('aria-current'));
      document.querySelector(`.chapter-rail a[href="#${entry.target.id}"]`)?.setAttribute('aria-current', 'location');
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

// Motion frames are bundled locally; each scene keeps its poster until frames decode.
if (motionAllowed && 'IntersectionObserver' in window) {
  const scenes = [...document.querySelectorAll('.motion-scene[data-frames]')];
  const sceneState = new Map();
  const activeScenes = new Set();
  const clamp = value => Math.min(1, Math.max(0, value));
  const frameUrl = (name, frame) => `/assets/motion/${name}/frames/frame-${String(frame).padStart(2, '0')}.webp`;

  function progressFor(element) {
    const section = element.closest('section') || element;
    if (section.id === 'inicio') return clamp(window.scrollY / Math.max(400, section.offsetHeight * .85));
    const rect = section.getBoundingClientRect();
    return clamp((window.innerHeight * .76 - rect.top) / (window.innerHeight * .62 + rect.height * .45));
  }
  function renderScene(scene, forcedFrame) {
    const state = sceneState.get(scene);
    if (!state?.ready) return;
    const value = forcedFrame === undefined ? progressFor(scene) * (state.count - 1) : forcedFrame - 1;
    const index = Math.min(state.count, Math.max(1, Math.floor(value) + 1));
    const next = Math.min(state.count, index + 1);
    const fraction = index === next ? 0 : value - Math.floor(value);
    if (state.index !== index) { state.a.src = frameUrl(state.name, index); state.index = index; }
    if (state.next !== next) { state.b.src = frameUrl(state.name, next); state.next = next; }
    state.a.style.opacity = String(1 - fraction);
    state.b.style.opacity = String(fraction);
  }
  async function prepareScene(scene) {
    if (sceneState.has(scene)) return;
    const name = scene.dataset.motion;
    const count = Number(scene.dataset.frames);
    const state = { name, count, ready: false, index: 0, next: 0 };
    sceneState.set(scene, state);
    const urls = Array.from({length: count}, (_, i) => frameUrl(name, i + 1));
    try {
      await Promise.all(urls.map(url => new Promise((resolve, reject) => {
        const img = new Image(); img.onload = resolve; img.onerror = reject; img.src = url;
      })));
      if (!scene.isConnected) return;
      state.a = document.createElement('img'); state.b = document.createElement('img');
      for (const img of [state.a, state.b]) {
        img.className = 'motion-frame'; img.alt = ''; img.setAttribute('aria-hidden', 'true');
        img.width = 900; img.height = 900; scene.append(img);
      }
      state.ready = true;
      renderScene(scene);
      scene.classList.add('is-ready');
    } catch { /* The poster remains visible if any frame fails to load. */ }
  }
  const visibility = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) { activeScenes.add(entry.target); prepareScene(entry.target); }
    else activeScenes.delete(entry.target);
  }), { rootMargin: '350px 0px' });
  scenes.forEach(scene => visibility.observe(scene));

  const plates = document.querySelector('.layers-story');
  const plateArt = plates?.querySelector('.layers-art');
  plateArt?.classList.add('is-ready');
  const statue = document.querySelector('.contact-art');
  const arm = statue?.querySelector('.statue-arm');
  const nextArm = arm?.cloneNode();
  if (nextArm) { nextArm.classList.add('statue-arm-next'); nextArm.alt = ''; statue.append(nextArm); }
  const contactArms = Array.from({length:5},(_,i)=>`/assets/motion/contact/layers/braco-${String(i+1).padStart(2,'0')}.webp`);
  const armImages = contactArms.map(src => { const img = new Image(); img.src = src; return img; });
  let currentArm = 1;
  let followingArm = 0;
  statue?.classList.add('is-ready');

  let sceneQueued = false;
  function animateScroll() {
    sceneQueued = false;
    for (const scene of activeScenes) {
      if (scene.dataset.motion !== 'solutions' || !scene.dataset.hoverFrame) renderScene(scene);
    }
    if (plates && plateArt) {
      const rect = plates.getBoundingClientRect();
      const p = clamp((window.innerHeight * .75 - rect.top) / (window.innerHeight * .55 + rect.height * .35));
      plateArt.style.setProperty('--stack', p.toFixed(3));
    }
    if (statue && arm) {
      const rect = statue.closest('section').getBoundingClientRect();
      const p = clamp((window.innerHeight * .76 - rect.top) / (window.innerHeight * .55 + rect.height * .5));
      const enter = clamp(p / .24);
      const exit = clamp((p - .82) / .18);
      statue.style.setProperty('--enter', enter.toFixed(3));
      statue.style.setProperty('--exit', exit.toFixed(3));
      statue.style.opacity = String(enter * (1 - exit));
      const value = p * 4;
      const step = Math.min(5, Math.max(1, Math.floor(value) + 1));
      const next = Math.min(5, step + 1);
      const blend = step === next ? 0 : value - Math.floor(value);
      if (step !== currentArm && armImages[step - 1].complete) { arm.src = contactArms[step - 1]; currentArm = step; }
      if (nextArm && next !== followingArm && armImages[next - 1].complete) { nextArm.src = contactArms[next - 1]; followingArm = next; }
      arm.style.opacity = String(1 - blend);
      if (nextArm) nextArm.style.opacity = String(blend);
    }
  }
  window.addEventListener('scroll', () => {
    if (sceneQueued) return;
    sceneQueued = true;
    requestAnimationFrame(animateScroll);
  }, { passive:true });
  window.addEventListener('resize', () => requestAnimationFrame(animateScroll), { passive:true });
  animateScroll();

  const solutionScene = document.querySelector('.solutions-art');
  const highlight = solutionScene?.querySelector('.solution-highlight');
  const hoverNames = ['marketing','vendas','tecnologia'];
  solutionCards.forEach((card, i) => {
    const activate = () => {
      solutionScene.dataset.hoverFrame = String(i + 2);
      renderScene(solutionScene, i + 2);
      if (highlight) highlight.src = `/assets/motion/solutions/layers/hover-${hoverNames[i]}.webp`;
    };
    card.addEventListener('pointerenter', activate);
    card.addEventListener('focusin', activate);
    card.addEventListener('click', activate);
    card.addEventListener('pointerleave', () => { delete solutionScene.dataset.hoverFrame; renderScene(solutionScene); });
  });
  const pointerDepth = (element, target, scale) => {
    element?.addEventListener('pointermove', event => {
      if (!window.matchMedia('(pointer:fine)').matches) return;
      const bounds = element.getBoundingClientRect();
      target.style.setProperty('--depth-x', `${(((event.clientX - bounds.left) / bounds.width - .5) * scale).toFixed(1)}px`);
      target.style.setProperty('--depth-y', `${(((event.clientY - bounds.top) / bounds.height - .5) * scale).toFixed(1)}px`);
    });
    element?.addEventListener('pointerleave', () => { target.style.setProperty('--depth-x', '0px'); target.style.setProperty('--depth-y', '0px'); });
  };
  if (plateArt) pointerDepth(plateArt, plateArt, 12);
}

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

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const motionAllowed = !reducedMotion.matches;
const revealTargets = document.querySelectorAll('.section-top, .intro-grid, .section-heading, .problem-list, .steps, .solutions-grid, .solution-bottom');
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
  card.addEventListener('focusin', () => activateSolution(card));
});
solutionCards[1]?.classList.add('is-active');

// One scroll clock, continuous transforms and a short, time-based catch-up.
// No wheel interception, image swapping or continuously running idle loop.
(() => {
  const clamp = x => Math.max(0, Math.min(1, x));
  const ease = x => { x = clamp(x); return x * x * (3 - 2 * x); };
  const root = document.documentElement;
  const plateStory = document.querySelector('.layers-story');
  const plateArt = document.querySelector('.layers-art');
  const plates = [...document.querySelectorAll('.layer-plate')];
  const labels = [...document.querySelectorAll('.layer-labels span')];
  const statue = document.querySelector('.contact-art');
  const arm = document.querySelector('.statue-arm');
  const contact = document.querySelector('.contact');
  const hero = document.querySelector('.hero-art');
  const orbit = hero?.querySelector('.hero-orbit');
  const symbol = hero?.querySelector('.hero-v');
  const method = document.querySelector('.method-art .motion-poster');
  const problem = document.querySelector('.problem-art .motion-poster');
  const network = document.querySelector('.solutions-art .motion-poster');
  const highlight = document.querySelector('.solution-highlight');
  const desktop = matchMedia('(min-width:901px) and (min-height:650px)');
  let pointer = {x:0,y:0}, smoothPointer = {x:0,y:0};
  let y = scrollY, target = scrollY, frame = 0, lastTime = 0;
  let geometry = {};
  const measure = el => ({top:el.getBoundingClientRect().top + scrollY,height:el.offsetHeight});
  const traverse = (g, viewport = .8) => clamp((y + innerHeight * viewport - g.top) / (g.height + innerHeight * .5));
  const pinProgress = g => clamp((y - g.top + 88) / Math.max(1,g.height - innerHeight + 88));
  function measureAll() {
    geometry = {
      plates:measure(plateStory),contact:measure(contact),hero:measure(document.querySelector('.hero')),
      method:measure(document.querySelector('.method')),problem:measure(document.querySelector('.problem-stage')),
      network:measure(document.querySelector('.solutions-showcase'))
    };
    wake();
  }
  async function ready(el, images) {
    try {
      await Promise.all(images.map(async img => {
        if (img.loading === 'lazy') img.loading = 'eager';
        await img.decode();
      }));
      el.classList.add('is-ready');
      wake();
    } catch { /* A complete poster stays visible if a layer cannot load. */ }
  }
  const loader = new IntersectionObserver(entries => entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    ready(el,[...el.querySelectorAll('.layer-plate,.statue-body,.statue-arm')]);
    loader.unobserve(el);
  }),{rootMargin:'500px'});
  loader.observe(plateArt);loader.observe(statue);
  function paint() {
    const p = desktop.matches ? pinProgress(geometry.plates) : traverse(geometry.plates);
    const assemble = ease((p - .08) / .78);
    plateStory.style.setProperty('--scene-p', p.toFixed(4));
    // Every plate's painted pixels fit inside 10–89% of this square.
    // Source canvases have 63% transparent space below the plate.
    const positions = [54 - 12 * assemble,32 + 2 * assemble,10 + 16 * assemble];
    plates.forEach((el,i) => {
      const spread = 1 - assemble;
      const dx = (i - 1) * 8 * spread + smoothPointer.x * (3-i);
      el.style.transform = `translate3d(${dx}%,${positions[i]}%,0) rotate(${(i-1)*5*spread}deg)`;
    });
    labels.forEach((el,i) => {el.style.top = `${positions[2-i]+12}%`;el.style.opacity = String(.55+.45*assemble);});
    const cp = desktop.matches ? pinProgress(geometry.contact) : traverse(geometry.contact);
    const entry = desktop.matches ? ease((y + innerHeight - geometry.contact.top)/(innerHeight*.85)) : 1;
    const lift = ease((cp-.04)/.58);
    const exit = desktop.matches ? ease((cp-.88)/.12) : 0;
    statue.style.transform = `translate3d(${(-12*(1-entry)+7*exit).toFixed(3)}%,${(10*(1-entry)+14*exit).toFixed(3)}%,0) rotate(${(-3*(1-entry)).toFixed(3)}deg)`;
    statue.style.opacity = String(1 - exit*.5);
    arm.style.transform = `rotate(${(48*(1-lift)-2*lift).toFixed(3)}deg)`;
    contact.style.setProperty('--gesture',lift.toFixed(4));
    const hp = clamp(y / geometry.hero.height);
    orbit.style.transform = `translate3d(${smoothPointer.x*6}px,${hp*75+smoothPointer.y*4}px,0) rotate(${hp*70-12}deg) scale(${1-hp*.08})`;
    symbol.style.transform = `translate3d(${smoothPointer.x*14}px,${-hp*65+smoothPointer.y*10}px,0) rotate(${hp*-9}deg)`;
    const mp = traverse(geometry.method);
    method.style.transform = `rotate(${-28+mp*145}deg) scale(${.9+.1*Math.sin(mp*Math.PI)})`;
    const pp = traverse(geometry.problem);
    problem.style.transform = `translate3d(0,${30-pp*60}px,0) rotate(${-8+pp*16}deg)`;
    const np = traverse(geometry.network);
    network.style.transform = `rotate(${-12+np*24}deg) scale(${.88+np*.12})`;
    highlight.style.transform = network.style.transform;
  }
  function tick(time) {
    frame = 0;
    if (reducedMotion.matches || document.hidden) return;
    const dt = lastTime ? Math.min(time-lastTime,50) : 16.7;
    lastTime = time;
    const alpha = 1-Math.exp(-dt/65);
    y += (target-y)*alpha;
    smoothPointer.x += (pointer.x-smoothPointer.x)*alpha;
    smoothPointer.y += (pointer.y-smoothPointer.y)*alpha;
    paint();
    if (Math.abs(target-y)>.1 || Math.abs(pointer.x-smoothPointer.x)>.002 || Math.abs(pointer.y-smoothPointer.y)>.002) frame=requestAnimationFrame(tick);
    else lastTime=0;
  }
  function wake() { if(!frame && !reducedMotion.matches && !document.hidden) frame=requestAnimationFrame(tick); }
  const updatePreference = () => {
    root.classList.toggle('motion-enabled',!reducedMotion.matches);
    if(reducedMotion.matches){cancelAnimationFrame(frame);frame=0;lastTime=0;}
    target=y=scrollY; measureAll();
  };
  window.addEventListener('scroll',()=>{target=scrollY;wake();},{passive:true});
  window.addEventListener('resize',measureAll,{passive:true});
  window.addEventListener('load',measureAll,{once:true});
  document.addEventListener('visibilitychange',()=>{target=y=scrollY;wake();});
  reducedMotion.addEventListener('change',updatePreference);
  desktop.addEventListener('change',measureAll);
  hero.addEventListener('pointermove',e=>{
    if(e.pointerType!=='mouse')return;
    const b=hero.getBoundingClientRect();pointer={x:(e.clientX-b.left)/b.width-.5,y:(e.clientY-b.top)/b.height-.5};wake();
  });
  hero.addEventListener('pointerleave',()=>{pointer={x:0,y:0};wake();});
  const hoverNames=['marketing','vendas','tecnologia'];
  solutionCards.forEach((card,i)=>{
    const choose=()=>{highlight.src=`/assets/motion/solutions/layers/hover-${hoverNames[i]}.webp`;};
    card.addEventListener('pointerenter',choose);card.addEventListener('focusin',choose);card.addEventListener('click',choose);
  });
  updatePreference();
})();

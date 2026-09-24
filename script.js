'use strict';
const $ = (selector, parent = document) => parent.querySelector(selector);
const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];
const toggle = $('.menu-toggle');
const nav = $('#main-nav');
function closeMenu() { nav.classList.remove('is-open'); toggle.setAttribute('aria-expanded', 'false'); }
toggle.addEventListener('click', () => { const open = toggle.getAttribute('aria-expanded') !== 'true'; nav.classList.toggle('is-open', open); toggle.setAttribute('aria-expanded', String(open)); });
$$('a', nav).forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', e => { if (e.key === 'Escape') { const wasOpen = nav.classList.contains('is-open'); closeMenu(); if (wasOpen) toggle.focus(); } });
document.addEventListener('click', e => { if (!e.target.closest('.site-header')) closeMenu(); });
$('#year').textContent = new Date().getFullYear();

// Accessible tabs: selection works with touch, mouse and the keyboard.
const tabs = $$('[role="tab"]');
function selectTab(index, focus = false) {
  tabs.forEach((tab, i) => {
    tab.setAttribute('aria-selected', String(i === index));
    tab.tabIndex = i === index ? 0 : -1;
    $('#' + tab.getAttribute('aria-controls')).hidden = i !== index;
  });
  if (focus) tabs[index].focus();
}
tabs.forEach((tab, i) => {
  tab.addEventListener('click', () => selectTab(i));
  tab.addEventListener('keydown', e => {
    let next;
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') next = (i + 1) % tabs.length;
    if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') next = (i + tabs.length - 1) % tabs.length;
    if (e.key === 'Home') next = 0;
    if (e.key === 'End') next = tabs.length - 1;
    if (next !== undefined) { e.preventDefault(); selectTab(next, true); }
  });
});
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const desktop = matchMedia('(min-width:901px) and (min-height:721px)');
const root = document.documentElement;
const reveals = $$('.reveal');
if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver(entries => entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('is-visible'); revealObserver.unobserve(e.target); }
  }), { threshold: .08, rootMargin: '0px 0px -15px 0px' });
  reveals.forEach(el => revealObserver.observe(el));
  const sectionObserver = new IntersectionObserver(entries => entries.forEach(e => {
    if (!e.isIntersecting) return;
    $$('a', nav).forEach(a => {
      if (a.getAttribute('href') === '#' + e.target.id) a.setAttribute('aria-current', 'location');
      else a.removeAttribute('aria-current');
    });
  }), { rootMargin: '-20% 0px -60% 0px' });
  $$('main section[id], #solucoes').forEach(el => sectionObserver.observe(el));
  const steps = $$('.steps li');
  const stepObserver = new IntersectionObserver(entries => entries.forEach(e => {
    if (e.isIntersecting) steps.forEach(el => el.classList.toggle('is-active', el === e.target));
  }), { rootMargin: '-22% 0px -50% 0px' });
  steps.forEach(el => stepObserver.observe(el));
} else reveals.forEach(el => el.classList.add('is-visible'));

// All scroll scenes share one clock. The native scroll is never intercepted.
(() => {
  const clamp = v => Math.max(0, Math.min(1, v));
  const ease = v => { v = clamp(v); return v * v * (3 - 2 * v); };
  const hero = $('.hero'), symbol = $('.hero-v'), orbit = $('.hero-orbit');
  const plateStory = $('.layers-story'), plateArt = $('.layers-art'), plates = $$('.plate');
  const contact = $('.contact'), statue = $('.contact-art'), arm = $('.statue-arm');
  const method = $('.method'), methodArt = $('.method-orbit');
  const numbers = $('.numbers'), network = $('.network-art');
  const ribbon = $('.type-ribbon');
  let geometry = {}, y = scrollY, target = scrollY, frame = 0, last = 0;
  let pointer = { x:0, y:0 }, currentPointer = { x:0, y:0 };
  const measure = el => ({ top:el.getBoundingClientRect().top + scrollY, height:el.offsetHeight });
  const travel = g => clamp((y + innerHeight * .8 - g.top) / (g.height + innerHeight * .6));
  const pin = g => clamp((y - g.top + 95) / Math.max(1, g.height - innerHeight + 110));
  function measureAll() {
    geometry = { hero:measure(hero), plates:measure(plateStory), contact:measure(contact), method:measure(method), numbers:measure(numbers), ribbon:measure(ribbon), page:Math.max(1,document.documentElement.scrollHeight-innerHeight) };
    wake();
  }
  async function decodeScene(el, selector) {
    try {
      await Promise.all($$(selector,el).map(async img => { img.loading = 'eager'; await img.decode(); }));
      el.classList.add('is-ready');
      wake();
    } catch { /* The complete poster remains visible when a layer fails. */ }
  }
  if ('IntersectionObserver' in window) {
    const loader = new IntersectionObserver(entries => entries.forEach(e => {
      if (!e.isIntersecting) return;
      decodeScene(e.target, e.target === plateArt ? '.plate' : '.statue-body,.statue-arm');
      loader.unobserve(e.target);
    }), { rootMargin:'450px' });
    loader.observe(plateArt); loader.observe(statue);
  }
  function paint() {
    root.style.setProperty('--reading', clamp(target / geometry.page).toFixed(4));
    if (reduced.matches) return;
    const h = clamp(y / geometry.hero.height);
    symbol.style.transform = `translate3d(${currentPointer.x*22}px,${-h*95+currentPointer.y*15}px,0) rotate(${-h*13}deg) scale(${1-h*.05})`;
    orbit.style.transform = `translate3d(${currentPointer.x*10}px,${h*65+currentPointer.y*8}px,0) rotate(${-12+h*95}deg)`;
    const p = ease(desktop.matches ? pin(geometry.plates) : travel(geometry.plates));
    // Each source plate fills only the top 37% of its square canvas.
    [51-9*p,30+4*p,9+17*p].forEach((position,i) => {
      plates[i].style.transform = `translate3d(${(i-1)*6*(1-p)}%,${position}%,0) rotate(${(i-1)*4*(1-p)}deg)`;
    });
    const cp = desktop.matches ? pin(geometry.contact) : travel(geometry.contact);
    const lift = ease((cp-.04)/.65);
    const entering = desktop.matches ? ease((y+innerHeight-geometry.contact.top)/(innerHeight*.75)) : 1;
    const leaving = desktop.matches ? ease((cp-.92)/.08) : 0;
    statue.style.transform = `translate3d(${-8*(1-entering)+3*leaving}%,${8*(1-entering)+10*leaving}%,0)`;
    arm.style.transform = `rotate(${48-36*lift}deg)`;
    contact.style.setProperty('--gesture',lift.toFixed(4));
    const mp = travel(geometry.method);
    methodArt.style.transform = `rotate(${-25+mp*145}deg)`;
    network.style.transform = `rotate(${-8+travel(geometry.numbers)*20}deg)`;
    ribbon.style.setProperty('--ribbon-x',`${-3-travel(geometry.ribbon)*15}%`);
  }
  function tick(time) {
    frame=0;
    if(document.hidden) return;
    const dt=last ? Math.min(time-last,50) : 16.7; last=time;
    const alpha=1-Math.exp(-dt/65);
    y+=(target-y)*alpha;
    currentPointer.x+=(pointer.x-currentPointer.x)*alpha;
    currentPointer.y+=(pointer.y-currentPointer.y)*alpha;
    paint();
    if(!reduced.matches && (Math.abs(y-target)>.15 || Math.abs(pointer.x-currentPointer.x)>.002 || Math.abs(pointer.y-currentPointer.y)>.002)) frame=requestAnimationFrame(tick);
    else last=0;
  }
  function wake(){if(!frame && !document.hidden) frame=requestAnimationFrame(tick);}
  function preference(){
    root.classList.toggle('js-motion',!reduced.matches);
    if(reduced.matches) [symbol,orbit,...plates,statue,arm,methodArt,network].forEach(el => el.style.removeProperty('transform'));
    y=target=scrollY; measureAll();
  }
  window.addEventListener('scroll',()=>{target=scrollY;wake();},{passive:true});
  window.addEventListener('resize',measureAll,{passive:true});
  window.addEventListener('load',measureAll,{once:true});
  document.addEventListener('visibilitychange',()=>{target=y=scrollY;wake();});
  reduced.addEventListener('change',preference); desktop.addEventListener('change',measureAll);
  if ('ResizeObserver' in window) new ResizeObserver(measureAll).observe(document.body);
  hero.addEventListener('pointermove',e=>{
    if(e.pointerType!=='mouse'||reduced.matches)return;
    const rect=hero.getBoundingClientRect(); pointer={x:(e.clientX-rect.left)/rect.width-.5,y:(e.clientY-rect.top)/rect.height-.5};wake();
  });
  hero.addEventListener('pointerleave',()=>{pointer={x:0,y:0};wake();});
  preference();
})();

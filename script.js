'use strict';
const $ = (selector, parent = document) => parent.querySelector(selector);
const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];
const clamp = v => Math.max(0, Math.min(1, v));
const smooth = v => { v = clamp(v); return v * v * (3 - 2 * v); };

const toggle = $('.menu-toggle');
const nav = $('#main-nav');
function closeMenu() { nav.classList.remove('is-open'); toggle.setAttribute('aria-expanded', 'false'); }
toggle.addEventListener('click', () => { const open = toggle.getAttribute('aria-expanded') !== 'true'; nav.classList.toggle('is-open', open); toggle.setAttribute('aria-expanded', String(open)); });
$$('a', nav).forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', e => { if (e.key === 'Escape') { const wasOpen = nav.classList.contains('is-open'); closeMenu(); if (wasOpen) toggle.focus(); } });
document.addEventListener('click', e => { if (!e.target.closest('.site-header')) closeMenu(); });
$('#year').textContent = new Date().getFullYear();

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
root.classList.toggle('js-motion', !reduced.matches);

const reveals = $$('.reveal');
if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver(entries => entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('is-visible'); revealObserver.unobserve(e.target); }
  }), { threshold: .06, rootMargin: '0px 0px -8% 0px' });
  reveals.forEach(el => revealObserver.observe(el));

  const sectionObserver = new IntersectionObserver(entries => entries.forEach(e => {
    if (!e.isIntersecting) return;
    $$('a', nav).forEach(a => a.toggleAttribute('aria-current', a.getAttribute('href') === '#' + e.target.id));
  }), { rootMargin: '-20% 0px -60% 0px' });
  $$('main section[id], #solucoes').forEach(el => sectionObserver.observe(el));
} else reveals.forEach(el => el.classList.add('is-visible'));

(() => {
  const hero = $('.hero'), symbol = $('.hero-v'), orbit = $('.hero-orbit'), halo = $('.hero-halo'), heroContent = $('.hero-content');
  const plateStory = $('.layers-story'), plateArt = $('.layers-art'), plates = $$('.plate');
  const contact = $('.contact'), statue = $('.contact-art'), arm = $('.statue-arm');
  const methodArt = $('.method-orbit'), network = $('.network-art'), ribbon = $('.type-ribbon');
  const scenes = ['.overview','.solutions','.difference','.numbers','.method','.ecosystem','.challenges','.contact','.faq']
    .map(s => $(s)).filter(Boolean);

  let y = scrollY, target = scrollY, velocity = 0, frame = 0, last = 0;
  let geometry = new Map(), pointer = {x:0,y:0}, currentPointer = {x:0,y:0};

  const measure = el => {
    const r = el.getBoundingClientRect();
    return {top:r.top + scrollY, height:Math.max(1,el.offsetHeight)};
  };

  function measureAll(){
    [hero,plateStory,contact,...scenes].filter(Boolean).forEach(el=>geometry.set(el,measure(el)));
    geometry.set(document.documentElement,{height:Math.max(1,document.documentElement.scrollHeight-innerHeight)});
    wake();
  }

  const progress = (el, start=.82, end=.18) => {
    const g=geometry.get(el); if(!g) return 0;
    const viewportStart=y+innerHeight*start;
    const viewportEnd=y+innerHeight*end;
    const range=g.height + innerHeight*(start-end);
    return clamp((viewportStart-g.top)/Math.max(1,range));
  };

  const pinned = el => {
    const g=geometry.get(el); if(!g) return 0;
    return clamp((y-g.top+90)/Math.max(1,g.height-innerHeight+110));
  };

  function setScene(el){
    const p=smooth(progress(el,.90,.12));
    el.style.setProperty('--scene',p.toFixed(4));
    el.style.setProperty('--scene-enter',smooth(clamp(p/.42)).toFixed(4));
    el.style.setProperty('--scene-leave',smooth(clamp((p-.68)/.32)).toFixed(4));
  }

  async function decodeScene(el,selector){
    if(!el) return;
    try{
      await Promise.all($$(selector,el).map(async img=>{img.loading='eager';await img.decode()}));
      el.classList.add('is-ready'); wake();
    }catch{}
  }

  if('IntersectionObserver' in window){
    const loader=new IntersectionObserver(entries=>entries.forEach(e=>{
      if(!e.isIntersecting)return;
      if(e.target===plateArt)decodeScene(e.target,'.plate');
      else decodeScene(e.target,'.statue-body,.statue-arm');
      loader.unobserve(e.target);
    }),{rootMargin:'520px'});
    if(plateArt)loader.observe(plateArt);
    if(statue)loader.observe(statue);
  }

  function paint(){
    const page=geometry.get(document.documentElement)?.height||1;
    root.style.setProperty('--reading',clamp(target/page).toFixed(4));
    document.body.classList.toggle('has-scrolled',target>24);

    scenes.forEach(setScene);
    if(reduced.matches)return;

    const hg=geometry.get(hero);
    if(hg){
      const hp=clamp(y/hg.height);
      const inert=Math.max(-1,Math.min(1,velocity/120));
      symbol.style.transform=`translate3d(${currentPointer.x*28+inert*5}px,${-hp*118+currentPointer.y*18}px,0) rotate(${-hp*15+inert*1.8}deg) scale(${1-hp*.07})`;
      orbit.style.transform=`translate3d(${currentPointer.x*12-inert*4}px,${hp*82+currentPointer.y*10}px,0) rotate(${-12+hp*112}deg) scale(${1+hp*.06})`;
      if(halo) halo.style.transform=`translate3d(0,${hp*30}px,0) scale(${1+hp*.18})`;
      if(heroContent){
        heroContent.style.transform=`translate3d(0,${-hp*52}px,0)`;
        heroContent.style.opacity=String(1-clamp((hp-.62)/.38)*.82);
      }
      root.style.setProperty('--header-y',`${hp>0.12?-2:0}px`);
      root.style.setProperty('--header-scale',hp>0.12?'.985':'1');
    }

    if(plateStory && plates.length){
      const p=smooth(desktop.matches?pinned(plateStory):progress(plateStory,.92,.12));
      [53-13*p,31+5*p,8+22*p].forEach((position,i)=>{
        plates[i].style.transform=`translate3d(${(i-1)*8*(1-p)}%,${position}%,0) rotate(${(i-1)*6*(1-p)}deg) scale(${.93+p*.07})`;
      });
      if(plateArt) plateArt.style.transform=`translate3d(0,${(p-.5)*-25}px,0) scale(${.96+p*.04})`;
    }

    const numbers=$('.numbers');
    if(numbers&&network){
      const np=smooth(progress(numbers,.88,.16));
      network.style.transform=`translate3d(${(1-np)*-30}px,${(1-np)*35}px,0) rotate(${-11+np*27}deg) scale(${.9+np*.1})`;
    }

    const method=$('.method');
    if(method&&methodArt){
      const mp=smooth(progress(method,.9,.14));
      methodArt.style.transform=`translate3d(0,${(1-mp)*26}px,0) rotate(${-30+mp*175}deg) scale(${.91+mp*.09})`;
    }

    if(ribbon){
      const rp=progress(ribbon,.95,.05);
      ribbon.style.setProperty('--ribbon-x',`${-2-rp*22}%`);
    }

    if(contact&&statue){
      const cp=smooth(desktop.matches?pinned(contact):progress(contact,.94,.08));
      const enter=smooth(clamp(cp/.5));
      const leave=smooth(clamp((cp-.82)/.18));
      statue.style.transform=`translate3d(${-11*(1-enter)+5*leave}%,${13*(1-enter)+10*leave}%,0) scale(${.92+enter*.08})`;
      if(arm) arm.style.transform=`rotate(${52-42*enter}deg)`;
      contact.style.setProperty('--gesture',enter.toFixed(4));
    }
  }

  function tick(time){
    frame=0;
    if(document.hidden)return;
    const dt=last?Math.min(time-last,50):16.7; last=time;
    const prev=y;
    const alpha=1-Math.exp(-dt/72);
    y+=(target-y)*alpha;
    velocity=(y-prev)/Math.max(dt,1)*1000;
    currentPointer.x+=(pointer.x-currentPointer.x)*alpha;
    currentPointer.y+=(pointer.y-currentPointer.y)*alpha;
    paint();
    if(Math.abs(y-target)>.08||Math.abs(pointer.x-currentPointer.x)>.001||Math.abs(pointer.y-currentPointer.y)>.001)frame=requestAnimationFrame(tick);
    else last=0;
  }
  function wake(){if(!frame&&!document.hidden)frame=requestAnimationFrame(tick)}

  addEventListener('scroll',()=>{target=scrollY;wake()},{passive:true});
  addEventListener('resize',measureAll,{passive:true});
  addEventListener('load',measureAll,{once:true});
  document.addEventListener('visibilitychange',()=>{target=y=scrollY;measureAll();wake()});
  reduced.addEventListener('change',()=>{root.classList.toggle('js-motion',!reduced.matches);measureAll()});
  desktop.addEventListener('change',measureAll);
  if('ResizeObserver'in window)new ResizeObserver(measureAll).observe(document.body);

  if(hero){
    hero.addEventListener('pointermove',e=>{
      if(e.pointerType!=='mouse'||reduced.matches)return;
      const r=hero.getBoundingClientRect();
      pointer={x:(e.clientX-r.left)/r.width-.5,y:(e.clientY-r.top)/r.height-.5};wake();
    });
    hero.addEventListener('pointerleave',()=>{pointer={x:0,y:0};wake()});
  }
  measureAll();
})();
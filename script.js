'use strict';

const $=(s,p=document)=>p.querySelector(s);
const $$=(s,p=document)=>[...p.querySelectorAll(s)];
const clamp=v=>Math.max(0,Math.min(1,v));
const smooth=v=>{v=clamp(v);return v*v*(3-2*v)};
const root=document.documentElement;
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const desktop=matchMedia('(min-width:901px) and (min-height:721px)');

/* navigation */
const toggle=$('.menu-toggle');
const nav=$('#main-nav');
function closeMenu(){
  if(!nav||!toggle)return;
  nav.classList.remove('is-open');
  toggle.setAttribute('aria-expanded','false');
}
if(toggle&&nav){
  toggle.addEventListener('click',()=>{
    const open=toggle.getAttribute('aria-expanded')!=='true';
    nav.classList.toggle('is-open',open);
    toggle.setAttribute('aria-expanded',String(open));
  });
  $$('a',nav).forEach(a=>a.addEventListener('click',closeMenu));
  document.addEventListener('click',e=>{if(!e.target.closest('.site-header'))closeMenu()});
  document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu()});
}
const year=$('#year'); if(year)year.textContent=new Date().getFullYear();

/* accessible tabs */
const tabs=$$('[role="tab"]');
function selectTab(index,focus=false){
  tabs.forEach((tab,i)=>{
    const selected=i===index;
    tab.setAttribute('aria-selected',String(selected));
    tab.tabIndex=selected?0:-1;
    const panel=$('#'+tab.getAttribute('aria-controls'));
    if(panel)panel.hidden=!selected;
  });
  if(focus&&tabs[index])tabs[index].focus();
}
tabs.forEach((tab,i)=>{
  tab.addEventListener('click',()=>selectTab(i));
  tab.addEventListener('keydown',e=>{
    let next;
    if(e.key==='ArrowDown'||e.key==='ArrowRight')next=(i+1)%tabs.length;
    if(e.key==='ArrowUp'||e.key==='ArrowLeft')next=(i+tabs.length-1)%tabs.length;
    if(e.key==='Home')next=0;
    if(e.key==='End')next=tabs.length-1;
    if(next!==undefined){e.preventDefault();selectTab(next,true)}
  });
});

/* light reveal only as a fallback/entry cue; scroll remains the main animation driver */
root.classList.toggle('js-motion',!reduced.matches);
if('IntersectionObserver'in window){
  const io=new IntersectionObserver(entries=>entries.forEach(e=>{
    if(e.isIntersecting){e.target.classList.add('is-visible');io.unobserve(e.target)}
  }),{threshold:.06,rootMargin:'0px 0px -7% 0px'});
  $$('.reveal').forEach(el=>io.observe(el));
}else $$('.reveal').forEach(el=>el.classList.add('is-visible'));

/* sequence renderer: crossfades neighbor frames continuously with scroll */
const seqState=new WeakMap();
function renderSequence(el,p){
  if(!el)return;
  const frames=$$('.scrub-frame',el);
  if(!frames.length)return;
  if(reduced.matches){
    frames.forEach((f,i)=>f.style.opacity=i===0?'1':'0');
    return;
  }
  const x=clamp(p)*(frames.length-1);
  const a=Math.floor(x);
  const b=Math.min(frames.length-1,a+1);
  const t=x-a;
  const state=seqState.get(el)||{};
  if(state.a!==a||state.b!==b){
    frames.forEach(f=>f.style.opacity='0');
    state.a=a;state.b=b;
  }
  frames[a].style.opacity=String(1-t);
  frames[b].style.opacity=String(b===a?1:t);
  frames[a].style.transform=`translate3d(0,${-3*t}px,0) scale(${1+.018*t})`;
  frames[b].style.transform=`translate3d(0,${5*(1-t)}px,0) scale(${.982+.018*t})`;
  seqState.set(el,state);
}

const hero=$('.hero');
const heroSeq=$('[data-sequence="hero"]');
const heroContent=$('.hero-content');
const heroHalo=$('.hero-halo');

const overview=$('.overview');
const plateStory=$('.layers-story');
const plateArt=$('.layers-art');
const plates=$$('.plate');

const solutions=$('.solutions');
const solutionsSeq=$('[data-sequence="solutions"]');

const difference=$('.difference');

const numbers=$('.numbers');
const network=$('.network-art');

const method=$('.method');
const methodSeq=$('[data-sequence="method"]');
const steps=$$('.steps li');

const ecosystem=$('.ecosystem');
const challenges=$('.challenges');

const contact=$('.contact');
const statue=$('.contact-art');
const contactArmSeq=$('[data-sequence="contact-arm"]');

const faq=$('.faq');
const ribbon=$('.type-ribbon');

const sceneEls=[overview,solutions,difference,numbers,method,ecosystem,challenges,contact,faq].filter(Boolean);

let y=scrollY,target=scrollY,velocity=0,frame=0,last=0;
let pointer={x:0,y:0},pointerNow={x:0,y:0};
let geo=new Map();

function measure(el){
  const r=el.getBoundingClientRect();
  return {top:r.top+scrollY,height:Math.max(1,el.offsetHeight)};
}
function measureAll(){
  [hero,plateStory,...sceneEls,ribbon].filter(Boolean).forEach(el=>geo.set(el,measure(el)));
  geo.set(document.documentElement,{height:Math.max(1,document.documentElement.scrollHeight-innerHeight)});
  wake();
}
function travel(el,start=.88,end=.14){
  const g=geo.get(el); if(!g)return 0;
  const from=y+innerHeight*start;
  const range=g.height+innerHeight*(start-end);
  return clamp((from-g.top)/Math.max(1,range));
}
function pin(el){
  const g=geo.get(el); if(!g)return 0;
  return clamp((y-g.top+95)/Math.max(1,g.height-innerHeight+110));
}
function setScene(el){
  if(!el)return 0;
  const p=smooth(travel(el,.92,.10));
  el.style.setProperty('--scene',p.toFixed(4));
  el.style.setProperty('--scene-in',smooth(clamp(p/.43)).toFixed(4));
  return p;
}

function paint(){
  const page=geo.get(document.documentElement)?.height||1;
  root.style.setProperty('--reading',clamp(target/page).toFixed(4));
  document.body.classList.toggle('has-scrolled',target>24);

  sceneEls.forEach(setScene);
  if(challenges){challenges.style.setProperty('--scene-in','1');}

  if(reduced.matches){
    [heroSeq,solutionsSeq,methodSeq,contactArmSeq].forEach(el=>renderSequence(el,0));
    return;
  }

  /* hero */
  if(hero){
    const hg=geo.get(hero);
    const hp=hg?clamp(y/Math.max(1,hg.height*.88)):0; root.style.setProperty('--hero-p',smooth(hp).toFixed(4));
    const hScene=smooth(clamp(hp/.88));
    renderSequence(heroSeq,hScene);
    const inert=Math.max(-1,Math.min(1,velocity/135));
    if(heroSeq){
      heroSeq.style.transform=`translate3d(${pointerNow.x*12+inert*3}px,calc(-50% + ${hp*34+pointerNow.y*9}px),0) rotate(${-7+hp*112+inert*1.4}deg) scale(${.96+Math.sin(hp*Math.PI)*.08})`;
    }
    if(heroHalo)heroHalo.style.transform=`scale(${1+hp*.12}) translate3d(0,${hp*18}px,0)`;
    if(heroContent){
      heroContent.style.transform=`translate3d(0,${-hp*44}px,0)`;
      heroContent.style.opacity='1';
    }
  }

  /* about / layered plates */
  if(plateStory&&plates.length){
    const p=smooth(desktop.matches?pin(plateStory):travel(plateStory,.94,.10));
    const spread=Math.sin(Math.PI*p);
    const offsets=[-19,0,19];
    plates.forEach((plate,i)=>{
      const side=i-1;
      plate.style.transform=`translate3d(${side*7*spread}%,${offsets[i]*spread}%,0) rotate(${side*4*spread}deg) scale(${.90+spread*.13})`;
      plate.style.opacity=String(.72+spread*.28);
    });
    if(plateArt)plateArt.style.transform=`translate3d(0,${(p-.5)*-16}px,0) scale(${.97+spread*.035})`;
  }

  /* solutions network sequence */
  if(solutions){
    const sp=smooth(travel(solutions,.93,.08));
    renderSequence(solutionsSeq,sp);
    if(solutionsSeq)solutionsSeq.style.transform=`translate3d(${(1-sp)*35}px,${(sp-.5)*-24}px,0) rotate(${-5+sp*11}deg) scale(${.93+sp*.07})`;
  }

  /* numbers / owned visual asset */
  if(numbers){
    const np=smooth(travel(numbers,.92,.10));
    if(network)network.style.transform=`translate3d(${(1-np)*-28}px,${(1-np)*24}px,0) rotate(${-7+np*16}deg) scale(${.94+np*.06})`;
  }

  /* method: true frame scrub, not a simple rotation */
  if(method){
    const mp=smooth(travel(method,.94,.08));
    renderSequence(methodSeq,mp);
    if(methodSeq)methodSeq.style.transform=`translate3d(${(1-mp)*-24}px,${(1-mp)*18}px,0) rotate(${-24+mp*248}deg) scale(${.95+mp*.05})`;
    const active=Math.min(steps.length-1,Math.floor(mp*steps.length));
    steps.forEach((el,i)=>el.classList.toggle('is-active',i===active));
  }

  /* contact: pinned body + 5-state arm sequence */
  if(contact&&statue){
    const cp=smooth(desktop.matches?pin(contact):travel(contact,.95,.06));
    renderSequence(contactArmSeq,cp);
    const enter=smooth(clamp(cp/.68));
    const leave=smooth(clamp((cp-.9)/.1));
    statue.style.transform=`translate3d(${-10*(1-enter)+4*leave}%,${12*(1-enter)+8*leave}%,0) scale(${.93+enter*.07})`;
    if(contactArmSeq)contactArmSeq.style.transform=`translate3d(${pointerNow.x*4}px,${pointerNow.y*4}px,0)`;
    contact.style.setProperty('--gesture',enter.toFixed(4));
  }

  /* ribbon */
  if(ribbon){
    const rp=travel(ribbon,.98,.02);
    ribbon.style.setProperty('--ribbon-x',`${-3-rp*18}%`);
  }
}

function tick(time){
  frame=0;
  if(document.hidden)return;
  const dt=last?Math.min(time-last,50):16.7;
  last=time;
  const before=y;
  const alpha=1-Math.exp(-dt/62);
  y+=(target-y)*alpha;
  velocity=(y-before)/Math.max(1,dt)*1000;
  pointerNow.x+=(pointer.x-pointerNow.x)*alpha;
  pointerNow.y+=(pointer.y-pointerNow.y)*alpha;
  paint();
  if(Math.abs(y-target)>.08||Math.abs(pointer.x-pointerNow.x)>.001||Math.abs(pointer.y-pointerNow.y)>.001){
    frame=requestAnimationFrame(tick);
  }else last=0;
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
    pointer={x:(e.clientX-r.left)/r.width-.5,y:(e.clientY-r.top)/r.height-.5};
    wake();
  });
  hero.addEventListener('pointerleave',()=>{pointer={x:0,y:0};wake()});
}

measureAll();

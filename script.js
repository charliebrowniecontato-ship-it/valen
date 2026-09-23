(() => {
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const nav = document.querySelector('[data-nav]');
  const menu = document.querySelector('.nav__menu');
  const links = [...document.querySelectorAll('.nav__links a[href^="#"]')];
  const sections = links.map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);
  const cursor = document.querySelector('.cursor-orb');
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  const onScroll = () => nav?.classList.toggle('scrolled', scrollY > 24);
  onScroll(); addEventListener('scroll', onScroll, {passive:true});

  menu?.addEventListener('click', () => {
    const open = nav.classList.toggle('menu-open');
    document.body.classList.toggle('menu-open', open);
    menu.setAttribute('aria-expanded', String(open));
  });
  links.forEach(a => a.addEventListener('click', () => {
    nav?.classList.remove('menu-open'); document.body.classList.remove('menu-open'); menu?.setAttribute('aria-expanded','false');
  }));

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === `#${entry.target.id}`));
      });
    }, {rootMargin:'-30% 0px -60%', threshold:.01});
    sections.forEach(s => observer.observe(s));
  }

  if (!reduceMotion && cursor && matchMedia('(pointer:fine)').matches) {
    let x = innerWidth/2, y = innerHeight/2, tx=x, ty=y;
    addEventListener('pointermove', e => { tx=e.clientX; ty=e.clientY; }, {passive:true});
    const tick = () => { x += (tx-x)*.08; y += (ty-y)*.08; cursor.style.left=x+'px'; cursor.style.top=y+'px'; requestAnimationFrame(tick); }; tick();
  }

  const boot = () => {
    if (!window.gsap || reduceMotion) {
      document.querySelectorAll('.method-step').forEach(el => el.classList.add('is-active'));
      return;
    }
    gsap.registerPlugin(ScrollTrigger);

    const heroTl = gsap.timeline({defaults:{ease:'power3.out'}});
    heroTl.from('.hero-kicker',{y:18,opacity:0,duration:.6})
      .from('.hero__title-line',{yPercent:110,duration:1.05,stagger:.12},'-=.25')
      .from('.hero__lead',{y:24,opacity:0,duration:.7},'-=.55')
      .from('.hero__actions',{y:20,opacity:0,duration:.65},'-=.45')
      .from('[data-hero-visual]',{scale:.9,opacity:0,rotate:2,duration:1.25},'-=1')
      .from('.hero__metric',{scale:.75,opacity:0,stagger:.12,duration:.55},'-=.45');

    gsap.to('.hero__art',{yPercent:10,rotate:2,scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:1.2}});
    gsap.to('.hero__visual-ring',{rotate:45,scale:1.08,scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:1.5}});

    gsap.utils.toArray('[data-reveal-text]').forEach(el => {
      gsap.from(el,{y:70,opacity:0,duration:1.05,ease:'power3.out',scrollTrigger:{trigger:el,start:'top 84%'}});
    });

    gsap.utils.toArray('[data-float]').forEach(el => {
      gsap.fromTo(el,{y:55},{y:-35,ease:'none',scrollTrigger:{trigger:el,start:'top bottom',end:'bottom top',scrub:1.2}});
    });

    const rail = document.querySelector('[data-horizontal]');
    if (rail && innerWidth > 760) {
      const getDistance = () => Math.max(0, rail.scrollWidth - innerWidth + parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--pad'))*2);
      gsap.to(rail,{x:()=>-getDistance(),ease:'none',scrollTrigger:{trigger:'.problems',start:'top top',end:()=>`+=${getDistance()+innerHeight*.7}`,scrub:1,pin:true,invalidateOnRefresh:true}});
    }

    const steps = gsap.utils.toArray('.method-step');
    steps.forEach((step,i) => {
      ScrollTrigger.create({trigger:step,start:'top 58%',end:'bottom 42%',onToggle:self=>self.isActive && steps.forEach((s,j)=>s.classList.toggle('is-active',i===j))});
    });
    gsap.to('.method__visual img',{scale:1.08,yPercent:3,ease:'none',scrollTrigger:{trigger:'.method__layout',start:'top bottom',end:'bottom top',scrub:1.3}});
    gsap.to('.method__dial b',{textContent:5,snap:{textContent:1},scrollTrigger:{trigger:'.method__layout',start:'top 55%',end:'bottom 55%',scrub:true}});

    gsap.from('.solution-card',{y:80,opacity:0,stagger:.12,duration:.9,ease:'power3.out',scrollTrigger:{trigger:'.solutions__grid',start:'top 80%'}});
    gsap.utils.toArray('.principle').forEach((el,i)=>gsap.from(el,{x:40,opacity:0,duration:.7,delay:i*.03,scrollTrigger:{trigger:el,start:'top 90%'}}));
    gsap.to('.careers__art img',{rotate:8,scale:1.08,yPercent:5,ease:'none',scrollTrigger:{trigger:'.careers',start:'top bottom',end:'bottom top',scrub:1.3}});
    gsap.to('.contact__orb',{rotate:65,scale:1.12,ease:'none',scrollTrigger:{trigger:'.contact',start:'top bottom',end:'bottom top',scrub:1.2}});

    document.querySelectorAll('.magnetic').forEach(el => {
      el.addEventListener('pointermove', e => { const r=el.getBoundingClientRect(); gsap.to(el,{x:(e.clientX-r.left-r.width/2)*.08,y:(e.clientY-r.top-r.height/2)*.12,duration:.25}); });
      el.addEventListener('pointerleave',()=>gsap.to(el,{x:0,y:0,duration:.45,ease:'elastic.out(1,.45)'}));
    });
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();

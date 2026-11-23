'use strict';
const toggle=document.querySelector('.menu-toggle');
const nav=document.querySelector('#main-nav');
function closeMenu(){if(!toggle||!nav)return;toggle.setAttribute('aria-expanded','false');toggle.setAttribute('aria-label','Abrir menu');nav.classList.remove('is-open');document.body.classList.remove('nav-open')}
if(toggle&&nav){
 toggle.addEventListener('click',()=>{const opening=toggle.getAttribute('aria-expanded')!=='true';toggle.setAttribute('aria-expanded',String(opening));toggle.setAttribute('aria-label',opening?'Fechar menu':'Abrir menu');nav.classList.toggle('is-open',opening);document.body.classList.toggle('nav-open',opening)});
 nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));
 document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu()});
 document.addEventListener('click',e=>{if(!e.target.closest('.site-header'))closeMenu()});
 window.addEventListener('resize',()=>{if(innerWidth>820)closeMenu()},{passive:true});
}
const year=document.querySelector('#year');if(year)year.textContent=String(new Date().getFullYear());

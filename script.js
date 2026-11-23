'use strict';
const nav=document.querySelector('#main-nav'),toggle=document.querySelector('.menu-toggle');
const close=()=>{if(!nav||!toggle)return;nav.classList.remove('is-open');toggle.setAttribute('aria-expanded','false');toggle.setAttribute('aria-label','Abrir menu');document.body.classList.remove('nav-open')};
if(nav&&toggle){
toggle.addEventListener('click',()=>{const open=toggle.getAttribute('aria-expanded')!=='true';toggle.setAttribute('aria-expanded',String(open));toggle.setAttribute('aria-label',open?'Fechar menu':'Abrir menu');nav.classList.toggle('is-open',open);document.body.classList.toggle('nav-open',open)});
nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',close));document.addEventListener('keydown',e=>{if(e.key==='Escape')close()});document.addEventListener('click',e=>{if(!e.target.closest('.site-header'))close()});window.addEventListener('resize',()=>{if(innerWidth>820)close()},{passive:true});}
const year=document.querySelector('#year');if(year)year.textContent=String(new Date().getFullYear());
/* Centralized WhatsApp destination. Do not assign an unverified phone number.
   Until João Valentim's confirmed number is supplied, CTA retains /diagnostico fallback. */
const VALEN_WHATSAPP_NUMBER='558487149954';
const opening='Olá! Vim pelo site da Valen e quero entender qual modelo de aceleração comercial faz mais sentido para minha empresa.';
if(/^55\d{10,11}$/.test(VALEN_WHATSAPP_NUMBER)){
document.querySelectorAll('.whatsapp-intent').forEach(a=>{a.href='https://wa.me/'+VALEN_WHATSAPP_NUMBER+'?text='+encodeURIComponent(opening);a.target='_blank';a.rel='noopener noreferrer';});
}
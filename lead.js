'use strict';
const form=document.querySelector('#lead-form');
if(form){
 const status=document.querySelector('#form-status');
 const submit=form.querySelector('[type="submit"]');
 submit.disabled=true;
 status.textContent='Verificando disponibilidade do contato por e-mail...';
 fetch('/api/lead',{method:'GET'}).then(r=>r.json()).then(config=>{
   submit.disabled=!config.configured;
   status.textContent=config.configured?'Canal de envio disponível.':'O envio por e-mail está em configuração. Você pode copiar seus dados; nada será enviado automaticamente.';
 }).catch(()=>{submit.disabled=true;status.textContent='Não foi possível verificar o canal de envio por e-mail.'});
 const fields=['nome','email','empresa','telefone','faturamento','segmento'];
 const collect=()=>{
   const data=new FormData(form);
   return Object.fromEntries(fields.map(k=>[k,String(data.get(k)||'').trim().slice(0,150)]));
 };
 const summary=()=>{const d=collect();return [
  'Solicitação de diagnóstico comercial — Valen',
  'Nome: '+d.nome,'E-mail: '+d.email,'Empresa: '+d.empresa,
  'WhatsApp: '+d.telefone,'Faturamento mensal: '+d.faturamento,
  'Segmento: '+d.segmento
 ].join('\n')};
 document.querySelector('#copy-lead')?.addEventListener('click',async()=>{
  if(!form.reportValidity())return;
  try{await navigator.clipboard.writeText(summary());status.textContent='Dados copiados. O envio à Valen ainda não foi realizado.'}
  catch{status.textContent='Não foi possível copiar automaticamente; selecione e copie os dados manualmente.'}
 });
 form.addEventListener('submit',async e=>{
  e.preventDefault();if(!form.reportValidity())return;
  const lead=collect();const phone=lead.telefone.replace(/\D/g,'');
  if(phone.length<10||phone.length>13){status.textContent='Informe um WhatsApp válido com DDD.';return}
  if(form.elements.website?.value)return;
  submit.disabled=true;status.textContent='Verificando o canal de contato...';
  try{
   const res=await fetch('/api/lead',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...lead,consentimento:form.elements.consentimento.checked})});
   if(!res.ok){status.textContent=res.status===503?'O canal de e-mail está em configuração. Você pode copiar os dados, mas a solicitação ainda não foi enviada.':'Não foi possível enviar. Tente novamente.';return}
   status.textContent='Solicitação enviada. A equipe poderá responder pelo contato informado.';form.reset();
  }catch{status.textContent='Falha de conexão. Nenhuma confirmação de envio foi recebida.'}
  finally{submit.disabled=false}
 });
}

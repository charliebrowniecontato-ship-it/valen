'use strict';
module.exports=async function handler(req,res){
 res.setHeader('Cache-Control','no-store');
 res.setHeader('X-Content-Type-Options','nosniff');
 if(req.method!=='POST'){res.setHeader('Allow','POST');return res.status(405).json({error:'Método inválido'})}
 const key=process.env.RESEND_API_KEY;
 const to=process.env.VALEN_CONTACT_EMAIL;
 const from=process.env.VALEN_SENDER_EMAIL;
 if(!key||!to||!from)return res.status(503).json({error:'Canal de e-mail não configurado'});
 const ctype=req.headers['content-type']||'';
 if(!ctype.includes('application/json'))return res.status(415).json({error:'Formato inválido'});
 const raw=req.body||{};
 const pick=k=>typeof raw[k]==='string'?raw[k].trim().slice(0,150):'';
 const keys=['nome','email','empresa','telefone','faturamento','segmento'];
 const values=Object.fromEntries(keys.map(k=>[k,pick(k)]));
 const validEmail=/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email);
 const validPhone=values.telefone.replace(/\D/g,'').length>=10;
 if(!raw.consentimento||!validEmail||!validPhone||keys.some(k=>!values[k]))return res.status(422).json({error:'Dados inválidos'});
 const text=['Nova solicitação — Diagnóstico Valen',...keys.map(k=>k+': '+values[k]),'Consentimento: confirmado'].join('\n');
 try{
  const response=await fetch('https://api.resend.com/emails',{method:'POST',headers:{'Authorization':'Bearer '+key,'Content-Type':'application/json'},body:JSON.stringify({from,to:[to],reply_to:values.email,subject:'Diagnóstico comercial | '+values.empresa,text})});
  if(!response.ok)return res.status(502).json({error:'Serviço de envio indisponível'});
  return res.status(200).json({ok:true});
 }catch{return res.status(502).json({error:'Falha no serviço de e-mail'})}
};

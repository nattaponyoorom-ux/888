import {api} from '../api.js';
import {cards,status,node} from '../utils.js';
const target=document.getElementById('catalog');
try { const c=await api.catalog(); cards(target,c.carriages,'carriage');
  if(c.mode === 'DEMO') target.before(node('p','ข้อมูลสาธิตสำหรับทดลองระบบ ยังไม่ใช่ข้อมูลบริการจริง','notice')); }
catch(e) { status(target,e.message,true); }

import {api} from '../api.js';
import {node,status} from '../utils.js';
const params=new URLSearchParams(location.search);
const target=document.getElementById('document');
const print=document.getElementById('print');
// ลบ token จากแถบที่อยู่ ลดโอกาสคัดลอกหรือส่งต่อโดยไม่ตั้งใจ
const id=params.get('id'), token=params.get('token');
if(token) history.replaceState(null,'',location.pathname);
if(!id || !token) status(target,'กรุณาเปิดลิงก์ตรวจเอกสารที่ได้รับจากเจ้าหน้าที่');
else {
  try {
    const data=await api.verify(id,token);
    if(data?.intact === false) throw new Error('เอกสารนี้ไม่ผ่านการตรวจสอบความถูกต้อง กรุณาติดต่อเจ้าหน้าที่');
    if(!data || data.intact !== true || typeof data.id!=='string' || typeof data.status!=='string') throw new Error('รูปแบบเอกสารไม่ตรงกับบริการข้อมูล');
    target.replaceChildren(node('h2',`เอกสาร ${data.id}`),node('p',data.statusLabel || data.status));
    if(data.message) target.append(node('p',data.message));
    target.append(node('p','เอกสารนี้ใช้ตรวจสอบสถานะคำขอ กรุณารอใบเสนอราคาและการจัดสรรตู้ที่เจ้าหน้าที่ยืนยัน'));
    print.hidden=false; print.addEventListener('click',()=>window.print());
  } catch(e) { status(target,e.message,true); }
}

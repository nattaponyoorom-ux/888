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
    if(!data || typeof data.id!=='string' || typeof data.status!=='string') throw new Error('รูปแบบเอกสารไม่ตรงกับบริการข้อมูล');
    target.replaceChildren(node('h2',`เอกสาร ${data.id}`),node('p',data.status));
    if(data.message) target.append(node('p',data.message));
    // รอระบุฟิลด์รายการราคา/การยืนยันใน Api.gs ก่อนสร้างใบเสนอราคาเต็ม
    target.append(node('p','ข้อมูลตรวจสอบสถานะ · รายละเอียดใบเสนอราคาฉบับเต็มต้องยืนยันรูปแบบข้อมูลกับ Rail-API'));
    print.hidden=false; print.addEventListener('click',()=>window.print());
  } catch(e) { status(target,e.message,true); }
}

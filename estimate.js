import {api} from '../api.js';
import {CONFIG} from '../config.js';
import {node,status} from '../utils.js';
const form=document.getElementById('estimate-form');
const result=document.getElementById('result');
const calendar=document.getElementById('calendar');
const send=document.getElementById('request-form');
const pending=document.getElementById('pending');
const fields=form.elements;
let catalog, approvedInput=null, sending=false, attempted=false;
function options(name, rows) {
  fields[name].replaceChildren(new Option('กรุณาเลือก',''));
  rows.forEach(row=>fields[name].append(new Option(row.name,row.id)));
}
function input() {
  return {revision:catalog.revision, customerType:fields.customerType.value,
    service:fields.service.value, trip:fields.trip.value, date:fields.date.value,
    returnDate:fields.trip.value==='OVERNIGHT'?fields.returnDate.value:fields.date.value,
    routeId:fields.routeId.value,carriageId:fields.carriageId.value,
    count:Number(fields.count.value),passengers:Number(fields.passengers.value)};
}
form.addEventListener('input',()=>{
  approvedInput=null;send.hidden=true;result.replaceChildren();calendar.replaceChildren();
});
try {
  catalog=await api.catalog();
  options('carriageId',catalog.carriages); options('routeId',catalog.routes);
  options('service',catalog.services); options('trip',catalog.trips);
  fields.date.min=catalog.today; fields.returnDate.min=catalog.today;
  const selected=new URLSearchParams(location.search).get('carriage');
  if(selected) fields.carriageId.value=selected;
  form.querySelector('fieldset').disabled=false;
  document.getElementById('connection').textContent=catalog.scopeNote || '';
} catch(e) { status(document.getElementById('connection'),e.message,true); }
fields.trip.addEventListener('change',()=>{fields.returnDate.required=fields.trip.value==='OVERNIGHT';});
document.getElementById('check-calendar').addEventListener('click',async()=>{
  if(!fields.carriageId.value || !fields.date.value) return status(calendar,'เลือกตู้โดยสารและวันที่ก่อนตรวจตู้ว่าง',true);
  const button=document.getElementById('check-calendar');button.disabled=true;
  try {
    status(calendar,'กำลังตรวจสอบ…');
    const response=await api.calendar(fields.carriageId.value,fields.date.value,14);
    const rows=response?.days;
    if(!Array.isArray(rows)) throw new Error('รูปแบบปฏิทินไม่ตรงกับบริการข้อมูล');
    calendar.replaceChildren();
    rows.forEach(day=>calendar.append(node('p',`${day.date} · คงเหลือ ${day.available} ตู้ · ${day.status}`)));
  }catch(e){status(calendar,e.message,true);}finally{button.disabled=false;}
});
form.addEventListener('submit',async event=>{
  event.preventDefault();const button=document.getElementById('calculate');button.disabled=true;
  approvedInput=null;send.hidden=true;
  try {
    const proposed=input();status(result,'กำลังประเมินราคา…');
    const data=await api.estimate(proposed);
    if(JSON.stringify(proposed)!==JSON.stringify(input())) throw new Error('รายละเอียดเปลี่ยนระหว่างประเมิน กรุณาประเมินใหม่');
    if(!data || typeof data.enough!=='boolean') throw new Error('รูปแบบผลประเมินไม่ตรงกับบริการข้อมูล');
    result.replaceChildren(node('h2','ผลการประเมิน'),node('p',`ตู้คงเหลือ ${data.available} ตู้`));
    if(Number.isSafeInteger(data.grandTotalSatang)) result.append(node('p',`${(data.grandTotalSatang/100).toLocaleString('th-TH',{minimumFractionDigits:2})} บาท`,'price'));
    else result.append(node('p','รอการยืนยันฟิลด์ยอดรวมจาก Rail-API'));
    result.append(node('p','ผลประเมินยังไม่ใช่การยืนยันราคาและการจัดสรรตู้'));
    if(data.enough && CONFIG.privacyReady && !attempted) {approvedInput=proposed;send.hidden=false;}
    else result.append(node('p',data.enough?'การส่งคำขอยังไม่เปิดใช้งาน กรุณาติดต่อเจ้าหน้าที่':'จำนวนตู้ไม่เพียงพอ กรุณาปรับวันหรือจำนวนตู้'));
  }catch(e){status(result,e.message,true);}finally{button.disabled=false;}
});
send.addEventListener('submit',async event=>{
  event.preventDefault();if(sending || attempted || !approvedInput) return;
  const contact=Object.fromEntries(new FormData(send));contact.consent=send.elements.consent.checked;
  sending=true;attempted=true;send.querySelector('button').disabled=true;
  try {
    status(pending,'กำลังส่งคำขอ…');
    const data=await api.submit(approvedInput,contact);
    if(!data || typeof data.id!=='string') throw new Error('ผลตอบกลับไม่ระบุหมายเลขคำขอ จึงยังยืนยันผลไม่ได้');
    status(pending,`ส่งคำขอแล้ว หมายเลข ${data.id} กรุณารอเจ้าหน้าที่ตรวจสอบ`);
    send.reset();send.hidden=true;approvedInput=null;
  }catch(e){status(pending,`${e.message} หากยังไม่ทราบผล กรุณาติดต่อเจ้าหน้าที่ก่อนส่งซ้ำ`,true);}
  finally{sending=false;}
});

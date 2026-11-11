import {node} from './utils.js';
const links = [['index.html','หน้าแรก'],['carriages.html','ตู้โดยสาร'],['estimate.html','ประเมินราคา'],['attractions.html','ท่องเที่ยว'],['conditions.html','เงื่อนไข'],['faq.html','คำถามและติดต่อ']];
const root = document.getElementById('site-header');
const nav = node('nav', undefined, 'wrap navigation'); nav.setAttribute('aria-label','เมนูหลัก');
const logo = node('a','RAIL / CHARTER','brand'); logo.href = 'index.html'; nav.append(logo);
const menu = node('div', undefined, 'nav-links');
links.forEach(([href,title]) => { const a=node('a',title); a.href=href; if(location.pathname.endsWith('/'+href) || (href==='index.html' && location.pathname.endsWith('/'))) a.setAttribute('aria-current','page'); menu.append(a); });
nav.append(menu); root?.append(nav);
const footer=document.getElementById('site-footer');
if(footer) {
  footer.append(node('p','Rail Charter · ระบบประเมินค่าเช่าขบวนรถจัดเฉพาะและตู้โดยสารพิเศษ'));
  const a=node('a','นโยบายความเป็นส่วนตัว');a.href='privacy.html';footer.append(a);
  footer.append(node('p','ราคาและการให้บริการยึดข้อมูลที่เจ้าหน้าที่เผยแพร่และยืนยันเป็นรายคำขอ'));
}

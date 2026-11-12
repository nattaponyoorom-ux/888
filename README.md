# Rail Charter — GitHub Pages 888

เว็บไซต์: https://nattaponyoorom-ux.github.io/888/
เชื่อม Rail-API บน Google Apps Script แล้ว ใช้ HTTP contract 1 และ Core schema 2 ฉบับเต็ม

## สถานะ
- ฐานข้อมูลเริ่มต้นเป็น DEMO ราคา จำนวนตู้ และข้อมูลสถานที่เป็นข้อมูลสาธิต
- หน้าเว็บอ่าน catalog ตรวจตู้ว่าง 14 วัน และประเมินราคาจาก API
- ยังปิดการส่งคำขอจริง: ฝั่ง API ACCEPT_REQUESTS=false และหน้าเว็บ privacyReady=false
- ยังไม่มี Rail-Admin UI สำหรับจัดสรรตู้และยืนยันคำขอ หน้า verify แสดงสถานะ ยังไม่ใช่ใบเสนอราคาเต็ม
- ไม่ใช้ localStorage เป็นฐานข้อมูล ไม่ฝัง QUOTE_SECRET หรือข้อมูลลูกค้าใน GitHub
- อย่านำ Core v3 ที่ส่งมาไม่ครบมาผสมกับ schema 2 นี้

## ตำแหน่งตั้งค่า
แก้ URL API ที่ assets/js/config.js เพียงจุดเดียว ใช้ลิงก์ Web App ลงท้าย /exec
HTTP: POST Content-Type text/plain;charset=UTF-8 พร้อม JSON {"action":"getCatalog","payload":{}}
ผลตอบกลับ {"ok":true,"data":...} หรือ {"ok":false,"error":"..."}
อย่าใช้ no-cors เพราะอ่าน JSON ไม่ได้ และอย่า retry submitRequest อัตโนมัติเมื่อยังไม่ทราบผล

## คำสั่ง API
- getCatalog {} → revision,today,mode,scopeNote,contactNote,services,trips,stations,carriages,routes,attractions
- getCalendar {carriageId,startDate,days} → {carriage,units,days:[{date,available,status}]}
- estimate {input} → priced,grandTotalSatang,serviceTotalSatang,depositSatang,available,enough,revision
- submitRequest {input,contact} → {id,exempt,verifyUrl}; ค่าเริ่มต้นปิดรับคำขอ
- verifyQuote {id,token} → intact,status,statusLabel,...; intact:false คือเอกสารไม่ผ่านการตรวจสอบ
EXEMPT จะส่ง priced:false ต้องรอเจ้าหน้าที่พิจารณา ไม่ใช่ราคา 0 บาท

## การจัดการฐานข้อมูล
เจ้าหน้าที่แก้ Settings / Stations / Carriages / Routes / Rates / Attractions / Blackouts
แล้วรัน publishTables จาก Apps Script editor เพื่อเผยแพร่ Versions ใหม่
ห้ามแก้ Versions / Requests / Audit ด้วยมือ
Rates ใช้สตางค์ Routes ใช้เมตร วันที่ใช้ YYYY-MM-DD คงชนิดตัวเลขและ boolean ตามหัวตาราง
schema 2 นี้เก็บ snapshot ในเซลล์เดียวจำกัดต่ำกว่า 45,000 ตัวอักษร
installDatabase ใช้ติดตั้งครั้งแรกและปฏิเสธการเขียนทับข้อมูลเดิม ไม่ต้องรันซ้ำ

## Deploy
GitHub Pages ใช้ branch main ที่ root และ relative URL สำหรับ /888/
เมื่อแก้ Apps Script: Manage deployments > Edit > New version > Deploy
เมื่อแก้ข้อมูลตารางอย่างเดียว: run publishTables โดยไม่ต้อง Deploy โค้ดใหม่
เปิด local preview ด้วย python3 -m http.server 8080 จากโฟลเดอร์เว็บ (ไม่ใช้ file://)

## ก่อนเปิดรับคำขอจริง
ตรวจข้อมูลบริการและราคา เปลี่ยนข้อมูลสาธิตเป็นข้อมูลที่ได้รับอนุมัติ
กรอกช่องทางติดต่อ เงื่อนไข และ privacy.html ให้ครบ เตรียม workflow เจ้าหน้าที่
ทดสอบรับคำขอ/ตรวจเอกสาร/การจัดสรรตู้และการป้องกันคำขอซ้ำ
จากนั้นจึงเปิด ACCEPT_REQUESTS และ privacyReady

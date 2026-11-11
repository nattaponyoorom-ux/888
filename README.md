# rail-charter — ส่วนที่ 2 (โครงเว็บสำหรับเชื่อมต่อ)

สถานะ: โครงหน้าเว็บครบ แต่ยังไม่ใช่ระบบพร้อมใช้งานจริง ไม่มีการเชื่อม API หรือเผยแพร่ใน GitHub

## เปิดดู
ใช้ static HTTP server จากโฟลเดอร์นี้ เช่น `python3 -m http.server 8080` แล้วเปิด http://localhost:8080 ไม่ใช้ file:// เพราะใช้ JavaScript modules

## ไฟล์
หน้าแรก ตู้โดยสาร ประเมินราคา ท่องเที่ยว เงื่อนไข FAQ ตรวจเอกสาร และนโยบาย แยก HTML ตามรายการที่กำหนด CSS/JS อยู่ใน assets ใช้โทนเข้มทองจาก index.html เดิม
ไม่มีหน้าแอดมินหรือบัญชีแอดมินในเว็บสาธารณะ ไม่มีสูตรราคาสมมติและไม่มี localStorage เก็บข้อมูลกลาง

## เชื่อม Rail-API
แก้ลิงก์เพียง `assets/js/config.js` ค่า apiUrl เป็น deployment /exec ของ Apps Script
`contractReady: false` ปิดการเรียก API จนเทียบ Api.gs เวอร์ชัน 3 เสร็จ
สัญญา HTTP ด้านล่างเป็น **ข้อเสนอฉบับร่าง** ตามชื่อฟังก์ชันใน Rail-Public v2 ยังไม่มี Api.gs v3 ยืนยัน ห้ามถือว่าเชื่อมต่อสำเร็จเพียงใส่ URL

POST Content-Type text/plain;charset=UTF-8 ตัวเนื้อหาเป็น JSON:
`{ "action": "getCatalog", "payload": {} }`
ตอบ `{ "ok": true, "data": ... }` หรือ `{ "ok": false, "error": "ข้อความที่เปิดเผยกับลูกค้าได้" }`
- getCatalog: payload {} → revision,today,mode,scopeNote,contactNote,services,trips,stations,carriages,routes,attractions
- getCalendar: {carriageId,startDate,days} → {carriage,units,days:[{date,available,status}]}
- estimate: {input} → ผลราคาจากเซิร์ฟเวอร์พร้อม grandTotalSatang, available,enough,revision (ต้องยืนยันฟิลด์ v3)
- submitRequest: {input,contact} → {id,...} (รูปแบบผลลัพธ์และลิงก์ตรวจเอกสารต้องยืนยัน)
- verifyQuote: {id,token} → ข้อมูลเอกสารสาธารณะที่ปกปิดข้อมูลส่วนตัวแล้ว (หน้าเว็บขณะนี้แสดงเพียง id,status,message รอสร้างใบเสนอราคาเต็มตาม schema)
input: revision,customerType (GENERAL/EXEMPT),service (CHARTER/CARRIAGE),trip (ONEWAY/SAMEDAY/OVERNIGHT),date,returnDate,routeId,carriageId,count,passengers
contact: name,organisation,phone,email,purpose,consent (boolean)

Api.gs ต้อง dispatch เฉพาะฟังก์ชันสาธารณะที่อนุญาต ตรวจชนิด/ขอบเขต/สิทธิ์ฝั่งเซิร์ฟเวอร์เสมอ และไม่เปิดฟังก์ชัน Rail-Admin ผ่าน public API
ต้องทดสอบจาก origin GitHub Pages จริง ทั้ง preflight/redirect/CORS และการตอบ JSON ของ Apps Script ไม่ใช้ mode:no-cors เพราะจะอ่านผลไม่ได้ ไม่ใช้ JSONP ส่งข้อมูลลูกค้า ไม่มีการ retry คำขอเขียนข้อมูลอัตโนมัติ เมื่อผลส่งไม่ชัดเจนต้องสอบถามเจ้าหน้าที่ก่อนส่งซ้ำ

## ก่อนเปิดรับลูกค้าจริง
1. ขอ Core.gs v3 ฉบับเต็ม (ไฟล์ล่าสุดจบที่ `if (input.trip` และ parse ไม่ผ่าน), Api.gs และ Admin ชุดเดียวกัน
2. ตั้ง Google Sheets ชื่อ Rail Charter Database: เจ้าหน้าที่แก้ Settings/Stations/Carriages/Routes/Rates/Attractions/Blackouts ระบบเขียน Versions/Requests/Audit
3. ยืนยันสัญญา HTTP/ฟิลด์ผลลัพธ์ ปรับ api.js และ estimate/verify ให้ครบ ไม่มีการใช้สูตรราคา v1 แทน v3
4. ตรวจเงื่อนไข ช่องทางติดต่อและ privacy.html ให้ครบแล้วเปิด privacyReady
5. ทดสอบ API ทั้งประเมิน ตู้ว่าง ส่งคำขอ ตรวจเอกสาร และการปกปิดข้อมูล จาก GitHub Pages จริงก่อนเปิด contractReady

## GitHub Pages
นำไฟล์ในโฟลเดอร์นี้ขึ้น repository `rail-charter` บน branch ที่ต้องการ แล้วเลือก Settings > Pages > Deploy from a branch > main / root (หรือ workflow ของเจ้าของรีโป)
ใช้ relative URL ทุกหน้าตาม project site `/<repo>/` ไฟล์ 404.html กำหนด base `/rail-charter/` ไว้ หากเปลี่ยนชื่อ repository หรือใช้โดเมนตัวเองให้แก้ base ด้วย
ไม่รวม .gs, script properties, QUOTE_SECRET หรือข้อมูลลูกค้าใน repository สาธารณะ
ไม่มี workflow หรือ remote GitHub ถูกสร้างจากชุดนี้ เพราะยังไม่มี repository rail-charter ที่ระบุแน่นอนในบัญชีที่เชื่อมต่อ

## ภาพ
แทน placeholder ด้วยภาพที่มีสิทธิ์ใช้งานใน assets/img/carriages และ attractions พร้อมเครดิตภาพ แก้ URL ในตารางต้นทางแล้วเผยแพร่ Versions ผ่าน Rail-Admin

## การตรวจในรอบนี้
ตรวจไวยากรณ์ JavaScript และลิงก์ asset ภายใน; ยังไม่มี browser QA หรือ end-to-end API เพราะไม่มี endpoint และ Api.gs ฉบับเต็ม

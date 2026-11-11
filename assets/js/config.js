// แก้ endpoint ที่นี่ที่เดียว หลัง Deploy Rail-API เป็น Web App
export const CONFIG = Object.freeze({
  apiUrl: '',
  contractReady: false, // เปิดเมื่อ Api.gs รองรับสัญญา JSON ใน README แล้ว
  privacyReady: false, // เปิดหลังเจ้าของระบบตรวจนโยบายและข้อมูลผู้ควบคุมข้อมูล
  timeoutMs: 20000
});

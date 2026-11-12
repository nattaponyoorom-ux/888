import {CONFIG} from './config.js';
// Rail-API HTTP contract 1: POST JSON with a text/plain content type.
export async function call(action, payload = {}) {
  if (!CONFIG.apiUrl || !CONFIG.contractReady) throw new Error('ระบบกำลังเตรียมเชื่อมต่อข้อมูล กรุณาติดต่อเจ้าหน้าที่ก่อนส่งคำขอ');
  const url = new URL(CONFIG.apiUrl);
  if (url.protocol !== 'https:') throw new Error('ลิงก์ API ต้องใช้ HTTPS');
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), CONFIG.timeoutMs);
  try {
    const response = await fetch(url, {
      method: 'POST', headers: {'Content-Type': 'text/plain;charset=UTF-8'},
      body: JSON.stringify({action, payload}), signal: controller.signal,
      redirect: 'follow', credentials: 'omit', cache: 'no-store'
    });
    if (!response.ok) throw new Error('บริการข้อมูลไม่พร้อมใช้งาน กรุณาลองใหม่ภายหลัง');
    const result = await response.json();
    if (result.ok !== true) throw new Error(typeof result.error === 'string' ? result.error : 'ไม่สามารถดำเนินการได้');
    return result.data;
  } catch (error) {
    if (error.name === 'AbortError') throw new Error(action === 'submitRequest' ? 'ยังยืนยันผลการส่งไม่ได้ กรุณาติดต่อเจ้าหน้าที่ก่อนส่งซ้ำ' : 'บริการข้อมูลตอบกลับช้า กรุณาลองใหม่');
    if (error instanceof TypeError || error instanceof SyntaxError) throw new Error(action === 'submitRequest' ? 'ยังยืนยันผลการส่งไม่ได้ กรุณาติดต่อเจ้าหน้าที่ก่อนส่งซ้ำ' : 'เชื่อมต่อบริการข้อมูลไม่ได้ กรุณาลองใหม่ภายหลัง');
    throw error;
  } finally { clearTimeout(timer); }
}
export const api = {
  catalog: () => call('getCatalog'),
  calendar: (carriageId, startDate, days) => call('getCalendar', {carriageId, startDate, days}),
  estimate: input => call('estimate', {input}),
  submit: (input, contact) => call('submitRequest', {input, contact}),
  verify: (id, token) => call('verifyQuote', {id, token})
};

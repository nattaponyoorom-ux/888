export function node(tag, text, className) {
  const element = document.createElement(tag);
  if (text !== undefined) element.textContent = String(text ?? '');
  if (className) element.className = className;
  return element;
}
export function status(target, message, error = false) {
  target.replaceChildren(node('p', message, error ? 'notice error' : 'notice'));
}
export function safeImage(value, fallback) {
  try {
    const url = new URL(value, location.href);
    if (url.protocol === 'https:' || url.origin === location.origin) return url.href;
  } catch {}
  return fallback;
}
export function cards(target, rows, kind) {
  target.replaceChildren();
  if (!Array.isArray(rows) || !rows.length) return status(target, 'ยังไม่มีรายการที่เผยแพร่');
  rows.forEach(row => {
    const card = node('article', undefined, 'card');
    const img = node('img');
    const fallback = `assets/img/placeholder-${kind === 'carriage' ? 'carriage' : 'place'}.svg`;
    img.src = safeImage(row.imageUrl || fallback, fallback);
    img.alt = row.name || ''; img.loading = 'lazy';
    img.addEventListener('error', () => { img.src = fallback; }, {once:true});
    card.append(img, node('h2', row.name), node('p', row.description));
    if (row.imageCredit) card.append(node('small', row.imageCredit));
    if (kind === 'carriage') {
      card.append(node('p', `ความจุ ${row.capacity} คน`));
      const link = node('a', 'เลือกตู้นี้', 'button');
      link.href = `estimate.html?carriage=${encodeURIComponent(row.id)}`; card.append(link);
    }
    target.append(card);
  });
}

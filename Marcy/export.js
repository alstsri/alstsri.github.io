'use strict';
const statusText = document.getElementById('status');
function downloadSavedRecord(key, recovery = false) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      statusText.textContent = 'No saved data was found here. Open Marcy in the browser, device, or Home Screen app you used before, then export there.';
      return;
    }
    let readable = true;
    try { const value = JSON.parse(raw); readable = !!value && typeof value === 'object' && !Array.isArray(value); }
    catch { readable = false; }
    // Export the original bytes, including all history and any fields from older versions.
    const url = URL.createObjectURL(new Blob([raw], { type: 'application/json' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `marcy-${recovery || !readable ? 'recovery' : 'backup'}-${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 60000);
    statusText.textContent = readable
      ? 'Backup download requested. Check your browser’s downloads or save prompt. Your saved data has not been changed.'
      : 'Recovery file download requested. This saved record could not be read normally; keep the file and contact support for help. Your saved data has not been changed.';
  } catch {
    statusText.textContent = 'This browser could not access or download your saved data. Check its storage and download permissions, or contact support. Nothing has been erased.';
  }
}
document.getElementById('export').addEventListener('click', () => downloadSavedRecord('marcy_data'));
try {
  const keys = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('marcy_data_recovery_')) keys.push(key);
  }
  keys.sort().forEach((key, index) => {
    const button = document.createElement('button');
    button.type = 'button'; button.textContent = `Download saved recovery copy ${index + 1}`;
    button.addEventListener('click', () => downloadSavedRecord(key, true));
    document.getElementById('recovery').appendChild(button);
  });
} catch { /* The export button reports inaccessible storage when clicked. */ }
if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});

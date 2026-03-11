/* ─── WombTo18 Test Frontend – Shared JS ───────────────────────────── */
const API = 'http://localhost:3000';

/* ─── Auth Token ─── */
function getToken() { return localStorage.getItem('wt18_token') || ''; }
function setToken(t) { localStorage.setItem('wt18_token', t); syncTokenUI(); }
function syncTokenUI() {
  const el = document.getElementById('auth-token');
  if (el) el.value = getToken();
}

/* ─── Saved values (persist test data across pages) ─── */
function saveVal(key, v) { localStorage.setItem('wt18_' + key, v); }
function loadVal(key) { return localStorage.getItem('wt18_' + key) || ''; }

/* ─── API Caller ─── */
async function api(method, path, body, opts) {
  opts = opts || {};
  var auth = opts.auth !== undefined ? opts.auth : true;
  const headers = { 'Content-Type': 'application/json' };
  if (auth && getToken()) headers['Authorization'] = 'Bearer ' + getToken();
  if (opts.headers) { for (var k in opts.headers) { headers[k] = opts.headers[k]; } }

  const fetchOpts = { method, headers };
  if (body && !['GET', 'DELETE'].includes(method)) fetchOpts.body = typeof body === 'string' ? body : JSON.stringify(body);

  const t0 = performance.now();
  try {
    const res = await fetch(API + path, fetchOpts);
    const elapsed = Math.round(performance.now() - t0);
    const text = await res.text();
    let data;
    try { data = JSON.parse(text); } catch { data = text; }
    return { ok: res.ok, status: res.status, statusText: res.statusText, data, elapsed };
  } catch (err) {
    return { ok: false, status: 0, statusText: 'Network Error', data: { error: err.message }, elapsed: Math.round(performance.now() - t0) };
  }
}

/* ─── Show response ─── */
function showResponse(panelId, result) {
  const panel = document.getElementById(panelId);
  if (!panel) return;
  const hdr = panel.querySelector('.response-header');
  const body = panel.querySelector('.response-body');
  const statusSpan = hdr.querySelector('.res-status');
  statusSpan.textContent = result.status + ' ' + result.statusText;
  statusSpan.className = result.ok ? 'res-status status-ok' : 'res-status status-err';
  const timeSpan = hdr.querySelector('.res-time');
  if (timeSpan) timeSpan.textContent = result.elapsed + 'ms';
  body.textContent = typeof result.data === 'object' ? JSON.stringify(result.data, null, 2) : result.data;
  body.className = result.ok ? 'response-body ok' : 'response-body err';
}

/* ─── Response panel HTML ─── */
function responsePanelHTML(id) {
  return '<div class="response-panel" id="' + id + '">' +
    '<div class="response-header"><span class="res-status text-muted">No request sent</span><span class="res-time"></span></div>' +
    '<div class="response-body text-muted">Response will appear here\u2026</div></div>';
}

/* ─── Toast ─── */
function toast(msg, type) {
  type = type || 'info';
  var c = document.querySelector('.toast-container');
  if (!c) { c = document.createElement('div'); c.className = 'toast-container'; document.body.appendChild(c); }
  var t = document.createElement('div');
  t.className = 'toast toast-' + type;
  t.textContent = msg;
  c.appendChild(t);
  setTimeout(function () { t.style.opacity = '0'; t.style.transition = 'opacity .3s'; setTimeout(function () { t.remove(); }, 300); }, 3500);
}

/* ─── Server Health ─── */
async function checkServer() {
  var dot = document.querySelector('.server-dot');
  var txt = document.querySelector('.server-text');
  if (!dot) return;
  try {
    var res = await api('GET', '/registration/config/test-mode', null, { auth: false });
    if (res.ok) {
      dot.classList.add('ok');
      txt.textContent = 'Online \u2014 OTP: ' + (res.data.otpTestMode ? 'test' : 'live') + ', Pay: ' + (res.data.paymentTestMode ? 'test' : 'live');
    } else {
      dot.classList.remove('ok'); txt.textContent = 'Error ' + res.status;
    }
  } catch { dot.classList.remove('ok'); txt.textContent = 'Offline'; }
}

/* ─── Auth check ─── */
async function testAuth() {
  var el = document.getElementById('auth-status');
  if (!el) return;
  if (!getToken()) { el.textContent = 'No token'; el.style.color = 'var(--orange)'; return; }
  var res = await api('GET', '/auth/profile');
  if (res.ok && res.data.data) {
    el.textContent = 'Valid (' + (res.data.data.fullName || res.data.data.email) + ')';
    el.style.color = 'var(--green)';
  } else {
    el.textContent = 'Invalid'; el.style.color = 'var(--red)';
  }
}

/* ─── Helpers ─── */
function getVal(id) { var el = document.getElementById(id); return el ? el.value.trim() : ''; }
function setVal(id, v) { var el = document.getElementById(id); if (el) el.value = v; }

function initNav() {
  var current = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.top-header nav a').forEach(function (a) {
    if (a.getAttribute('href') === current) a.classList.add('active');
  });
}

/* ─── Boot ─── */
document.addEventListener('DOMContentLoaded', function () {
  syncTokenUI();
  initNav();
  checkServer();
  testAuth();
  setInterval(checkServer, 15000);
  var ti = document.getElementById('auth-token');
  if (ti) ti.addEventListener('input', function () { setToken(ti.value); });
});

// ── Utilities ──

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' });
}

function formatTime(t) {
  if (!t) return '—';
  return t.toString().slice(0, 5);
}

function riskBadge(level) {
  const map = { Low:'badge-green', Medium:'badge-yellow', High:'badge-red' };
  return `<span class="badge ${map[level]||'badge-gray'}">${level||'—'}</span>`;
}

function statusBadge(s) {
  const map = { Present:'badge-green', Late:'badge-yellow', Absent:'badge-red', enrolled:'badge-blue', completed:'badge-green', dropped:'badge-red' };
  return `<span class="badge ${map[s]||'badge-gray'}">${s||'—'}</span>`;
}

function gradeBadge(letter) {
  const map = { A:'badge-green', B:'badge-blue', C:'badge-purple', D:'badge-yellow', F:'badge-red' };
  return `<span class="badge ${map[letter]||'badge-gray'}">${letter||'—'}</span>`;
}

function getInitials(name) {
  if (!name) return 'U';
  return name.split(' ').slice(0,2).map(w=>w[0]).join('').toUpperCase();
}

function showSection(id) {
  document.querySelectorAll('.page-section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
  const sec = document.getElementById(id);
  if (sec) sec.classList.add('active');
  const navLink = document.querySelector(`[data-section="${id}"]`);
  if (navLink) navLink.classList.add('active');
}

function initClock() {
  const el = document.getElementById('topbar-time');
  if (!el) return;
  function tick() {
    const now = new Date();
    el.textContent = now.toLocaleTimeString('en-US', { hour:'2-digit', minute:'2-digit' });
  }
  tick();
  setInterval(tick, 1000);
}

function initUserInfo(auth) {
  const nameEl = document.getElementById('sidebar-user-name');
  const roleEl = document.getElementById('sidebar-user-role');
  const avatarEl = document.getElementById('sidebar-user-avatar');
  const badgeEl = document.getElementById('topbar-role-badge');
  if (nameEl) nameEl.textContent = auth.name || 'User';
  if (roleEl) roleEl.textContent = auth.role || '';
  if (avatarEl) avatarEl.textContent = getInitials(auth.name);
  if (badgeEl) badgeEl.textContent = auth.role;
}

function animateValue(el, end, decimals=0) {
  const start = 0, duration = 1000, startTime = performance.now();
  function step(now) {
    const t = Math.min((now - startTime) / duration, 1);
    const ease = 1 - Math.pow(1 - t, 3);
    el.textContent = (start + (end - start) * ease).toFixed(decimals);
    if (t < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

/* FMCG Admin Dashboard — app.js */
const API = 'http://localhost:5000';

// ── Demo Mode ─────────────────────────────────────────────────
// When backend is offline, login with: admin / admin123
const DEMO_CREDS = { username: 'admin', password: 'admin123' };
let DEMO_MODE = false;

const MOCK = {
  dashboard: {
    qr_codes:    { total: 500000, used: 127450, remaining: 372550, usage_percentage: 25.5 },
    submissions: { total_submissions: 127450, total_winners: 5120, unique_participants: 121300, unique_cities: 648, winner_percentage: 4.0 },
    schemes:     { total: 5, active: 3, inactive: 2 },
    batches:     { total: 12 },
    winners:     { total_winners: 5120, announced: 4600, pending_announcement: 520 }
  },
  schemes: [
    { id:1, title:'Summer Oil Campaign 2024', reward_text:'Win a free 5L Oil Tin!', is_active:true,  total_qr_codes:200000, used_qr_codes:58200, usage_percentage:29.1 },
    { id:2, title:'Mustard Gold Diwali 2024', reward_text:'Win Gold Coins!',        is_active:true,  total_qr_codes:150000, used_qr_codes:43100, usage_percentage:28.7 },
    { id:3, title:'SoyaBean Harvest 2024',   reward_text:'Win ₹500 Amazon Card!',  is_active:true,  total_qr_codes:100000, used_qr_codes:26150, usage_percentage:26.2 },
    { id:4, title:'CottonSeed Spring 2023',  reward_text:'Win free product pack!', is_active:false, total_qr_codes:30000,  used_qr_codes:30000, usage_percentage:100  },
    { id:5, title:'Pilot Campaign 2023',     reward_text:'Early bird gift!',       is_active:false, total_qr_codes:20000,  used_qr_codes:20000, usage_percentage:100  },
  ],
  batches: [
    { id:1, batch_name:'Summer Campaign Batch 1', total_codes:100000, used_codes:32500, usage_percentage:32.5, created_at:'2024-03-01T10:00:00' },
    { id:2, batch_name:'Summer Campaign Batch 2', total_codes:100000, used_codes:25700, usage_percentage:25.7, created_at:'2024-03-15T10:00:00' },
    { id:3, batch_name:'Diwali Gold Batch 1',     total_codes:75000,  used_codes:21000, usage_percentage:28.0, created_at:'2024-09-01T10:00:00' },
    { id:4, batch_name:'Diwali Gold Batch 2',     total_codes:75000,  used_codes:22100, usage_percentage:29.5, created_at:'2024-09-20T10:00:00' },
    { id:5, batch_name:'SoyaBean Harvest Batch',  total_codes:100000, used_codes:26150, usage_percentage:26.2, created_at:'2024-06-01T10:00:00' },
  ],
  submissions: [
    { id:1001, name:'Ramesh Sharma',   phone:'9876543210', city:'Mumbai',    state:'Maharashtra', qr_code:'QR-SUM-A1B2C3', submitted_at:'2024-03-10T09:32:00', is_winner:true  },
    { id:1002, name:'Priya Patel',     phone:'9823456789', city:'Ahmedabad', state:'Gujarat',     qr_code:'QR-SUM-D4E5F6', submitted_at:'2024-03-10T10:15:00', is_winner:false },
    { id:1003, name:'Anil Kumar',      phone:'9765432100', city:'Delhi',     state:'Delhi',       qr_code:'QR-DIW-G7H8I9', submitted_at:'2024-03-11T11:00:00', is_winner:false },
    { id:1004, name:'Sunita Devi',     phone:'9712345678', city:'Jaipur',    state:'Rajasthan',   qr_code:'QR-SOY-J1K2L3', submitted_at:'2024-03-11T14:22:00', is_winner:true  },
    { id:1005, name:'Mohan Yadav',     phone:'9698765432', city:'Lucknow',   state:'UP',          qr_code:'QR-SUM-M4N5O6', submitted_at:'2024-03-12T08:45:00', is_winner:false },
    { id:1006, name:'Kavita Reddy',    phone:'9654321098', city:'Hyderabad', state:'Telangana',   qr_code:'QR-DIW-P7Q8R9', submitted_at:'2024-03-12T16:30:00', is_winner:false },
    { id:1007, name:'Rajiv Gupta',     phone:'9543210987', city:'Pune',      state:'Maharashtra', qr_code:'QR-SOY-S1T2U3', submitted_at:'2024-03-13T10:10:00', is_winner:true  },
    { id:1008, name:'Deepa Nair',      phone:'9432109876', city:'Chennai',   state:'Tamil Nadu',  qr_code:'QR-SUM-V4W5X6', submitted_at:'2024-03-13T12:00:00', is_winner:false },
    { id:1009, name:'Vikram Singh',    phone:'9321098765', city:'Kolkata',   state:'West Bengal', qr_code:'QR-DIW-Y7Z8A9', submitted_at:'2024-03-14T09:20:00', is_winner:false },
    { id:1010, name:'Meena Mishra',    phone:'9210987654', city:'Bhopal',    state:'MP',          qr_code:'QR-SOY-B1C2D3', submitted_at:'2024-03-14T15:45:00', is_winner:false },
  ],
  winners: [
    { submission_id:1001, name:'Ramesh Sharma', phone:'9876543210', city:'Mumbai',    announced:true  },
    { submission_id:1004, name:'Sunita Devi',   phone:'9712345678', city:'Jaipur',    announced:true  },
    { submission_id:1007, name:'Rajiv Gupta',   phone:'9543210987', city:'Pune',      announced:false },
    { submission_id:1015, name:'Anita Joshi',   phone:'9100000001', city:'Nagpur',    announced:false },
    { submission_id:1023, name:'Suresh Menon',  phone:'9100000002', city:'Kochi',     announced:true  },
    { submission_id:1031, name:'Geeta Rani',    phone:'9100000003', city:'Patna',     announced:false },
  ],
  winner_stats: { total_winners: 5120, announced: 4600, pending_announcement: 520 },
  profile: { id:1, username:'admin', email:'admin@fmcgrewards.in', role:'super_admin', is_active:true, last_login:'2024-03-14T09:00:00', created_at:'2024-01-01T00:00:00' },
};

// ── Auth helpers ──────────────────────────────────────────────
const getToken  = () => localStorage.getItem('fmcg_token');
const setToken  = (t) => localStorage.setItem('fmcg_token', t);
const clearAuth = () => { localStorage.removeItem('fmcg_token'); localStorage.removeItem('fmcg_admin'); };

async function apiFetch(path, opts = {}) {
  if (DEMO_MODE) throw new Error('demo'); // handled by callers
  const token = getToken();
  const headers = { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...opts.headers };
  const res = await fetch(`${API}${path}`, { ...opts, headers });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || json.message || `HTTP ${res.status}`);
  return json;
}

// ── Login ──────────────────────────────────────────────────────
async function handleLogin(e) {
  e.preventDefault();
  const btn = document.getElementById('login-btn');
  const btnText = document.getElementById('login-btn-text');
  const spinner = document.getElementById('login-spinner');
  const errEl = document.getElementById('login-error');
  errEl.classList.add('hidden');
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;

  // ── Demo mode shortcut ──────────────────────────────────────
  if (username === DEMO_CREDS.username && password === DEMO_CREDS.password) {
    DEMO_MODE = true;
    setToken('demo-token');
    const adminData = { username: 'admin', role: 'super_admin', admin_id: 1 };
    localStorage.setItem('fmcg_admin', JSON.stringify(adminData));
    bootApp(adminData);
    return;
  }

  btnText.textContent = 'Signing in…';
  spinner.classList.remove('hidden');
  btn.disabled = true;
  DEMO_MODE = false;
  try {
    const data = await fetch(`${API}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const json = await data.json();
    if (!data.ok) throw new Error(json.error || json.message || `HTTP ${data.status}`);
    setToken(json.data.access_token);
    localStorage.setItem('fmcg_admin', JSON.stringify(json.data));
    bootApp(json.data);
  } catch (err) {
    errEl.textContent = err.message.includes('fetch') ? 'Cannot connect to backend. Use admin / admin123 for demo mode.' : err.message;
    errEl.classList.remove('hidden');
  } finally {
    btnText.textContent = 'Sign In';
    spinner.classList.add('hidden');
    btn.disabled = false;
  }
}

function togglePassword() {
  const pw = document.getElementById('password');
  pw.type = pw.type === 'password' ? 'text' : 'password';
}

// ── Boot app ───────────────────────────────────────────────────
function bootApp(admin) {
  document.getElementById('login-screen').classList.remove('active');
  document.getElementById('login-screen').classList.add('hidden');
  document.getElementById('app-screen').classList.remove('hidden');
  document.getElementById('app-screen').classList.add('active');
  const name = admin.username || 'Admin';
  document.getElementById('admin-name-sidebar').textContent = name;
  document.getElementById('admin-role-sidebar').textContent = DEMO_MODE ? '⚡ Demo Mode' : (admin.role || 'admin');
  document.getElementById('admin-avatar').textContent = name[0].toUpperCase();
  document.getElementById('topbar-admin').textContent = DEMO_MODE ? 'Demo Admin' : name;
  if (DEMO_MODE) showToast('⚡ Demo Mode — showing sample data. Connect backend for live data.', 'info');
  checkApiStatus();
  loadDashboard();
}

// ── Logout ─────────────────────────────────────────────────────
function handleLogout() {
  clearAuth();
  document.getElementById('app-screen').classList.add('hidden');
  document.getElementById('app-screen').classList.remove('active');
  document.getElementById('login-screen').classList.add('active');
  document.getElementById('login-screen').classList.remove('hidden');
  document.getElementById('login-form').reset();
}

// ── Navigation ─────────────────────────────────────────────────
function navigate(page, el) {
  document.querySelectorAll('.page').forEach(p => { p.classList.remove('active'); p.classList.add('hidden'); });
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const target = document.getElementById(`page-${page}`);
  if (target) { target.classList.remove('hidden'); target.classList.add('active'); }
  if (el) el.classList.add('active');
  document.getElementById('page-title').textContent = el ? el.querySelector('.nav-label').textContent : page;
  const loaders = { dashboard: loadDashboard, schemes: loadSchemes, batches: loadBatches, submissions: loadSubmissions, winners: loadWinners, profile: loadProfile };
  if (loaders[page]) loaders[page]();
  if (window.innerWidth <= 768) document.getElementById('sidebar').classList.remove('mobile-open');
}

function toggleSidebar() {
  const sb = document.getElementById('sidebar');
  if (window.innerWidth <= 768) sb.classList.toggle('mobile-open');
  else sb.classList.toggle('collapsed');
  document.querySelector('.main-content').classList.toggle('expanded');
}

// ── API Status ─────────────────────────────────────────────────
async function checkApiStatus() {
  const dot = document.getElementById('status-dot');
  const txt = document.getElementById('status-text');
  if (DEMO_MODE) { dot.className = 'status-dot'; dot.style.background = '#f7c94f'; txt.textContent = '⚡ Demo Mode'; return; }
  try {
    const r = await fetch(`${API}/api/auth/profile`, { headers: { Authorization: `Bearer ${getToken()}` } });
    dot.className = r.ok ? 'status-dot online' : 'status-dot offline';
    txt.textContent  = r.ok ? 'API Online' : 'API Offline';
  } catch {
    dot.className = 'status-dot offline'; txt.textContent = 'API Offline';
  }
}

// ── Dashboard ──────────────────────────────────────────────────
async function loadDashboard() {
  try {
    if (DEMO_MODE) throw new Error('demo');
    const res = await apiFetch('/api/admin/dashboard');
    renderStats(res.data); renderBarChart(res.data); renderActivity(res.data);
  } catch {
    renderStats(MOCK.dashboard); renderBarChart(MOCK.dashboard); renderActivity(MOCK.dashboard);
  }
}

function renderStats(d) {
  const qr = d.qr_codes || {}; const sub = d.submissions || {}; const sch = d.schemes || {}; const win = d.winners || {};
  const cards = [
    { icon: '📱', label: 'Total QR Codes', value: fmt(qr.total), sub: `${fmt(qr.used)} used`, badge: `${qr.usage_percentage?.toFixed(1) || 0}%`, btype: 'info' },
    { icon: '✅', label: 'Available QR', value: fmt(qr.remaining), sub: 'Ready to distribute', badge: 'Active', btype: 'success' },
    { icon: '📥', label: 'Total Submissions', value: fmt(sub.total_submissions), sub: `${fmt(sub.unique_participants)} unique users`, badge: '+today', btype: 'info' },
    { icon: '🏙️', label: 'Cities Reached', value: fmt(sub.unique_cities), sub: 'Across India', badge: 'Growing', btype: 'success' },
    { icon: '🏆', label: 'Total Winners', value: fmt(win.total_winners), sub: `${fmt(win.announced)} announced`, badge: `${win.pending_announcement || 0} pending`, btype: 'warning' },
    { icon: '📋', label: 'Active Campaigns', value: fmt(sch.active), sub: `${fmt(sch.total)} total schemes`, badge: `${sch.inactive || 0} inactive`, btype: 'info' },
  ];
  document.getElementById('stats-grid').innerHTML = cards.map(c => `
    <div class="stat-card">
      <div class="stat-icon">${c.icon}</div>
      <div class="stat-label">${c.label}</div>
      <div class="stat-value">${c.value}</div>
      <div class="stat-sub">${c.sub} &nbsp;<span class="stat-badge badge-${c.btype}">${c.badge}</span></div>
    </div>`).join('');
}

function renderMockStats() {
  const cards = [
    { icon: '📱', label: 'Total QR Codes', value: '—', sub: 'Connect backend', badge: 'Demo', btype: 'warning' },
    { icon: '✅', label: 'Available QR', value: '—', sub: '', badge: 'Demo', btype: 'warning' },
    { icon: '📥', label: 'Total Submissions', value: '—', sub: '', badge: 'Demo', btype: 'warning' },
    { icon: '🏙️', label: 'Cities Reached', value: '—', sub: '', badge: 'Demo', btype: 'warning' },
    { icon: '🏆', label: 'Total Winners', value: '—', sub: '', badge: 'Demo', btype: 'warning' },
    { icon: '📋', label: 'Active Campaigns', value: '—', sub: '', badge: 'Demo', btype: 'warning' },
  ];
  document.getElementById('stats-grid').innerHTML = cards.map(c => `
    <div class="stat-card">
      <div class="stat-icon">${c.icon}</div>
      <div class="stat-label">${c.label}</div>
      <div class="stat-value">${c.value}</div>
      <div class="stat-sub">${c.sub} &nbsp;<span class="stat-badge badge-${c.btype}">${c.badge}</span></div>
    </div>`).join('');
}

function renderBarChart(d) {
  const qr = d.qr_codes || {};
  const used = qr.used || 0; const total = qr.total || 1;
  const pct = Math.round((used / total) * 100);
  document.getElementById('qr-usage-chart').innerHTML = `
    <div class="bar-chart" style="width:100%">
      <div class="bar-row">
        <span class="bar-label">Used</span>
        <div class="bar-track"><div class="bar-fill bar-used" style="width:${pct}%"></div></div>
        <span class="bar-val">${fmt(used)}</span>
      </div>
      <div class="bar-row">
        <span class="bar-label">Available</span>
        <div class="bar-track"><div class="bar-fill bar-avail" style="width:${100-pct}%"></div></div>
        <span class="bar-val">${fmt(qr.remaining || 0)}</span>
      </div>
      <div style="margin-top:14px;font-size:13px;color:var(--text3)">QR Usage: ${pct}% of total codes consumed</div>
    </div>`;
}

function renderActivity(d) {
  const win = d.winners || {}; const sub = d.submissions || {}; const sch = d.schemes || {};
  const items = [
    { icon: '📥', text: `${fmt(sub.total_submissions)} total submissions recorded`, time: 'Total' },
    { icon: '🏆', text: `${fmt(win.pending_announcement)} winners pending announcement`, time: 'Pending' },
    { icon: '📋', text: `${sch.active} active campaigns running`, time: 'Live' },
    { icon: '🏙️', text: `${fmt(sub.unique_cities)} cities participating`, time: 'Reach' },
  ];
  document.getElementById('recent-activity').innerHTML = items.map(i => `
    <div class="activity-item">
      <span class="activity-icon">${i.icon}</span>
      <span class="activity-text">${i.text}</span>
      <span class="activity-time">${i.time}</span>
    </div>`).join('');
}

// ── Schemes ────────────────────────────────────────────────────
async function loadSchemes() {
  try {
    if (DEMO_MODE) throw new Error('demo');
    const res = await apiFetch('/api/schemes?per_page=100');
    const schemes = res.data?.schemes || [];
    document.getElementById('schemes-tbody').innerHTML = schemes.length ? schemes.map(s => `
      <tr>
        <td>${s.id}</td>
        <td><strong>${s.title}</strong></td>
        <td>${s.reward_text || '—'}</td>
        <td>${fmt(s.total_qr_codes || 0)}</td>
        <td>
          <div class="usage-bar"><div class="usage-fill" style="width:${s.usage_percentage || 0}%"></div></div>
          <span style="font-size:11px;color:var(--text3)">${(s.usage_percentage || 0).toFixed(1)}%</span>
        </td>
        <td><span class="status-pill ${s.is_active ? 'pill-active' : 'pill-inactive'}">${s.is_active ? '● Active' : '● Inactive'}</span></td>
        <td>
          <div style="display:flex;gap:6px">
            <button class="btn-sm btn-secondary" onclick="toggleScheme(${s.id},${s.is_active})">${s.is_active ? 'Deactivate' : 'Activate'}</button>
          </div>
        </td>
      </tr>`).join('') : '<tr><td colspan="7" class="loading-row">No campaigns found</td></tr>';
  } catch {
    const schemes = MOCK.schemes;
    document.getElementById('schemes-tbody').innerHTML = schemes.map(s => `
      <tr>
        <td>${s.id}</td>
        <td><strong>${s.title}</strong></td>
        <td>${s.reward_text}</td>
        <td>${fmt(s.total_qr_codes)}</td>
        <td><div class="usage-bar"><div class="usage-fill" style="width:${s.usage_percentage}%"></div></div>
          <span style="font-size:11px;color:var(--text3)">${s.usage_percentage.toFixed(1)}%</span></td>
        <td><span class="status-pill ${s.is_active ? 'pill-active':'pill-inactive'}">${s.is_active?'● Active':'● Inactive'}</span></td>
        <td><span style="color:var(--text3);font-size:12px">Demo mode</span></td>
      </tr>`).join('');
  }
}

async function toggleScheme(id, isActive) {
  try {
    await apiFetch(`/api/schemes/${id}/${isActive ? 'deactivate' : 'activate'}`, { method: 'POST' });
    showToast(`Campaign ${isActive ? 'deactivated' : 'activated'}`, 'success');
    loadSchemes();
  } catch (err) { showToast(err.message, 'error'); }
}

async function handleCreateScheme(e) {
  e.preventDefault();
  const errEl = document.getElementById('scheme-error');
  errEl.classList.add('hidden');
  try {
    await apiFetch('/api/schemes', {
      method: 'POST',
      body: JSON.stringify({
        title: document.getElementById('s-title').value,
        description: document.getElementById('s-desc').value,
        reward_text: document.getElementById('s-reward-text').value,
        reward_details: document.getElementById('s-reward-details').value,
        start_date: document.getElementById('s-start').value,
        end_date: document.getElementById('s-end').value,
      })
    });
    showToast('Campaign created!', 'success');
    closeAllModals(); loadSchemes();
  } catch (err) { errEl.textContent = err.message; errEl.classList.remove('hidden'); }
}

// ── Batches ────────────────────────────────────────────────────
async function loadBatches() {
  try {
    if (DEMO_MODE) throw new Error('demo');
    const res = await apiFetch('/api/admin/batches?per_page=100');
    const batches = res.data?.batches || [];
    document.getElementById('batches-tbody').innerHTML = batches.length ? batches.map(b => `
      <tr>
        <td>${b.id}</td>
        <td><strong>${b.batch_name}</strong></td>
        <td>${fmt(b.total_codes)}</td>
        <td>${fmt(b.used_codes)}</td>
        <td>${fmt((b.total_codes || 0) - (b.used_codes || 0))}</td>
        <td>
          <div class="usage-bar"><div class="usage-fill" style="width:${b.usage_percentage || 0}%"></div></div>
          <span style="font-size:11px;color:var(--text3)">${(b.usage_percentage || 0).toFixed(1)}%</span>
        </td>
        <td>${fmtDate(b.created_at)}</td>
        <td>
          <div style="display:flex;gap:6px">
            <button class="btn-sm btn-outline" onclick="exportBatch(${b.id})">⬇ Export</button>
            <button class="btn-sm btn-danger" onclick="deleteBatch(${b.id})">Delete</button>
          </div>
        </td>
      </tr>`).join('') : '<tr><td colspan="8" class="loading-row">No batches found</td></tr>';
    populateSchemesDropdown();
  } catch {
    document.getElementById('batches-tbody').innerHTML = MOCK.batches.map(b => `
      <tr>
        <td>${b.id}</td><td><strong>${b.batch_name}</strong></td>
        <td>${fmt(b.total_codes)}</td><td>${fmt(b.used_codes)}</td>
        <td>${fmt(b.total_codes - b.used_codes)}</td>
        <td><div class="usage-bar"><div class="usage-fill" style="width:${b.usage_percentage}%"></div></div>
          <span style="font-size:11px;color:var(--text3)">${b.usage_percentage.toFixed(1)}%</span></td>
        <td>${fmtDate(b.created_at)}</td>
        <td><span style="color:var(--text3);font-size:12px">Demo mode</span></td>
      </tr>`).join('');
  }
}

async function handleCreateBatch(e) {
  e.preventDefault();
  const errEl = document.getElementById('batch-error');
  errEl.classList.add('hidden');
  try {
    await apiFetch('/api/admin/batch/create', {
      method: 'POST',
      body: JSON.stringify({
        batch_name: document.getElementById('b-name').value,
        quantity: parseInt(document.getElementById('b-qty').value),
        scheme_id: document.getElementById('b-scheme').value || null,
      })
    });
    showToast('Batch created! QR codes generating…', 'success');
    closeAllModals(); loadBatches();
  } catch (err) { errEl.textContent = err.message; errEl.classList.remove('hidden'); }
}

function exportBatch(id) {
  window.open(`${API}/api/admin/batch/${id}/export?token=${getToken()}`, '_blank');
}

async function deleteBatch(id) {
  if (!confirm('Delete this batch? This cannot be undone.')) return;
  try {
    await apiFetch(`/api/admin/batch/${id}`, { method: 'DELETE' });
    showToast('Batch deleted', 'success');
    loadBatches();
  } catch (err) { showToast(err.message, 'error'); }
}

// ── Submissions ────────────────────────────────────────────────
let subPage = 1;
async function loadSubmissions(page = 1) {
  subPage = page;
  const city = document.getElementById('filter-city')?.value || '';
  const period = document.getElementById('filter-period')?.value || '';
  try {
    if (DEMO_MODE) throw new Error('demo');
    const res = await apiFetch(`/api/admin/submissions?page=${page}&per_page=25${city ? '&city=' + city : ''}${period ? '&period=' + period : ''}`);
    const subs = res.data?.submissions || [];
    const pag = res.data?.pagination || {};
    document.getElementById('submissions-tbody').innerHTML = subs.length ? subs.map(s => `
      <tr>
        <td>${s.id}</td>
        <td>${s.name}</td>
        <td>${s.phone}</td>
        <td>${s.city}</td>
        <td>${s.state || '—'}</td>
        <td><code style="font-size:11px;color:var(--text3)">${s.qr_code}</code></td>
        <td>${fmtDate(s.submitted_at)}</td>
        <td>${s.is_winner ? '<span class="status-pill pill-winner">🏆 Winner</span>' : '—'}</td>
      </tr>`).join('') : '<tr><td colspan="8" class="loading-row">No submissions found</td></tr>';
    renderPagination('submissions-pagination', pag, (p) => loadSubmissions(p));
  } catch {
    let subs = MOCK.submissions;
    if (city) subs = subs.filter(s => s.city.toLowerCase().includes(city.toLowerCase()));
    document.getElementById('submissions-tbody').innerHTML = subs.map(s => `
      <tr>
        <td>${s.id}</td><td>${s.name}</td><td>${s.phone}</td><td>${s.city}</td><td>${s.state}</td>
        <td><code style="font-size:11px;color:var(--text3)">${s.qr_code}</code></td>
        <td>${fmtDate(s.submitted_at)}</td>
        <td>${s.is_winner ? '<span class="status-pill pill-winner">🏆 Winner</span>' : '—'}</td>
      </tr>`).join('');
  }
}

function exportSubmissions() {
  const period = document.getElementById('filter-period')?.value || '';
  window.open(`${API}/api/admin/submissions/export${period ? '?period=' + period : ''}`, '_blank');
}

// ── Winners ────────────────────────────────────────────────────
let winPage = 1;
const selectedWinners = new Set();

async function loadWinners(page = 1) {
  winPage = page;
  loadWinnerStats();
  try {
    if (DEMO_MODE) throw new Error('demo');
    const res = await apiFetch(`/api/winners?page=${page}&per_page=25`);
    const winners = res.data?.winners || [];
    const pag = res.data?.pagination || {};
    document.getElementById('winners-tbody').innerHTML = winners.length ? winners.map(w => `
      <tr>
        <td><input type="checkbox" class="winner-cb" value="${w.submission_id}" onchange="toggleWinnerSelect(this)" /></td>
        <td>${w.submission_id}</td>
        <td>${w.name}</td>
        <td>${w.phone}</td>
        <td>${w.city}</td>
        <td>${w.announced ? '<span class="status-pill pill-active">✅ Announced</span>' : '<span class="status-pill pill-inactive">Pending</span>'}</td>
        <td>
          ${!w.announced ? `<button class="btn-sm btn-primary" onclick="announceWinner(${w.submission_id})">Announce</button>` : ''}
        </td>
      </tr>`).join('') : '<tr><td colspan="7" class="loading-row">No winners found</td></tr>';
    renderPagination('winners-pagination', pag, (p) => loadWinners(p));
  } catch {
    document.getElementById('winners-tbody').innerHTML = MOCK.winners.map(w => `
      <tr>
        <td><input type="checkbox" class="winner-cb" value="${w.submission_id}" onchange="toggleWinnerSelect(this)" /></td>
        <td>${w.submission_id}</td><td>${w.name}</td><td>${w.phone}</td><td>${w.city}</td>
        <td>${w.announced ? '<span class="status-pill pill-active">✅ Announced</span>' : '<span class="status-pill pill-inactive">Pending</span>'}</td>
        <td>${!w.announced ? `<button class="btn-sm btn-primary" onclick="showToast('Demo: announce action', \'info\')">Announce</button>` : ''}</td>
      </tr>`).join('');
  }
}

async function loadWinnerStats() {
  try {
    if (DEMO_MODE) throw new Error('demo');
    const res = await apiFetch('/api/winners/statistics');
    const s = res.data || {};
    document.getElementById('ws-total').textContent = fmt(s.total_winners);
    document.getElementById('ws-announced').textContent = fmt(s.announced);
    document.getElementById('ws-pending').textContent = fmt(s.pending_announcement);
  } catch {
    const s = MOCK.winner_stats;
    document.getElementById('ws-total').textContent = fmt(s.total_winners);
    document.getElementById('ws-announced').textContent = fmt(s.announced);
    document.getElementById('ws-pending').textContent = fmt(s.pending_announcement);
  }
}

function toggleWinnerSelect(cb) {
  cb.checked ? selectedWinners.add(parseInt(cb.value)) : selectedWinners.delete(parseInt(cb.value));
  document.getElementById('selected-count').textContent = `${selectedWinners.size} selected`;
  document.getElementById('bulk-bar').classList.toggle('hidden', selectedWinners.size === 0);
}

function toggleSelectAll(cb) {
  document.querySelectorAll('.winner-cb').forEach(c => { c.checked = cb.checked; toggleWinnerSelect(c); });
}

async function announceWinner(id) {
  try {
    await apiFetch(`/api/winners/${id}/announce`, { method: 'POST' });
    showToast('Winner announced!', 'success');
    loadWinners(winPage);
  } catch (err) { showToast(err.message, 'error'); }
}

async function bulkAnnounce() {
  if (!selectedWinners.size) return;
  try {
    await apiFetch('/api/winners/announce-bulk', { method: 'POST', body: JSON.stringify({ submission_ids: [...selectedWinners] }) });
    showToast(`${selectedWinners.size} winners announced!`, 'success');
    selectedWinners.clear();
    document.getElementById('bulk-bar').classList.add('hidden');
    loadWinners(winPage);
  } catch (err) { showToast(err.message, 'error'); }
}

async function handleSelectWinners(e) {
  e.preventDefault();
  const errEl = document.getElementById('winner-error');
  errEl.classList.add('hidden');
  try {
    const res = await apiFetch('/api/winners/select-random', {
      method: 'POST',
      body: JSON.stringify({ scheme_id: parseInt(document.getElementById('w-scheme').value), count: parseInt(document.getElementById('w-count').value) })
    });
    showToast(`${res.data.winners_selected} winners selected!`, 'success');
    closeAllModals(); loadWinners();
  } catch (err) { errEl.textContent = err.message; errEl.classList.remove('hidden'); }
}

function exportWinners() {
  window.open(`${API}/api/winners/export`, '_blank');
}

// ── Profile ────────────────────────────────────────────────────
async function loadProfile() {
  try {
    if (DEMO_MODE) throw new Error('demo');
    const res = await apiFetch('/api/auth/profile');
    const p = res.data || {};
    document.getElementById('profile-avatar-big').textContent = (p.username || 'A')[0].toUpperCase();
    document.getElementById('profile-details').innerHTML = `
      <div class="profile-detail-row"><span class="detail-key">Username</span><span class="detail-val">${p.username}</span></div>
      <div class="profile-detail-row"><span class="detail-key">Email</span><span class="detail-val">${p.email}</span></div>
      <div class="profile-detail-row"><span class="detail-key">Role</span><span class="detail-val">${p.role}</span></div>
      <div class="profile-detail-row"><span class="detail-key">Status</span><span class="detail-val">${p.is_active ? '✅ Active' : '❌ Inactive'}</span></div>
      <div class="profile-detail-row"><span class="detail-key">Last Login</span><span class="detail-val">${fmtDate(p.last_login)}</span></div>`;
  } catch {
    const p = MOCK.profile;
    document.getElementById('profile-avatar-big').textContent = p.username[0].toUpperCase();
    document.getElementById('profile-details').innerHTML = `
      <div class="profile-detail-row"><span class="detail-key">Username</span><span class="detail-val">${p.username}</span></div>
      <div class="profile-detail-row"><span class="detail-key">Email</span><span class="detail-val">${p.email}</span></div>
      <div class="profile-detail-row"><span class="detail-key">Role</span><span class="detail-val">${p.role}</span></div>
      <div class="profile-detail-row"><span class="detail-key">Status</span><span class="detail-val">✅ Active (Demo)</span></div>
      <div class="profile-detail-row"><span class="detail-key">Last Login</span><span class="detail-val">${fmtDate(p.last_login)}</span></div>`;
  }
}

async function handleChangePassword(e) {
  e.preventDefault();
  const msgEl = document.getElementById('pw-msg');
  msgEl.className = ''; msgEl.textContent = '';
  try {
    await apiFetch('/api/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ old_password: document.getElementById('old-password').value, new_password: document.getElementById('new-password').value })
    });
    msgEl.className = 'alert-success'; msgEl.textContent = 'Password updated successfully!';
    document.getElementById('change-pw-form').reset();
  } catch (err) { msgEl.className = 'alert-error'; msgEl.textContent = err.message; }
}

// ── Modals ────────────────────────────────────────────────────
async function openModal(id) {
  document.getElementById('modal-overlay').classList.remove('hidden');
  document.getElementById(id).classList.remove('hidden');
  if (id === 'create-batch-modal' || id === 'select-winners-modal') await populateSchemesDropdown();
}

function closeAllModals() {
  document.getElementById('modal-overlay').classList.add('hidden');
  document.querySelectorAll('.modal').forEach(m => m.classList.add('hidden'));
}

async function populateSchemesDropdown() {
  try {
    const res = await apiFetch('/api/schemes?per_page=100');
    const schemes = res.data?.schemes || [];
    const opts = schemes.map(s => `<option value="${s.id}">${s.title}</option>`).join('');
    ['b-scheme', 'w-scheme'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.innerHTML = (id === 'b-scheme' ? '<option value="">— No campaign —</option>' : '<option value="">Select campaign…</option>') + opts;
    });
  } catch {}
}

// ── Pagination ─────────────────────────────────────────────────
function renderPagination(containerId, pag, cb) {
  const el = document.getElementById(containerId);
  if (!el || !pag.total_pages || pag.total_pages <= 1) { if (el) el.innerHTML = ''; return; }
  let html = `<button ${pag.page <= 1 ? 'disabled' : ''} onclick="(${cb.toString()})(${pag.page - 1})">‹ Prev</button>`;
  for (let p = Math.max(1, pag.page - 2); p <= Math.min(pag.total_pages, pag.page + 2); p++)
    html += `<button class="${p === pag.page ? 'active' : ''}" onclick="(${cb.toString()})(${p})">${p}</button>`;
  html += `<button ${pag.page >= pag.total_pages ? 'disabled' : ''} onclick="(${cb.toString()})(${pag.page + 1})">Next ›</button>`;
  el.innerHTML = html;
}

// ── Toast ──────────────────────────────────────────────────────
function showToast(msg, type = 'info') {
  const t = document.getElementById('toast');
  t.textContent = msg; t.className = `toast ${type}`;
  t.classList.remove('hidden');
  setTimeout(() => t.classList.add('hidden'), 3500);
}

// ── Helpers ────────────────────────────────────────────────────
function fmt(n) { if (n == null) return '—'; return Number(n).toLocaleString('en-IN'); }
function fmtDate(d) { if (!d) return '—'; return new Date(d).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }); }

// ── Init ───────────────────────────────────────────────────────
window.addEventListener('load', () => {
  const token = getToken();
  const admin = JSON.parse(localStorage.getItem('fmcg_admin') || 'null');
  if (token === 'demo-token' && admin) { DEMO_MODE = true; bootApp(admin); }
  else if (token && admin) bootApp(admin);
  setInterval(checkApiStatus, 30000);
});

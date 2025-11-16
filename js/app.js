/* CityPulse — main application logic (vehicles + zoom/pan + theme persistence) */

// small helpers
const qs = s => document.querySelector(s);
const qsa = s => Array.from(document.querySelectorAll(s));
const formatTime = iso => new Date(iso).toLocaleString();

function saveLastPage(id){ try { localStorage.setItem('citypulse_lastpage', id); } catch(e){} }
function getLastPage(){ try { return localStorage.getItem('citypulse_lastpage'); } catch(e){ return null } }

// ---------------- theme persistence & toggle fix ----------------
function applySavedTheme(){
  try {
    const saved = localStorage.getItem('citypulse_theme');
    if(saved === 'light') document.body.classList.add('light');
    else document.body.classList.remove('light');
  } catch(e){}
}
applySavedTheme();

qs('#themeToggle').addEventListener('click', () => {
  document.body.classList.toggle('light');
  try {
    const now = document.body.classList.contains('light') ? 'light' : 'dark';
    localStorage.setItem('citypulse_theme', now);
  } catch(e){}
});

// ---------------- Page switching ----------------
function showPage(id){
  qsa('.page').forEach(p => p.classList.remove('active'));
  const el = qs('#' + id); if(el) el.classList.add('active');
  qsa('.nav-btn').forEach(b => b.classList.toggle('active', b.dataset.target === id));
  saveLastPage(id);
}
qsa('.nav-btn').forEach(b => b.addEventListener('click', () => showPage(b.dataset.target)));
const last = getLastPage(); if(last) showPage(last); else showPage('page1');

// ---------------- Modal ----------------
const modalBackdrop = qs('#modalBackdrop');
const modalOk = qs('#modalOk'), modalCancel = qs('#modalCancel');
function openModal(title, html, onOk){
  qs('#modalTitle').textContent = title;
  qs('#modalMessage').innerHTML = html;
  modalBackdrop.style.display = 'flex';
  modalBackdrop.setAttribute('aria-hidden','false');

  function closeAll(){
    modalBackdrop.style.display='none';
    modalBackdrop.setAttribute('aria-hidden','true');
    modalOk.removeEventListener('click', okHandler);
    modalCancel.removeEventListener('click', closeAll);
  }
  function okHandler(){ if(typeof onOk === 'function') onOk(); closeAll(); }
  modalOk.addEventListener('click', okHandler);
  modalCancel.addEventListener('click', closeAll);
}
document.addEventListener('keydown', e => { if(e.key==='Escape' && modalBackdrop.style.display==='flex'){ modalBackdrop.style.display='none'; modalBackdrop.setAttribute('aria-hidden','true'); } });

// ---------------- Dashboard renderer ----------------
function aqiLabel(aqi){
  if(aqi <= 50) return {text:'Good', color:'#34d399'};
  if(aqi <= 100) return {text:'Moderate', color:'#fbbf24'};
  if(aqi <= 200) return {text:'Unhealthy', color:'#fb7185'};
  return {text:'Hazardous', color:'#ef4444'};
}
function trafficLabel(val){
  if(val < 40) return 'Low';
  if(val < 70) return 'Moderate';
  return 'High';
}

function renderDashboard(){
  qs('#temperatureValue').textContent = `${dashboardData.temperature} °C`;
  qs('#tempMeta').textContent = `Feels like ${dashboardData.feelsLike} °C`;

  qs('#aqiValue').textContent = dashboardData.aqi;
  const aqiP = aqiLabel(dashboardData.aqi);
  qs('#aqiLabel').textContent = `Status: ${aqiP.text}`;
  qs('#aqiMeter').style.width = Math.min(100, dashboardData.aqi) + '%';
  qs('#aqiMeter').style.background = aqiP.color;

  qs('#trafficValue').textContent = `${dashboardData.traffic}%`;
  qs('#trafficLabel').textContent = `Flow: ${trafficLabel(dashboardData.traffic)}`;
  qs('#trafficMeter').style.width = `${dashboardData.traffic}%`;

  qs('#updateTimestamp').textContent = new Date().toLocaleTimeString();
}
renderDashboard();
setInterval(()=>{ qs('#liveClock').textContent = new Date().toLocaleTimeString(); qs('#liveDate').textContent = new Date().toLocaleDateString(); },1000);

// Simulate live updates
setInterval(()=>{
  dashboardData.temperature = 20 + Math.floor(Math.random()*12);
  dashboardData.feelsLike = dashboardData.temperature + (Math.random()>0.5?1:-1);
  dashboardData.aqi = 40 + Math.floor(Math.random()*120);
  dashboardData.traffic = Math.floor(Math.random()*100);
  renderDashboard();
  if(Math.random() < 0.12) simulateAlert();
}, 30000);

// ---------------- Alerts ----------------
function updateTicker(){
  const ticker = qs('#tickerContent');
  ticker.textContent = alertsData.map(a => `${a.type.toUpperCase()}: ${a.message}`).join('   •   ');
}
function renderAlerts(list){
  const container = qs('#alertList');
  container.innerHTML = '';
  list.forEach(a => {
    const el = document.createElement('div');
    el.className = 'alert-card';
    el.innerHTML = `<div class="alert-type">${a.type.toUpperCase()} • Priority: ${a.priority.toUpperCase()}</div>
      <div class="alert-msg">${a.message}</div>
      <div class="alert-time">${formatTime(a.time)}</div>`;
    container.appendChild(el);
  });
}
updateTicker();
renderAlerts(alertsData);

// filters & sort
qsa('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    qsa('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const f = btn.dataset.filter;
    const filtered = f==='all' ? alertsData : alertsData.filter(x => x.type===f);
    renderAlerts(sortedCopy(filtered, qs('#sortSelect').value));
  });
});
function sortedCopy(list, method){
  const copy = [...list];
  copy.sort((a,b) => method==='newest' ? new Date(b.time)-new Date(a.time) : new Date(a.time)-new Date(b.time));
  return copy;
}
qs('#sortSelect').addEventListener('change', () => {
  const method = qs('#sortSelect').value;
  const activeFilter = qsa('.filter-btn').find(b => b.classList.contains('active')).dataset.filter;
  const filtered = activeFilter==='all' ? alertsData : alertsData.filter(x => x.type===activeFilter);
  renderAlerts(sortedCopy(filtered, method));
});

function simulateAlert(){
  const types = ['traffic','weather','public','health'];
  const type = types[Math.floor(Math.random()*types.length)];
  const priorities = ['low','medium','high'];
  const a = {
    id: 's' + Math.random().toString(36).slice(2,8),
    type,
    priority: priorities[Math.floor(Math.random()*priorities.length)],
    message: `Simulated ${type} event at ${new Date().toLocaleTimeString()}`,
    time: new Date().toISOString()
  };
  alertsData.unshift(a);
  if(alertsData.length > 30) alertsData.pop();
  updateTicker();
  const method = qs('#sortSelect').value;
  const activeFilter = qsa('.filter-btn').find(b => b.classList.contains('active')).dataset.filter;
  const filtered = activeFilter==='all' ? alertsData : alertsData.filter(x => x.type===activeFilter);
  renderAlerts(sortedCopy(filtered, method));
}

// ---------------- Map: zoom & pan + hotspots + vehicles ----------------
const mapContainer = qs('#mapContainer');
const mapWrapper = qs('#mapWrapper');
const tooltip = qs('#mapTooltip');

let scale = 1;
let tx = 0, ty = 0;
const minScale = 0.6, maxScale = 3;
let isDragging = false;
let dragStart = null;
let lastTx = 0, lastTy = 0;

function updateTransform(){
  mapWrapper.style.transform = `translate(${tx}px, ${ty}px) scale(${scale})`;
}

// wheel zoom (center on mouse)
mapContainer.addEventListener('wheel', (ev) => {
  ev.preventDefault();
  const rect = mapContainer.getBoundingClientRect();
  const cx = ev.clientX - rect.left;
  const cy = ev.clientY - rect.top;

  const delta = -ev.deltaY || ev.wheelDelta;
  const factor = delta > 0 ? 1.08 : 1/1.08;
  const newScale = Math.min(maxScale, Math.max(minScale, scale * factor));
  // compute translate to keep focus
  const dx = (cx - tx) * (newScale/scale - 1);
  const dy = (cy - ty) * (newScale/scale - 1);

  scale = newScale;
  tx -= dx;
  ty -= dy;
  updateTransform();
}, { passive: false });

// drag to pan
mapContainer.addEventListener('pointerdown', (ev) => {
  // ignore if clicked hotspot (let hotspot handle)
  if (ev.target.closest('.hotspot')) return;
  isDragging = true;
  dragStart = { x: ev.clientX, y: ev.clientY };
  lastTx = tx; lastTy = ty;
  try { mapContainer.setPointerCapture(ev.pointerId); } catch(e){}
});
mapContainer.addEventListener('pointermove', (ev) => {
  if(!isDragging) return;
  const dx = ev.clientX - dragStart.x;
  const dy = ev.clientY - dragStart.y;
  tx = lastTx + dx;
  ty = lastTy + dy;
  updateTransform();
});
mapContainer.addEventListener('pointerup', (ev) => {
  isDragging = false;
  try { mapContainer.releasePointerCapture(ev.pointerId); } catch(e){}
});
mapContainer.addEventListener('pointercancel', ()=> { isDragging = false; });

// zoom buttons
qs('#zoomIn').addEventListener('click', ()=> {
  const rect = mapContainer.getBoundingClientRect();
  const cx = rect.width/2, cy = rect.height/2;
  const factor = 1.15;
  const newScale = Math.min(maxScale, scale * factor);
  const dx = (cx - tx) * (newScale/scale - 1);
  const dy = (cy - ty) * (newScale/scale - 1);
  scale = newScale; tx -= dx; ty -= dy; updateTransform();
});
qs('#zoomOut').addEventListener('click', ()=> {
  const rect = mapContainer.getBoundingClientRect();
  const cx = rect.width/2, cy = rect.height/2;
  const factor = 1.15;
  const newScale = Math.max(minScale, scale / factor);
  const dx = (cx - tx) * (newScale/scale - 1);
  const dy = (cy - ty) * (newScale/scale - 1);
  scale = newScale; tx -= dx; ty -= dy; updateTransform();
});
qs('#resetView').addEventListener('click', ()=> { scale = 1; tx = 0; ty = 0; updateTransform(); });

// Hotspots: tooltip + click to modal
function showTooltipForElement(el){
  const zoneKey = el.dataset.zone;
  const z = mapZones[zoneKey];
  if(!z) return;
  const rect = el.getBoundingClientRect();
  tooltip.innerHTML = `<strong style="color:var(--text)">${z.name}</strong><div style="color:var(--muted);margin-top:6px">${z.status} • ${z.contact}</div>`;
  // place tooltip above hotspot (fixed)
  const left = rect.left + rect.width/2;
  const top = rect.top - 12;
  tooltip.style.left = left + 'px';
  tooltip.style.top = top + 'px';
  tooltip.style.opacity = '1';
  tooltip.setAttribute('aria-hidden','false');
}
function hideTooltip(){
  tooltip.style.opacity = '0';
  tooltip.setAttribute('aria-hidden','true');
}

qsa('.hotspot').forEach(h => {
  h.classList.add('pulse');

  h.addEventListener('mouseenter', (ev)=>{
    showTooltipForElement(h);
  });
  h.addEventListener('mouseleave', hideTooltip);
  h.addEventListener('focus', ()=> showTooltipForElement(h));
  h.addEventListener('blur', hideTooltip);

  h.addEventListener('click', () => {
    const z = mapZones[h.dataset.zone];
    openModal(z.name, `<p><strong>Status:</strong> ${z.status}</p><p><strong>Contact:</strong> ${z.contact}</p><p>${z.description}</p>`);
  });
});

// ---------------- Vehicles (create and manage) ----------------
/* 
  We create vehicles positioned absolutely inside mapWrapper.
  Vehicles have classes v-pathA..D that animate along keyframes defined in CSS.
  Types: car, bus, ambulance (visual differentiation)
*/

function createVehicle(pathClass, typeClass, delay = 0, durationClass = '') {
  const v = document.createElement('div');
  v.className = `vehicle ${typeClass} ${pathClass} ${durationClass}`;
  // optional initial placement; keyframes will move it
  v.style.left = '0%';
  v.style.top = '0%';
  if (delay) v.style.animationDelay = delay + 's';
  return v;
}

function addVehicles() {
  const wrapper = qs('#mapWrapper');

  // remove existing vehicles if any
  qsa('.vehicle').forEach(n => n.remove());

  // Path A - river highway: a few cars & 1 ambulance
  wrapper.appendChild(createVehicle('v-pathA','car', 0));
  wrapper.appendChild(createVehicle('v-pathA','car', 3));
  wrapper.appendChild(createVehicle('v-pathA','ambulance', 6));

  // Path B - east-west main road
  wrapper.appendChild(createVehicle('v-pathB','car', 0));
  wrapper.appendChild(createVehicle('v-pathB','bus', 5));
  wrapper.appendChild(createVehicle('v-pathB','car', 2.5));

  // Path C - north-south
  wrapper.appendChild(createVehicle('v-pathC','car', 1.3));
  wrapper.appendChild(createVehicle('v-pathC','bus', 6.7));

  // Path D - roundabout
  wrapper.appendChild(createVehicle('v-pathD','car', 0));
  wrapper.appendChild(createVehicle('v-pathD','ambulance', 4.2));
}

// call once
addVehicles();

// Pause/resume animations on visibility change to reduce CPU when not visible
document.addEventListener('visibilitychange', () => {
  const running = !document.hidden;
  qsa('.vehicle').forEach(v => v.style.animationPlayState = running ? 'running' : 'paused');
});

// ---------------- Feedback form ----------------
const fbForm = qs('#feedbackForm');
const errName = qs('#errName'), errEmail = qs('#errEmail'), errMessage = qs('#errMessage');

function validateEmail(email){ return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); }

// Autofill
try {
  const savedName = localStorage.getItem('citypulse_name');
  const savedEmail = localStorage.getItem('citypulse_email');
  if(savedName) qs('#fbName').value = savedName;
  if(savedEmail) qs('#fbEmail').value = savedEmail;
} catch(e){}

fbForm.addEventListener('submit', (ev) => {
  ev.preventDefault();
  errName.textContent = ''; errEmail.textContent = ''; errMessage.textContent = '';

  const name = qs('#fbName').value.trim();
  const email = qs('#fbEmail').value.trim();
  const msg = qs('#fbMessage').value.trim();

  let ok = true;
  if(name.length < 3){ errName.textContent = 'Please enter at least 3 characters.'; ok = false; }
  if(!validateEmail(email)){ errEmail.textContent = 'Enter a valid email address.'; ok = false; }
  if(msg.length < 10){ errMessage.textContent = 'Message must be at least 10 characters.'; ok = false; }

  if(!ok) return;

  try { localStorage.setItem('citypulse_name', name); localStorage.setItem('citypulse_email', email); } catch(e){}
  fbForm.reset();
  qs('#thanksBlock').style.display = 'block';
  openModal('Feedback Submitted', 'Thank you for your feedback. This is a client-side simulation.');
});

qs('#resetForm').addEventListener('click', () => { fbForm.reset(); errName.textContent=''; errEmail.textContent=''; errMessage.textContent=''; });
qs('#thanksClose').addEventListener('click', () => { qs('#thanksBlock').style.display = 'none'; });

// close modal when click outside
modalBackdrop.addEventListener('click', (e) => { if(e.target === modalBackdrop){ modalBackdrop.style.display = 'none'; modalBackdrop.setAttribute('aria-hidden','true'); } });

// ticker refresh
setInterval(updateTicker, 8000);

// initial render
renderAlerts(alertsData);
renderDashboard();

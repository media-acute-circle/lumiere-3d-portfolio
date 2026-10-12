(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const inr = n => Number(n).toLocaleString('en-IN');
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  /* ---------- Direction switcher ---------- */
  const NAMES = { atelier: 'Warm Atelier', gallery: 'Dark Gallery', studio: 'Studio Light' };
  const THEME_COLOR = { atelier: '#F4EFE6', gallery: '#0E0E10', studio: '#FFFFFF' };
  function setTheme(t) {
    document.body.dataset.theme = t;
    $$('[data-set-theme]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.setTheme === t)));
    try { localStorage.setItem('pl-theme', t); } catch (e) { /* private window */ }
    const meta = $('meta[name="theme-color"]');
    if (meta) meta.content = THEME_COLOR[t];
    renderRing();
    renderViewer();
  }
  $$('[data-set-theme]').forEach(b => b.addEventListener('click', () => setTheme(b.dataset.setTheme)));
  let saved = 'atelier';
  try { saved = localStorage.getItem('pl-theme') || 'atelier'; } catch (e) { /* ignore */ }
  if (!NAMES[saved]) saved = 'atelier';

  /* ---------- Sample product renders (generated SVG, no external files) ---------- */
  const FINISH = {
    brass:    { hi: '#F3DDAA', mid: '#B08A4E', lo: '#5E4420', name: 'Brass' },
    nickel:   { hi: '#FBFBFA', mid: '#A9ACB2', lo: '#4A4E55', name: 'Nickel' },
    graphite: { hi: '#7A818E', mid: '#33383F', lo: '#121418', name: 'Graphite' },
    smoke:    { hi: '#E9DCC2', mid: '#8F7C5C', lo: '#2A241B', name: 'Smoke glass' }
  };
  let uid = 0;
  function lampSVG(finish = 'brass', shape = 'cone', opts = {}) {
    const id = 'L' + (++uid), F = FINISH[finish] || FINISH.brass;
    const lit = opts.lit !== false;
    const body = shape === 'drum'
      ? 'M128 176 Q200 160 272 176 L286 300 Q200 318 114 300 Z'
      : 'M116 172 Q200 150 284 172 L304 292 Q200 318 96 292 Z';
    return `<svg viewBox="0 0 400 400" role="img" aria-label="Sample ${shape} pendant, ${F.name}">
      <defs>
        <linearGradient id="${id}s" x1="0" x2="1">
          <stop offset="0" stop-color="${F.lo}"/><stop offset=".3" stop-color="${F.mid}"/>
          <stop offset=".5" stop-color="${F.hi}"/><stop offset=".72" stop-color="${F.mid}"/><stop offset="1" stop-color="${F.lo}"/>
        </linearGradient>
        <radialGradient id="${id}g" cx=".5" cy=".5" r=".5">
          <stop offset="0" stop-color="#FFF6DA" stop-opacity="${lit ? 1 : 0}"/>
          <stop offset=".35" stop-color="#FFE2A0" stop-opacity="${lit ? .5 : 0}"/>
          <stop offset="1" stop-color="#FFE2A0" stop-opacity="0"/>
        </radialGradient>
        <linearGradient id="${id}r" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#FFF6DA" stop-opacity=".9"/><stop offset="1" stop-color="#FFE2A0" stop-opacity="0"/>
        </linearGradient>
      </defs>
      <ellipse cx="200" cy="356" rx="150" ry="16" fill="#000" opacity=".22"/>
      <rect x="197" y="0" width="6" height="80" fill="${F.mid}"/>
      <rect x="170" y="70" width="60" height="18" rx="9" fill="url(#${id}s)"/>
      <g class="spin">
        <path d="${body}" fill="url(#${id}s)"/>
        <ellipse cx="200" cy="174" rx="84" ry="13" fill="${F.hi}" opacity=".55"/>
        <ellipse cx="200" cy="296" rx="104" ry="20" fill="${F.lo}"/>
        <ellipse cx="200" cy="300" rx="92" ry="16" fill="#FFF0C4" opacity="${lit ? .85 : 0}"/>
        <ellipse cx="200" cy="330" rx="110" ry="70" fill="url(#${id}g)"/>
        <path d="M150 300 L250 300 L232 340 L168 340 Z" fill="url(#${id}r)" opacity="${lit ? .55 : 0}"/>
      </g>
    </svg>`;
  }

  /* Sample room scene for the light comparison (generated) */
  function roomSVG() {
    return `<svg class="scene" viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id="wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3A3129"/><stop offset="1" stop-color="#1B1714"/></linearGradient>
        <linearGradient id="floor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2A221C"/><stop offset="1" stop-color="#0E0B09"/></linearGradient>
        <radialGradient id="pool" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#FFE7AE" stop-opacity=".85"/><stop offset="1" stop-color="#FFE7AE" stop-opacity="0"/></radialGradient>
        <radialGradient id="halo" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#FFF4D2" stop-opacity=".9"/><stop offset="1" stop-color="#FFF4D2" stop-opacity="0"/></radialGradient>
      </defs>
      <rect width="800" height="500" fill="url(#wall)"/>
      <rect y="360" width="800" height="140" fill="url(#floor)"/>
      <rect x="560" y="120" width="180" height="230" rx="6" fill="#241E19" stroke="#4A3F34"/>
      <rect x="586" y="150" width="128" height="170" rx="4" fill="#1A1613"/>
      <path d="M0 360 L800 360" stroke="#4A3F34" stroke-width="1"/>
      <g class="room-light">
        <ellipse cx="400" cy="420" rx="330" ry="120" fill="url(#pool)"/>
        <line x1="400" y1="0" x2="400" y2="110" stroke="#B08A4E" stroke-width="2"/>
        <path d="M352 110 Q400 96 448 110 L470 170 Q400 186 330 170 Z" fill="#E3C98F"/>
        <ellipse cx="400" cy="176" rx="150" ry="110" fill="url(#halo)"/>
      </g>
    </svg>`;
  }

  /* Category artwork for the collection cards (generated, theme-neutral metals) */
  function catArt(kind) {
    const id = 'C' + (++uid);
    const F = FINISH[{ pendant: 'brass', chandelier: 'nickel', wall: 'graphite', floor: 'brass', outdoor: 'graphite' }[kind]];
    const metal = `url(#${id}m)`, glow = `url(#${id}g)`;
    const shade = (cx, top, w1, w2, h) => `<path d="M${cx - w1} ${top} Q${cx} ${top - 8} ${cx + w1} ${top} L${cx + w2} ${top + h} Q${cx} ${top + h + 12} ${cx - w2} ${top + h} Z" fill="${metal}"/><ellipse cx="${cx}" cy="${top + h}" rx="${w2 - 4}" ry="7" fill="#FFF3D2"/>`;
    const body = {
      pendant: `<ellipse cx="270" cy="300" rx="150" ry="110" fill="${glow}"/><rect x="269" y="0" width="2" height="120" fill="${F.mid}"/><rect x="258" y="112" width="24" height="14" rx="4" fill="${metal}"/>${shade(270, 128, 34, 86, 104)}`,
      chandelier: `<ellipse cx="260" cy="260" rx="170" ry="120" fill="${glow}"/><rect x="259" y="0" width="2" height="96" fill="${F.mid}"/>
        <path d="M260 96 L170 150 M260 96 L350 150 M260 96 L215 162 M260 96 L305 162" stroke="${F.mid}" stroke-width="1.5"/>
        <ellipse cx="260" cy="156" rx="96" ry="18" fill="none" stroke="${metal}" stroke-width="5"/>
        ${shade(170, 160, 9, 24, 38)}${shade(350, 160, 9, 24, 38)}${shade(215, 172, 9, 24, 38)}${shade(305, 172, 9, 24, 38)}`,
      wall: `<ellipse cx="250" cy="170" rx="120" ry="150" fill="${glow}"/><rect x="292" y="96" width="22" height="120" rx="11" fill="${metal}"/>
        <path d="M296 150 Q250 150 238 178" fill="none" stroke="${metal}" stroke-width="6" stroke-linecap="round"/>${shade(232, 178, 18, 44, 60)}`,
      floor: `<ellipse cx="190" cy="290" rx="150" ry="110" fill="${glow}"/><ellipse cx="300" cy="352" rx="46" ry="9" fill="${metal}"/>
        <path d="M300 350 L300 120 Q300 70 240 74 Q200 78 190 104" fill="none" stroke="${metal}" stroke-width="6" stroke-linecap="round"/>${shade(190, 106, 22, 58, 70)}`,
      outdoor: `<ellipse cx="260" cy="230" rx="140" ry="130" fill="${glow}"/><rect x="259" y="0" width="2" height="88" fill="${F.mid}"/>
        <path d="M222 112 L260 86 L298 112 Z" fill="${metal}"/><rect x="226" y="112" width="68" height="112" rx="4" fill="#FFE9B8" opacity=".9"/>
        <rect x="226" y="112" width="68" height="112" rx="4" fill="none" stroke="${metal}" stroke-width="6"/><path d="M260 112 L260 224" stroke="${metal}" stroke-width="3"/>
        <rect x="218" y="222" width="84" height="12" rx="3" fill="${metal}"/>`
    }[kind];
    return `<svg viewBox="0 0 400 400" preserveAspectRatio="xMaxYMin meet">
      <defs>
        <linearGradient id="${id}m" x1="0" x2="1"><stop offset="0" stop-color="${F.lo}"/><stop offset=".35" stop-color="${F.mid}"/><stop offset=".55" stop-color="${F.hi}"/><stop offset=".8" stop-color="${F.mid}"/><stop offset="1" stop-color="${F.lo}"/></linearGradient>
        <radialGradient id="${id}g"><stop offset="0" stop-color="#FFE2A0" stop-opacity=".55"/><stop offset="1" stop-color="#FFE2A0" stop-opacity="0"/></radialGradient>
      </defs>${body}</svg>`;
  }
  $$('[data-art]').forEach(el => { el.innerHTML = catArt(el.dataset.art); });

  /* ---------- Product catalogue (sample data) ---------- */
  const PRODUCTS = [
    { id: 'AC-PD-01', name: 'Halo Pendant', cat: 'Pendants', price: 18500, shape: 'cone', finish: 'brass', size: '60 × 40 cm', watt: '18 W', lm: '1,900 lm', k: '3000 K', ip: 'IP20', live: true },
    { id: 'AC-CH-02', name: 'Atrium Chandelier', cat: 'Chandeliers', price: 96000, shape: 'drum', finish: 'nickel', size: '80 cm Ø', watt: '42 W', lm: '4,800 lm', k: '2700 K', ip: 'IP20', live: true },
    { id: 'AC-WL-03', name: 'Linea Wall Light', cat: 'Wall lights', price: 6200, shape: 'cone', finish: 'graphite', size: '30 × 12 cm', watt: '8 W', lm: '720 lm', k: '3000 K', ip: 'IP44', live: true },
    { id: 'AC-FL-04', name: 'Arc Floor Lamp', cat: 'Floor lamps', price: 24900, shape: 'drum', finish: 'smoke', size: '170 cm H', watt: '12 W', lm: '1,100 lm', k: '2700 K', ip: 'IP20', live: true },
    { id: 'AC-PD-05', name: 'Orbit Pendant', cat: 'Pendants', price: 12400, shape: 'drum', finish: 'nickel', size: '45 cm Ø', watt: '14 W', lm: '1,500 lm', k: '3000 K', ip: 'IP20', live: false },
    { id: 'AC-OD-06', name: 'Terrace Lantern', cat: 'Outdoor', price: 8900, shape: 'cone', finish: 'graphite', size: '38 × 24 cm', watt: '9 W', lm: '800 lm', k: '3000 K', ip: 'IP65', live: true }
  ];

  /* ---------- 3D ring ---------- */
  const ring = $('#ring');
  let ringAngle = 0, ringVel = 0, ringDrag = null, ringAuto = !reduce;
  function renderRing() {
    if (!ring) return;
    ring.innerHTML = PRODUCTS.slice(0, 6).map((p, i) => `
      <article class="ring-item" style="--a:${i * 60}deg">
        ${lampSVG(p.finish, p.shape)}
        <div class="cap"><div><b>${p.name}</b><div class="muted" style="font-size:12px">${p.cat}</div></div></div>
      </article>`).join('');
  }
  renderRing();
  const ringStage = $('#ringStage');
  if (ringStage) {
    ringStage.addEventListener('pointerdown', e => { ringDrag = { x: e.clientX, a: ringAngle }; ringAuto = false; ringStage.classList.add('dragging'); ringStage.setPointerCapture(e.pointerId); });
    ringStage.addEventListener('pointermove', e => { if (!ringDrag) return; const dx = e.clientX - ringDrag.x; ringAngle = ringDrag.a + dx * .25; ringVel = dx * .02; });
    const endRing = () => { ringDrag = null; ringStage.classList.remove('dragging'); setTimeout(() => { ringAuto = !reduce; }, 2500); };
    ringStage.addEventListener('pointerup', endRing);
    ringStage.addEventListener('pointercancel', endRing);
    ringStage.addEventListener('keydown', e => {
      const dir = { ArrowLeft: -1, ArrowRight: 1 }[e.key];
      if (!dir) return;
      e.preventDefault();
      ringAuto = false; ringVel += dir * 4.8;
      clearTimeout(ringStage._t); ringStage._t = setTimeout(() => { ringAuto = !reduce; }, 4000);
    });
  }
  (function ringLoop() {
    if (ringAuto && !ringDrag) ringAngle += .12;
    ringVel *= .92; if (!ringDrag) ringAngle += ringVel;
    if (ring) {
      ring.style.setProperty('--ring', ringAngle.toFixed(2) + 'deg');
      $$('.ring-item', ring).forEach((el, i) => {
        const a = (i * 60 + ringAngle) * Math.PI / 180;
        el.style.opacity = (0.35 + 0.65 * (Math.cos(a) + 1) / 2).toFixed(2);
      });
    }
    requestAnimationFrame(ringLoop);
  })();

  /* ---------- 360 viewer, zoom and finishes ---------- */
  const viewer = $('#viewer');
  const vInner = $('#viewerInner');
  const deg = $('#viewerDeg');
  const vState = { rot: 200, z: 1, finish: 'brass', drag: null, shape: 'cone' };
  function renderViewer() {
    if (!vInner) return;
    const p = PRODUCTS[0];
    vInner.innerHTML = lampSVG(vState.finish, p.shape);
    applySpin();
  }
  function applySpin() {
    const s = $('#viewerInner .spin');
    if (!s) return;
    const c = Math.cos(vState.rot * Math.PI / 180);
    s.setAttribute('transform', `translate(200 0) scale(${Math.max(.08, Math.abs(c)).toFixed(3)} 1) translate(-200 0)`);
    s.style.opacity = (c < -0.02 ? .72 : 1).toFixed(2);
    if (deg) deg.textContent = String(Math.round(((vState.rot % 360) + 360) % 360)).padStart(3, '0') + '° / 360°';
    if (vInner) vInner.style.setProperty('--z', vState.z.toFixed(2));
  }
  function setZoom(z) { vState.z = clamp(z, 1, 2.6); applySpin(); }
  if (viewer) {
    viewer.addEventListener('pointerdown', e => { vState.drag = { x: e.clientX, r: vState.rot }; viewer.classList.add('dragging'); viewer.setPointerCapture(e.pointerId); });
    viewer.addEventListener('pointermove', e => { if (!vState.drag) return; vState.rot = vState.drag.r + (e.clientX - vState.drag.x) * .6; applySpin(); });
    const endV = () => { vState.drag = null; viewer.classList.remove('dragging'); };
    viewer.addEventListener('pointerup', endV);
    viewer.addEventListener('pointercancel', endV);
    viewer.addEventListener('wheel', e => { e.preventDefault(); setZoom(vState.z - e.deltaY * .002); }, { passive: false });
    viewer.addEventListener('dblclick', () => setZoom(1));
    viewer.addEventListener('keydown', e => {
      const k = e.key;
      if (k === 'ArrowLeft' || k === 'ArrowRight') { vState.rot += (k === 'ArrowRight' ? 15 : -15); applySpin(); }
      else if (k === '+' || k === '=') setZoom(vState.z + .3);
      else if (k === '-' || k === '_') setZoom(vState.z - .3);
      else if (k === '0' || k === 'Home') setZoom(1);
      else return;
      e.preventDefault();
    });
  }
  $('#zoomIn')?.addEventListener('click', () => setZoom(vState.z + .3));
  $('#zoomOut')?.addEventListener('click', () => setZoom(vState.z - .3));
  $('#zoomReset')?.addEventListener('click', () => setZoom(1));
  $$('[data-finish]').forEach(b => b.addEventListener('click', () => {
    vState.finish = b.dataset.finish;
    $$('[data-finish]').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
    const label = $('#finishName'); if (label) label.textContent = FINISH[vState.finish].name;
    renderViewer();
  }));
  const tabs = $$('[data-spec-tab]');
  const selectTab = t => {
    tabs.forEach(x => { const on = x === t; x.setAttribute('aria-selected', String(on)); x.tabIndex = on ? 0 : -1; });
    $$('[data-spec-panel]').forEach(pn => { pn.hidden = pn.dataset.specPanel !== t.dataset.specTab; });
  };
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => selectTab(t));
    t.addEventListener('keydown', e => {
      const n = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 }[e.key];
      if (n == null) return;
      e.preventDefault();
      const next = tabs[(n + tabs.length) % tabs.length];
      selectTab(next); next.focus();
    });
  });
  (function viewerIdle() { if (!vState.drag && !reduce) { vState.rot += .06; applySpin(); } requestAnimationFrame(viewerIdle); })();
  renderViewer();

  /* ---------- Light compare ---------- */
  const cmp = $('#compare');
  if (cmp) {
    cmp.insertAdjacentHTML('afterbegin', roomSVG());
    const range = $('#lightRange'), out = $('#lightOut');
    const update = () => {
      const v = Number(range.value);
      cmp.style.setProperty('--dark', (1 - v / 100 * .92).toFixed(2));
      out.textContent = v < 15 ? 'Lights off' : v > 85 ? 'Full brightness' : v + '%';
    };
    range.addEventListener('input', update); update();
  }

  /* ---------- Quote form (3 steps, validation, sample confirmation) ---------- */
  const form = $('#quoteForm');
  if (form) {
    let step = 0;
    const steps = $$('.step', form), dots = $$('.progress-steps i', form);
    const STEP_NAMES = ['Your details', 'Pieces and place', 'Timing and budget'];
    const stepLabel = $('#stepLabel');
    const show = (n, focus) => {
      step = n;
      steps.forEach((s, i) => s.classList.toggle('on', i === n));
      dots.forEach((d, i) => d.classList.toggle('on', i <= n));
      if (stepLabel) stepLabel.textContent = `Step ${n + 1} of ${steps.length} · ${STEP_NAMES[n]}`;
      if (focus) steps[n].querySelector('input, select, textarea')?.focus();
    };
    const valid = () => {
      let ok = true;
      $$('[required]', steps[step]).forEach(f => {
        const empty = !f.value.trim();
        const bad = empty || (f.type === 'email' && !/^\S+@\S+\.\S+$/.test(f.value));
        const field = f.closest('.field');
        field.classList.toggle('err', bad);
        f.setAttribute('aria-invalid', String(bad));
        let msg = field.querySelector('.field-error');
        if (bad) {
          if (!msg) {
            msg = Object.assign(document.createElement('span'), { className: 'field-error', id: 'err-' + f.name });
            field.append(msg);
            f.setAttribute('aria-describedby', msg.id);
          }
          msg.textContent = empty ? 'Please fill this in.' : 'Please enter a valid email address.';
        } else if (msg) { msg.remove(); f.removeAttribute('aria-describedby'); }
        if (bad && ok) f.focus();
        if (bad) ok = false;
      });
      return ok;
    };
    form.addEventListener('click', e => {
      const b = e.target.closest('[data-next],[data-back]');
      if (!b) return;
      if (b.hasAttribute('data-next')) { if (valid()) show(Math.min(step + 1, steps.length - 1), true); }
      else show(Math.max(step - 1, 0), true);
    });
    form.addEventListener('submit', e => {
      e.preventDefault();
      if (!valid()) return;
      form.querySelector('.form-body').hidden = true;
      const done = form.querySelector('.form-done');
      done.hidden = false;
      done.querySelector('[data-ref]').textContent = 'AC-' + (Math.floor(Math.random() * 90000) + 10000);
      done.querySelector('.done-title')?.focus();
    });
    show(0);
  }

  /* ---------- Toast ---------- */
  const toast = $('#toast');
  let tt;
  function say(msg) { if (!toast) return; toast.textContent = msg; toast.classList.add('show'); clearTimeout(tt); tt = setTimeout(() => toast.classList.remove('show'), 2200); }

  /* ---------- Admin panel ---------- */
  const admin = $('#admin');
  if (admin) {
    const views = $$('.admin-view', admin);
    $$('.admin-side [data-view]', admin).forEach(b => b.addEventListener('click', () => {
      $$('.admin-side [data-view]', admin).forEach(x => x.removeAttribute('aria-current'));
      b.setAttribute('aria-current', 'page');
      views.forEach(v => { v.hidden = v.dataset.view !== b.dataset.view; });
    }));
    // Overview bars
    const week = [42, 58, 47, 66, 74, 61, 88];
    $('#bars').innerHTML = week.map((v, i) => `<div><i style="height:0" data-h="${v}%"></i><small>${['M','T','W','T','F','S','S'][i]}</small></div>`).join('');

    // Products + uplift
    const tbody = $('#prodRows');
    let uplift = 0;
    const liveOf = p => Math.round(p.price * (1 + uplift / 100) / 10) * 10;
    function renderProducts() {
      tbody.innerHTML = PRODUCTS.map((p, i) => `
        <tr>
          <td><div style="display:flex;gap:10px;align-items:center"><span style="width:34px;height:34px;border-radius:10px;background:var(--bg);display:grid;place-items:center;overflow:hidden">${lampSVG(p.finish, p.shape).replace('<svg ', '<svg width="34" height="34" ')}</span><div><b>${p.name}</b><div class="muted mono" style="font-size:11px">${p.id}</div></div></div></td>
          <td class="col-md">${p.cat}</td>
          <td class="num"><input type="number" value="${p.price}" data-price="${i}" aria-label="Base price for ${p.name}"></td>
          <td class="num" data-live="${i}">Rs. ${inr(liveOf(p))}</td>
          <td class="col-md"><span class="badge ${p.live ? 'ok' : ''}">${p.live ? 'Live' : 'Draft'}</span></td>
          <td class="num"><button class="toggle" role="switch" aria-checked="${p.live}" data-toggle="${i}" aria-label="Show ${p.name} on site"></button></td>
        </tr>`).join('');
      $('#liveCount').textContent = PRODUCTS.filter(p => p.live).length;
    }
    renderProducts();
    tbody.addEventListener('input', e => {
      const i = e.target.dataset.price; if (i == null) return;
      PRODUCTS[i].price = Number(e.target.value) || 0;
      $(`[data-live="${i}"]`).textContent = 'Rs. ' + inr(liveOf(PRODUCTS[i]));
    });
    tbody.addEventListener('click', e => {
      const i = e.target.dataset.toggle; if (i == null) return;
      const p = PRODUCTS[i]; p.live = !p.live; renderProducts(); say(`${p.name} ${p.live ? 'is live' : 'moved to draft'}`);
    });
    const up = $('#uplift');
    up?.addEventListener('input', () => {
      uplift = Number(up.value);
      $('#upliftOut').textContent = '+' + uplift + '%';
      PRODUCTS.forEach((p, i) => { const el = $(`[data-live="${i}"]`); if (el) el.textContent = 'Rs. ' + inr(liveOf(p)); });
    });
    $('#applyUplift')?.addEventListener('click', () => { PRODUCTS.forEach(p => p.price = liveOf(p)); up.value = 0; uplift = 0; $('#upliftOut').textContent = '+0%'; renderProducts(); say('Prices updated for all products'); });

    // Editor with live preview
    const ed = { name: $('#edName'), price: $('#edPrice'), desc: $('#edDesc'), cat: $('#edCat') };
    const prev = { name: $('#pvName'), price: $('#pvPrice'), pic: $('#pvPic') };
    const syncPreview = () => {
      prev.name.textContent = ed.name.value || 'Untitled product';
      prev.price.textContent = ed.price.value ? 'Rs. ' + inr(ed.price.value) : 'Price on request';
    };
    [ed.name, ed.price, ed.desc, ed.cat].forEach(f => f?.addEventListener('input', syncPreview));
    syncPreview();
    prev.pic.innerHTML = lampSVG('brass', 'cone');
    const drop = $('#drop'), file = $('#file');
    drop?.addEventListener('click', () => file.click());
    drop?.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); file.click(); } });
    drop?.addEventListener('dragover', e => { e.preventDefault(); drop.classList.add('over'); });
    drop?.addEventListener('dragleave', () => drop.classList.remove('over'));
    drop?.addEventListener('drop', e => { e.preventDefault(); drop.classList.remove('over'); pick(e.dataTransfer.files[0]); });
    file?.addEventListener('change', () => pick(file.files[0]));
    function pick(f) {
      if (!f || !f.type.startsWith('image/')) { say('Please choose an image file'); return; }
      const r = new FileReader();
      r.onload = () => { prev.pic.innerHTML = `<img alt="Uploaded product photo preview" src="${r.result}">`; say('Photo added to the product'); };
      r.readAsDataURL(f);
    }
    $('#saveDraft')?.addEventListener('click', () => say('Draft saved. Publish when ready'));

    // Leads kanban
    const leads = [
      { n: 'Ananya R.', p: 'Halo Pendant', c: 'Pune', s: 'new', src: 'Quote form' },
      { n: 'Vikram Shah', p: 'Atrium Chandelier', c: 'Mumbai', s: 'new', src: 'WhatsApp' },
      { n: 'Meera Iyer', p: 'Linea Wall Light', c: 'Bengaluru', s: 'contacted', src: 'Store visit' },
      { n: 'Arjun K.', p: 'Arc Floor Lamp', c: 'Delhi', s: 'contacted', src: 'Quote form' },
      { n: 'Studio Nove', p: 'Terrace Lantern', c: 'Goa', s: 'closed', src: 'Quote form' }
    ];
    const cols = ['new', 'contacted', 'closed'];
    const LABEL = { new: 'New', contacted: 'Contacted', closed: 'Closed' };
    function renderLeads() {
      cols.forEach(s => {
        const list = leads.filter(l => l.s === s);
        $(`[data-col="${s}"] .n`).textContent = list.length;
        $(`[data-col="${s}"] .list`).innerHTML = list.map((l, i) => `
          <button class="lead-card" data-lead="${leads.indexOf(l)}" aria-label="Move ${l.n} to next stage">
            <b>${l.n}</b><small>${l.p} · ${l.c}</small><small>via ${l.src}. Tap to move on</small>
          </button>`).join('') || '<small class="muted">Nothing here</small>';
      });
      $('#newCount').textContent = leads.filter(l => l.s === 'new').length;
      $('#leadTotal').textContent = leads.length;
    }
    $('#kanban')?.addEventListener('click', e => {
      const b = e.target.closest('[data-lead]'); if (!b) return;
      const l = leads[b.dataset.lead];
      l.s = cols[(cols.indexOf(l.s) + 1) % cols.length];
      renderLeads(); say(`${l.n}: ${LABEL[l.s]}`);
    });
    renderLeads();

    // Pages list
    const pages = ['Home', 'Collections', 'Product page', 'Request a quote', 'Thank you', 'About', 'Store visit', 'Contact', 'Privacy and terms'];
    $('#pageList').innerHTML = pages.map((p, i) => `
      <div class="page-row"><div><span>${String(i + 1).padStart(2, '0')}  ${p}</span><small>${i === 0 ? 'Hero, banner, featured products' : i === 2 ? 'Photos, finishes, specs, price' : 'Text, images, links'}</small></div>
      <button class="toggle" role="switch" aria-checked="true" aria-label="Show ${p}"></button></div>`).join('');
    $('#pageList').addEventListener('click', e => { const t = e.target.closest('.toggle'); if (!t) return; const on = t.getAttribute('aria-checked') !== 'true'; t.setAttribute('aria-checked', String(on)); say(on ? 'Page visible' : 'Page hidden'); });
  }

  /* ---------- Scroll, reveal, counters ---------- */
  const progress = $('#progress'), nav = $('#nav');
  const onScroll = () => {
    const h = document.documentElement.scrollHeight - innerHeight;
    if (progress) progress.style.transform = `scaleX(${h > 0 ? scrollY / h : 0})`;
    if (nav) nav.classList.toggle('scrolled', scrollY > 24);
    const hero = $('.hero');
    if (hero && !reduce) hero.style.setProperty('--hs', Math.min(scrollY / innerHeight, 1).toFixed(3));
  };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  const countUp = el => {
    const target = Number(el.dataset.count), t0 = performance.now(), dur = 1400;
    const step = t => { const k = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - k, 3); el.textContent = inr(Math.round(target * e)); if (k < 1) requestAnimationFrame(step); };
    reduce ? (el.textContent = inr(target)) : requestAnimationFrame(step);
  };
  const io = new IntersectionObserver(entries => entries.forEach(en => {
    if (!en.isIntersecting) return;
    en.target.classList.add('in');
    en.target.querySelectorAll?.('[data-count]').forEach(countUp);
    if (en.target.dataset.count) countUp(en.target);
    if (en.target.id === 'bars' || en.target.querySelector?.('#bars')) $$('#bars i').forEach(i => i.style.height = i.dataset.h);
    io.unobserve(en.target);
  }), { threshold: .15 });
  $$('.reveal, .timeline, .stat-n[data-count], #bars').forEach(el => io.observe(el));

  /* ---------- Mobile menu ---------- */
  const burger = $('#burger'), navLinks = $('#navLinks');
  const setMenu = open => {
    if (!navLinks || !burger) return;
    navLinks.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', String(open));
    if (open) navLinks.querySelector('a')?.focus();
  };
  burger?.addEventListener('click', () => setMenu(!navLinks.classList.contains('open')));
  $$('#navLinks a').forEach(a => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && navLinks?.classList.contains('open')) { setMenu(false); burger.focus(); }
  });
  document.addEventListener('click', e => {
    if (navLinks?.classList.contains('open') && !e.target.closest('#navLinks, #burger')) setMenu(false);
  });

  /* ---------- Scrollspy: mark the nav link for the section in view ---------- */
  const spyLinks = $$('#navLinks a[href^="#"]');
  const spyTargets = spyLinks.map(a => $(a.getAttribute('href'))).filter(Boolean);
  const spy = new IntersectionObserver(entries => entries.forEach(en => {
    if (!en.isIntersecting) return;
    spyLinks.forEach(a => {
      if (a.getAttribute('href') === '#' + en.target.id) a.setAttribute('aria-current', 'true');
      else a.removeAttribute('aria-current');
    });
  }), { rootMargin: '-45% 0px -50% 0px' });
  spyTargets.forEach(t => spy.observe(t));

  /* ---------- Pointer effects (desktop only) ---------- */
  if (fine && !reduce) {
    document.body.classList.add('has-cursor');
    const dot = Object.assign(document.createElement('div'), { className: 'cursor' });
    const ringEl = Object.assign(document.createElement('div'), { className: 'cursor-ring' });
    ringEl.innerHTML = '<span class="lbl"></span>';
    document.body.append(dot, ringEl);
    let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;
    addEventListener('pointermove', e => { mx = e.clientX; my = e.clientY; document.body.classList.add('cursor-on'); }, { passive: true });
    document.documentElement.addEventListener('pointerleave', () => document.body.classList.remove('cursor-on'));
    (function cursorLoop() {
      dot.style.transform = `translate3d(${mx}px, ${my}px, 0)`;
      rx += (mx - rx) * .18; ry += (my - ry) * .18;
      ringEl.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
      requestAnimationFrame(cursorLoop);
    })();
    document.addEventListener('pointerover', e => {
      const t = e.target.closest('a, button, [data-cursor], .viewer, .ring-stage, .hero-stage, .cat');
      ringEl.classList.toggle('hover', !!t);
      const label = t?.dataset.cursor || (t?.matches('.viewer, .ring-stage, .hero-stage') ? 'Drag' : '');
      ringEl.querySelector('.lbl').textContent = label;
      ringEl.classList.toggle('labelled', !!label);
    });

    // Magnetic buttons
    $$('[data-magnetic]').forEach(b => {
      b.addEventListener('pointermove', e => { const r = b.getBoundingClientRect(); b.style.translate = `${((e.clientX - r.left) - r.width / 2) * .22}px ${((e.clientY - r.top) - r.height / 2) * .3}px`; });
      b.addEventListener('pointerleave', () => { b.style.translate = ''; });
    });
  }

  /* Default direction, applied last so every renderer above is ready */
  setTheme(saved);
})();

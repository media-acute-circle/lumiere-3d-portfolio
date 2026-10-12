/* ==========================================================================
   Lumière · Access screen
   Checks the password (SHA-256, so the plain text never ships), counts
   attempts, opens the support modal after MAX_ATTEMPTS, and renders the
   Acute Circle 3D backdrop with Three.js (r128).

   Note: this is a client-side gate for a private preview. It keeps casual
   visitors out; it is not access control. See docs/project/site-guide.md §6.
   ========================================================================== */
(() => {
  const ACCESS_HASH = '31d7e1681777aa28a58007dc7c351b241ce0f02dc31eefb81bb0d972046c1b84';
  const KEY = 'lumiere-access', ATTEMPTS_KEY = 'lumiere-attempts', MAX_ATTEMPTS = 3;
  const NEXT = 'portfolio.html';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = id => document.getElementById(id);

  /* ---------- Session helpers (sessionStorage, with window.name fallback) ---------- */
  const store = {
    get(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { sessionStorage.setItem(k, v); } catch (e) { /* private mode */ } }
  };
  const isGranted = () => store.get(KEY) === ACCESS_HASH || window.name === KEY + ':' + ACCESS_HASH;
  if (isGranted()) { location.replace(NEXT); return; }

  /* ---------- SHA-256 (pure JS, works on file:// and http) ---------- */
  const K = new Uint32Array([
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5, 0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da, 0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
  ]);
  function sha256(str) {
    const bytes = new TextEncoder().encode(str), len = bytes.length;
    const size = ((len + 9 + 63) >> 6) << 6, buf = new Uint8Array(size);
    buf.set(bytes); buf[len] = 0x80;
    const dv = new DataView(buf.buffer);
    dv.setUint32(size - 4, (len * 8) >>> 0); dv.setUint32(size - 8, Math.floor(len / 0x20000000));
    const H = new Uint32Array([0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19]);
    const W = new Uint32Array(64), ror = (x, n) => (x >>> n) | (x << (32 - n));
    for (let o = 0; o < size; o += 64) {
      for (let i = 0; i < 16; i++) W[i] = dv.getUint32(o + i * 4);
      for (let i = 16; i < 64; i++) {
        const a = W[i - 15], b = W[i - 2];
        W[i] = W[i - 16] + (ror(a, 7) ^ ror(a, 18) ^ (a >>> 3)) + W[i - 7] + (ror(b, 17) ^ ror(b, 19) ^ (b >>> 10));
      }
      let [a, b, c, d, e, f, g, h] = H;
      for (let i = 0; i < 64; i++) {
        const t1 = (h + (ror(e, 6) ^ ror(e, 11) ^ ror(e, 25)) + ((e & f) ^ (~e & g)) + K[i] + W[i]) >>> 0;
        const t2 = ((ror(a, 2) ^ ror(a, 13) ^ ror(a, 22)) + ((a & b) ^ (a & c) ^ (b & c))) >>> 0;
        h = g; g = f; f = e; e = (d + t1) >>> 0; d = c; c = b; b = a; a = (t1 + t2) >>> 0;
      }
      H[0] += a; H[1] += b; H[2] += c; H[3] += d; H[4] += e; H[5] += f; H[6] += g; H[7] += h;
    }
    return [...H].map(x => x.toString(16).padStart(8, '0')).join('');
  }

  /* ---------- Form ---------- */
  const form = $('gateForm'), input = $('gatePass'), msg = $('gateMsg'), field = form.querySelector('.gate-field');
  const eye = $('gateEye'), modal = $('gateModal'), card = document.querySelector('.gate-card');
  let attempts = Number(store.get(ATTEMPTS_KEY)) || 0;
  let scene = null; // set once the 3D backdrop is ready

  eye.addEventListener('click', () => {
    const show = input.type === 'password';
    input.type = show ? 'text' : 'password';
    eye.setAttribute('aria-pressed', String(show));
    eye.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
    input.focus({ preventScroll: true });
    const end = input.value.length; try { input.setSelectionRange(end, end); } catch (e) { /* type=text only */ }
  });
  input.addEventListener('input', () => {
    if (field.classList.contains('is-error')) { field.classList.remove('is-error'); input.removeAttribute('aria-invalid'); msg.textContent = ''; }
  });

  form.addEventListener('submit', e => {
    e.preventDefault();
    const value = input.value;
    if (!value) { fail('Enter the access password to continue.', false); return; }
    if (sha256(value) === ACCESS_HASH) { grant(); return; }
    attempts += 1; store.set(ATTEMPTS_KEY, String(attempts));
    const left = MAX_ATTEMPTS - attempts;
    fail(left > 0 ? `That password is incorrect. ${left} ${left === 1 ? 'attempt' : 'attempts'} left before we connect you with support.` : 'That password is incorrect.', true);
    if (attempts >= MAX_ATTEMPTS) openModal();
  });

  function fail(text, counted) {
    msg.textContent = text;
    field.classList.remove('is-error'); void field.offsetWidth; // restart the shake
    field.classList.add('is-error');
    input.setAttribute('aria-invalid', 'true');
    if (counted) input.select();
    input.focus();
    scene?.pulse('error');
  }
  function grant() {
    store.set(KEY, ACCESS_HASH); store.set(ATTEMPTS_KEY, '0');
    window.name = KEY + ':' + ACCESS_HASH;
    field.classList.remove('is-error'); input.removeAttribute('aria-invalid');
    card.classList.add('is-granted');
    msg.textContent = 'Access granted. Opening the portfolio…';
    form.querySelector('.gate-submit span').textContent = 'Access granted';
    form.querySelectorAll('input, button').forEach(el => { el.disabled = true; });
    scene?.pulse('success');
    setTimeout(() => location.assign(NEXT), reduce ? 200 : 1100);
  }

  /* ---------- Support modal (focus trapped, Esc closes) ---------- */
  let lastFocus = null;
  function openModal() {
    lastFocus = document.activeElement;
    modal.hidden = false;
    requestAnimationFrame(() => modal.classList.add('is-open'));
    modal.querySelector('.gate-submit').focus();
  }
  function closeModal() {
    modal.classList.remove('is-open');
    setTimeout(() => { modal.hidden = true; }, reduce ? 0 : 250);
    (lastFocus || input).focus();
  }
  modal.addEventListener('click', e => { if (e.target === modal || e.target.closest('[data-close]')) closeModal(); });
  modal.addEventListener('keydown', e => {
    if (e.key === 'Escape') { closeModal(); return; }
    if (e.key !== 'Tab') return;
    const f = [...modal.querySelectorAll('a[href], button:not([disabled])')];
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });
  if (attempts >= MAX_ATTEMPTS) msg.textContent = 'Too many incorrect attempts this session. You can still try again, or contact Acute Circle support.';
  document.documentElement.classList.add('gate-ready');

  /* ---------- 3D backdrop: neural sphere inside orbit rings ----------
     Isolated so a WebGL or CDN failure can never break the form above. */
  try { scene = initScene(); } catch (err) { document.body.classList.add('no-webgl'); }

  function initScene() {
    const canvas = $('gateCanvas');
    if (!canvas || !window.THREE) { document.body.classList.add('no-webgl'); return null; }
    const T = window.THREE;
    const renderer = new T.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);
    const scene3 = new T.Scene();
    const camera = new T.PerspectiveCamera(45, 1, .1, 100);
    camera.position.set(0, 0, 9);
    const TEAL = new T.Color('#00D4B8'), VIOLET = new T.Color('#7C3AED'), CYAN = new T.Color('#22D3EE');

    const dot = (() => {
      const c = document.createElement('canvas'); c.width = c.height = 64;
      const x = c.getContext('2d'), g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
      g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(.3, 'rgba(255,255,255,.6)'); g.addColorStop(1, 'rgba(255,255,255,0)');
      x.fillStyle = g; x.fillRect(0, 0, 64, 64);
      return new T.CanvasTexture(c);
    })();

    const rig = new T.Group(); scene3.add(rig);

    // Neural sphere: Fibonacci points, each linked to its nearest neighbours
    const N = 360, R = 3.1, pts = [];
    const pos = new Float32Array(N * 3), col = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      const y = 1 - (i / (N - 1)) * 2, r = Math.sqrt(1 - y * y), th = i * Math.PI * (3 - Math.sqrt(5));
      const v = new T.Vector3(Math.cos(th) * r, y, Math.sin(th) * r).multiplyScalar(R);
      pts.push(v); pos.set([v.x, v.y, v.z], i * 3);
      const c = TEAL.clone().lerp(VIOLET, (1 - y) / 2); col.set([c.r, c.g, c.b], i * 3);
    }
    const nodeGeo = new T.BufferGeometry();
    nodeGeo.setAttribute('position', new T.BufferAttribute(pos, 3));
    nodeGeo.setAttribute('color', new T.BufferAttribute(col, 3));
    const nodes = new T.Points(nodeGeo, new T.PointsMaterial({ size: .09, map: dot, vertexColors: true, transparent: true, depthWrite: false, blending: T.AdditiveBlending, opacity: .9 }));
    const linePos = [], lineCol = [];
    pts.forEach((p, i) => {
      pts.map((q, j) => [j, p.distanceToSquared(q)]).filter(([j]) => j > i).sort((a, b) => a[1] - b[1]).slice(0, 2).forEach(([j]) => {
        linePos.push(p.x, p.y, p.z, pts[j].x, pts[j].y, pts[j].z);
        lineCol.push(col[i * 3], col[i * 3 + 1], col[i * 3 + 2], col[j * 3], col[j * 3 + 1], col[j * 3 + 2]);
      });
    });
    const lineGeo = new T.BufferGeometry();
    lineGeo.setAttribute('position', new T.Float32BufferAttribute(linePos, 3));
    lineGeo.setAttribute('color', new T.Float32BufferAttribute(lineCol, 3));
    const lineMat = new T.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: .22, depthWrite: false, blending: T.AdditiveBlending });
    const sphere = new T.Group(); sphere.add(nodes, new T.LineSegments(lineGeo, lineMat)); rig.add(sphere);

    // Orbit rings with travelling satellites, echoing the Acute Circle emblem
    const rings = [[4.1, 1.2, .2, TEAL], [4.6, -.5, .9, VIOLET], [5.1, .35, -1.1, CYAN]].map(([r, rx, rz, c], k) => {
      const g = new T.Group(); g.rotation.set(rx, 0, rz);
      g.add(new T.Mesh(new T.TorusGeometry(r, .008, 8, 220), new T.MeshBasicMaterial({ color: c, transparent: true, opacity: .55, blending: T.AdditiveBlending, depthWrite: false })));
      const sat = new T.Sprite(new T.SpriteMaterial({ map: dot, color: c, transparent: true, blending: T.AdditiveBlending, depthWrite: false }));
      sat.scale.setScalar(.38); g.add(sat); rig.add(g);
      return { g, sat, r, speed: .004 + k * .0015, a: k * 2.1 };
    });

    // Distant starfield
    const S = 900, sPos = new Float32Array(S * 3);
    for (let i = 0; i < S; i++) sPos.set([(Math.random() - .5) * 60, (Math.random() - .5) * 36, -8 - Math.random() * 30], i * 3);
    const starGeo = new T.BufferGeometry(); starGeo.setAttribute('position', new T.BufferAttribute(sPos, 3));
    const stars = new T.Points(starGeo, new T.PointsMaterial({ size: .07, map: dot, color: 0x94A3B8, transparent: true, opacity: .55, depthWrite: false, blending: T.AdditiveBlending }));
    scene3.add(stars);

    function resize() {
      const w = innerWidth, h = innerHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.position.z = w < 640 ? 13 : w < 1024 ? 11 : 9.5;
      camera.updateProjectionMatrix();
    }
    addEventListener('resize', resize); resize();

    let px = 0, py = 0, energy = 0, flash = 0, flashColor = TEAL;
    addEventListener('pointermove', e => { px = e.clientX / innerWidth - .5; py = e.clientY / innerHeight - .5; }, { passive: true });

    let last = performance.now(), t = 0, running = false;
    function frame(now) {
      const dt = Math.min((now - last) / 16.67, 3); last = now; t += dt;
      energy *= Math.pow(.97, dt); flash *= Math.pow(.93, dt);
      sphere.rotation.y += (.0018 + energy * .05) * dt;
      sphere.rotation.x = Math.sin(t * .003) * .2;
      rings.forEach(r => { r.a += (r.speed + energy * .04) * dt; r.sat.position.set(Math.cos(r.a) * r.r, Math.sin(r.a) * r.r, 0); r.g.rotation.y += .0006 * dt; });
      rig.rotation.y += (px * .5 - rig.rotation.y) * .04;
      rig.rotation.x += (py * .3 - rig.rotation.x) * .04;
      rig.scale.setScalar(1 + energy * .35);
      stars.rotation.z += .00015 * dt;
      lineMat.opacity = .22 + flash * .5;
      nodes.material.size = .09 + flash * .08;
      if (flash > .01) { const c = flashColor; nodes.material.color.setRGB(1 + c.r * flash, 1 + c.g * flash, 1 + c.b * flash); } else nodes.material.color.setRGB(1, 1, 1);
      renderer.render(scene3, camera);
      if (!document.hidden && !reduce) requestAnimationFrame(frame); else running = false;
    }
    const start = () => { if (running) return; running = true; last = performance.now(); requestAnimationFrame(frame); };
    document.addEventListener('visibilitychange', () => { if (!document.hidden) start(); });
    start();
    document.body.classList.add('has-webgl');

    return {
      pulse(kind) {
        if (kind === 'success') { energy = 1; flash = 1; flashColor = TEAL; }
        else { flash = .8; flashColor = new T.Color('#EC4899'); }
        if (reduce) requestAnimationFrame(frame);
      }
    };
  }
})();

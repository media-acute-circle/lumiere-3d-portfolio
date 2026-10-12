/* ==========================================================================
   Lumière · Hero 3D viewer
   A physically lit pendant rendered with Three.js (r128). Drag or use the
   arrow keys to turn it through 360°, switch model and finish, and dim the
   light. Adapts to the active design direction (body[data-theme]).
   Falls back to a static illustration when WebGL is unavailable.
   ========================================================================== */
(() => {
  const stage = document.getElementById('heroStage');
  const canvas = document.getElementById('heroCanvas');
  if (!stage || !canvas) return;
  const hero = stage.closest('.hero');
  const byId = id => document.getElementById(id);
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ---------- Data (sample, mirrors the catalogue in app.js) ---------- */
  const MODELS = [
    { key: 'halo',   word: 'Halo',   name: 'Halo Pendant',      code: 'AC-PD-01 · Pendants',    price: 'Rs. 18,500', w: '18 W', lm: '1,900 lm', k: '3000 K' },
    { key: 'orbit',  word: 'Orbit',  name: 'Orbit Pendant',     code: 'AC-PD-05 · Pendants',    price: 'Rs. 12,400', w: '14 W', lm: '1,500 lm', k: '3000 K' },
    { key: 'atrium', word: 'Atrium', name: 'Atrium Chandelier', code: 'AC-CH-02 · Chandeliers', price: 'Rs. 96,000', w: '42 W', lm: '4,800 lm', k: '2700 K' }
  ];
  const FINISHES = {
    brass:    { name: 'Brass',       color: '#C9A266', metalness: 1,   roughness: .28, clearcoat: 0, detail: '#6E5128' },
    nickel:   { name: 'Nickel',      color: '#DADCDF', metalness: 1,   roughness: .2,  clearcoat: 0, detail: '#5C6068' },
    graphite: { name: 'Graphite',    color: '#30343B', metalness: .85, roughness: .48, clearcoat: 0, detail: '#C9A266' },
    smoke:    { name: 'Smoke glass', color: '#4B3F31', metalness: .35, roughness: .16, clearcoat: 1, detail: '#C9A266' }
  };
  const THEMES = {
    atelier: { exposure: 1.0,  key: 1.25, shadow: .16, pool: '#FFC982', poolK: .5, additive: false, cone: 0,   dust: 0,  env: 1 },
    gallery: { exposure: 1.05, key: .4,   shadow: .55, pool: '#FFBE66', poolK: .8, additive: true,  cone: .34, dust: .9, env: .6 },
    studio:  { exposure: 1.0,  key: 1.35, shadow: .12, pool: '#FFD49A', poolK: .38, additive: false, cone: 0,  dust: 0,  env: 1.15 }
  };

  const state = { model: 0, finish: 'brass', lit: .8, lastLit: .8, rot: -.6, vel: 0, drag: null, auto: !reduce, px: 0, py: 0 };
  const ui = {
    name: byId('heroName'), code: byId('heroCode'), price: byId('heroPrice'),
    w: byId('heroW'), lm: byId('heroLm'), k: byId('heroK'), index: byId('heroIndex'),
    word: byId('heroWord'), deg: byId('heroDeg'), prog: byId('heroDialProg'),
    finish: byId('heroFinish'), dim: byId('heroDim'), dimOut: byId('heroDimOut'), power: byId('heroPower')
  };

  /* ---------- UI (works with or without WebGL) ---------- */
  function renderModelUI() {
    const m = MODELS[state.model];
    ui.name.textContent = m.name;
    ui.code.textContent = m.code;
    ui.price.firstChild.textContent = m.price;
    ui.w.textContent = m.w; ui.lm.textContent = m.lm; ui.k.textContent = m.k;
    ui.index.textContent = String(state.model + 1).padStart(2, '0');
    ui.word.classList.remove('is-in');
    void ui.word.offsetWidth; // restart the word transition
    ui.word.textContent = m.word;
    ui.word.style.setProperty('--fit', Math.min(1, 4.4 / m.word.length).toFixed(3)); // long names shrink to fit
    ui.word.classList.add('is-in');
    stage.setAttribute('aria-label', `${m.name} in ${FINISHES[state.finish].name}, 3D view. Drag or use the arrow keys to rotate it 360 degrees.`);
  }
  function setModel(i) {
    state.model = (i + MODELS.length) % MODELS.length;
    renderModelUI();
    gl?.setModel(state.model);
  }
  function setFinish(key) {
    state.finish = key;
    document.querySelectorAll('[data-hero-finish]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.heroFinish === key)));
    ui.finish.textContent = FINISHES[key].name;
    renderModelUI();
    gl?.setFinish(key);
  }
  function setLit(v, fromToggle) {
    state.lit = v;
    if (v > 0) state.lastLit = v;
    ui.dim.value = Math.round(v * 100);
    ui.dimOut.textContent = v === 0 ? 'Off' : Math.round(v * 100) + '%';
    ui.power.setAttribute('aria-checked', String(v > 0));
    hero.style.setProperty('--lit', v.toFixed(2));
    if (!fromToggle) ui.dim.setAttribute('aria-valuetext', ui.dimOut.textContent);
  }
  document.querySelectorAll('[data-model-step]').forEach(b => b.addEventListener('click', () => setModel(state.model + Number(b.dataset.modelStep))));
  document.querySelectorAll('[data-hero-finish]').forEach(b => b.addEventListener('click', () => setFinish(b.dataset.heroFinish)));
  ui.dim.addEventListener('input', () => setLit(Number(ui.dim.value) / 100));
  ui.power.addEventListener('click', () => setLit(state.lit > 0 ? 0 : state.lastLit || .8, true));

  function updateDial() {
    const d = Math.round(((state.rot * 180 / Math.PI) % 360 + 360) % 360);
    if (d === updateDial.last) return;
    updateDial.last = d;
    ui.deg.textContent = String(d).padStart(3, '0') + '°';
    ui.prog.style.strokeDashoffset = String(360 - d);
  }

  /* ---------- Pointer and keyboard ---------- */
  let resumeT;
  const pauseAuto = () => { state.auto = false; clearTimeout(resumeT); resumeT = setTimeout(() => { state.auto = !reduce; }, 3500); };
  stage.addEventListener('pointerdown', e => {
    if (e.button !== 0) return;
    state.drag = { x: e.clientX }; pauseAuto();
    stage.classList.add('is-dragging'); stage.setPointerCapture(e.pointerId);
  });
  stage.addEventListener('pointermove', e => {
    if (!state.drag) return;
    const dx = e.clientX - state.drag.x; state.drag.x = e.clientX;
    state.rot += dx * .009; state.vel = dx * .009;
  });
  const endDrag = () => { state.drag = null; stage.classList.remove('is-dragging'); pauseAuto(); };
  stage.addEventListener('pointerup', endDrag);
  stage.addEventListener('pointercancel', endDrag);
  stage.addEventListener('keydown', e => {
    const dir = { ArrowLeft: -1, ArrowRight: 1 }[e.key];
    if (!dir) return;
    e.preventDefault(); pauseAuto();
    state.vel += dir * .0158; // eases ~15° with the frame decay below
  });
  if (fine && !reduce) {
    hero.addEventListener('pointermove', e => {
      const r = hero.getBoundingClientRect();
      state.px = (e.clientX - r.left) / r.width - .5;
      state.py = (e.clientY - r.top) / r.height - .5;
    }, { passive: true });
  }

  /* ---------- WebGL ---------- */
  let gl = null;
  try {
    if (!window.THREE) throw new Error('Three.js not loaded');
    gl = initGL();
  } catch (err) {
    stage.classList.add('is-fallback', 'is-ready');
  }
  renderModelUI();
  setLit(state.lit);

  function initGL() {
    const T = window.THREE;
    const srgb = hex => new T.Color(hex).convertSRGBToLinear();
    const renderer = new T.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputEncoding = T.sRGBEncoding;
    renderer.toneMapping = T.ACESFilmicToneMapping;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = T.PCFSoftShadowMap;
    renderer.setClearColor(0x000000, 0);

    const scene = new T.Scene();
    const camera = new T.PerspectiveCamera(32, 1, .1, 100);
    const LOOK = new T.Vector3(0, -.75, 0);
    const LAMP_Y = .6, FLOOR_Y = -2.5;

    /* Studio environment: emissive softboxes prefiltered for PBR reflections */
    const envScene = new T.Scene();
    envScene.add(new T.Mesh(new T.BoxGeometry(12, 12, 12), new T.MeshBasicMaterial({ color: 0x2a2724, side: T.BackSide })));
    const softbox = (w, h, k, pos, rot, tint = 0xffffff) => {
      const m = new T.Mesh(new T.PlaneGeometry(w, h), new T.MeshBasicMaterial({ color: new T.Color(tint).multiplyScalar(k), side: T.DoubleSide }));
      m.position.set(...pos); m.rotation.set(...rot); envScene.add(m);
    };
    softbox(8, 4, 3, [0, 5.9, 0], [Math.PI / 2, 0, 0]);
    softbox(1.4, 8, 7, [-5.9, 1, 0], [0, Math.PI / 2, 0]);
    softbox(1.4, 8, 3.5, [5.9, 1, -1], [0, -Math.PI / 2, 0], 0xffe6c4);
    softbox(5, 2, 1.6, [0, 1, 5.9], [0, Math.PI, 0]);
    softbox(10, 2, .6, [0, -5.9, 0], [-Math.PI / 2, 0, 0], 0xffd8a8);
    const pmrem = new T.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(envScene, .035).texture;
    pmrem.dispose();

    /* Lights */
    const key = new T.DirectionalLight(0xffffff, 1);
    key.position.set(-1.6, 8, 2.4);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    Object.assign(key.shadow.camera, { left: -4, right: 4, top: 4, bottom: -4, near: 1, far: 20 });
    key.shadow.bias = -.0006;
    scene.add(key, new T.HemisphereLight(0xfff4e6, 0x222018, .35));

    /* Floor: shadow catcher plus a pool of light */
    const radial = (size = 256) => {
      const c = document.createElement('canvas'); c.width = c.height = size;
      const x = c.getContext('2d'), g = x.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
      g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(.35, 'rgba(255,255,255,.45)'); g.addColorStop(1, 'rgba(255,255,255,0)');
      x.fillStyle = g; x.fillRect(0, 0, size, size);
      return new T.CanvasTexture(c);
    };
    const glowTex = radial();
    const shadowMat = new T.ShadowMaterial({ opacity: .16 });
    const floor = new T.Mesh(new T.PlaneGeometry(16, 16), shadowMat);
    floor.rotation.x = -Math.PI / 2; floor.position.y = FLOOR_Y; floor.receiveShadow = true;
    const poolMat = new T.MeshBasicMaterial({ map: glowTex, transparent: true, depthWrite: false, toneMapped: false });
    const pool = new T.Mesh(new T.PlaneGeometry(7, 7), poolMat);
    pool.rotation.x = -Math.PI / 2; pool.position.y = FLOOR_Y + .003;
    scene.add(floor, pool);

    /* Lamp rig: lamp (sways) > spinner (rotates) > shade */
    const lamp = new T.Group(); lamp.position.y = LAMP_Y; scene.add(lamp);
    const spinner = new T.Group(); lamp.add(spinner);
    const finishMat = new T.MeshPhysicalMaterial({ side: T.DoubleSide });
    const innerMat = new T.MeshStandardMaterial({ color: srgb('#F3E6CC'), roughness: .75, metalness: 0, emissive: srgb('#FFC46E'), side: T.DoubleSide });
    const detailMat = new T.MeshStandardMaterial({ metalness: .7, roughness: .35 });
    const cord = new T.Mesh(new T.CylinderGeometry(.011, .011, 9, 8), new T.MeshStandardMaterial({ color: srgb('#161616'), roughness: .6 }));
    cord.position.y = 4.6; lamp.add(cord);
    const collar = new T.Mesh(new T.CylinderGeometry(.095, .12, .26, 48), finishMat);
    collar.position.y = .13; collar.castShadow = true; spinner.add(collar);
    const bulbMat = new T.MeshBasicMaterial({ color: new T.Color(1, .85, .6) });
    const bulb = new T.Mesh(new T.SphereGeometry(.18, 32, 16), bulbMat); spinner.add(bulb);
    const bulbLight = new T.PointLight(0xffc477, 1, 7, 2); spinner.add(bulbLight);
    const shadeHolder = new T.Group(); spinner.add(shadeHolder);

    /* Volumetric light cone (fresnel-faded, additive) */
    const coneMat = new T.ShaderMaterial({
      uniforms: { uColor: { value: new T.Color('#FFD08A') }, uOpacity: { value: 0 } },
      vertexShader: 'varying float vY; varying vec3 vN; varying vec3 vV;\nvoid main(){ vY = uv.y; vec4 mv = modelViewMatrix * vec4(position, 1.0); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }',
      fragmentShader: 'uniform vec3 uColor; uniform float uOpacity; varying float vY; varying vec3 vN; varying vec3 vV;\nvoid main(){ float f = pow(abs(dot(normalize(vN), normalize(vV))), 2.0); gl_FragColor = vec4(uColor, pow(vY, 1.6) * f * uOpacity); }',
      transparent: true, depthWrite: false, side: T.DoubleSide, blending: T.AdditiveBlending
    });
    const cone = new T.Mesh(new T.BufferGeometry(), coneMat); lamp.add(cone);

    /* Dust drifting through the beam */
    const DUST = 150, dustPos = new Float32Array(DUST * 3), dustSeed = new Float32Array(DUST);
    const dustGeo = new T.BufferGeometry(); dustGeo.setAttribute('position', new T.BufferAttribute(dustPos, 3));
    const dustMat = new T.PointsMaterial({ size: .03, map: glowTex, color: 0xffd9a0, transparent: true, depthWrite: false, blending: T.AdditiveBlending });
    const dust = new T.Points(dustGeo, dustMat); lamp.add(dust);

    /* Shade profiles: [radius, y], y = 0 at the collar */
    const dome = () => {
      const p = [];
      for (let i = 0; i <= 24; i++) { const t = (6 + i * 84 / 24) * Math.PI / 180; p.push([1.18 * Math.sin(t), .98 * (Math.cos(t) - 1)]); }
      p.push([1.22, -1.0]);
      return p;
    };
    const PROFILES = {
      halo:   { pts: [[.1, .02], [.48, 0], [.7, -.3], [.95, -.75], [1.17, -1.12], [1.21, -1.18]], flutes: 28, depth: .014, from: -.05 },
      orbit:  { pts: dome(), flutes: 56, depth: .006, from: -.15 },
      atrium: { pts: [[.11, .02], [.3, 0], [1.22, -.04], [1.28, -.12], [1.28, -.92], [1.24, -.98]], flutes: 18, depth: .03, from: -.12 }
    };
    let shade = null, shadeParts = [];
    function buildShade(k) {
      const P = PROFILES[k];
      const geo = new T.LatheGeometry(P.pts.map(([r, y]) => new T.Vector2(r, y)), 192);
      const a = geo.attributes.position;
      for (let i = 0; i < a.count; i++) { // radial fluting so rotation reads clearly
        const x = a.getX(i), y = a.getY(i), z = a.getZ(i);
        if (y > P.from) continue;
        const th = Math.atan2(z, x), s = 1 + P.depth * (.5 + .5 * Math.cos(th * P.flutes));
        a.setX(i, x * s); a.setZ(i, z * s);
      }
      geo.computeVertexNormals();
      const g = new T.Group();
      const outer = new T.Mesh(geo, finishMat); outer.castShadow = true;
      const inner = new T.Mesh(geo, innerMat); inner.scale.set(.972, .996, .972); inner.position.y = -.004;
      const [lr, ly] = P.pts[P.pts.length - 1];
      const rim = new T.Mesh(new T.TorusGeometry(lr * (1 + P.depth), .02, 12, 192), finishMat);
      rim.rotation.x = Math.PI / 2; rim.position.y = ly;
      // Seam at 0° and maker's plate at 180°: the two cues that make a 360° turn legible
      const wall = P.pts.filter(([r]) => r > .32);
      const seam = new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(wall.map(([r, y]) => new T.Vector3(r * (1 + P.depth) + .008, y, 0))), 64, .004, 6), detailMat);
      const mid = Math.floor(wall.length / 2), p0 = wall[mid - 1], p1 = wall[mid];
      const plate = new T.Mesh(new T.BoxGeometry(.014, .2, .13), detailMat);
      plate.position.set(-((p0[0] + p1[0]) / 2 * (1 + P.depth) + .012), (p0[1] + p1[1]) / 2, 0);
      plate.rotation.z = -Math.atan2(p1[0] - p0[0], p0[1] - p1[1]);
      g.add(outer, inner, rim, seam, plate);
      return { group: g, openY: ly, openR: lr, geos: [geo, rim.geometry, seam.geometry, plate.geometry] };
    }
    function mountShade(k) {
      if (shade) { shadeHolder.remove(shade.group); shade.geos.forEach(x => x.dispose()); }
      shade = buildShade(k); shadeHolder.add(shade.group);
      bulb.position.y = shade.openY * .42; bulbLight.position.y = shade.openY * .55;
      const floorLocal = FLOOR_Y - LAMP_Y, h = shade.openY - floorLocal;
      cone.geometry.dispose();
      cone.geometry = new T.CylinderGeometry(shade.openR * .92, shade.openR * 2.2, h, 64, 1, true);
      cone.position.y = shade.openY - h / 2;
      for (let i = 0; i < DUST; i++) {
        const u = Math.random(), y = floorLocal + .2 + u * (h - .3), spread = shade.openR * (2.1 - 1.1 * u) * Math.sqrt(Math.random()), ang = Math.random() * Math.PI * 2;
        dustPos.set([Math.cos(ang) * spread, y, Math.sin(ang) * spread], i * 3); dustSeed[i] = Math.random() * 6.28;
      }
      dustGeo.attributes.position.needsUpdate = true;
    }

    /* Finish, light and theme */
    let finishTo = null;
    function setFinish(k) {
      const f = FINISHES[k];
      finishTo = { color: srgb(f.color), metalness: f.metalness, roughness: f.roughness, clearcoat: f.clearcoat };
      detailMat.color.copy(srgb(f.detail));
      if (reduce) stepFinish(1);
    }
    function stepFinish(k) {
      if (!finishTo) return;
      finishMat.color.lerp(finishTo.color, k);
      finishMat.metalness += (finishTo.metalness - finishMat.metalness) * k;
      finishMat.roughness += (finishTo.roughness - finishMat.roughness) * k;
      finishMat.clearcoat += (finishTo.clearcoat - finishMat.clearcoat) * k;
      finishMat.clearcoatRoughness = .08;
      if (Math.abs(finishMat.roughness - finishTo.roughness) < .002 && finishMat.color.equals(finishTo.color)) finishTo = null;
    }
    let theme = THEMES.atelier;
    function setTheme() {
      theme = THEMES[document.body.dataset.theme] || THEMES.atelier;
      renderer.toneMappingExposure = theme.exposure;
      key.intensity = theme.key;
      shadowMat.opacity = theme.shadow;
      poolMat.color.set(theme.pool);
      poolMat.blending = theme.additive ? T.AdditiveBlending : T.NormalBlending;
      poolMat.needsUpdate = true;
      [finishMat, innerMat, detailMat].forEach(m => { m.envMapIntensity = theme.env; });
    }

    /* Model change: lift the pendant out of frame, swap, lower it back */
    let tween = null;
    const easeIn = t => t * t * t, easeOut = t => 1 - Math.pow(1 - t, 3) * (1 - 1.6 * t * (1 - t));
    function setModel(i) {
      const k = MODELS[i].key;
      if (reduce || !shade) { mountShade(k); return; }
      tween = { t0: performance.now(), dur: 420, from: lamp.position.y, to: LAMP_Y + 4.4, ease: easeIn, done: () => {
        mountShade(k);
        tween = { t0: performance.now(), dur: 900, from: LAMP_Y + 4.4, to: LAMP_Y, ease: easeOut, done: null };
      } };
    }

    /* Sizing: keep the shade framed at any aspect ratio */
    function resize() {
      const w = stage.clientWidth, h = stage.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      const t = Math.tan(camera.fov * Math.PI / 360);
      camera.userData.dist = Math.max(3.1 / t, 3.1 / (t * camera.aspect));
      // On wide layouts, nudge the pendant left of the product panel
      const shift = window.innerWidth > 860 ? w * .1 : 0;
      camera.setViewOffset(w, h, shift, 0, w, h);
      camera.updateProjectionMatrix();
    }
    new ResizeObserver(resize).observe(stage);
    resize();

    /* Loop: runs only while the hero is on screen */
    let running = false, inView = true, last = performance.now(), time = 0, cx = 0, cy = 0, firstFrame = true;
    function frame(now) {
      const dt = Math.min((now - last) / 16.67, 3); last = now; time += dt;
      if (!state.drag) {
        state.vel *= Math.pow(.94, dt);
        state.rot += state.vel * dt;
        if (state.auto) state.rot += .0035 * dt;
      }
      spinner.rotation.y = state.rot;
      if (!reduce) lamp.rotation.z = Math.sin(time * .011) * .012;
      if (tween) {
        const k = Math.min((now - tween.t0) / tween.dur, 1);
        lamp.position.y = tween.from + (tween.to - tween.from) * tween.ease(k);
        if (k === 1) { const d = tween.done; tween = null; d?.(); }
      }
      stepFinish(reduce ? 1 : .08 * dt);

      const lit = state.lit, lift = 1 - Math.min(Math.max((lamp.position.y - LAMP_Y) / 3, 0), 1);
      const L = lit * lift;
      innerMat.emissiveIntensity = .15 + L * 1.25;
      bulbMat.color.setRGB(1, .85, .6).multiplyScalar(.35 + L * 3.2);
      bulbLight.intensity = L * 2.4;
      poolMat.opacity = L * theme.poolK;
      coneMat.uniforms.uOpacity.value = L * theme.cone;
      dustMat.opacity = L * theme.dust;
      dust.visible = cone.visible = theme.cone > 0;
      if (dust.visible && !reduce) {
        const a = dustGeo.attributes.position;
        for (let i = 0; i < DUST; i++) {
          let y = a.getY(i) + .0016 * dt;
          if (y > shade.openY - .05) y = FLOOR_Y - LAMP_Y + .2;
          a.setY(i, y); a.setX(i, a.getX(i) + Math.sin(time * .02 + dustSeed[i]) * .0008);
        }
        a.needsUpdate = true;
      }

      cx += (state.px * .9 - cx) * .05; cy += (state.py * .5 - cy) * .05;
      camera.position.set(cx, .45 - cy, camera.userData.dist);
      camera.lookAt(LOOK);
      renderer.render(scene, camera);
      updateDial();
      if (firstFrame) { firstFrame = false; stage.classList.add('is-ready'); }
      if (inView && !document.hidden) requestAnimationFrame(frame); else running = false;
    }
    const start = () => { if (running || !inView || document.hidden) return; running = true; last = performance.now(); requestAnimationFrame(frame); };
    new IntersectionObserver(([e]) => { inView = e.isIntersecting; start(); }).observe(stage);
    document.addEventListener('visibilitychange', start);
    new MutationObserver(setTheme).observe(document.body, { attributes: true, attributeFilter: ['data-theme'] });

    mountShade(MODELS[state.model].key);
    setFinish(state.finish); stepFinish(1);
    setTheme();
    start();
    return { setModel, setFinish, setTheme };
  }
})();

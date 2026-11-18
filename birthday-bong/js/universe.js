import * as THREE from 'three';

export const U = {
  updates: new Set(), mouse: { x: 0, y: 0 }, boost: 0,
  reduced: matchMedia('(prefers-reduced-motion: reduce)').matches,
  camBase: new THREE.Vector3(0, 0, 30), look: new THREE.Vector3()
};
U.d = s => (U.reduced ? 0 : s);
U.tex = (w, h, draw) => {
  const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.userData = { url: c.toDataURL() }; return t;
};
U.dot = U.tex(128, 128, (x, w) => {
  const g = x.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2);
  g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(.3, 'rgba(255,255,255,.6)'); g.addColorStop(1, 'rgba(255,255,255,0)');
  x.fillStyle = g; x.fillRect(0, 0, w, w);
});
const ADD = THREE.AdditiveBlending;
U.sprite = (color, size, opacity = 1) => {
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: U.dot, color, transparent: true, opacity, blending: ADD, depthWrite: false, fog: false }));
  s.scale.set(size, size, 1); return s;
};

// Bùng nổ hạt sáng (hộp quà, nến, pháo hoa)
U.burst = (pos, n, color = 0xFFE7A3, speed = 8, life = 2.5) => {
  n = U.mobile ? Math.ceil(n / 2) : n;
  const p = new Float32Array(n * 3), v = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    p.set([pos.x, pos.y, pos.z], i * 3);
    const a = Math.random() * 6.283, b = Math.acos(2 * Math.random() - 1), s = speed * (.3 + Math.random());
    v.set([Math.sin(b) * Math.cos(a) * s, Math.cos(b) * s, Math.sin(b) * Math.sin(a) * s], i * 3);
  }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(p, 3));
  const m = new THREE.PointsMaterial({ color, size: .45, map: U.dot, transparent: true, depthWrite: false, blending: ADD });
  const pts = new THREE.Points(g, m); pts.frustumCulled = false; U.scene.add(pts);
  let t = 0;
  const f = dt => {
    t += dt; const k = 1 - dt * .9;
    for (let i = 0; i < n; i++) { v[i * 3 + 1] -= 2 * dt; for (let j = 0; j < 3; j++) { p[i * 3 + j] += v[i * 3 + j] * dt; v[i * 3 + j] *= k; } }
    g.attributes.position.needsUpdate = true; m.opacity = Math.max(0, 1 - t / life);
    if (t > life) { U.scene.remove(pts); g.dispose(); m.dispose(); U.updates.delete(f); }
  };
  U.updates.add(f);
};

export function initUniverse(canvas) {
  U.mobile = innerWidth < 700 || (navigator.hardwareConcurrency || 8) <= 4;
  const r = U.renderer = new THREE.WebGLRenderer({ canvas, antialias: !U.mobile });
  r.setPixelRatio(Math.min(devicePixelRatio || 1, U.mobile ? 1.5 : 2));
  const s = U.scene = new THREE.Scene(); s.background = new THREE.Color(0x080D25);
  const cam = U.camera = new THREE.PerspectiveCamera(60, 1, .1, 1200);
  U.amb = new THREE.AmbientLight(0xA99BEF, .9); s.add(U.amb);
  const sun = new THREE.DirectionalLight(0xffffff, 1.6); sun.position.set(10, 15, 20); s.add(sun);

  // Sao nhấp nháy (2 lớp lệch pha)
  const PAL = [0xffffff, 0xA99BEF, 0xF4CDE5, 0xFFE7A3].map(c => new THREE.Color(c));
  const layer = (n, size) => {
    const p = new Float32Array(n * 3), c = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const R = 80 + Math.random() * 320, a = Math.random() * 6.283, b = Math.acos(2 * Math.random() - 1);
      p.set([R * Math.sin(b) * Math.cos(a), R * Math.cos(b), R * Math.sin(b) * Math.sin(a)], i * 3);
      PAL[Math.random() * 4 | 0].toArray(c, i * 3);
    }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(p, 3)); g.setAttribute('color', new THREE.BufferAttribute(c, 3));
    const pts = new THREE.Points(g, new THREE.PointsMaterial({ size, map: U.dot, vertexColors: true, transparent: true, depthWrite: false, blending: ADD }));
    pts.userData.size = size; pts.frustumCulled = false; s.add(pts); return pts;
  };
  const nS = U.mobile ? 700 : 1800, A = layer(nS, 1.8), B = layer(nS, 1.2);

  // Dải ngân hà xoắn ốc
  const gn = U.mobile ? 2500 : 7000, gp = new Float32Array(gn * 3), gc = new Float32Array(gn * 3), c1 = new THREE.Color(0xF4CDE5), c2 = new THREE.Color(0xA99BEF), tc = new THREE.Color();
  for (let i = 0; i < gn; i++) {
    const rr = Math.pow(Math.random(), 1.5) * 130, a = rr * .07 + (i % 3) * 2.094 + (Math.random() - .5) * .6;
    gp.set([Math.cos(a) * rr, (Math.random() - .5) * 6 * (1 - rr / 150), Math.sin(a) * rr], i * 3);
    tc.copy(c1).lerp(c2, rr / 130).toArray(gc, i * 3);
  }
  const gg = new THREE.BufferGeometry(); gg.setAttribute('position', new THREE.BufferAttribute(gp, 3)); gg.setAttribute('color', new THREE.BufferAttribute(gc, 3));
  const galaxy = new THREE.Points(gg, new THREE.PointsMaterial({ size: 1.3, map: U.dot, vertexColors: true, transparent: true, opacity: .75, depthWrite: false, blending: ADD }));
  galaxy.position.set(0, -25, -170); galaxy.rotation.x = .9; galaxy.frustumCulled = false; s.add(galaxy);

  // Tinh vân
  [[0xA99BEF, -120, 40, -300], [0xF4CDE5, 150, -30, -320], [0x4a3fa0, 0, 90, -350]].forEach(([c, x, y, z]) => { const n = U.sprite(c, 340, .22); n.position.set(x, y, z); s.add(n); });

  // Bụi vũ trụ quanh người xem
  const dn = U.mobile ? 150 : 400, dp = new Float32Array(dn * 3);
  for (let i = 0; i < dn * 3; i++) dp[i] = (Math.random() - .5) * 80;
  const dg = new THREE.BufferGeometry(); dg.setAttribute('position', new THREE.BufferAttribute(dp, 3));
  const dust = new THREE.Points(dg, new THREE.PointsMaterial({ size: .35, map: U.dot, color: 0xFFE7A3, transparent: true, opacity: .5, depthWrite: false, blending: ADD }));
  dust.frustumCulled = false; s.add(dust);

  // Hành tinh trung tâm + mặt trăng
  const pg = U.planetGroup = new THREE.Group();
  const planet = new THREE.Mesh(new THREE.SphereGeometry(6, 48, 48), new THREE.MeshStandardMaterial({ color: 0xA99BEF, roughness: .7, emissive: 0x21164A, emissiveIntensity: .6 }));
  const ring = new THREE.Mesh(new THREE.RingGeometry(8.5, 11, 96), new THREE.MeshBasicMaterial({ color: 0xFFE7A3, transparent: true, opacity: .35, side: THREE.DoubleSide })); ring.rotation.x = 1.2;
  const glow = U.sprite(0xF4CDE5, 26, .55);
  pg.add(planet, ring, glow);
  const moons = [[13, .9, 0xF4CDE5, .5], [18, 1.3, 0xFFE7A3, .33], [23, 1.1, 0x7a6ee0, .22]].map(([d, rad, c, sp], i) => {
    const piv = new THREE.Group(), m = new THREE.Mesh(new THREE.SphereGeometry(rad, 24, 24), new THREE.MeshStandardMaterial({ color: c, roughness: .6, emissive: c, emissiveIntensity: .25 }));
    m.position.x = d; piv.add(m); piv.rotation.y = i * 2; piv.userData.sp = sp; pg.add(piv); return piv;
  });
  s.add(pg);

  const rs = () => { const w = innerWidth, h = innerHeight; r.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); U.portrait = h > w; };
  addEventListener('resize', rs); rs();
  addEventListener('pointermove', e => { U.mouse.x = (e.clientX / innerWidth - .5) * 2; U.mouse.y = -(e.clientY / innerHeight - .5) * 2; });

  const clock = new THREE.Clock();
  r.setAnimationLoop(() => {
    const dt = Math.min(clock.getDelta(), .05), t = clock.elapsedTime, mv = U.reduced ? 0 : 1;
    A.material.opacity = .65 + .35 * Math.sin(t * 1.7) * mv; B.material.opacity = .65 + .35 * Math.sin(t * 1.7 + 3) * mv;
    A.material.size = A.userData.size * (1 + U.boost); B.material.size = B.userData.size * (1 + U.boost);
    galaxy.rotation.z += dt * .01 * mv; A.rotation.y += dt * .004 * mv; B.rotation.y += dt * .004 * mv;
    planet.rotation.y += dt * .1 * mv; moons.forEach(m => { m.rotation.y += dt * m.userData.sp * mv; });
    const a = dust.geometry.attributes.position.array;
    for (let i = 1; i < dn * 3; i += 3) { a[i] += dt * .5 * mv; if (a[i] > 40) a[i] = -40; }
    dust.geometry.attributes.position.needsUpdate = true;
    U.updates.forEach(f => f(dt, t));
    cam.position.set(U.camBase.x + U.mouse.x * 1.5 * mv, U.camBase.y + U.mouse.y * mv, U.camBase.z);
    cam.lookAt(U.look); r.render(s, cam);
  });
}

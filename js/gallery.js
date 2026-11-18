import * as THREE from 'three';
import { CFG } from './config.js';
import { U } from './universe.js';
import { go } from './transitions.js';

const $ = id => document.getElementById(id);
const items = CFG.gallery.items, N = items.length;
const SPREAD = Math.min(5.5, .4 * (N - 1));
let G, pics = [], PH = [], hover = -1, drag = null, idx = 0;
const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();

function placeholder(i) {
  return U.tex(400, 500, (x, w, h) => {
    const g = x.createLinearGradient(0, 0, w, h); g.addColorStop(0, '#21164A'); g.addColorStop(1, '#A99BEF'); x.fillStyle = g; x.fillRect(0, 0, w, h);
    for (let k = 0; k < 40; k++) { x.fillStyle = `rgba(255,255,255,${Math.random()})`; x.fillRect(Math.random() * w, Math.random() * h, 2, 2); }
    x.fillStyle = '#FFE7A3'; x.textAlign = 'center'; x.font = '600 44px Georgia'; x.fillText('Ảnh ' + (i + 1), w / 2, h / 2);
    x.fillStyle = '#fff'; x.font = '22px sans-serif'; x.fillText('thay bằng ảnh thật', w / 2, h / 2 + 40);
  });
}
const fit = (f, aspect) => {
  const w = aspect > .8 ? 4 : 5 * aspect, h = aspect > .8 ? 4 / aspect : 5;
  f.userData.pic.scale.set(w, h, 1); f.userData.edge.scale.set(w + .35, h + .35, 1);
};

export function init() {
  G = new THREE.Group(); const loader = new THREE.TextureLoader();
  items.forEach((it, i) => {
    const f = new THREE.Group(), ph = placeholder(i); PH.push(ph.userData.url);
    const pic = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: ph, side: THREE.DoubleSide }));
    const edge = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ color: 0xA99BEF, transparent: true, opacity: .55, blending: THREE.AdditiveBlending, depthWrite: false }));
    edge.position.z = -.03; f.add(edge, pic); f.userData = { pic, edge, s: 1, i, y: Math.sin(i * 1.7) * .6 };
    fit(f, .8);
    const a = (i / (N - 1) - .5) * SPREAD;
    f.position.set(Math.sin(a) * 12, f.userData.y, -Math.cos(a) * 12); f.lookAt(0, 0, 0);
    G.add(f); pics.push(pic); pic.userData.f = f;
    loader.load(it.src, t => { t.colorSpace = THREE.SRGBColorSpace; pic.material.map = t; pic.material.needsUpdate = true; fit(f, t.image.width / t.image.height); }, undefined, () => {});
  });
  U.updates.add((dt, t) => {
    if (!G.parent) return;
    G.children.forEach((f, i) => {
      const u = f.userData, s = u.s + ((hover === i ? 1.12 : 1) - u.s) * Math.min(1, dt * 8); u.s = s; f.scale.setScalar(s);
      f.position.y = u.y + (U.reduced ? 0 : Math.sin(t * .8 + i) * .25);
    });
  });
  // lightbox
  const img = $('lb-img');
  const show = i => {
    idx = (i + N) % N; img.onerror = () => { img.onerror = null; img.src = PH[idx]; };
    img.src = items[idx].src; img.alt = items[idx].caption; $('lb-cap').textContent = items[idx].caption;
  };
  const close = () => $('lb').classList.remove('on');
  window.openLightbox = i => { show(i); $('lb').classList.add('on'); };
  $('lb-x').onclick = close; $('lb-p').onclick = () => show(idx - 1); $('lb-n').onclick = () => show(idx + 1);
  $('lb').addEventListener('click', e => { if (e.target.id === 'lb') close(); });
  addEventListener('keydown', e => {
    if (!$('lb').classList.contains('on')) return;
    if (e.key === 'Escape') close(); if (e.key === 'ArrowLeft') show(idx - 1); if (e.key === 'ArrowRight') show(idx + 1);
  });
  $('gal-next').onclick = () => go('cake');
}

const pick = e => {
  ndc.set(e.clientX / innerWidth * 2 - 1, -(e.clientY / innerHeight) * 2 + 1); ray.setFromCamera(ndc, U.camera);
  const h = ray.intersectObjects(pics)[0]; return h ? h.object.userData.f.userData.i : -1;
};
const down = e => { if (e.target === U.renderer.domElement) drag = { x: e.clientX, moved: 0 }; };
const move = e => {
  if (drag) { const dx = e.clientX - drag.x; drag.x = e.clientX; drag.moved += Math.abs(dx); G.rotation.y = THREE.MathUtils.clamp(G.rotation.y + dx * .004, -SPREAD / 2, SPREAD / 2); }
  else if (e.target === U.renderer.domElement) hover = pick(e);
};
const up = e => { if (drag && drag.moved < 6) { const h = pick(e); if (h >= 0) window.openLightbox(h); } drag = null; };

export function enter() {
  G.rotation.y = 0; hover = -1; U.scene.add(G);
  U.camBase.set(0, 0, U.portrait ? 7 : 1); U.look.set(0, 0, -12);
  addEventListener('pointerdown', down); addEventListener('pointermove', move); addEventListener('pointerup', up);
}
export function leave() {
  removeEventListener('pointerdown', down); removeEventListener('pointermove', move); removeEventListener('pointerup', up);
  U.scene.remove(G); $('lb').classList.remove('on');
}

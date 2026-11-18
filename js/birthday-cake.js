import * as THREE from 'three';
import { U } from './universe.js';
import { go } from './transitions.js';

const $ = id => document.getElementById(id);
const mat = (c, o = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: .5, ...o });
const gold = mat(0xFFE7A3, { metalness: .7, roughness: .3, emissive: 0x5a4510 });
let G, flames = [], light, wished = false, ang = 0;
const zoom = { r: 16, y: 6 };

const starShape = (R, r) => { const s = new THREE.Shape(); for (let i = 0; i < 10; i++) { const a = i * Math.PI / 5 + Math.PI / 2, k = i % 2 ? r : R, x = Math.cos(a) * k, y = Math.sin(a) * k; i ? s.lineTo(x, y) : s.moveTo(x, y); } s.closePath(); return s; };
const moonShape = () => { const s = new THREE.Shape(); s.absarc(0, 0, .45, Math.PI / 2, Math.PI * 1.5, false); s.quadraticCurveTo(.3, 0, 0, .45); return s; };
const flat = (shape, s) => { const m = new THREE.Mesh(new THREE.ExtrudeGeometry(shape, { depth: .08, bevelEnabled: false }), gold); m.scale.setScalar(s); return m; };

export function init() {
  G = new THREE.Group();
  const ped = new THREE.Mesh(new THREE.CylinderGeometry(6, 6.5, .8, 64), mat(0x21164A, { emissive: 0x21164A, emissiveIntensity: .5, metalness: .3 })); ped.position.y = -.4; G.add(ped);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(6.2, .08, 8, 96), new THREE.MeshBasicMaterial({ color: 0xA99BEF })); rim.rotation.x = Math.PI / 2; G.add(rim);
  const tiers = [[4.2, 1.5, 0xF4CDE5], [3.1, 1.4, 0xA99BEF], [2.1, 1.3, 0xF4CDE5]]; let y = 0;
  tiers.forEach(([r, h, c], t) => {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 48), mat(c)); m.position.y = y + h / 2; G.add(m);
    const fr = new THREE.Mesh(new THREE.TorusGeometry(r, .16, 12, 64), mat(0xffffff, { roughness: .3 })); fr.rotation.x = Math.PI / 2; fr.position.y = y + h; G.add(fr);
    const np = Math.round(r * 7);
    for (let i = 0; i < np; i++) { const a = i / np * 6.283, p = new THREE.Mesh(new THREE.SphereGeometry(.13, 12, 12), mat(i % 2 ? 0xffffff : 0xFFE7A3, { metalness: .5, roughness: .25 })); p.position.set(Math.sin(a) * (r + .03), y + .25, Math.cos(a) * (r + .03)); G.add(p); }
    const dec = t === 0 ? 4 : t === 1 ? 6 : 0;
    for (let i = 0; i < dec; i++) { const a = (i + .5) / dec * 6.283, d = flat(t === 0 ? moonShape() : starShape(.35, .15), t === 0 ? 1.3 : 1); d.position.set(Math.sin(a) * (r + .02), y + h / 2 + .1, Math.cos(a) * (r + .02)); d.rotation.y = a; G.add(d); }
    y += h;
  });
  for (let i = 0; i < 5; i++) {
    const a = i / 5 * 6.283, x = Math.sin(a) * 1, z = Math.cos(a) * 1;
    const c = new THREE.Mesh(new THREE.CylinderGeometry(.1, .1, 1, 12), mat(i % 2 ? 0xffffff : 0xF4CDE5)); c.position.set(x, y + .5, z); G.add(c);
    const f = U.sprite(0xFFB347, 1, 1); f.position.set(x, y + 1.25, z); f.userData = { k: 1, i }; flames.push(f); G.add(f);
  }
  light = new THREE.PointLight(0xFFB347, 25, 24); light.position.set(0, y + 1.8, 0); G.add(light);
  U.updates.add((dt, t) => {
    if (!G.parent) return;
    if (!U.reduced) ang += dt * .18;
    U.camBase.set(Math.sin(ang) * zoom.r, zoom.y, Math.cos(ang) * zoom.r);
    flames.forEach(f => { const k = f.userData.k, fl = U.reduced ? 1 : 1 + .12 * Math.sin(t * 14 + f.userData.i * 2) + .06 * Math.sin(t * 23 + f.userData.i); f.scale.set(.6 * fl * k, .95 * fl * k, 1); });
    if (!wished) light.intensity = 25 + (U.reduced ? 0 : Math.sin(t * 17) * 3);
  });
  $('wish').onclick = wish; $('cake-next').onclick = () => go('letter');
}

function wish() {
  if (wished) return; wished = true; $('wish').style.display = 'none';
  const tl = gsap.timeline();
  tl.to(U.amb, { intensity: .3, duration: U.d(1) });
  flames.forEach((f, i) => {
    tl.to(f.userData, { k: 0, duration: U.d(.25) }, '>' + (i ? '+.1' : '+.3'))
      .add(() => U.burst(new THREE.Vector3(f.position.x, f.position.y, f.position.z), 30, 0xFFE7A3, 3, 2), '<');
  });
  tl.to(light, { intensity: 0, duration: U.d(.4) }, '<')
    .add(() => { for (let i = 0; i < 6; i++) gsap.delayedCall(U.d(i * .45), () => U.burst(new THREE.Vector3((Math.random() - .5) * 34, 8 + Math.random() * 14, -22), 110, [0xFFE7A3, 0xF4CDE5, 0xA99BEF][i % 3], 12, 2.4)); })
    .to(zoom, { r: 9, y: 4.5, duration: U.d(2.5), ease: 'power2.inOut' }, '<')
    .to(U.amb, { intensity: .6, duration: U.d(1.5) }, '<1')
    .add(() => { const m = $('wish-msg'); m.classList.add('on'); gsap.fromTo(m.children, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: U.d(.9), stagger: U.d(.3) }); }, '+=.5');
}

export function enter() {
  wished = false; ang = 0; zoom.r = 16; zoom.y = 6; flames.forEach(f => { f.userData.k = 1; });
  light.intensity = 25; U.amb.intensity = .9; $('wish').style.display = ''; $('wish-msg').classList.remove('on');
  U.scene.add(G); U.look.set(0, 2.5, 0);
}
export function leave() { gsap.killTweensOf(zoom); U.amb.intensity = .9; U.scene.remove(G); }

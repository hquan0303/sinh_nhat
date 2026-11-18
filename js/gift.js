import * as THREE from 'three';
import { CFG } from './config.js';
import { U } from './universe.js';
import { go } from './transitions.js';

const $ = id => document.getElementById(id);
const mat = (c, o = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: .45, metalness: .1, ...o });
let G, lid, light, glow, beam, opened = false, timer;

export function init() {
  G = new THREE.Group();
  const gold = mat(0xFFE7A3, { metalness: .8, roughness: .3, emissive: 0x4a3a10 });
  const box = (w, h, d, m, x = 0, y = 0, z = 0) => { const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); b.position.set(x, y, z); return b; };
  G.add(box(4, 3, 4, mat(0xA99BEF)), box(.6, 3.02, 4.02, gold), box(4.02, 3.02, .6, gold));
  // nắp mở quanh bản lề phía sau
  lid = new THREE.Group(); lid.position.set(0, 1.5, -2.2);
  const top = box(4.4, .8, 4.4, mat(0xF4CDE5), 0, .4, 2.2);
  top.add(box(.6, .82, 4.42, gold), box(4.42, .82, .6, gold));
  [-1, 1].forEach(s => { const t = new THREE.Mesh(new THREE.TorusGeometry(.55, .16, 12, 32), gold); t.position.set(s * .6, .6, 0); t.rotation.z = s * -.5; top.add(t); });
  lid.add(top); G.add(lid);
  light = new THREE.PointLight(0xFFE7A3, 0, 40); light.position.set(0, 1, 0); G.add(light);
  glow = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 3.6), new THREE.MeshBasicMaterial({ color: 0xFFE7A3, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }));
  glow.rotation.x = -Math.PI / 2; glow.position.y = 1.49; G.add(glow);
  beam = new THREE.Mesh(new THREE.CylinderGeometry(2.8, 1.6, 9, 32, 1, true), new THREE.MeshBasicMaterial({ color: 0xFFE7A3, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
  beam.position.y = 6; G.add(beam);
  const n = U.mobile ? 40 : 90, p = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) { const R = 8 + Math.random() * 8, a = Math.random() * 6.283; p.set([Math.cos(a) * R, (Math.random() - .5) * 12, Math.sin(a) * R], i * 3); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(p, 3));
  G.add(new THREE.Points(g, new THREE.PointsMaterial({ color: 0xFFE7A3, size: .5, map: U.dot, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })));
  U.updates.add((dt, t) => { if (!G.parent) return; if (!U.reduced) { G.rotation.y += dt * .35; G.position.y = Math.sin(t) * .25; } });
  $('gift-open').onclick = open; $('gift-next').onclick = () => go('gallery');
}

function open() {
  if (opened) return; opened = true; $('gift-open').style.display = 'none';
  const tl = gsap.timeline();
  tl.to(G.rotation, { z: .07, duration: .06, repeat: U.reduced ? 0 : 9, yoyo: true }).to(G.rotation, { z: 0, duration: .05 })
    .to(lid.rotation, { x: -2.1, duration: U.d(1.2), ease: 'back.out(1.4)' })
    .to(light, { intensity: 90, duration: U.d(1) }, '<')
    .to(glow.material, { opacity: .9, duration: U.d(1) }, '<').to(beam.material, { opacity: .3, duration: U.d(1.2) }, '<')
    .add(() => {
      U.burst(new THREE.Vector3(0, 1.5, 0), 240, 0xFFE7A3, 11, 3);
      for (let i = 0; i < 12; i++) {
        const o = U.sprite([0xFFE7A3, 0xF4CDE5, 0xA99BEF][i % 3], 1.3); o.position.set(0, 1.6, 0); G.add(o);
        gsap.to(o.position, { x: (Math.random() - .5) * 8, y: 6 + Math.random() * 5, z: (Math.random() - .5) * 8, duration: U.d(2.5 + Math.random()), ease: 'power2.out' });
        gsap.to(o.material, { opacity: 0, duration: U.d(1.2), delay: U.d(2), onComplete: () => G.remove(o) });
      }
    }, '<.3')
    .add(() => {
      const m = $('gift-msg'); m.classList.add('on'); gsap.fromTo(m.children, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: U.d(.9), stagger: U.d(.25) });
      timer = gsap.delayedCall(CFG.timing.giftAutoNextSec, () => go('gallery'));
    }, '+=.6');
}

export function enter() {
  opened = false; lid.rotation.x = 0; G.rotation.set(0, 0, 0); light.intensity = 0; glow.material.opacity = 0; beam.material.opacity = 0;
  $('gift-open').style.display = ''; $('gift-msg').classList.remove('on');
  U.scene.add(G); U.camBase.set(0, 3, 14); U.look.set(0, 1, 0);
}
export function leave() { timer?.kill(); gsap.killTweensOf(G.rotation); U.scene.remove(G); }

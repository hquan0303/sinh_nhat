import * as THREE from 'three';
import { CFG } from './config.js';
import { U } from './universe.js';
import { go } from './transitions.js';

const $ = id => document.getElementById(id);
let door, busy = false, fails = 0, lockUntil = 0;

function build() {
  door = new THREE.Group();
  const t1 = new THREE.Mesh(new THREE.TorusGeometry(5, .1, 16, 96), new THREE.MeshBasicMaterial({ color: 0xFFE7A3, transparent: true, opacity: .9 }));
  const t2 = new THREE.Mesh(new THREE.TorusGeometry(4.2, .05, 12, 96), new THREE.MeshBasicMaterial({ color: 0xF4CDE5, transparent: true, opacity: .7 }));
  const disc = new THREE.Mesh(new THREE.CircleGeometry(4.9, 64), new THREE.MeshBasicMaterial({ color: 0xA99BEF, transparent: true, opacity: .18, blending: THREE.AdditiveBlending, depthWrite: false }));
  door.add(t1, t2, disc, U.sprite(0xA99BEF, 18, .5)); door.position.set(0, 0, 12);
  U.updates.add((dt, t) => { if (!U.reduced) { t1.rotation.z += dt * .3; t2.rotation.z -= dt * .5; door.rotation.x = Math.sin(t * .6) * .12; } });
}

export function init() {
  build();
  const inp = $('pw'), msg = $('pw-msg');
  inp.addEventListener('input', () => {
    const d = inp.value.replace(/\D/g, '').slice(0, 8);
    inp.value = d.length > 4 ? `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4)}` : d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
  });
  $('pw-eye').onclick = () => { inp.type = inp.type === 'password' ? 'text' : 'password'; };
  $('pw-form').addEventListener('submit', e => {
    e.preventDefault();
    const now = Date.now();
    if (busy) return;
    if (now < lockUntil) { msg.textContent = `Đợi ${Math.ceil((lockUntil - now) / 1000)} giây rồi thử lại nha.`; return; }
    if (inp.value === CFG.password.birthday) return ok();
    fails++; lockUntil = now + CFG.password.cooldownMs; msg.textContent = CFG.password.wrongMsg;
    if (fails >= CFG.password.maxTries) { fails = 0; lockUntil = now + CFG.password.lockoutMs; msg.textContent = `Sai nhiều quá rồi, chờ ${CFG.password.lockoutMs / 1000} giây nhé.`; }
    inp.classList.remove('shake'); void inp.offsetWidth; inp.classList.add('shake'); inp.select();
  });
}

function ok() {
  busy = true; $('pw').classList.add('glow'); $('pw-msg').textContent = '';
  gsap.to(U, { boost: 2.5, duration: U.d(1) });
  gsap.to(door.scale, { x: 2.4, y: 2.4, z: 2.4, duration: U.d(1.8), ease: 'power2.in' });
  U.burst(new THREE.Vector3(0, 0, 12), 140, 0xFFE7A3, 12);
  gsap.to(U.camBase, { z: 12, duration: U.d(2), delay: U.d(.6), ease: 'power3.in' });
  gsap.delayedCall(U.d(2.5), () => go('welcome'));
}

export function enter() {
  busy = false; fails = 0; lockUntil = 0;
  const inp = $('pw'); inp.value = ''; inp.classList.remove('glow'); inp.type = 'password'; $('pw-msg').textContent = '';
  door.scale.set(1, 1, 1); U.scene.add(door);
  const p = U.planetGroup; p.visible = true; p.position.set(0, 0, 0); p.scale.setScalar(1);
  U.camBase.set(0, 0, 30); U.look.set(0, 0, 0); U.boost = 0;
}
export function leave() { U.scene.remove(door); }

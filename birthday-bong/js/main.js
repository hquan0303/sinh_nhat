import * as THREE from 'three';
import { U, initUniverse } from './universe.js';
import { register, go } from './transitions.js';
import * as music from './music.js';
import * as password from './password.js';
import * as gift from './gift.js';
import * as gallery from './gallery.js';
import * as cake from './birthday-cake.js';
import * as letter from './letter.js';

const $ = id => document.getElementById(id);

try { initUniverse($('c')); }
catch (e) { $('loader').innerHTML = '<p>Trình duyệt này chưa hỗ trợ WebGL 😢</p>'; throw e; }

const welcome = {
  enter() {
    const p = U.planetGroup; p.visible = true; p.position.set(0, 0, 0); p.scale.setScalar(1);
    U.camBase.set(0, 8, 52); U.look.set(0, 0, 0);
    gsap.to(U, { boost: 0, duration: U.d(1.5) });
    gsap.to(U.camBase, { y: 3, z: 34, duration: U.d(8), ease: 'power2.out' });
  },
  leave() { gsap.killTweensOf(U.camBase); }
};
let fw;
const finale = {
  enter() {
    const p = U.planetGroup; p.visible = true; p.position.set(0, -2, 0); p.scale.setScalar(1.5);
    U.camBase.set(0, 2, 44); U.look.set(0, 0, 0); gsap.to(U.camBase, { z: 34, duration: U.d(4), ease: 'power2.out' }); gsap.to(U, { boost: 1, duration: U.d(2) });
    const loop = () => {
      U.burst(new THREE.Vector3((Math.random() - .5) * 50, 8 + Math.random() * 14, -25), 90, [0xFFE7A3, 0xF4CDE5, 0xA99BEF][Math.random() * 3 | 0], 10, 2.2);
      fw = gsap.delayedCall(U.reduced ? 3 : 1.3, loop);
    };
    loop();
  },
  leave() { fw?.kill(); gsap.killTweensOf(U.camBase); }
};

[['password', password], ['gift', gift], ['gallery', gallery], ['cake', cake], ['letter', letter]].forEach(([k, m]) => { m.init(); register(k, m); });
register('welcome', welcome); register('finale', finale);
$('welcome-go').onclick = () => go('gift');
$('replay').onclick = () => go('password');

// Nhạc & nút hiệu ứng
music.init();
addEventListener('pointerdown', music.start, { once: true });
const mb = $('motion-btn');
const setMotion = r => { U.reduced = r; document.body.classList.toggle('reduced', r); mb.textContent = 'Hiệu ứng: ' + (r ? 'Tắt' : 'Bật'); mb.setAttribute('aria-pressed', !r); };
mb.onclick = () => setMotion(!U.reduced); setMotion(U.reduced);

// Màn hình tải
Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 3000))]).then(() => {
  go('password', { flash: false });
  gsap.to('#loader', { opacity: 0, duration: .8, onComplete: () => $('loader').remove() });
});

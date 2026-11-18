import { CFG } from './config.js';
import { U } from './universe.js';
import { go } from './transitions.js';

const $ = id => document.getElementById(id);
let raf = 0, timers = [];

function done() { raf = 0; $('letter-text').classList.remove('typing'); $('letter-next').classList.add('on'); }
function type() {
  const out = $('letter-text'), txt = CFG.letter, total = Math.min(txt.length * 45, CFG.timing.letterMaxSec * 1000), t0 = performance.now();
  out.classList.add('typing');
  const step = now => {
    const k = U.reduced ? 1 : Math.min(1, (now - t0) / total);
    out.textContent = txt.slice(0, Math.ceil(k * txt.length)); $('paper').scrollTop = $('paper').scrollHeight;
    if (k < 1) raf = requestAnimationFrame(step); else done();
  };
  raf = requestAnimationFrame(step);
}
function openEnv() {
  $('letter-hint').textContent = 'Chạm vào thư để hiện hết nhanh ✦';
  $('env').classList.add('open');
  U.burst({ x: 0, y: 0, z: 10 }, 60, 0xFFE7A3, 5, 2);
  timers.push(setTimeout(() => $('paper').classList.add('show'), U.reduced ? 0 : 600));
  timers.push(setTimeout(type, U.reduced ? 0 : 1600));
}
export function init() {
  $('seal').onclick = openEnv;
  $('paper').onclick = () => { if (raf) { cancelAnimationFrame(raf); $('letter-text').textContent = CFG.letter; done(); } };
  $('letter-next').onclick = () => go('finale');
}
export function enter() {
  $('env').classList.remove('open'); $('paper').classList.remove('show'); $('letter-text').textContent = ''; $('letter-text').classList.remove('typing');
  $('letter-next').classList.remove('on'); $('letter-hint').textContent = 'Chạm vào dấu niêm phong ✦';
  const p = U.planetGroup; p.visible = true; p.position.set(-34, 14, -60); p.scale.setScalar(1);
  U.camBase.set(0, 0, 14); U.look.set(0, 0, 0);
}
export function leave() { cancelAnimationFrame(raf); raf = 0; timers.forEach(clearTimeout); timers = []; }

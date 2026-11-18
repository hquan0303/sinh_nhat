import { CFG } from './config.js';

const $ = id => document.getElementById(id);
let a, i = 0, on = false, started = false;
const ui = () => { $('music-btn').textContent = on ? '♫' : '♪'; $('music-btn').setAttribute('aria-pressed', on); };
const note = t => { $('music-note').textContent = t || ''; };
const fade = (v, d, cb) => gsap.to(a, { volume: v, duration: d, overwrite: true, onComplete: cb });

export function init() {
  a = new Audio(); a.loop = true; a.preload = 'none'; a.volume = 0; a.src = CFG.music.tracks[0];   // chỉ 1 thẻ audio -> không bao giờ phát chồng
  a.addEventListener('error', () => {
    if (++i < CFG.music.tracks.length) { a.src = CFG.music.tracks[i]; if (on) a.play().catch(() => {}); }
    else { on = false; ui(); note('Chưa có file nhạc trong assets/music/'); }
  });
  $('vol').value = CFG.music.volume;
  $('music-btn').onclick = () => (on ? pause() : play());
  $('vol').oninput = e => { CFG.music.volume = +e.target.value; if (on) a.volume = CFG.music.volume; };
}
function play() {
  on = true; ui();
  a.play().then(() => { note(''); fade(CFG.music.volume, 1.5); }).catch(e => { if (e.name === 'NotAllowedError') { on = false; ui(); } });
}
function pause() { on = false; ui(); fade(0, .8, () => a.pause()); }
export function start() { if (started) return; started = true; play(); }   // gọi sau lần tương tác đầu tiên

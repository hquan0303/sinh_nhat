import { U } from './universe.js';

const S = {}; let cur = null, busy = false;
export const register = (n, m) => { S[n] = m; };

export function go(n, { flash = true } = {}) {
  if (busy || n === cur) return;
  busy = true;
  const f = document.getElementById('flash');
  const sw = () => {
    if (cur) { S[cur].leave?.(); document.getElementById('s-' + cur).classList.remove('on'); }
    cur = n; U.planetGroup.visible = false;
    const el = document.getElementById('s-' + n); el.classList.add('on'); S[n].enter();
    gsap.fromTo(el.querySelectorAll('.stack > *'), { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: U.d(.9), stagger: U.d(.18), clearProps: 'transform' });
  };
  if (!flash) { sw(); busy = false; return; }
  gsap.timeline({ onComplete: () => { busy = false; } })
    .to(f, { opacity: 1, duration: U.d(.6) }).add(sw).to(f, { opacity: 0, duration: U.d(.8) });
}

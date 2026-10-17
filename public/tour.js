/* Scroll tutorial engine. A page passes:
     W, H        size of its recreated plug-in UI (#ui), in UI pixels
     beats       [{id, rail, scene, focus, cam, camPort, pad, padPort, len, lenPort, apply(state, a)}]
     base()      a fresh UI state
     render(st)  draws a state into #ui
   Scroll position picks the beat; within a beat the camera eases in over
   the first part, then apply() animates from a=0 to a=1. States build up:
   every earlier beat is applied at a=1 first. */
(function () {
  const D = document.documentElement;
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const ease = t => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const CAM_IN = .26, ANIM_A = .24, ANIM_B = .84, REST = .88;

  window.Tour = function (cfg) {
    const PORT = D.classList.contains('is-port');
    const STATIC = D.classList.contains('static');
    const { W, H, beats, base, render } = cfg;
    const stage = document.getElementById('stage');
    const scroller = document.getElementById('scroller');
    const box = document.getElementById('uibox');
    const ui = document.getElementById('ui');
    const bar = document.querySelector('.pbar');
    const cards = {}; document.querySelectorAll('.beat').forEach(c => (cards[c.dataset.beat] = c));
    const scenes = {}; document.querySelectorAll('.scene').forEach(s => (scenes[s.id] = s));
    ui.style.width = W + 'px'; ui.style.height = H + 'px';
    box.style.setProperty('--ar', W + '/' + H);

    // spotlight + cursor live in UI coordinates
    const NS = 'http://www.w3.org/2000/svg';
    const spot = document.createElementNS(NS, 'svg');
    spot.id = 'spot'; spot.setAttribute('width', W); spot.setAttribute('height', H); spot.setAttribute('viewBox', `0 0 ${W} ${H}`);
    spot.innerHTML = `<defs><mask id="spotmask"><rect x="-4000" y="-4000" width="${W + 8000}" height="${H + 8000}" fill="#fff"/><g id="holes"></g></mask></defs>
      <rect class="dim" x="-4000" y="-4000" width="${W + 8000}" height="${H + 8000}" fill="${cfg.dim || 'rgba(0,0,0,.58)'}" mask="url(#spotmask)"/><g id="rings"></g>`;
    ui.appendChild(spot);
    const holes = spot.querySelector('#holes'), rings = spot.querySelector('#rings'), dimRect = spot.querySelector('.dim');
    const cursor = document.createElement('div');
    cursor.id = 'cursor';
    cursor.innerHTML = `<svg width="60" height="60" viewBox="0 0 60 60" style="overflow:visible">
      <circle class="rip" cx="6" cy="4" r="16" fill="none" stroke="${cfg.ring || '#fff'}" stroke-width="3"/>
      <path class="arrow" d="M4 2 L4 34 L12 26 L18 40 L24 37 L18 24 L30 24 Z" fill="#fff" stroke="#000" stroke-width="2.5" stroke-linejoin="round"/>
      <g class="wheel"><rect x="0" y="0" width="26" height="40" rx="13" fill="#fff" stroke="#000" stroke-width="2.5"/><rect x="10" y="7" width="6" height="12" rx="3" fill="#000"/><path d="M13 -10 l-6 6 h12z M13 50 l-6 -6 h12z" fill="#fff" stroke="#000" stroke-width="2"/></g>
      <g class="hand"><path d="M8 4 v24 l-5-5 q-4 0 -2 5 l10 13 h16 l4-14 v-10 q0-4-4-4 q-2 0-3 2 q0-4-4-4 q-2 0-3 2 q0-4-4-4 q-2 0-2 2 v-7 q0-4-4-4 q-3 0-3 4z" fill="#fff" stroke="#000" stroke-width="2.4" stroke-linejoin="round"/></g>
    </svg>`;
    ui.appendChild(cursor);

    // timing
    const lens = beats.map(b => (PORT ? b.lenPort : b.len) || b.len || 1);
    const starts = []; let total = 0; lens.forEach(l => { starts.push(total); total += l; });
    const VH = PORT ? (cfg.vhPort || 90) : (cfg.vh || 100);
    scroller.style.height = `calc(${(total * VH).toFixed(1)}${PORT ? 'svh' : 'vh'} + 100${PORT ? 'svh' : 'vh'})`;

    // rail (desktop)
    const rail = document.getElementById('rail');
    const railBtns = [];
    if (rail) beats.forEach((b, i) => {
      if (!b.rail) return;
      const btn = document.createElement('button');
      btn.innerHTML = `<span>${b.rail}</span><i></i>`;
      btn.addEventListener('click', () => goTo(i, REST, true));
      rail.appendChild(btn); railBtns.push([i, btn]);
    });
    document.querySelectorAll('[data-goto]').forEach(a => a.addEventListener('click', e => {
      const i = beats.findIndex(b => b.id === a.dataset.goto); if (i < 0) return; e.preventDefault(); goTo(i, REST, true);
    }));

    function camOf(b) {
      const r = (PORT && b.camPort) || b.cam || (PORT && b.focusPort) || b.focus || [0, 0, W, H];
      const pad = (PORT ? b.padPort : b.pad) ?? (PORT ? 10 : 24);
      const bw = box.clientWidth, bh = box.clientHeight;
      const cap = PORT ? (cfg.maxZoomPort || 2.2) : (cfg.maxZoom || 2);
      const s = Math.min(bw / (r[2] + pad * 2), bh / (r[3] + pad * 2), cap);
      return { s, cx: r[0] + r[2] / 2, cy: r[1] + r[3] / 2 };
    }
    const norm = f => !f ? null : (typeof f[0] === 'number' ? [f] : f);
    const focusOf = (b, st) => norm(st.focus || (PORT && b.focusPort) || b.focus || null);

    function scrollRange() { return scroller.offsetHeight - window.innerHeight; }
    function progress() { return clamp((window.scrollY - scroller.offsetTop) / Math.max(1, scrollRange())) * total; }
    function locate(p) {
      let i = 0; while (i < beats.length - 1 && starts[i + 1] <= p) i++;
      return { i, f: clamp((p - starts[i]) / lens[i]) };
    }
    function goTo(i, f = REST, smooth = false) {
      const p = starts[i] + lens[i] * f;
      const y = scroller.offsetTop + (p / total) * scrollRange();
      window.scrollTo({ top: y, behavior: smooth ? 'smooth' : 'auto' });
    }

    function stateAt(i, a) {
      const st = base();
      for (let j = 0; j < i; j++) if (beats[j].apply) beats[j].apply(st, 1, true);
      st.focus = null;
      if (beats[i] && beats[i].apply) beats[i].apply(st, a, false);
      return st;
    }

    let last = -1, lastRects = null;
    function drawRects(rs, on) {
      holes.innerHTML = ''; rings.innerHTML = '';
      dimRect.style.opacity = on ? 1 : 0;
      if (!rs) return;
      for (const r of rs) {
        const [x, y, w, h, rad = 10] = r;
        holes.insertAdjacentHTML('beforeend', `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rad}" fill="#000"/>`);
        rings.insertAdjacentHTML('beforeend', `<rect x="${x - 3}" y="${y - 3}" width="${w + 6}" height="${h + 6}" rx="${rad + 3}" fill="none" stroke="${cfg.ring || '#fff'}" stroke-width="${cfg.ringW || 3}" class="ring"/>`);
      }
    }
    const lerpRects = (A, B, t) => (!A || !B || A.length !== B.length) ? (t < .5 ? A : B) : A.map((r, k) => r.map((v, n) => lerp(v, B[k][n] ?? v, t)));

    function frame(now) {
      const p = STATIC ? 0 : progress();
      const { i, f } = STATIC ? { i: beats.length - 1, f: 1 } : locate(p);
      const b = beats[i];
      const a = STATIC ? 1 : clamp((f - ANIM_A) / (ANIM_B - ANIM_A));
      const st = STATIC ? stateAt(beats.length, 1) : stateAt(i, a);
      st.now = now;
      // camera
      const t = i === 0 || STATIC ? 1 : ease(clamp(f / CAM_IN));
      const c1 = STATIC ? { s: box.clientWidth / W, cx: W / 2, cy: H / 2 } : camOf(b);
      const c0 = i > 0 ? camOf(beats[i - 1]) : c1;
      const s = Math.exp(lerp(Math.log(c0.s), Math.log(c1.s), t));
      const cx = lerp(c0.cx, c1.cx, t), cy = lerp(c0.cy, c1.cy, t);
      const bw = box.clientWidth, bh = box.clientHeight;
      ui.style.transform = STATIC ? `scale(${bw / W})` : `translate(${(bw / 2 - cx * s).toFixed(2)}px,${(bh / 2 - cy * s).toFixed(2)}px) scale(${s.toFixed(4)})`;
      // spotlight
      if (!STATIC) {
        const r1 = focusOf(b, st), r0 = i > 0 ? (focusOf(beats[i - 1], stateAt(i - 1, 1)) ) : r1;
        const rs = (st.focus ? r1 : lerpRects(r0, r1, t));
        drawRects(rs, !!r1 && !b.scene);
      }
      // cursor
      const cu = st.cur;
      if (cu && !STATIC) {
        cursor.className = 'on' + (cu.down ? ' down' : '') + (cu.wheel ? ' wheel' : '') + (cu.drag ? ' drag' : '');
        const k = (PORT ? 1.15 : 1.25) / Math.max(.5, s);
        cursor.style.transform = `translate(${cu.x}px,${cu.y}px) scale(${k.toFixed(3)})`;
      } else cursor.className = '';
      render(st);
      // copy + scenes
      if (i !== last) {
        Object.values(cards).forEach(c => c.classList.toggle('on', c.dataset.beat === b.id));
        Object.values(scenes).forEach(s => s.classList.toggle('on', s.id === b.scene));
        stage.classList.toggle('scene-on', !!b.scene);
        railBtns.forEach(([k, btn]) => btn.classList.toggle('on', k === i));
        D.dataset.beat = b.id;
        last = i;
      }
      if (bar) bar.style.transform = `scaleX(${(p / total).toFixed(4)})`;
      if (!STATIC) requestAnimationFrame(frame);
    }

    // soft snap: when scrolling settles, glide to the nearest beat's rest point
    let snapT = 0, lastY = window.scrollY, dir = 1, snapping = false;
    const SNAP = !STATIC && !/nosnap/.test(location.search) && cfg.snap !== false;
    window.addEventListener('scroll', () => {
      const y = window.scrollY; if (y !== lastY) dir = y > lastY ? 1 : -1; lastY = y;
      if (!SNAP || api.snapOff) return;
      clearTimeout(snapT);
      snapT = setTimeout(() => {
        const p = progress(); if (p <= 0 || p >= total) return;
        const { i, f } = locate(p);
        let target = i;
        if (dir > 0 && f > .96 && i < beats.length - 1) target = i + 1;
        if (dir < 0 && f < .45 && i > 0) target = i - 1;
        const tp = starts[target] + lens[target] * REST;
        const y2 = scroller.offsetTop + (tp / total) * scrollRange();
        if (Math.abs(y2 - window.scrollY) > 6) window.scrollTo({ top: y2, behavior: 'smooth' });
      }, cfg.snapDelay || 240);
    }, { passive: true });

    // keyboard: arrows / page keys step through beats
    window.addEventListener('keydown', e => {
      if (STATIC || e.target.closest('input,textarea')) return;
      const nextKeys = ['ArrowDown', 'PageDown', 'ArrowRight'], prevKeys = ['ArrowUp', 'PageUp', 'ArrowLeft'];
      if (!nextKeys.includes(e.key) && !prevKeys.includes(e.key)) return;
      const { i } = locate(progress());
      const j = clamp(i + (nextKeys.includes(e.key) ? 1 : -1), 0, beats.length - 1);
      if (j === i) return; e.preventDefault(); goTo(j, REST, true);
    });

    const api = window.__tour = {
      mode: () => (STATIC ? 'static' : PORT ? 'portrait' : 'desktop'),
      count: beats.length, ids: beats.map(b => b.id), goTo, snapOff: false,
      rangePx: () => scrollRange(), top: () => scroller.offsetTop, starts, lens, total, REST
    };
    // portrait: a card must never clip its copy. Shrink its contents until it fits,
    // and as a last resort let it scroll on its own.
    function fitCards() {
      if (!PORT || STATIC) return;
      D.style.setProperty('--uih', innerHeight < 720 ? '42svh' : '48svh');
      document.querySelectorAll('.beat .card').forEach(card => {
        const kids = [...card.children];
        kids.forEach(k => (k.style.zoom = ''));
        card.style.overflowY = '';
        let z = 1;
        while (card.scrollHeight - card.clientHeight > 1 && z > .74) {
          z = +(z - .03).toFixed(2); kids.forEach(k => (k.style.zoom = z));
        }
        if (card.scrollHeight - card.clientHeight > 1) card.style.overflowY = 'auto';
      });
    }
    fitCards();
    if (document.fonts) document.fonts.ready.then(fitCards);
    let fitT; window.addEventListener('resize', () => { clearTimeout(fitT); fitT = setTimeout(fitCards, 150); });
    api.fitCards = fitCards;
    if (STATIC) { frame(0); window.addEventListener('resize', () => frame(0)); }
    else requestAnimationFrame(frame);
  };
})();

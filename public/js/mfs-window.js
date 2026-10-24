/* MIDI Fart Sniffer's window, rebuilt in HTML from the plug-in's own layout
   (midi-fart-sniffer/src/editor.rs and theme.rs: the same coordinates,
   colours, stickers and lettering), as it looks inside a DAW.

     const win = MfsWindow(container, { sid: '/assets/sniffin-sid.webp' });
     win.update(state);   // see BASE for the fields
     win.tick(seconds);   // flies, starburst; call every frame for motion
     win.rect('card');    // [x, y, w, h] in UI pixels, for cameras and spotlights

   It renders into a shadow root, so page styles can't reach it. Styles
   live in /mfs-window.css (or pass { cssText } to inline them). The /midi-fart-sniffer tour and the
   homepage teaser (teasers/midi-fart-sniffer) both build from this, so the
   two can't drift apart. The grooves are original patterns, not anyone's
   library. */
(function (global) {
  const W = 1180, H = 760;
  const INK = '#1A1220', PAPER = '#FFF6DC', PAPER_D = '#E8D5A4', SLIME = '#8FDC2C', SLIME_D = '#4A8C10', SLIME_L = '#D4F772';
  const PUKE = '#F7D21E', GUM = '#FF5CA8', RED = '#E82D2D', BLUE = '#2472D8', GRAPE = '#7C40C6', ORANGE = '#FF8A1D';
  const BORDERS = [RED, BLUE, PUKE, GRAPE, GUM, ORANGE, SLIME];
  const BACKDROPS = ['#FFE87C', '#BDE7FF', '#FFCDE3', '#DBF8A8', '#FFD6AE', '#E4D4FF'];

  // General MIDI drums, as groove.rs names and orders them.
  const NAMES = { 35: 'KICK 2', 36: 'KICK', 37: 'SIDESTICK', 38: 'SNARE', 39: 'CLAP', 40: 'SNARE 2', 41: 'FLOOR TOM 2', 42: 'HAT SHUT', 43: 'FLOOR TOM', 44: 'HAT PEDAL',
    45: 'LOW TOM', 46: 'HAT OPEN', 47: 'MID TOM', 48: 'HI-MID TOM', 49: 'CRASH', 50: 'HIGH TOM', 51: 'RIDE', 52: 'CHINA', 53: 'RIDE BELL', 54: 'TAMBOURINE', 55: 'SPLASH', 56: 'COWBELL', 57: 'CRASH 2', 59: 'RIDE 2' };
  const family = n => n === 35 || n === 36 ? RED : n >= 37 && n <= 40 ? ORANGE : [42, 44, 46].includes(n) ? PUKE : [41, 43, 45, 47, 48, 50].includes(n) ? GUM : [49, 51, 52, 53, 55, 57, 59].includes(n) ? BLUE : GRAPE;
  const rank = n => [57, 49, 55, 52].includes(n) ? 0 : [51, 59, 53].includes(n) ? 1 : n === 46 ? 2 : n === 42 ? 3 : n === 44 ? 4 : [50, 48, 47, 45, 43, 41].includes(n) ? 5 : n === 37 || n === 39 ? 7 : n === 38 || n === 40 ? 8 : n === 35 || n === 36 ? 9 : 6;

  // Original grooves: { note: [[beat, velocity], ...] }.
  const steps = (from, to, step, vel) => { const out = []; for (let b = from; b < to - 1e-9; b += step) out.push([+b.toFixed(4), typeof vel === 'function' ? vel(b) : vel]); return out; };
  const at = (beats, vel) => beats.map(b => [b, vel]);
  const GROOVES = [
    { file: 'dumpster-punk-174.mid', bpm: 174, sig: [4, 4], bars: 2, border: GRAPE, backdrop: '#FFCDE3', notes: {
      49: at([0], 118), 42: steps(.5, 8, .5, b => (b % 1 ? 70 : 98)), 46: at([7.5], 90), 38: at([1, 3, 5, 7], 112), 36: at([0, 2, 2.5, 4, 6, 6.5], 110) } },
    { file: 'stank-funk-96.mid', bpm: 96, sig: [4, 4], bars: 2, border: BLUE, backdrop: '#FFE87C', notes: {
      42: steps(0, 8, .25, b => (b % .5 ? 52 : 92)).filter(h => h[0] % 4 !== 3.5), 46: at([3.5, 7.5], 96), 38: [...at([1, 3, 5, 7], 116), ...at([1.75, 3.25, 5.75, 7.25], 38)], 36: at([0, .75, 2.5, 4, 4.75, 6.25, 6.5], 108) } },
    { file: 'sewer-shuffle-112.mid', bpm: 112, sig: [4, 4], bars: 2, border: ORANGE, backdrop: '#BDE7FF', notes: {
      51: [...steps(0, 8, 1, 100), ...steps(2 / 3, 8, 1, 64)], 53: at([0, 4], 110), 44: at([1, 3, 5, 7], 80), 38: at([1, 3, 5, 7], 110), 36: at([0, 5 / 3, 2, 4, 17 / 3, 6], 104) } },
    { file: 'toilet-tom-fill-140.mid', bpm: 140, sig: [4, 4], bars: 1, border: RED, backdrop: '#DBF8A8', notes: {
      50: steps(0, 1, .25, 104), 48: steps(1, 2, .25, 108), 45: steps(2, 3, .25, 112), 43: steps(3, 3.75, .25, 118), 38: at([3.75], 124), 36: at([0, 1, 2, 3], 100) } },
    { file: 'garbage-day-blast-200.mid', bpm: 200, sig: [4, 4], bars: 1, border: SLIME, backdrop: '#E4D4FF', notes: {
      52: at([0], 120), 51: steps(.5, 4, .5, 96), 38: steps(.25, 4, .5, 100), 36: steps(0, 4, .5, 112) } },
    { file: 'stinky-pinky-6-8-120.mid', bpm: 120, sig: [6, 8], bars: 2, border: GUM, backdrop: '#FFD6AE', notes: {
      49: at([0], 112), 42: steps(.5, 6, .5, b => (b % 1.5 ? 66 : 96)), 38: at([1.5, 4.5], 112), 36: at([0, 2.5, 3], 106) } },
  ].map(g => {
    const len = g.bars * g.sig[0] * 4 / g.sig[1];
    const lanes = Object.keys(g.notes).map(Number).sort((a, b) => rank(a) - rank(b) || b - a)
      .map(n => ({ note: n, name: NAMES[n] || 'N' + n, color: family(n), hits: g.notes[n] }));
    const hits = lanes.reduce((s, l) => s + l.hits.length, 0);
    return Object.assign(g, { len, lanes, hits, name: g.file.replace(/\.mid$/, '') });
  });
  const FILES = ['baked-bean-boogie-128.mid', 'barf-o-matic-160.mid', GROOVES[0].file, 'gutter-ball-groove-104.mid', GROOVES[4].file, 'moldy-cheese-march-110.mid',
    'pee-wee-paradiddle-130.mid', 'rotten-egg-roll-118.mid', GROOVES[2].file, 'skidmark-swing-100.mid', 'sludge-gutter-80.mid', GROOVES[1].file,
    GROOVES[5].file, 'stink-bomb-blast-210.mid', 'swamp-gas-shuffle-92.mid', GROOVES[3].file, 'tuna-can-thrash-190.mid', 'whoopee-cushion-140.mid', 'zit-popper-polka-150.mid'];
  const hashPick = (list, key, salt) => { let h = 2166136261 ^ salt; for (const c of key) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return list[(h >>> 0) % list.length]; };
  const grooveOf = file => GROOVES.find(g => g.file === file) || null;

  const BASE = {
    time: 0, playing: false, armed: false, locked: false, loop: true, auto: true, press: null,
    tab: 'dump', faves: [], filter: '', filterFocus: false, folder: 'Grooves', loaded: GROOVES[0].file, cursor: null, hover: null,
    pos: 0, mutes: {}, empty: false,
    tempo: 'HOST', bpm: null, time2: '1X', launch: 'BAR', channel: 'FILE', velocity: 100, port: 'NOWHERE ELSE', portOn: false, kit: 'OFF', vol: .72, led: false,
    drag: 0, dragHot: false, sidStink: true
  };

  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const px = v => (Math.round(v * 100) / 100) + 'px';
  const box = (x, y, w, h) => `left:${px(x)};top:${px(y)};width:${px(w)};height:${px(h)}`;
  const tick = '<svg viewBox="0 0 12 12"><path d="M2 6.2 L5 9.2 L10.4 2.8" fill="none" stroke="#1A1220" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const starPath = (cx, cy, r, k = .45, n = 5, rot = -Math.PI / 2) => {
    let d = ''; for (let i = 0; i < n * 2; i++) { const a = rot + i * Math.PI / n, rr = i % 2 ? r * k : r; d += (i ? 'L' : 'M') + (cx + Math.cos(a) * rr).toFixed(2) + ' ' + (cy + Math.sin(a) * rr).toFixed(2); }
    return d + 'Z';
  };
  const fly = '<svg class="fly a" viewBox="-12 -10 24 20" width="24" height="20"><g class="w"><ellipse cx="-4.4" cy="-5.5" rx="5" ry="7.2" fill="rgba(255,255,255,.75)" stroke="#1A1220" stroke-width="1.1"/><ellipse cx="4.4" cy="-5.5" rx="5" ry="7.2" fill="rgba(255,255,255,.75)" stroke="#1A1220" stroke-width="1.1"/></g><ellipse cx="0" cy="0" rx="6" ry="4.4" fill="#1A1220"/><circle cx="5.5" cy="-1.1" r="3.3" fill="#1A1220"/><circle cx="6.6" cy="-2.2" r="1.5" fill="#E82D2D"/></svg>';
  const stinkSvg = (w, h, n, gap, color) => {
    let p = '';
    for (let k = 0; k < n; k++) {
      const x0 = w / 2 + (k - (n - 1) / 2) * gap; let d = '';
      for (let i = 0; i <= 16; i++) { const f = i / 16; d += (i ? 'L' : 'M') + (x0 + Math.sin(f * 9 + k * 1.7) * 4 * (.4 + f)).toFixed(1) + ' ' + (h - f * h * .82).toFixed(1); }
      p += `<path d="${d}" fill="none" stroke="rgba(26,18,32,.6)" stroke-width="4.5" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round"/>`;
    }
    return p;
  };

  // The ribbon a name sits on, with folded tails (theme.rs banner()).
  function ribbon(x, y, w, h, size, id) {
    const t = h * .7, top = h * .28, bot = h * 1.28, mid = (top + bot) / 2;
    const tail = side => {
      const x0 = side < 0 ? 0 : w, o = x0 + side * t, n = x0 + side * t * .55;
      const pts = [[x0, top], [o, top], [n, mid], [o, bot], [x0, bot]];
      const P = (dx, dy) => pts.map(p => (p[0] + dx).toFixed(1) + ',' + (p[1] + dy).toFixed(1)).join(' ');
      return `<polygon points="${P(3, 4)}" fill="#1A1220"/><polygon points="${P(0, 0)}" fill="${PAPER_D}" stroke="#1A1220" stroke-width="2.5" stroke-linejoin="round"/>` +
        `<polygon points="${x0},${h} ${x0 - side * h * .25},${h} ${x0},${bot}" fill="rgba(26,18,32,.85)"/>`;
    };
    const pad = t + 8;
    return `<div class="a ribbon" ${id ? `id="${id}"` : ''} style="${box(x, y, w, h)}"><svg width="${w + pad * 2}" height="${bot + 12}" style="left:${-pad}px;top:0" viewBox="${-pad} 0 ${w + pad * 2} ${bot + 12}">` +
      tail(-1) + tail(1) +
      `<rect x="4" y="5" width="${w}" height="${h}" rx="4" fill="#1A1220"/><rect x="0" y="0" width="${w}" height="${h}" rx="4" fill="${PAPER}" stroke="#1A1220" stroke-width="2.5"/>` +
      `<line x1="6" y1="5" x2="${w - 6}" y2="5" stroke="rgba(26,18,32,.25)"/><line x1="6" y1="${h - 5}" x2="${w - 6}" y2="${h - 5}" stroke="rgba(26,18,32,.25)"/></svg>` +
      `<div class="txt t" style="font-size:${size}px"><span></span></div></div>`;
  }

  // Slime over the top edge (theme.rs slime_top()).
  const DRIPS = [[38, 22, 9], [96, 44, 11], [150, 16, 7], [212, 58, 12], [300, 26, 8], [372, 38, 10], [455, 18, 7], [530, 50, 11], [640, 9, 8], [700, 7, 6], [790, 9, 8], [858, 40, 7], [930, 7, 7], [980, 34, 9], [1130, 8, 8]];
  function slimeTop() {
    const band = 16; let ink = '', fill = '', shine = '';
    DRIPS.forEach(([x, len, w]) => {
      const ty = band + len, stem = [[x - w * .75, band - 2], [x + w * .75, band - 2], [x + w * .5, ty - w * .3], [x - w * .5, ty - w * .3]];
      const pts = g => stem.map(p => { const dx = p[0] - x, s = Math.sign(dx); return (p[0] + s * g).toFixed(1) + ',' + p[1].toFixed(1); }).join(' ');
      ink += `<polygon points="${pts(2.5)}" fill="#1A1220"/><circle cx="${x}" cy="${ty}" r="${(w * .62 + 2.5).toFixed(1)}" fill="#1A1220"/>`;
      fill += `<polygon points="${pts(0)}" fill="${SLIME}"/><circle cx="${x}" cy="${ty}" r="${(w * .62).toFixed(1)}" fill="${SLIME}"/>`;
      shine += `<circle cx="${(x - w * .2).toFixed(1)}" cy="${(ty - w * .2).toFixed(1)}" r="${(w * .16).toFixed(1)}" fill="rgba(255,255,255,.7)"/>`;
    });
    return `<svg class="a slimetop" viewBox="0 0 1180 110" width="1180" height="110"><rect x="0" y="2.5" width="1180" height="${band}" fill="#1A1220"/>${ink}` +
      `<rect x="0" y="0" width="1180" height="${band}" fill="${SLIME}"/>${fill}${shine}<line x1="0" y1="5" x2="1180" y2="5" stroke="rgba(212,247,114,.8)" stroke-width="2"/></svg>`;
  }

  function MfsWindow(host, opts) {
    opts = opts || {};
    const sid = opts.sid || '/assets/sniffin-sid.webp';
    // A shadow root keeps the page's own .btn/.card/.tag rules out, and ours in.
    host.style.cssText += ';position:absolute;left:0;top:0;width:1180px;height:760px';
    const shadow = host.shadowRoot || host.attachShadow({ mode: 'open' });
    shadow.innerHTML = (opts.cssText ? `<style>${opts.cssText}</style>` : `<link rel="stylesheet" href="${opts.css || '/mfs-window.css'}">`) + '<div class="mfsw"></div>';
    const root = shadow.querySelector('.mfsw');
    // Asset paths, for pages (or the teaser) that serve them elsewhere.
    const can = opts.can;
    if (can) root.style.backgroundImage = `url(${can})`;
    const segs = (id, x, y, w, h, labels, color, size) => `<div class="a st seg" id="${id}" style="${box(x, y, w, h)};--c:${color}">${labels.map(l => `<div data-v="${l}"><span class="t" style="font-size:${size}px">${l}</span></div>`).join('')}</div>`;
    const slider = (id, x, y, w, color) => `<div class="a st slider" id="${id}" style="${box(x, y, w, 20)};--c:${color}"><i></i></div>`;
    const cap = (id, x, y, text) => `<div class="cap" ${id ? `id="${id}"` : ''} style="left:${x}px;top:${y - 12}px">${text}</div>`;
    const ptab = (x, y, text, color) => `<div class="a st ptab t" style="left:${x}px;top:${y}px;background:${color}"><span class="lbl">${text}</span></div>`;

    root.innerHTML = [
      `<div class="a t head sh ol">MIDI FART SNIFFER</div><div class="a t head ol">MIDI FART SNIFFER</div>`,
      `<div class="a t dymo">SNIFF OUT A GROOVE · PIPE IT TO YOUR DRUMS</div>`,
      `<div class="a st btn t" id="rip" style="${box(590, 32, 124, 58)}"><svg class="glyph" width="24" height="24" viewBox="-12 -12 24 24"><path id="ripglyph" d="M-6 -10 L10 0 L-6 10 Z" stroke="#1A1220" stroke-width="2" stroke-linejoin="round"/></svg><span class="lbl">RIP IT</span><b class="gl" style="left:14px;top:4px;width:43px"></b></div>`,
      `<div class="a st btn t" id="hold" style="${box(726, 32, 124, 58)};font-size:20px"><svg class="glyph" width="20" height="20" viewBox="0 0 20 20"><rect x="2" y="2" width="16" height="16" rx="2" fill="${RED}" stroke="#1A1220" stroke-width="2"/></svg><span class="lbl">HOLD IT</span><b class="gl" style="left:14px;top:4px;width:43px"></b></div>`,
      `<div class="a st tog t" id="loop" style="left:866px;top:32px;--c:${BLUE}"><i>${tick}</i><span class="lbl">LOOP</span></div>`,
      `<div class="a st tog t" id="auto" style="left:866px;top:64px;--c:${GRAPE}"><i>${tick}</i><span class="lbl">AUTO</span></div>`,
      `<svg class="a" id="sidstink" style="left:1030px;top:-30px;width:100px;height:70px;z-index:3" viewBox="0 0 100 70">${stinkSvg(100, 70, 3, 26, SLIME)}</svg>`,
      `<div class="a sid"><div></div><img src="${sid}" alt=""></div>`,
      ribbon(1022, 174, 124, 28, 16, 'sidbanner'),
      `<div id="flies">${fly}${fly}</div>`,
      // the dumpster
      `<div class="a st" style="${box(20, 122, 370, 622)};border-radius:14px;--l:5px"></div>`,
      `<div class="a st tab t" id="tabdump" style="left:34px;top:108px;width:132px"><span class="lbl">DUMPSTER</span></div>`,
      `<div class="a st tab t" id="tabfaves" style="left:174px;top:108px;width:112px"><span class="lbl">FAVES 0</span></div>`,
      `<div class="a st sq" id="up" style="${box(34, 150, 38, 32)}"><svg width="16" height="16" viewBox="-8 -9 16 16"><path d="M0 -8 L7 0 L2.5 0 L2.5 7 L-2.5 7 L-2.5 0 L-7 0 Z" fill="${BLUE}" stroke="#1A1220" stroke-width="1.5" stroke-linejoin="round"/></svg></div>`,
      `<div class="a t" id="folder" style="left:80px;top:158px;font-size:16px">Grooves</div>`,
      `<div class="a st sq t" id="open" style="${box(300, 150, 76, 32)}">OPEN</div>`,
      `<div class="a st field" id="field"><svg class="a" style="left:9px;top:6px" width="18" height="18" viewBox="0 0 18 18"><circle cx="7" cy="7" r="5.5" fill="none" stroke="#1A1220" stroke-width="2"/><path d="M11 11 L15.5 15.5" stroke="#1A1220" stroke-width="2.5" stroke-linecap="round"/></svg><span id="ftext"></span></div>`,
      `<div id="rows"></div>`,
      `<div class="a t" id="count" style="left:36px;top:717px;font-size:13px">0 grooves</div>`,
      `<div class="cap" style="right:${W - 372}px;left:auto;top:717px;font-size:12px;color:rgba(26,18,32,.6)">Drag a groove into your DAW</div>`,
      // the card
      `<div class="a card" id="card"></div>`,
      `<div class="a t status" id="status">HOLDING IT IN</div>`,
      `<div class="a win" id="win"></div><div class="a lanes" id="lanes"></div><div class="a winedge"></div>`,
      `<div class="a burst" id="burst"><svg width="60" height="60" viewBox="-30 -30 60 60"><path d="${starPath(3, 4, 30, .78, 12)}" fill="#1A1220"/><path d="${starPath(0, 0, 30, .78, 12)}" fill="${PUKE}" stroke="#1A1220" stroke-width="2.5" stroke-linejoin="round"/></svg><b id="cardno">1a</b></div>`,
      `<svg class="a favstar" id="favstar" viewBox="-22 -22 44 44"><path d="${starPath(3, 4, 20)}" fill="#1A1220"/><path id="favfill" d="${starPath(0, 0, 20)}" fill="${PAPER}" stroke="#1A1220" stroke-width="2.5" stroke-linejoin="round"/></svg>`,
      `<div id="bannerwrap" class="a" style="left:0;top:0;width:0;height:0">${ribbon(454, 517, 372, 50, 28, 'banner')}<div class="a st dragme t" id="dragme" style="left:748px;top:504px">DRAG ME</div></div>`,
      `<div class="a st plate" id="plate"></div><div class="a chips" id="chips"></div>`,
      `<div class="a t readout" id="readout">BAR 1/2 · BEAT 1</div>`,
      `<div class="a st tube" id="tube"><i></i></div>`,
      `<div class="a path" id="path"></div>`,
      // right column, as in a host
      `<div class="a st panel" style="${box(890, 222, 270, 178)}"></div>${ptab(904, 210, 'TEMPO', BLUE)}`,
      segs('tempo', 902, 246, 246, 30, ['HOST', 'FILE', 'SET'], BLUE, 15),
      cap('', 904, 302, 'BPM (drag)'), `<div class="a st box t" id="bpm" style="${box(902, 304, 116, 42)};font-size:25px">120.0</div>`,
      cap('', 1034, 302, 'TIME'), segs('time', 1032, 310, 116, 30, ['HALF', '1X', '2X'], BLUE, 12),
      cap('', 904, 366, 'LAUNCH ON THE HOST’S…'), segs('launch', 902, 368, 246, 28, ['NOW', 'BEAT', 'BAR'], BLUE, 13),
      `<div class="a st panel" style="${box(890, 428, 270, 156)}"></div>${ptab(904, 416, 'OUTPUT', GUM)}`,
      cap('', 904, 462, 'CHANNEL'), `<div class="a st box t" id="chan" style="${box(902, 464, 84, 40)};font-size:19px">FILE</div>`,
      cap('velcap', 1002, 462, 'VELOCITY 100%'), slider('vel', 1002, 474, 146, GUM),
      cap('', 904, 528, 'ALSO SEND TO'),
      `<div class="a st" id="port" style="${box(902, 530, 246, 30)};border-radius:9px"><span class="a t" id="portlbl" style="left:10px;top:8px;font-size:14px">NOWHERE ELSE</span>` +
        `<div class="a led" id="led" style="${box(198, 7.5, 11, 11)}"><i></i></div><svg class="a" style="left:222px;top:9px" width="12" height="8" viewBox="0 0 12 8"><path d="M0 0 L12 0 L6 7 Z" fill="#1A1220"/></svg></div>`,
      `<div class="cap" id="portstat" style="left:904px;top:565px;font-size:11.5px;color:rgba(26,18,32,.65)">The host gets the MIDI either way.</div>`,
      `<div class="a st panel" style="${box(890, 608, 270, 120)}"></div>${ptab(904, 596, 'PREVIEW KIT', SLIME)}`,
      segs('kit', 902, 632, 246, 30, ['OFF', 'DRUMS', 'FARTS'], SLIME_D, 15),
      cap('', 904, 684, 'VOLUME -3.0 dB'), slider('vol', 902, 688, 200, SLIME),
      `<div class="a led" id="peak" style="${box(1121, 689, 18, 18)}"><i style="inset:2px"></i></div>`,
      `<div class="cap" id="kithint" style="left:904px;top:713px;font-size:11px;color:rgba(26,18,32,.6)">Optional. Your drum plug-in makes the sound.</div>`,
      `<div class="a ver">v0.1.1 · Trilsoft</div>`,
      slimeTop(),
    ].join('');

    const $ = id => shadow.getElementById(id);
    const el = {
      rip: $('rip'), hold: $('hold'), loop: $('loop'), auto: $('auto'), tabdump: $('tabdump'), tabfaves: $('tabfaves'), field: $('field'), ftext: $('ftext'), rows: $('rows'),
      count: $('count'), card: $('card'), status: $('status'), win: $('win'), lanes: $('lanes'), cardno: $('cardno'), favfill: $('favfill'), banner: $('banner'), bannerwrap: $('bannerwrap'),
      dragme: $('dragme'), chips: $('chips'), readout: $('readout'), tube: $('tube'), path: $('path'), bpm: $('bpm'), chan: $('chan'), velcap: $('velcap'), vel: $('vel'), port: $('port'),
      portlbl: $('portlbl'), led: $('led'), portstat: $('portstat'), vol: $('vol'), peak: $('peak'), kithint: $('kithint'), sidstink: $('sidstink'), burst: $('burst'),
      flies: [...$('flies').querySelectorAll('.fly')], tempo: $('tempo'), time: $('time'), launch: $('launch'), kit: $('kit'), sidbanner: $('sidbanner'), open: $('open'), up: $('up')
    };
    el.sidbanner.querySelector('.txt span').textContent = "SNIFFIN' SID";
    let built = null; // the groove the lanes were drawn for
    const lane = { hits: [], tags: [], head: null, gx: 0, gw: 0 };
    const set = (e, t) => { if (e._t !== t) { e._t = t; e.textContent = t; } };

    // Lanes for one groove (editor.rs lanes()): drawn once, then puffed.
    function buildLanes(g) {
      built = g; el.lanes.textContent = ''; lane.hits = []; lane.tags = [];
      if (!g) return;
      const n = Math.max(1, g.lanes.length), top = 30, bottom = 368 - 36, gl = 108, gr = 424 - 14, gw = gr - gl, gh = bottom - top;
      const lh = Math.min(30, Math.max(10, gh / n)), y0 = top + Math.max(0, (gh - lh * n) / 2);
      const xOf = b => gl + b / g.len * gw;
      const beatLen = 4 / g.sig[1], beats = Math.round(g.len / beatLen), perBar = g.sig[0];
      let s = `<svg width="424" height="368" viewBox="0 0 424 368">`;
      for (let b = 0; b <= beats; b++) {
        const x = xOf(b * beatLen).toFixed(1), bar = b % perBar === 0;
        s += `<line x1="${x}" y1="${top - 4}" x2="${x}" y2="${bottom + 2}" stroke="rgba(26,18,32,${bar ? .45 : .14})" stroke-width="${bar ? 2 : 1}"/>`;
        if (bar && b < beats) s += `<text x="${(+x + 4).toFixed(1)}" y="20" font-family="Titan One" font-size="13" fill="rgba(26,18,32,.7)">${b / perBar + 1}</text>`;
      }
      g.lanes.forEach((l, i) => {
        const cy = y0 + (i + .5) * lh;
        l.hits.forEach(([beat, vel]) => {
          const r = Math.min(2.5 + 4.5 * vel / 127, lh * .42), x = xOf(beat);
          s += `<g class="puff" data-i="${lane.hits.length}" style="display:none"><circle cx="${x.toFixed(1)}" cy="${cy.toFixed(1)}" r="${r}" fill="${SLIME_L}"/><circle cx="${x.toFixed(1)}" cy="${cy.toFixed(1)}" r="${r}" fill="none" stroke="${SLIME_D}" stroke-width="2"/></g>` +
            `<circle class="hr" cx="${x.toFixed(1)}" cy="${cy.toFixed(1)}" r="${(r + 1.4).toFixed(2)}" fill="#1A1220"/><circle class="hf" cx="${x.toFixed(1)}" cy="${cy.toFixed(1)}" r="${r.toFixed(2)}" fill="${l.color}"/>`;
          lane.hits.push({ beat, lane: i, x, cy, r, note: l.note });
        });
      });
      s += `<g id="head"><line x1="0" y1="${top - 2}" x2="0" y2="${bottom + 4}" stroke="#1A1220" stroke-width="5"/><line x1="0" y1="${top - 2}" x2="0" y2="${bottom + 4}" stroke="${SLIME}" stroke-width="2.5"/>` +
        `<g transform="translate(0 ${top - 10})">${[[-.55, .15, .55], [0, -.2, .7], [.55, .1, .58], [.1, .35, .5]].map(([dx, dy, k]) => `<circle cx="${dx * 9}" cy="${dy * 9}" r="${k * 9 + 2}" fill="#1A1220"/>`).join('')}${[[-.55, .15, .55], [0, -.2, .7], [.55, .1, .58], [.1, .35, .5]].map(([dx, dy, k]) => `<circle cx="${dx * 9}" cy="${dy * 9}" r="${k * 9}" fill="${SLIME}"/>`).join('')}</g></g></svg>`;
      el.lanes.innerHTML = s;
      const svg = el.lanes.firstChild;
      lane.puffs = [...svg.querySelectorAll('.puff')]; lane.hf = [...svg.querySelectorAll('.hf')]; lane.hr = [...svg.querySelectorAll('.hr')];
      lane.head = svg.querySelector('#head'); lane.gl = gl; lane.gw = gw;
      lane.tagRects = {};
      g.lanes.forEach((l, i) => {
        const cy = y0 + (i + .5) * lh, h = Math.min(lh - 3, 22), fs = Math.max(9, Math.min(13, h * .62));
        lane.tagRects[l.note] = [438, 170 + cy - h / 2, 98, h];
        const t = document.createElement('div');
        t.className = 'tag'; t.style.cssText = `top:${(cy - h / 2).toFixed(1)}px;height:${h}px;font-size:${fs}px;--c:${l.color}`;
        t.innerHTML = `<span>${esc(l.name)}</span>`;
        el.lanes.appendChild(t); lane.tags.push(t);
      });
      el.card.style.background = g.border;
      el.win.style.backgroundColor = g.backdrop;
    }

    function rows(st) {
      const word = (st.filter || '').trim().toLowerCase();
      const list = (st.tab === 'faves' ? st.faves : FILES).filter(f => !word || f.toLowerCase().includes(word));
      const key = list.join('|') + '#' + st.tab;
      if (el.rows._k !== key) {
        el.rows._k = key;
        el.rows.innerHTML = list.slice(0, 17).map((f, i) => `<div class="a row" data-f="${esc(f)}" style="top:${232 + i * 28}px"><b class="bar"></b><i class="ic" style="background:${hashPick(BORDERS, f, 1)}"></i>` +
          `<span class="nm">${esc(f)}</span><svg class="stk" viewBox="0 0 24 26">${stinkSvg(24, 26, 2, 7, SLIME_D)}</svg><svg class="fav" viewBox="-9 -9 18 18"><path d="${starPath(0, 0, 8)}" fill="${PUKE}" stroke="#1A1220" stroke-width="1.5"/></svg></div>`).join('');
        el.rowEls = [...el.rows.children];
      }
      el.rowEls.forEach(r => {
        const f = r.dataset.f;
        r.classList.toggle('cur', f === (st.cursor || st.loaded));
        r.classList.toggle('now', f === st.loaded);
        r.classList.toggle('play', !!(st.playing || st.armed));
        r.classList.toggle('hov', f === st.hover && f !== (st.cursor || st.loaded));
        r.classList.toggle('fv', st.faves.includes(f));
      });
      set(el.count, list.length === 1 ? '1 groove' : list.length + ' grooves');
    }

    function update(input) {
      const st = Object.assign({}, BASE, input);
      const g = st.empty ? null : grooveOf(st.loaded);
      if (g !== built) buildLanes(g);
      const lit = st.playing || (st.armed && Math.floor(st.time * 4) % 2 === 0);
      el.rip.classList.toggle('lit', lit); el.rip.style.background = lit ? (st.playing ? SLIME : PUKE) : '';
      $('ripglyph').setAttribute('fill', lit ? PAPER : SLIME);
      el.rip.classList.toggle('down', st.press === 'rip'); el.hold.classList.toggle('down', st.press === 'hold');
      el.loop.classList.toggle('on', st.loop); el.loop.style.background = st.loop ? BLUE : '';
      el.auto.classList.toggle('on', st.auto); el.auto.style.background = st.auto ? GRAPE : '';
      el.sidstink.style.display = st.playing && st.sidStink ? '' : 'none';
      // dumpster
      el.tabdump.classList.toggle('on', st.tab === 'dump'); el.tabdump.style.background = st.tab === 'dump' ? SLIME : '';
      el.tabfaves.classList.toggle('on', st.tab === 'faves'); el.tabfaves.style.background = st.tab === 'faves' ? PUKE : '';
      set(el.tabfaves.firstChild, 'FAVES ' + st.faves.length);
      el.field.classList.toggle('typed', !!st.filter); el.field.classList.toggle('focus', !!st.filterFocus);
      el.ftext.innerHTML = st.filter ? esc(st.filter) + (st.filterFocus ? '<i class="caret"></i>' : '') : (st.filterFocus ? '<i class="caret"></i>' : '') + 'sniff for a groove…';
      rows(st);
      // card
      const status = !g ? 'NOTHING LOADED' : st.playing ? (st.locked ? 'SNIFFING ALONG' : 'NOW SNIFFING') : st.armed ? (st.launch === 'BEAT' ? 'WAITING FOR THE BEAT' : 'WAITING FOR THE BAR') : 'HOLDING IT IN';
      set(el.status, status);
      el.burst.style.display = g ? '' : 'none'; $('favstar').style.display = g ? '' : 'none';
      if (!g) {
        el.card.style.background = PUKE; el.win.style.backgroundColor = BACKDROPS[0];
        el.win.style.backgroundImage = `url(${sid})`; el.win.style.backgroundSize = '100% 112%'; el.win.style.backgroundPosition = '0 30%';
      } else el.win.style.backgroundImage = el.win.style.backgroundSize = el.win.style.backgroundPosition = '';
      if (g) {
        const i = FILES.indexOf(g.file);
        set(el.cardno, (Math.floor(i / 2) + 1) + (i % 2 ? 'b' : 'a'));
        el.favfill.setAttribute('fill', st.faves.includes(g.file) ? PUKE : PAPER);
        const pos = ((st.pos % g.len) + g.len) % g.len, playing = st.playing;
        lane.head.setAttribute('transform', `translate(${(lane.gl + pos / g.len * lane.gw).toFixed(1)} 0)`);
        lane.head.style.display = playing || st.pos > 0 ? '' : 'none';
        const lit = g.lanes.map(() => 2);
        lane.hits.forEach((h, k) => {
          const muted = !!st.mutes[h.note];
          const since = playing ? (((pos - h.beat) % g.len) + g.len) % g.len : 99;
          const p = lane.puffs[k];
          if (since < .35 && !muted) {
            const q = since / .35; lit[h.lane] = Math.min(lit[h.lane], q);
            p.style.display = ''; const [c1, c2] = p.children;
            c1.setAttribute('cy', (h.cy - q * 10).toFixed(1)); c1.setAttribute('r', (h.r * (1.6 + 1.6 * q)).toFixed(1)); c1.setAttribute('opacity', (.85 * (1 - q)).toFixed(2));
            c2.setAttribute('r', (h.r * (1.2 + 2.5 * q)).toFixed(1)); c2.setAttribute('opacity', (1 - q).toFixed(2));
          } else p.style.display = 'none';
          lane.hf[k].setAttribute('fill', muted ? 'rgba(140,123,143,.35)' : g.lanes[h.lane].color);
          lane.hr[k].setAttribute('fill', muted ? 'rgba(26,18,32,.25)' : INK);
        });
        lane.tags.forEach((t, i) => {
          const muted = !!st.mutes[g.lanes[i].note];
          t.classList.toggle('mute', muted);
          t.style.background = muted ? '' : lit[i] < 1 ? mix(g.lanes[i].color, PAPER, lit[i]) : '';
        });
        set(el.banner.querySelector('.txt span'), g.name);
        const bar = Math.floor(pos / (g.len / g.bars)) + 1, beat = Math.floor((pos % (g.len / g.bars)) / (4 / g.sig[1])) + 1;
        set(el.readout, `BAR ${Math.min(bar, g.bars)}/${g.bars}  ·  BEAT ${beat}`);
        el.tube.firstChild.style.cssText = `left:2.5px;top:2.5px;bottom:2.5px;width:${Math.max(13, (182 - 5) * pos / g.len).toFixed(1)}px`;
        if (el.tube._g !== g) { el.tube._g = g; el.tube.querySelectorAll('s').forEach(s => s.remove()); for (let b = 1; b < g.bars; b++) el.tube.insertAdjacentHTML('beforeend', `<s style="left:${(177 * b / g.bars).toFixed(1)}px"></s>`); }
        const ch = st.channel === 'FILE' ? 'CH 10' : 'CH ' + st.channel;
        const bpm = st.bpm || g.bpm;
        const chips = [`${Math.round(bpm)} BPM`, `${g.sig[0]}/${g.sig[1]}`, g.bars === 1 ? '1 BAR' : g.bars + ' BARS', g.hits + ' HITS', ch];
        const ck = chips.join('|'); if (el.chips._k !== ck) { el.chips._k = ck; el.chips.innerHTML = chips.map(c => `<span class="chip t">${c}</span>`).join(''); }
        set(el.path, '~/Music/Grooves/' + g.file);
      } else {
        set(el.banner.querySelector('.txt span'), 'PICK A STINKER');
        set(el.readout, ''); el.chips.innerHTML = ''; el.chips._k = ''; set(el.path, 'OPEN a folder of MIDI grooves on the left, then click one.');
      }
      el.dragme.style.display = g ? '' : 'none';
      el.dragme.classList.toggle('hot', !!st.dragHot);
      el.bannerwrap.style.transform = st.drag ? `translate(${(st.drag * 30).toFixed(1)}px,${(st.drag * 10).toFixed(1)}px) rotate(${(st.drag * 2.5).toFixed(2)}deg)` : '';
      el.bannerwrap.style.opacity = st.drag ? String(1 - st.drag * .35) : '';
      // right column
      const pick = (s, v) => s.querySelectorAll('[data-v]').forEach(d => d.classList.toggle('on', d.dataset.v === v));
      pick(el.tempo, st.tempo); pick(el.time, st.time2); pick(el.launch, st.launch); pick(el.kit, st.kit);
      el.launch.classList.toggle('off', st.tempo !== 'HOST');
      if (st.tempo !== 'HOST') el.launch.querySelectorAll('[data-v]').forEach(d => d.classList.remove('on'));
      set(el.bpm, (st.bpm || (g ? g.bpm : 120)).toFixed(1));
      set(el.chan, String(st.channel)); el.chan.style.fontSize = st.channel === 'FILE' ? '19px' : '23px';
      set(el.velcap, `VELOCITY ${Math.round(st.velocity)}%`);
      el.vel.firstChild.style.width = Math.max(20, 146 * st.velocity / 200) + 'px';
      el.vol.firstChild.style.width = Math.max(20, 200 * st.vol) + 'px';
      set(el.portlbl, st.port.toUpperCase());
      el.port.style.background = st.portHover ? '#fff' : '';
      el.led.classList.toggle('on', !!st.led);
      set(el.portstat, st.port === 'NOWHERE ELSE' ? 'The host gets the MIDI either way.' : st.port === 'VIRTUAL PORT' ? 'virtual port "MIDI Fart Sniffer"' : st.port);
      el.peak.firstChild.style.background = st.kit !== 'OFF' && st.playing ? SLIME_L : '#456b22';
      set(el.kithint, st.kit === 'OFF' ? 'Optional. Your drum plug-in makes the sound.' : 'Plays on top of a drum plug-in that’s routed');
      tickTo(st.time);
    }

    function tickTo(t) {
      // Two flies orbit Sid (editor.rs header()).
      [[0, 1], [2.4, 1.37]].forEach(([k, sp], i) => {
        const tt = t * sp + k, f = el.flies[i];
        f.style.left = (1080 + Math.cos(tt * 1.3) * 96).toFixed(1) + 'px';
        f.style.top = (104 + Math.sin(tt * 2.1) * 70 - 6).toFixed(1) + 'px';
      });
    }

    function mix(a, b, t) {
      const p = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
      const A = p(a), B = p(b);
      return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, '0')).join('');
    }

    const RECTS = {
      window: [0, 0, W, H], header: [16, 20, 960, 92], transport: [584, 26, 394, 70], sid: [990, 14, 180, 196],
      dump: [20, 102, 370, 642], tabs: [30, 104, 262, 36], pathrow: [30, 146, 350, 40], field: [30, 188, 350, 38], list: [26, 228, 358, 482],
      card: [404, 110, 470, 636], lanes: [428, 170, 424, 368], tags: [436, 196, 102, 312], banner: [424, 500, 432, 84], dragme: [744, 500, 78, 28], star: [818, 122, 48, 48],
      plate: [424, 576, 432, 154], tube: [652, 628, 190, 28],
      tempo: [886, 206, 278, 198], tempoSrc: [898, 242, 254, 38], bpm: [898, 286, 124, 64], time: [1028, 290, 124, 54], launch: [898, 350, 254, 50],
      output: [886, 412, 278, 176], chan: [898, 448, 92, 60], vel: [998, 448, 154, 52], port: [898, 512, 254, 66],
      kit: [886, 592, 278, 140], kitsegs: [898, 628, 254, 38], vol: [898, 670, 250, 44],
    };
    const rowRect = i => [30, 232 + i * 28, 342, 26];

    // Where a lane's name tag is, for the groove on show (call after update()).
    const tagRect = note => (lane.tagRects && lane.tagRects[note] ? lane.tagRects[note].slice() : null);
    return { W, H, el, root, update, tick: tickTo, rect: n => RECTS[n].slice(), rowRect, tagRect, grooves: GROOVES, files: FILES, base: () => Object.assign({}, BASE, { faves: [], mutes: {} }) };
  }

  MfsWindow.GROOVES = GROOVES;
  MfsWindow.FILES = FILES;
  global.MfsWindow = MfsWindow;
})(typeof window !== 'undefined' ? window : globalThis);

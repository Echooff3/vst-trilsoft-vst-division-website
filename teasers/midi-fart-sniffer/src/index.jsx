/* MIDI Fart Sniffer teaser for the homepage (scrubbed by scroll, so every
   frame has to read as a still too). Draws the real window from the site's
   /js/mfs-window.js (copied in by sync.mjs), so it matches the tour.

   0.00 slime pours, the title slams in
   0.20 the window drops in; a groove gets clicked
   0.36 push into the card: the lanes puff as it plays
   0.55 the next groove, same beat of the bar
   0.60 DRAG ME: the groove leaves as a MIDI clip
   0.78 the window falls away; title + Sniffin' Sid's card to finish
        (kept clear of where the homepage puts its key form) */
import React, { useLayoutEffect, useRef } from 'react';
import { AbsoluteFill, Composition, continueRender, delayRender, registerRoot, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import '../public/mfs-window.js';

const waitFor = (label, p) => { const h = delayRender(label); p.catch(e => console.error(e)).finally(() => continueRender(h)); };
let CSS = '';
if (typeof window !== 'undefined') {
  waitFor('fonts', Promise.all([
    new FontFace('Titan One', `url(${staticFile('fonts/TitanOne-Regular.ttf')})`).load(),
    new FontFace('Comic Neue', `url(${staticFile('fonts/ComicNeue-Bold.ttf')})`, { weight: '700' }).load(),
  ]).then(faces => faces.forEach(f => document.fonts.add(f))));
  waitFor('css', fetch(staticFile('mfs-window.css')).then(r => r.text()).then(t => { CSS = t; }));
  ['sid.webp', 'mfs-can.webp', 'mfs-steel.webp'].forEach(f => waitFor(f, new Promise(res => { const i = new Image(); i.onload = i.onerror = res; i.src = staticFile(f); })));
}

const INK = '#1A1220', PAPER = '#FFF6DC', PAPER_D = '#E8D5A4', SLIME = '#8FDC2C', SLIME_D = '#4A8C10', PUKE = '#F7D21E', GUM = '#FF5CA8', RED = '#E82D2D', GRAPE = '#7C40C6';
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const seg = (p, a, b) => clamp((p - a) / (b - a));
const io = t => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const out = t => 1 - Math.pow(1 - t, 3);
const back = t => { const c = 1.9; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };
const lerp = (a, b, t) => a + (b - a) * t;
const titan = { fontFamily: 'Titan One, Impact, sans-serif', fontWeight: 400, lineHeight: 1, whiteSpace: 'nowrap' };
const stroke = w => ({ WebkitTextStroke: `${w}px ${INK}`, paintOrder: 'stroke fill' });

// ---------- pieces ----------
function Steel() {
  return (
    <AbsoluteFill style={{ background: `#A6B0B8 url(${staticFile('mfs-steel.webp')}) 0 0/240px 240px` }}>
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 45%, transparent 40%, rgba(26,18,32,.38) 100%)' }} />
    </AbsoluteFill>
  );
}

// Slime across the top, the drips stretching as it pours.
function Slime({ w, grow, band = 26 }) {
  const drips = [];
  for (let x = 30, i = 0; x < w; i++) {
    const r = Math.abs(Math.sin(i * 12.9898) * 43758.5453) % 1;
    drips.push([x, 18 + r * 70, 10 + (r * 7) % 8]);
    x += 54 + ((r * 97) % 60);
  }
  const g = clamp(grow);
  const stems = (pad, fill) => drips.map(([x, len, wd], i) => {
    const L = len * g, tip = band + L;
    return (
      <g key={i}>
        <path d={`M${x - wd * .75 - pad} ${band - 2} L${x + wd * .75 + pad} ${band - 2} L${x + wd * .5 + pad} ${tip - wd * .3} L${x - wd * .5 - pad} ${tip - wd * .3} Z`} fill={fill} />
        <circle cx={x} cy={tip} r={wd * .62 + pad} fill={fill} />
      </g>
    );
  });
  return (
    <svg width={w} height={band + 120} style={{ position: 'absolute', left: 0, top: 0 }}>
      <rect x="0" y="3" width={w} height={band} fill={INK} />{stems(3, INK)}
      <rect x="0" y="0" width={w} height={band} fill={SLIME} />{stems(0, SLIME)}
      {drips.map(([x, len, wd], i) => <circle key={i} cx={x - wd * .2} cy={band + len * g - wd * .2} r={wd * .16} fill="rgba(255,255,255,.7)" />)}
      <line x1="0" y1="7" x2={w} y2="7" stroke="rgba(212,247,114,.8)" strokeWidth="3" />
    </svg>
  );
}

function Headline({ size, lines, style }) {
  const sw = size / 6.2, off = [size * .09, size * .11];
  const text = lines.map((l, i) => <div key={i}>{l}</div>);
  return (
    <div style={{ position: 'absolute', ...titan, fontSize: size, lineHeight: .92, ...style }}>
      <div style={{ position: 'absolute', left: off[0], top: off[1], color: GUM, ...stroke(sw) }}>{text}</div>
      <div style={{ position: 'relative', color: PUKE, ...stroke(sw) }}>{text}</div>
    </div>
  );
}

function Dymo({ text, size, style }) {
  return (
    <div style={{ position: 'absolute', ...titan, fontSize: size, color: '#F4F4F0', textShadow: '0 1.5px 0 rgba(26,18,32,.5)', background: RED, borderRadius: 4, padding: `${size * .45}px ${size * 1.1}px ${size * .35}px`, boxShadow: '3px 4px 0 rgba(26,18,32,.65)', ...style }}>
      <div style={{ position: 'absolute', left: 6, right: 6, top: 3, height: 2, background: 'rgba(255,255,255,.35)' }} />{text}
    </div>
  );
}

function Sticker({ text, size = 30, color = PAPER, style }) {
  return (
    <div style={{ position: 'absolute', ...titan, fontSize: size, color: INK, background: color, border: `4px solid ${INK}`, borderRadius: 12, boxShadow: `5px 6px 0 ${INK}`, padding: `${size * .35}px ${size * .55}px ${size * .25}px`, ...style }}>
      {text}
    </div>
  );
}

// Sniffin' Sid's trading card (as on the /midi-fart-sniffer hero).
function Card({ w, style }) {
  const h = w * 1.4, b = w * .07;
  return (
    <div style={{ position: 'absolute', width: w, height: h, filter: `drop-shadow(${w * .03}px ${w * .035}px 0 ${INK})`, ...style }}>
      <div style={{ position: 'absolute', inset: 0, borderRadius: w * .06, border: `4px solid ${INK}`, background: GRAPE }} />
      <div style={{ position: 'absolute', inset: w * .022, borderRadius: w * .045, border: `4px solid ${PAPER}` }} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: h * .03, textAlign: 'center', ...titan, fontSize: w * .07, color: PAPER, ...stroke(w * .018) }}>DIV-003 · FREE</div>
      <div style={{ position: 'absolute', left: b, right: b, top: h * .12, bottom: h * .22, borderRadius: w * .04, border: `4px solid ${INK}`, background: `${PUKE} url(${staticFile('sid.webp')}) center 20%/cover` }} />
      <svg viewBox="-34 -34 68 68" style={{ position: 'absolute', left: -w * .07, top: -w * .07, width: w * .26, height: w * .26, overflow: 'visible' }}>
        <path d={burst(3, 4)} fill={INK} /><path d={burst(0, 0)} fill={PUKE} stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
        <text x="0" y="7" textAnchor="middle" fontFamily="Titan One" fontSize="19" fill={INK}>3a</text>
      </svg>
      <Ribbon w={w * 1.02} h={h * .13} text="SNIFFIN' SID" style={{ left: -w * .01, bottom: h * .085 }} />
    </div>
  );
}
function burst(dx, dy, r = 30, n = 12) {
  let d = '';
  for (let i = 0; i < n * 2; i++) { const a = i * Math.PI / n - Math.PI / 2, rr = i % 2 ? r * .78 : r; d += (i ? 'L' : 'M') + (dx + Math.cos(a) * rr).toFixed(1) + ' ' + (dy + Math.sin(a) * rr).toFixed(1); }
  return d + 'Z';
}
function Ribbon({ w, h, text, style }) {
  const t = h * .7, top = h * .28, bot = h * 1.28, mid = (top + bot) / 2;
  const tail = side => {
    const x0 = side < 0 ? 0 : w, o = x0 + side * t, n = x0 + side * t * .55;
    const pts = (dx, dy) => [[x0, top], [o, top], [n, mid], [o, bot], [x0, bot]].map(p => `${p[0] + dx},${p[1] + dy}`).join(' ');
    return <g><polygon points={pts(3, 4)} fill={INK} /><polygon points={pts(0, 0)} fill={PAPER_D} stroke={INK} strokeWidth="3" strokeLinejoin="round" /></g>;
  };
  return (
    <div style={{ position: 'absolute', width: w, height: h, ...style }}>
      <svg width={w + t * 2 + 16} height={bot + 12} viewBox={`${-t - 8} 0 ${w + t * 2 + 16} ${bot + 12}`} style={{ position: 'absolute', left: -t - 8, top: 0, overflow: 'visible' }}>
        {tail(-1)}{tail(1)}
        <rect x="5" y="6" width={w} height={h} rx="5" fill={INK} /><rect x="0" y="0" width={w} height={h} rx="5" fill={PAPER} stroke={INK} strokeWidth="3" />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', ...titan, fontSize: h * .52, color: INK, paddingTop: h * .06 }}>{text}</div>
    </div>
  );
}

// The tour's cursor (arrow, or the grabbing hand).
function Cursor({ x, y, s, down, hand }) {
  return (
    <svg width="60" height="60" viewBox="0 0 60 60" style={{ position: 'absolute', left: x, top: y, transform: `scale(${s})`, transformOrigin: '0 0', overflow: 'visible', zIndex: 50 }}>
      {down ? <circle cx="6" cy="4" r="16" fill="none" stroke={INK} strokeWidth="3" /> : null}
      {hand
        ? <path d="M8 4 v24 l-5-5 q-4 0 -2 5 l10 13 h16 l4-14 v-10 q0-4-4-4 q-2 0-3 2 q0-4-4-4 q-2 0-3 2 q0-4-4-4 q-2 0-2 2 v-7 q0-4-4-4 q-3 0-3 4z" fill="#fff" stroke="#000" strokeWidth="2.4" strokeLinejoin="round" />
        : <path d="M4 2 L4 34 L12 26 L18 40 L24 37 L18 24 L30 24 Z" fill="#fff" stroke="#000" strokeWidth="2.5" strokeLinejoin="round" />}
    </svg>
  );
}

// A MIDI clip leaving for the DAW.
function Clip({ name, style }) {
  return (
    <div style={{ position: 'absolute', width: 260, height: 74, borderRadius: 8, background: '#7FB5CC', border: `3px solid ${INK}`, boxShadow: `5px 6px 0 ${INK}`, overflow: 'hidden', ...style }}>
      <div style={{ height: 22, background: '#5E93AB', ...titan, fontSize: 13, color: INK, padding: '5px 8px 0' }}>{name}</div>
      {Array.from({ length: 16 }).map((_, i) => <i key={i} style={{ position: 'absolute', left: 10 + i * 15, top: 30 + ((i * 7) % 4) * 9, width: 9, height: 6, borderRadius: 2, background: INK }} />)}
    </div>
  );
}

// The window itself, driven by update(state) every frame.
function Win({ st, transform }) {
  const host = useRef(null), win = useRef(null);
  useLayoutEffect(() => {
    if (!win.current) win.current = window.MfsWindow(host.current, { cssText: CSS, sid: staticFile('sid.webp'), can: staticFile('mfs-can.webp') });
    win.current.update(st);
  });
  return (
    <div style={{ position: 'absolute', left: 0, top: 0, width: 1180, height: 760, transformOrigin: '0 0', transform, filter: `drop-shadow(10px 12px 0 ${INK})` }}>
      <div style={{ position: 'absolute', inset: -4, border: `4px solid ${INK}`, borderRadius: 16, overflow: 'hidden' }}>
        <div ref={host} style={{ position: 'absolute', left: 0, top: 0 }} />
      </div>
    </div>
  );
}

// ---------- the film ----------
const FILES = () => window.MfsWindow.FILES;
const GROOVES = () => window.MfsWindow.GROOVES;
const rowY = f => 232 + FILES().indexOf(f) * 28 + 13;
// A camera: a rect of the window centred in the frame.
const cam = (vw, vh, r, m, oy = 0) => { const s = Math.min(vw / (r[2] + m * 2), vh / (r[3] + m * 2)); return { s, x: vw / 2 - (r[0] + r[2] / 2) * s, y: vh / 2 + oy - (r[1] + r[3] / 2) * s }; };
const mixCam = (a, b, t) => { const s = Math.exp(lerp(Math.log(a.s), Math.log(b.s), t)); return { s, x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t) }; };

function Teaser({ portrait }) {
  const frame = useCurrentFrame();
  const { durationInFrames, width: VW, height: VH, fps } = useVideoConfig();
  const p = frame / (durationInFrames - 1), t = frame / fps;
  const P = portrait;

  // the window's story
  const punk = 'dumpster-punk-174.mid', funk = 'stank-funk-96.mid';
  const st = { time: t, playing: false, loaded: punk, faves: ['toilet-tom-fill-140.mid', funk], tempo: 'HOST', kit: 'OFF', launch: 'BAR', cursor: null, hover: null };
  const T0 = .31, T1 = .56;
  if (p >= T0) { st.playing = true; const g = GROOVES().find(x => x.file === (p >= T1 ? funk : punk)); st.pos = ((t - T0 * 9) * g.bpm / 60) % g.len; }
  if (p >= T1) st.loaded = funk;
  if (p > .27 && p < T0) st.hover = punk;
  if (p > .52 && p < T1) st.hover = funk;
  const dragA = seg(p, .63, .74);
  st.drag = p > .62 && p < .78 ? io(dragA) : 0;
  st.dragHot = p > .6 && p < .78;

  // cameras (window coords)
  const full = cam(VW, VH, [0, 0, 1180, 760], P ? 16 : 40, P ? -40 : 10);
  const lanes = cam(VW, VH, [420, 150, 440, 400], P ? 10 : 30, P ? -60 : 0);
  const list = cam(VW, VH, P ? [0, 100, 600, 640] : [10, 100, 870, 650], P ? 10 : 30, P ? -40 : 0);
  const banner = cam(VW, VH, [400, 460, 520, 300], P ? 8 : 30, P ? -60 : 0);
  let c = full;
  if (p >= .36 && p < .54) c = mixCam(full, lanes, io(seg(p, .36, .42)));
  else if (p >= .54 && p < .6) c = mixCam(lanes, list, io(seg(p, .51, .55)));
  else if (p >= .6 && p < .78) c = mixCam(list, banner, io(seg(p, .58, .63)));
  else if (p >= .78) c = mixCam(banner, full, io(seg(p, .76, .8)));
  // entrance and exit
  const enter = out(seg(p, .18, .3)), leave = io(seg(p, .8, .9));
  const ey = (1 - enter) * VH * 1.1 + leave * VH * 1.2, rot = (1 - enter) * 9 + leave * -7;
  const transform = `translate(${c.x}px, ${c.y + ey}px) rotate(${rot}deg) scale(${c.s})`;

  // the cursor (window coords, then through the camera)
  let cur = null;
  const toScreen = (x, y) => ({ x: c.x + x * c.s, y: c.y + ey + y * c.s });
  const rowX = 160;
  if (p > .24 && p < .36) { const u = io(seg(p, .24, .3)); cur = { ...toScreen(lerp(300, rowX, u), lerp(640, rowY(punk), u)), down: p > .3 && p < .33 }; }
  if (p > .5 && p < .6) { const u = io(seg(p, .5, .55)); cur = { ...toScreen(lerp(rowX, rowX + 20, u), lerp(rowY(punk), rowY(funk), u)), down: p > .55 && p < .58 }; }
  if (p > .6 && p < .78) {
    const dm = [783, 514], u = io(seg(p, .6, .63));
    const from = [rowX + 20, rowY(funk)];
    const at = p < .63 ? [lerp(from[0], dm[0], u), lerp(from[1], dm[1], u)] : [dm[0] + st.drag * 30, dm[1] + st.drag * 10];
    cur = { ...toScreen(at[0], at[1]), down: p > .62, hand: p > .63 };
  }
  // the clip that leaves for the DAW, in screen space
  const clipT = seg(p, .66, .78);
  const clipFrom = toScreen(560, 520);
  const clipTo = P ? { x: VW * .1, y: VH * .82 } : { x: VW * .62, y: VH * .78 };

  // opening and closing titles
  const pour = seg(p, 0, .12), slam = seg(p, .04, .13), titleOut = io(seg(p, .2, .28));
  const endIn = seg(p, .82, .92), cardIn = seg(p, .85, .95);
  const caption = p > .32 && p < .42 ? 'CLICK A GROOVE' : p > .43 && p < .53 ? 'IT PLAYS YOUR DRUMS' : p > .555 && p < .61 ? 'NEXT ONE, SAME BEAT' : p > .64 && p < .77 ? 'DRAG IT INTO YOUR DAW' : '';
  const capPop = caption ? back(clamp(((p - ({ 'CLICK A GROOVE': .32, 'IT PLAYS YOUR DRUMS': .43, 'NEXT ONE, SAME BEAT': .555, 'DRAG IT INTO YOUR DAW': .64 })[caption]) / .02))) : 0;

  const titleSize = P ? 104 : 118;
  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      <Steel />
      {/* opener */}
      {p < .3 ? (
        <AbsoluteFill style={{ transform: `translateY(${-titleOut * VH * .7}px) scale(${1 - titleOut * .3})`, opacity: 1 - titleOut }}>
          <Headline size={titleSize} lines={P ? ['MIDI', 'FART', 'SNIFFER'] : ['MIDI FART', 'SNIFFER']}
            style={{ left: '50%', top: P ? VH * .3 : VH * .26, textAlign: 'center', transform: `translateX(-50%) scale(${back(slam) * (slam > 0 ? 1 : 0)}) rotate(${(1 - slam) * -8 - 2}deg)` }} />
          <Dymo text="SNIFF OUT A GROOVE · PIPE IT TO YOUR DRUMS" size={P ? 20 : 24}
            style={{ left: '50%', top: P ? VH * .62 : VH * .66, transform: `translateX(-50%) translateX(${(1 - out(seg(p, .1, .16))) * -VW}px) rotate(-1.5deg)` }} />
        </AbsoluteFill>
      ) : null}
      {/* the window */}
      {p > .17 && p < .92 ? <Win st={st} transform={transform} /> : null}
      {cur ? <Cursor x={cur.x} y={cur.y} s={P ? 1.3 : 1.5} down={cur.down} hand={cur.hand} /> : null}
      {clipT > 0 && clipT < 1 ? (
        <Clip name={funk.replace('.mid', '')} style={{ left: lerp(clipFrom.x, clipTo.x, io(clipT)), top: lerp(clipFrom.y, clipTo.y, io(clipT)), transform: `rotate(${lerp(0, -8, clipT)}deg) scale(${lerp(.6, 1.1, out(clipT))})`, opacity: clipT > .85 ? 1 - (clipT - .85) / .15 : 1 }} />
      ) : null}
      {caption ? (
        <Sticker text={caption} size={P ? 30 : 34} color={caption.startsWith('DRAG') ? PUKE : caption.startsWith('NEXT') ? '#BDE7FF' : SLIME}
          style={P ? { left: '50%', top: VH * .8, transform: `translateX(-50%) rotate(-3deg) scale(${capPop})` } : { left: 60, top: VH - 140, transform: `rotate(-3deg) scale(${capPop})`, transformOrigin: '0 100%' }} />
      ) : null}
      {/* finish */}
      {p > .8 ? (
        <AbsoluteFill>
          <Headline size={P ? 92 : 104} lines={['MIDI FART', 'SNIFFER']}
            style={P ? { left: '50%', top: 540, textAlign: 'center', transform: `translateX(-50%) scale(${back(endIn)})` } : { left: 80, top: 118, transform: `scale(${back(endIn)}) rotate(-2deg)`, transformOrigin: '0 50%' }} />
          {P ? null : <Dymo text="SNIFF OUT A GROOVE · PIPE IT TO YOUR DRUMS" size={20}
            style={P ? { left: '50%', top: 742, transform: `translateX(-50%) rotate(-1.5deg) translateY(${(1 - out(seg(p, .88, .95))) * 300}px)` } : { left: 92, top: 352, transform: `rotate(-1.5deg) translateX(${(1 - out(seg(p, .88, .95))) * -900}px)` }}/>}
          <Card w={P ? 280 : 330}
            style={P ? { left: (VW - 280) / 2, top: 112, transform: `rotate(${-5 + (1 - cardIn) * 25}deg) translateY(${(1 - out(cardIn)) * -900}px)` } : { left: VW - 470, top: 96, transform: `rotate(${4 + (1 - cardIn) * 20}deg) translateX(${(1 - out(cardIn)) * 700}px)` }} />
        </AbsoluteFill>
      ) : null}
      <Slime w={VW} grow={pour * (1 - .35 * seg(p, .3, .5)) + .35 * seg(p, .8, .95)} band={P ? 22 : 26} />
    </AbsoluteFill>
  );
}

const fps = 30;
const durationInFrames = 270;

function Root() {
  return (
    <>
      <Composition id="MfsDesk" component={Teaser} durationInFrames={durationInFrames} fps={fps} width={1280} height={720} defaultProps={{ portrait: false }} />
      <Composition id="MfsPort" component={Teaser} durationInFrames={durationInFrames} fps={fps} width={720} height={1280} defaultProps={{ portrait: true }} />
    </>
  );
}

registerRoot(Root);

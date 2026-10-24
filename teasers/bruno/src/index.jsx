/* Bruno teaser for the homepage (scrubbed by scroll, so every frame has to
   read as a still too). Draws the real window from the site's
   /js/bruno-window.js (copied in by sync.mjs), so it matches the tour.

   0.00 the curtain, a turning sunburst, BRUNO drops in letter by letter
   0.20 the window drops in; PLAY, he counts in and plays
   0.40 push into his mood: the puck goes furious
   0.54 crank the fills: FILL MANIA
   0.68 the take: DRAG ME, out goes a MIDI clip
   0.80 the window falls away; title + Bruno on his stage to finish
        (kept clear of where the homepage puts its buttons) */
import React, { useLayoutEffect, useRef } from 'react';
import { AbsoluteFill, Composition, continueRender, delayRender, registerRoot, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import '../public/bruno-window.js';

const waitFor = (label, p) => { const h = delayRender(label); p.catch(e => console.error(e)).finally(() => continueRender(h)); };
if (typeof window !== 'undefined') {
  // The window's own family names, so it finds them loaded and draws with them.
  waitFor('fonts', Promise.all([
    ['BrunoRye', 'fonts/Rye-Regular.ttf'], ['BrunoTitan', 'fonts/TitanOne-Regular.ttf'], ['BrunoComic', 'fonts/ComicNeue-Bold.ttf'],
  ].map(([fam, f]) => new FontFace(fam, `url(${staticFile(f)})`).load().then(face => document.fonts.add(face)))));
  waitFor('art', new Promise(res => { const i = new Image(); i.onload = i.onerror = res; i.src = staticFile('bruno-art.webp'); }));
}

const INK = '#1c1512', PAPER = '#f6eacf', PAPER_D = '#e2cd9f', RED = '#b5322a', RED_D = '#7a1f1a', MUSTARD = '#e0a526', ORANGE = '#e87828', TEAL = '#3f7f7a';
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const seg = (p, a, b) => clamp((p - a) / (b - a));
const io = t => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const out = t => 1 - Math.pow(1 - t, 3);
const back = t => { const c = 1.9; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };
const lerp = (a, b, t) => a + (b - a) * t;
const RYE = 'BrunoRye, Georgia, serif', TITAN = 'BrunoTitan, Impact, sans-serif';
const stroke = (w, c = INK) => ({ WebkitTextStroke: `${w}px ${c}`, paintOrder: 'stroke fill' });

// ---------- pieces ----------
// His curtain, swaying, with the iris closing in at the corners.
function Curtain({ t, dim = 0 }) {
  const sway = Math.sin(t * 1.3) * 3;
  return (
    <AbsoluteFill style={{ background: RED_D }}>
      <AbsoluteFill style={{ left: sway - 20, right: -20, background: `repeating-linear-gradient(90deg, rgba(181,50,42,.95) 0 44px, rgba(181,50,42,0) 44px 80px)` }} />
      <AbsoluteFill style={{ left: sway - 20, right: -20, background: `repeating-linear-gradient(90deg, rgba(28,21,18,.28) 0 2px, transparent 2px 80px)` }} />
      <AbsoluteFill style={{ background: `rgba(28,21,18,${dim})` }} />
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 45%, transparent 42%, rgba(28,21,18,.62) 100%)' }} />
    </AbsoluteFill>
  );
}

// The valance along the top: mustard scallops.
function Valance({ w, drop }) {
  const n = Math.ceil(w / 64), sw = w / n;
  return (
    <svg width={w} height={70} style={{ position: 'absolute', left: 0, top: (drop - 1) * 80 }}>
      <rect x="0" y="0" width={w} height="28" fill={MUSTARD} />
      {Array.from({ length: n }).map((_, i) => <circle key={i} cx={sw * (i + .5)} cy="28" r={sw / 2} fill={MUSTARD} stroke={INK} strokeWidth="3" />)}
      <rect x="0" y="0" width={w} height="28" fill={MUSTARD} />
      <line x1="0" y1="28" x2={w} y2="28" stroke="rgba(28,21,18,.4)" strokeWidth="2" />
    </svg>
  );
}

function Sunburst({ size, spin, style }) {
  return (
    <div style={{ position: 'absolute', width: size, height: size, borderRadius: '50%', transform: `translate(-50%,-50%) rotate(${spin}deg)`,
      background: 'repeating-conic-gradient(from 0deg, rgba(224,165,38,.75) 0 9deg, rgba(232,120,40,.5) 9deg 18deg)',
      WebkitMaskImage: 'radial-gradient(circle, #000 30%, transparent 70%)', maskImage: 'radial-gradient(circle, #000 30%, transparent 70%)', ...style }} />
  );
}

// BRUNO in his title-card lettering: Rye, red, a mustard drop, fat ink. Each letter bobs.
function Title({ size, p0, p, t, style }) {
  const sw = size / 7, off = [size * .07, size * .09];
  return (
    <div style={{ position: 'absolute', display: 'flex', width: 'max-content', fontFamily: RYE, fontSize: size, lineHeight: 1, whiteSpace: 'nowrap', ...style }}>
      {'BRUNO'.split('').map((l, i) => {
        const a = seg(p, p0 + i * .016, p0 + i * .016 + .05), bob = Math.sin(t * 3 + i * .9) * size * .03;
        return (
          <span key={i} style={{ position: 'relative', display: 'inline-block', margin: `0 ${size * .01}px`, transform: `translateY(${(1 - out(a)) * -size * 2.4 + bob}px) rotate(${(1 - a) * (i % 2 ? 14 : -14)}deg)`, opacity: a > 0 ? 1 : 0 }}>
            <span style={{ position: 'absolute', left: off[0], top: off[1], color: MUSTARD, ...stroke(sw) }}>{l}</span>
            <span style={{ position: 'relative', color: RED, ...stroke(sw) }}>{l}</span>
          </span>
        );
      })}
    </div>
  );
}

function Guff({ size, style }) {
  return <div style={{ position: 'absolute', fontFamily: TITAN, fontSize: size, letterSpacing: '.06em', color: PAPER, whiteSpace: 'nowrap', width: 'max-content', ...stroke(size / 3.4), ...style }}>THE DRUMMER WHO TAKES NO GUFF</div>;
}

function Sticker({ text, size = 30, color = PAPER, style }) {
  return (
    <div style={{ position: 'absolute', fontFamily: TITAN, fontSize: size, lineHeight: 1, whiteSpace: 'nowrap', color: INK, background: color, border: `4px solid ${INK}`, borderRadius: 12, boxShadow: `5px 6px 0 ${INK}`, padding: `${size * .38}px ${size * .55}px ${size * .26}px`, ...style }}>
      {text}
    </div>
  );
}

function Balloon({ text, size, style }) {
  return (
    <div style={{ position: 'absolute', fontFamily: TITAN, fontSize: size, color: INK, whiteSpace: 'nowrap', background: '#fff', border: `4px solid ${INK}`, borderRadius: 999, padding: `${size * .45}px ${size * .8}px ${size * .35}px`, ...style }}>
      {text}
      <svg width="40" height="34" style={{ position: 'absolute', left: '30%', top: '100%', marginTop: -4, overflow: 'visible' }}><path d="M2 0 L30 0 L8 30 Z" fill="#fff" stroke={INK} strokeWidth="4" strokeLinejoin="round" /><rect x="4" y="-6" width="24" height="7" fill="#fff" /></svg>
    </div>
  );
}

// Bruno on his stage, as on the /bruno hero.
function Poster({ w, t, style }) {
  const h = w * 1.4;
  return (
    <div style={{ position: 'absolute', width: w, height: h, filter: `drop-shadow(${w * .03}px ${w * .035}px 0 ${INK})`, ...style }}>
      <div style={{ position: 'absolute', inset: 0, borderRadius: w * .05, border: `4px solid ${INK}`, overflow: 'hidden', background: RED_D }}>
        <div style={{ position: 'absolute', inset: 0, background: 'repeating-linear-gradient(90deg, rgba(181,50,42,.92) 0 16px, rgba(122,31,26,0) 16px 29px)' }} />
        <Sunburst size={w * 1.8} spin={t * 6} style={{ left: '50%', top: '44%' }} />
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: '17%', background: `#8a5a32 repeating-linear-gradient(180deg, transparent 0 13px, rgba(28,21,18,.5) 13px 15px)`, borderTop: `4px solid ${INK}` }} />
        <div style={{ position: 'absolute', left: '24%', right: '24%', bottom: '4.5%', height: '4%', borderRadius: '50%', background: 'rgba(28,21,18,.35)' }} />
        <img src={staticFile('bruno-art.webp')} style={{ position: 'absolute', left: '50%', bottom: '6%', height: '72%', transform: `translateX(-50%) scaleY(${1 + Math.sin(t * 9) * .012})`, transformOrigin: '50% 100%' }} />
        <Valance w={w} drop={1} />
      </div>
    </div>
  );
}

function Cursor({ x, y, s, down, hand }) {
  return (
    <svg width="60" height="60" viewBox="0 0 60 60" style={{ position: 'absolute', left: x, top: y, transform: `scale(${s})`, transformOrigin: '0 0', overflow: 'visible', zIndex: 50 }}>
      {down ? <circle cx="6" cy="4" r="16" fill="none" stroke={MUSTARD} strokeWidth="3" /> : null}
      {hand
        ? <path d="M8 4 v24 l-5-5 q-4 0 -2 5 l10 13 h16 l4-14 v-10 q0-4-4-4 q-2 0-3 2 q0-4-4-4 q-2 0-3 2 q0-4-4-4 q-2 0-2 2 v-7 q0-4-4-4 q-3 0-3 4z" fill="#fff" stroke="#000" strokeWidth="2.4" strokeLinejoin="round" />
        : <path d="M4 2 L4 34 L12 26 L18 40 L24 37 L18 24 L30 24 Z" fill="#fff" stroke="#000" strokeWidth="2.5" strokeLinejoin="round" />}
    </svg>
  );
}

// The take leaving for the DAW as a MIDI clip.
function Clip({ name, style }) {
  return (
    <div style={{ position: 'absolute', width: 280, height: 78, borderRadius: 8, background: '#7FB5CC', border: `3px solid ${INK}`, boxShadow: `5px 6px 0 ${INK}`, overflow: 'hidden', ...style }}>
      <div style={{ height: 24, background: '#5E93AB', fontFamily: TITAN, fontSize: 13, color: INK, padding: '6px 8px 0' }}>{name}</div>
      {Array.from({ length: 24 }).map((_, i) => <i key={i} style={{ position: 'absolute', left: 8 + i * 11, top: 32 + [3, 1, 2, 1][i % 4] * 9, width: 7, height: 5, borderRadius: 2, background: INK }} />)}
    </div>
  );
}

// The window, drawn every frame.
function Win({ st, transform, scale }) {
  const host = useRef(null), win = useRef(null);
  useLayoutEffect(() => {
    if (!win.current) win.current = window.BrunoWindow(host.current, { scale, art: staticFile('bruno-art.webp'), fonts: { rye: staticFile('fonts/Rye-Regular.ttf'), titan: staticFile('fonts/TitanOne-Regular.ttf'), comic: staticFile('fonts/ComicNeue-Bold.ttf') } });
    win.current.draw(st);
  });
  return (
    <div style={{ position: 'absolute', left: 0, top: 0, width: 1100, height: 736, transformOrigin: '0 0', transform, filter: `drop-shadow(10px 12px 0 ${INK})` }}>
      <div style={{ position: 'absolute', inset: -4, border: `4px solid ${INK}`, borderRadius: 14, overflow: 'hidden' }}>
        <div ref={host} style={{ position: 'absolute', left: 4, top: 4 }} />
      </div>
    </div>
  );
}

// ---------- the film ----------
// A camera: a rect of the window centred in the frame.
const cam = (vw, vh, r, m, oy = 0) => { const s = Math.min(vw / (r[2] + m * 2), vh / (r[3] + m * 2)); return { s, x: vw / 2 - (r[0] + r[2] / 2) * s, y: vh / 2 + oy - (r[1] + r[3] / 2) * s }; };
const mixCam = (a, b, t) => { const s = Math.exp(lerp(Math.log(a.s), Math.log(b.s), t)); return { s, x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t) }; };
const padAt = (x, y) => [334 + x * 334, 454 - y * 322];

function Teaser({ portrait }) {
  const frame = useCurrentFrame();
  const { durationInFrames, width: VW, height: VH, fps } = useVideoConfig();
  const p = frame / (durationInFrames - 1), t = frame / fps, P = portrait;
  const dur = durationInFrames / fps;

  // the window's story
  const T0 = .38, tStart = T0 * dur;
  const st = { time: t, playing: false, armed: false, section: 4, bpm: 176, x: .5, y: .3, fill: .35, variation: .3, follow: true, hover: null, press: null };
  if (p > .335 && p < T0) st.armed = true;
  if (p >= T0) { st.playing = true; st.pos = 36 + (t - tStart) * 176 / 60; }
  const n = Math.floor((st.pos || 36) / 4), take = [];
  if (st.playing) for (let b = 0; b <= n; b++) take.push([b, 4, b % 8 === 7]);
  st.takeBars = take;
  const mood = io(seg(p, .45, .53));
  st.x = lerp(.5, .84, mood); st.y = lerp(.3, .8, mood) + Math.sin(mood * Math.PI) * .06;
  st.fill = p < .7 ? lerp(.35, 1, io(seg(p, .58, .64))) : .5;
  if (p > .3 && p < .335) st.hover = 'play';
  if (p > .32 && p < .345) st.press = 'play';
  if (p > .7 && p < .73) st.hover = 'dragme';
  if (p > .72 && p < .8) st.press = 'dragme';

  // cameras (window coords)
  const full = cam(VW, VH, [0, 0, 1100, 736], P ? 14 : 40, P ? -30 : 6);
  const header = cam(VW, VH, P ? [700, 0, 400, 300] : [420, 0, 680, 330], P ? 8 : 20, 0);
  const moodC = cam(VW, VH, [296, 88, 396, 404], P ? 8 : 24, P ? -60 : 0);
  const fills = cam(VW, VH, P ? [690, 96, 404, 392] : [10, 90, 1084, 400], P ? 8 : 24, P ? -60 : 0);
  const takeC = cam(VW, VH, P ? [520, 470, 574, 150] : [8, 470, 1084, 150], P ? 8 : 24, P ? -60 : 0);
  let c = full;
  if (p >= .27 && p < .4) c = mixCam(full, header, io(seg(p, .27, .31)));
  else if (p >= .4 && p < .54) c = mixCam(header, moodC, io(seg(p, .4, .44)));
  else if (p >= .54 && p < .68) c = mixCam(moodC, fills, io(seg(p, .54, .58)));
  else if (p >= .68 && p < .8) c = mixCam(fills, takeC, io(seg(p, .68, .71)));
  else if (p >= .8) c = mixCam(takeC, full, io(seg(p, .8, .84)));
  // entrance and exit
  const enter = out(seg(p, .19, .29)), leave = io(seg(p, .82, .9));
  const ey = (1 - enter) * -VH * 1.2 + leave * VH * 1.25, rot = (1 - enter) * -8 + leave * 8;
  const transform = `translate(${c.x}px, ${c.y + ey}px) rotate(${rot}deg) scale(${c.s})`;

  // the cursor (window coords, through the camera)
  const toScreen = (x, y) => ({ x: c.x + x * c.s, y: c.y + ey + y * c.s });
  let cur = null;
  if (p > .27 && p < .38) { const u = io(seg(p, .27, .32)); cur = { ...toScreen(lerp(820, 1046, u), lerp(260, 52, u)), down: p > .32 && p < .345 }; }
  if (p > .42 && p < .54) {
    const u = io(seg(p, .42, .45)), from = [520, 420], puck = padAt(st.x, st.y);
    const at = p < .45 ? [lerp(from[0], padAt(.5, .3)[0], u), lerp(from[1], padAt(.5, .3)[1], u)] : puck;
    cur = { ...toScreen(at[0], at[1]), down: p > .45 && p < .53 };
  }
  if (p > .56 && p < .68) {
    const k = [796, 388], u = io(seg(p, .56, .58));
    const y = p < .58 ? lerp(470, k[1], u) : k[1] - 110 * (st.fill - .35);
    cur = { ...toScreen(k[0] + 12, y), down: p > .58 && p < .65 };
  }
  const dm = [989, 550], dragT = io(seg(p, .73, .79));
  if (p > .69 && p < .8) {
    const u = io(seg(p, .69, .72));
    const at = p < .73 ? [lerp(760, dm[0], u), lerp(600, dm[1], u)] : [dm[0], dm[1]];
    cur = { ...toScreen(at[0], at[1]), down: p > .72, hand: p > .73 };
  }
  // once grabbed, the hand and the clip leave the window together (screen space)
  const grab = toScreen(dm[0], dm[1]);
  const away = P ? { x: VW * .14, y: VH * .78 } : { x: VW * .52, y: VH * .82 };
  if (p > .73 && p < .8) cur = { x: lerp(grab.x, away.x, dragT), y: lerp(grab.y, away.y, dragT), down: true, hand: true };
  const clipOn = p > .735 && p < .82;

  // titles
  const titleOut = io(seg(p, .19, .26)), endIn = seg(p, .84, .93), posterIn = seg(p, .86, .96);
  const caps = [['HIT PLAY. HE COUNTS IN.', .3, .4, TEAL], ['MOVE HIS MOOD', .44, .54, PAPER], ['CRANK THE FILLS', .57, .68, ORANGE], ['DRAG THE TAKE INTO YOUR DAW', .71, .8, MUSTARD]];
  const cap = caps.find(([, a, b]) => p > a && p < b);
  const capPop = cap ? back(clamp((p - cap[1]) / .02)) : 0;
  const titleSize = P ? 150 : 176;

  return (
    <AbsoluteFill style={{ overflow: 'hidden', background: RED_D }}>
      <Curtain t={t} dim={p > .2 && p < .86 ? .25 * seg(p, .2, .28) * (1 - seg(p, .8, .86)) : 0} />
      {/* opener */}
      {p < .3 ? (
        <AbsoluteFill style={{ transform: `translateY(${-titleOut * VH * .8}px)`, opacity: 1 - titleOut * .6 }}>
          <Sunburst size={P ? 1500 : 1600} spin={t * 8} style={{ left: '50%', top: P ? '40%' : '46%', opacity: out(seg(p, 0, .06)) }} />
          <Title size={titleSize} p0={.03} p={p} t={t} style={{ left: '50%', top: P ? VH * .29 : VH * .22, transform: 'translateX(-50%)' }} />
          <Guff size={P ? 30 : 36} style={{ left: '50%', top: P ? VH * .29 + titleSize * 1.12 : VH * .22 + titleSize * 1.1, transform: `translateX(-50%) translateY(${(1 - out(seg(p, .12, .17))) * VH}px) rotate(-1.5deg)` }} />
          {/* Bruno pops up to have his say */}
          <img src={staticFile('bruno-art.webp')} style={{ position: 'absolute', height: P ? 520 : 340, left: P ? VW * .5 - 190 : VW - 290, bottom: -30, transform: `translateY(${(1 - back(seg(p, .1, .16))) * 520}px)` }} />
          {p > .14 ? <Balloon text="QUIT STALLIN'!" size={P ? 30 : 26} style={P ? { left: 40, bottom: 440, transform: `scale(${back(seg(p, .14, .17))}) rotate(-3deg)` } : { right: 270, bottom: 130, transform: `scale(${back(seg(p, .14, .17))}) rotate(-3deg)`, transformOrigin: '100% 100%' }} /> : null}
        </AbsoluteFill>
      ) : null}
      {/* the window */}
      {p > .18 && p < .92 ? <Win st={st} transform={transform} scale={2.5} /> : null}
      {clipOn ? (
        <Clip name={`Bruno bars 1-${n + 1}`} style={{ left: lerp(grab.x, away.x, dragT) + 18, top: lerp(grab.y, away.y, dragT) + 16, transform: `rotate(${lerp(0, -6, dragT)}deg) scale(${lerp(.55, 1.05, out(dragT))})`, transformOrigin: '0 0', opacity: p > .79 ? 1 - seg(p, .79, .82) : 1 }} />
      ) : null}
      {cur ? <Cursor x={cur.x} y={cur.y} s={P ? 1.4 : 1.5} down={cur.down} hand={cur.hand} /> : null}
      {cap ? (
        <Sticker text={cap[0]} size={P ? 30 : 34} color={cap[3]}
          style={P ? { left: '50%', top: VH * .8, transform: `translateX(-50%) rotate(-3deg) scale(${capPop})` } : { left: 60, top: VH - 140, transform: `rotate(-3deg) scale(${capPop})`, transformOrigin: '0 100%' }} />
      ) : null}
      {/* finish */}
      {p > .82 ? (
        <AbsoluteFill>
          <Sunburst size={P ? 1300 : 1400} spin={t * 8} style={{ left: P ? '50%' : '70%', top: P ? '30%' : '42%', opacity: out(seg(p, .82, .9)) * .8 }} />
          <Poster w={P ? 290 : 320} t={t} style={P ? { left: (VW - 290) / 2, top: 96, transform: `rotate(${-3 + (1 - posterIn) * 20}deg) translateY(${(1 - out(posterIn)) * -900}px)` } : { left: VW - 450, top: 52, transform: `rotate(${3 + (1 - posterIn) * 18}deg) translateX(${(1 - out(posterIn)) * 700}px)` }} />
          <Title size={P ? 130 : 156} p0={.83} p={p} t={t} style={P ? { left: '50%', top: 560, transform: 'translateX(-50%)' } : { left: 70, top: 140 }} />
          <Guff size={P ? 26 : 30} style={P ? { left: '50%', top: 720, transform: `translateX(-50%) rotate(-1.5deg) translateY(${(1 - out(seg(p, .9, .96))) * 400}px)` } : { left: 82, top: 340, transform: `rotate(-1.5deg) translateX(${(1 - out(seg(p, .9, .96))) * -900}px)` }} />
        </AbsoluteFill>
      ) : null}
      <Valance w={VW} drop={p < .2 ? out(seg(p, 0, .05)) : 1} />
    </AbsoluteFill>
  );
}

const fps = 30;
const durationInFrames = 270;

function Root() {
  return (
    <>
      <Composition id="BrunoDesk" component={Teaser} durationInFrames={durationInFrames} fps={fps} width={1280} height={720} defaultProps={{ portrait: false }} />
      <Composition id="BrunoPort" component={Teaser} durationInFrames={durationInFrames} fps={fps} width={720} height={1280} defaultProps={{ portrait: true }} />
    </>
  );
}

registerRoot(Root);

import React from 'react';
import { AbsoluteFill, Composition, Img, continueRender, delayRender, registerRoot, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';

if (typeof FontFace !== 'undefined') {
  const fontsReady = delayRender('fonts');
  Promise.all([
    new FontFace('Titan One', `url(${staticFile('fonts/TitanOne-Regular.ttf')})`).load(),
    new FontFace('Comic Neue', `url(${staticFile('fonts/ComicNeue-Bold.ttf')})`, { weight: '700' }).load(),
  ]).then((faces) => {
    faces.forEach((face) => document.fonts.add(face));
    continueRender(fontsReady);
  }).catch((err) => {
    console.error(err);
    continueRender(fontsReady);
  });
}

const INK = '#1A1220';
const SLIME = '#8FDC2C';
const CREAM = '#FFF6DC';
const PAPER = '#FFF6DC';
const YELLOW = '#F7D21E';
const PINK = '#FFCDE3';
const RED = '#E82D2D';
const BLUE = '#2472D8';
const PURPLE = '#7C40C6';
const CONCRETE = '#8C949B';

const GROOVES = [
  ['dusty-break-126.mid', '126'],
  ['98bpmWrathBeat8.mid', '98'],
  ['107bpm6-4SymbolismBeat2.mid', '107'],
  ['107bpm6-4SymbolismBeat4.mid', '107'],
  ['107bpm6-4SymbolismBeat6.mid', '107'],
  ['107bpm6-4SymbolismBeat8.mid', '107'],
];

const LANES = [
  ['CRASH', BLUE, [0.08]],
  ['SPLASH', '#5BA4FF', [0.22]],
  ['HAT OPEN', YELLOW, [0, 0.125, 0.25, 0.375, 0.5, 0.625, 0.75, 0.875]],
  ['SNARE', '#F08A3A', [0.25, 0.75]],
  ['KICK', RED, [0.05, 0.5]],
];

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const seg = (p, a, b) => clamp((p - a) / (b - a));

const display = { fontFamily: 'Titan One, Impact, sans-serif', fontWeight: 400 };
const body = { fontFamily: 'Comic Neue, Comic Sans MS, sans-serif', fontWeight: 700 };

function drips(h, short) {
  const bumps = [6, 18, 29, 41, 54, 67, 79, 91];
  const bumpH = (i) => (short ? 10 + (i % 3) * 3 : 16 + (i % 4) * 6);
  const tallest = short ? 16 : 34;
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: h + tallest, zIndex: 6, pointerEvents: 'none' }}>
      <div style={{ height: h, background: SLIME, borderBottom: `3px solid ${INK}` }} />
      {bumps.map((x, i) => (
        <div key={x} style={{ position: 'absolute', left: `${x}%`, top: h - 2, width: short ? 12 + (i % 3) * 4 : 14 + (i % 3) * 8, height: bumpH(i), borderRadius: '0 0 16px 16px', background: SLIME, border: `3px solid ${INK}`, borderTop: 'none' }} />
      ))}
    </div>
  );
}

function Pill({ children, bg, color = '#fff', style }) {
  return (
    <div style={{ ...display, display: 'flex', alignItems: 'center', justifyContent: 'center', background: bg, color, border: `3px solid ${INK}`, borderRadius: 999, boxShadow: `3px 3px 0 ${INK}`, letterSpacing: 0.4, ...style }}>
      {children}
    </div>
  );
}

function Window({ p, portrait }) {
  const typing = seg(p, 0.12, 0.28);
  const typed = p < 0.34 ? 'break'.slice(0, Math.round(typing * 5)) : '';
  const showBreak = typed.length > 0;
  const sel = p < 0.36 ? 0 : p < 0.5 ? 1 : 2;
  const playing = p > 0.32;
  const head = playing ? (p * 3.1) % 1 : 0.08;
  const muted = p > 0.55 ? 2 : -1;
  const tempo = p < 0.62 ? 'FILE' : p < 0.7 ? 'SET' : 'HOST';
  const launch = p > 0.74;
  const port = p > 0.82;
  const kit = p < 0.72 ? 'DRUMS' : p < 0.9 ? 'OFF' : 'FARTS';
  const enter = 1;
  const rows = GROOVES.filter((g, i) => !showBreak || i === 0 || g[0].includes('break'));
  const groove = GROOVES[showBreak ? 0 : sel];

  const shell = portrait
    ? { width: 600, height: 1120 }
    : { width: 1200, height: 660 };

  const titleSize = portrait ? 28 : 34;
  // Desktop columns: browser | Now Sniffing | tempo/output/kit. The card used to share the browser's x and cover it.
  const cols = portrait
    ? { dump: [14, 160, 572, 250], card: [14, 422, 572, 390], side: [14, 824, 572, 280] }
    : { dump: [16, 158, 292, 486], card: [320, 158, 500, 486], side: [832, 158, 352, 486] };

  return (
    <div style={{ ...shell, ...body, position: 'relative', background: CONCRETE, borderRadius: 22, border: `4px solid ${INK}`, boxShadow: `8px 8px 0 ${INK}`, overflow: 'hidden', color: INK, transform: `scale(${0.98 + enter * 0.02})`, opacity: enter, backgroundImage: 'radial-gradient(rgba(255,255,255,.22) 0.7px, transparent 0.8px), radial-gradient(rgba(0,0,0,.18) 0.7px, transparent 0.8px)', backgroundSize: '5px 6px, 9px 11px' }}>
      {drips(portrait ? 14 : 8, !portrait)}

      <div style={{ position: 'absolute', left: 16, top: portrait ? 28 : 40, right: portrait ? 118 : 168 }}>
        <div style={{ ...display, fontSize: titleSize, lineHeight: 0.9, color: YELLOW, WebkitTextStroke: `6px ${INK}`, paintOrder: 'stroke fill' }}>MIDI FART SNIFFER</div>
        <div style={{ marginTop: 6, display: 'inline-flex', alignItems: 'center', height: 26, padding: '0 10px', background: RED, color: '#fff', border: `3px solid ${INK}`, borderRadius: 8, boxShadow: `3px 3px 0 ${INK}`, ...display, fontSize: 12, letterSpacing: 0.6 }}>SNIFF OUT A GROOVE</div>
      </div>

      <div style={{ position: 'absolute', right: 16, top: portrait ? 22 : 36, width: portrait ? 96 : 124, background: CREAM, border: `3px solid ${INK}`, borderRadius: 12, boxShadow: `4px 4px 0 ${INK}`, overflow: 'hidden' }}>
        <Img src={staticFile('sid.webp')} style={{ width: '100%', height: portrait ? 72 : 72, objectFit: 'cover', objectPosition: 'center 20%', display: 'block' }} />
        <div style={{ ...display, textAlign: 'center', fontSize: 10, letterSpacing: 0.6, background: INK, color: YELLOW, padding: '3px 0 2px' }}>SNIFFIN' SID</div>
      </div>

      <div style={{ position: 'absolute', left: 16, top: portrait ? 108 : 112, display: 'flex', gap: 8 }}>
        <Pill bg={SLIME} color={INK} style={{ height: 36, padding: '0 14px', fontSize: 14 }}>▶ RIP IT</Pill>
        <Pill bg={CREAM} color={INK} style={{ height: 36, padding: '0 14px', fontSize: 14 }}><i style={{ width: 12, height: 12, background: RED, border: `2px solid ${INK}`, marginRight: 6 }} />HOLD IT</Pill>
        <Pill bg={BLUE} style={{ height: 32, padding: '0 12px', fontSize: 12, alignSelf: 'center' }}>✓ LOOP</Pill>
        <Pill bg={PURPLE} style={{ height: 32, padding: '0 12px', fontSize: 12, alignSelf: 'center' }}>✓ AUTO</Pill>
      </div>

      <Dump x={cols.dump[0]} y={cols.dump[1]} w={cols.dump[2]} h={cols.dump[3]} rows={rows} typed={typed} showBreak={showBreak} sel={sel} />

      <Card x={cols.card[0]} y={cols.card[1]} w={cols.card[2]} h={cols.card[3]} groove={groove} head={head} muted={muted} playing={playing} portrait={portrait} />

      <Side x={cols.side[0]} y={cols.side[1]} w={cols.side[2]} h={cols.side[3]} portrait={portrait} tempo={tempo} launch={launch} port={port} kit={kit} />
    </div>
  );
}

function Dump({ x, y, w, h, rows, typed, showBreak, sel }) {
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: w, height: h, background: CREAM, border: `3px solid ${INK}`, borderRadius: 16, boxShadow: `5px 5px 0 ${INK}`, padding: 10, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ ...display, fontSize: 13, background: SLIME, color: INK, border: `2px solid ${INK}`, borderRadius: 999, padding: '3px 8px' }}>DUMPSTER</span>
        <span style={{ ...display, fontSize: 13, background: PAPER, border: `2px solid ${INK}`, borderRadius: 999, padding: '3px 8px' }}>FAVES</span>
        <span style={{ marginLeft: 'auto', ...display, fontSize: 12 }}>▲ OPEN</span>
      </div>
      <div style={{ marginTop: 8, height: 32, borderRadius: 999, border: `3px solid ${INK}`, background: PAPER, display: 'flex', alignItems: 'center', padding: '0 12px', color: typed ? INK : '#8a7d68', fontSize: 14 }}>{typed || 'sniff for a groove...'}</div>
      <div style={{ marginTop: 8, display: 'grid', gap: 6 }}>
        {rows.slice(0, 6).map((g) => {
          const on = GROOVES.indexOf(g) === (showBreak ? 0 : sel);
          return (
            <div key={g[0]} style={{ display: 'flex', alignItems: 'center', gap: 8, height: 32, padding: '0 8px', borderRadius: 10, border: `2px solid ${INK}`, background: on ? SLIME : PAPER, boxShadow: on ? `3px 3px 0 ${INK}` : 'none', fontSize: 13 }}>
              <i style={{ width: 10, height: 10, borderRadius: 10, background: on ? INK : BLUE, border: `2px solid ${INK}`, flex: 'none' }} />
              <span style={{ overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{g[0]}</span>
              <span style={{ marginLeft: 'auto' }}>{g[1]}</span>
            </div>
          );
        })}
      </div>
      <div style={{ marginTop: 'auto', paddingTop: 8, display: 'flex', justifyContent: 'space-between', gap: 8, fontSize: 12, lineHeight: 1.25 }}><span>675 grooves</span><span>Drag a groove into your DAW</span></div>
    </div>
  );
}

function Card({ x, y, w, h, groove, head, muted, playing, portrait }) {
  const laneH = portrait ? 46 : 52;
  const top = portrait ? 46 : 52;
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: w, height: h, background: YELLOW, border: `4px solid ${INK}`, borderRadius: 18, boxShadow: `5px 5px 0 ${INK}`, overflow: 'hidden' }}>
      <div style={{ position: 'absolute', left: -6, top: -4, width: 46, height: 46, background: YELLOW, color: INK, display: 'grid', placeItems: 'center', ...display, fontSize: 13, clipPath: 'polygon(50% 0, 63% 18%, 84% 10%, 78% 32%, 100% 40%, 80% 54%, 96% 74%, 72% 72%, 70% 96%, 50% 82%, 30% 96%, 28% 72%, 4% 74%, 20% 54%, 0 40%, 22% 32%, 16% 10%, 37% 18%)', filter: `drop-shadow(2px 2px 0 ${INK})` }}>16b</div>
      <div style={{ ...display, color: INK, fontSize: portrait ? 16 : 18, letterSpacing: 1, padding: '12px 14px 0', textAlign: 'center' }}>NOW SNIFFING</div>
      <div style={{ position: 'absolute', right: 12, top: 10, width: 28, height: 28, borderRadius: 8, background: '#fff', border: `2px solid ${INK}`, display: 'grid', placeItems: 'center', ...display, fontSize: 14 }}>★</div>
      <div style={{ position: 'absolute', left: 12, right: 12, top, bottom: portrait ? 78 : 86, background: PINK, border: `3px solid ${INK}`, borderRadius: 12, overflow: 'hidden', backgroundImage: 'repeating-linear-gradient(90deg, transparent 0, transparent calc(16.66% - 2px), rgba(28,20,12,.28) calc(16.66% - 2px), rgba(28,20,12,.28) 16.66%)' }}>
        {LANES.map((lane, i) => (
          <div key={lane[0]} style={{ position: 'absolute', left: 4, right: 4, top: 8 + i * laneH, height: laneH - 6, opacity: muted === i ? 0.35 : 1, background: lane[0] === 'KICK' ? RED : 'transparent', borderRadius: 8, color: lane[0] === 'KICK' ? '#fff' : INK }}>
            <div style={{ position: 'absolute', left: 6, top: 6, width: 70, fontSize: 11, textDecoration: muted === i ? 'line-through' : 'none' }}>{lane[0]}</div>
            <div style={{ position: 'absolute', left: 72, right: 10, top: 16, height: 3, background: 'rgba(28,20,12,.18)', borderRadius: 2 }} />
            {lane[2].map((hit) => {
              const near = playing && Math.min(Math.abs(hit - head), 1 - Math.abs(hit - head)) < 0.05;
              const s = near ? 16 : 11;
              return <div key={hit} style={{ position: 'absolute', left: `calc(72px + (100% - 86px) * ${hit})`, top: near ? 6 : 10, width: s, height: s, marginLeft: -s / 2, borderRadius: 20, background: lane[1], border: `2px solid ${INK}` }} />;
            })}
          </div>
        ))}
        <div style={{ position: 'absolute', top: 0, bottom: 0, left: `calc(72px + (100% - 86px) * ${head})`, width: 3, background: '#C6E000', boxShadow: `0 0 0 2px ${INK}` }} />
      </div>
      <div style={{ position: 'absolute', left: 12, right: 12, bottom: portrait ? 58 : 64, height: 28, background: '#fff', border: `3px solid ${INK}`, borderRadius: 8, display: 'flex', alignItems: 'center', padding: '0 8px', ...display, fontSize: 12 }}>
        <span style={{ ...body, fontSize: 12, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{groove[0].replace('.mid', '')}</span>
        <span style={{ marginLeft: 'auto', background: INK, color: '#fff', borderRadius: 6, padding: '2px 6px', fontSize: 10 }}>DRAG ME</span>
      </div>
      <div style={{ position: 'absolute', left: 12, right: 12, bottom: portrait ? 36 : 40, display: 'flex', gap: 4, justifyContent: 'center' }}>
        {[`${groove[1]} BPM`, '4/4', '6 BARS', '106 HITS', 'CH 1'].map((bit) => (
          <span key={bit} style={{ background: INK, color: '#fff', borderRadius: 999, padding: '2px 6px', fontSize: 9 }}>{bit}</span>
        ))}
      </div>
      <div style={{ position: 'absolute', left: 12, right: 12, bottom: 12, height: 16, borderRadius: 999, background: '#E7D7A4', border: `2px solid ${INK}`, overflow: 'hidden' }}>
        <div style={{ width: `${Math.round(head * 100)}%`, height: '100%', background: `linear-gradient(90deg, ${SLIME}, #3CB043)` }} />
      </div>
    </div>
  );
}

function Mini({ children, on, bg, color = INK }) {
  return <span style={{ ...display, fontSize: 11, padding: '4px 8px', borderRadius: 8, border: `2px solid ${INK}`, background: on ? (bg || BLUE) : PAPER, color: on ? color : INK }}>{children}</span>;
}

function Side({ x, y, w, h, portrait, tempo, port, kit }) {
  const send = port ? 'VIRTUAL PORT' : 'NOWHERE ELSE';
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: w, height: h, display: 'grid', gridTemplateRows: '1.15fr 1.15fr 0.9fr', gap: 8 }}>
      <div style={{ background: CREAM, border: `3px solid ${INK}`, borderRadius: 14, boxShadow: `4px 4px 0 ${INK}`, padding: 8 }}>
        <div style={{ ...display, fontSize: 13 }}>TEMPO</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
          <Mini on={tempo === 'FILE' || tempo === 'HOST'} bg={BLUE} color="#fff">{tempo === 'HOST' ? 'HOST' : 'FILE'}</Mini>
          <Mini on={tempo === 'SET'} bg={SLIME}>SET</Mini>
          <span style={{ marginLeft: 'auto', fontSize: 11 }}>TIME</span>
          <Mini>HALF</Mini>
          <Mini on bg={BLUE} color="#fff">1X</Mini>
          <Mini>2X</Mini>
        </div>
        <div style={{ marginTop: 6, background: '#fff', border: `3px solid ${INK}`, borderRadius: 10, textAlign: 'center', ...display, fontSize: portrait ? 18 : 22 }}>107.0</div>
      </div>
      <div style={{ background: CREAM, border: `3px solid ${INK}`, borderRadius: 14, boxShadow: `4px 4px 0 ${INK}`, padding: 8 }}>
        <div style={{ ...display, fontSize: 13 }}>OUTPUT</div>
        <div style={{ display: 'flex', gap: 8, marginTop: 6, alignItems: 'center' }}>
          <Mini on bg="#fff">FILE</Mini>
          <span style={{ fontSize: 11 }}>VELOCITY 100%</span>
          <span style={{ flex: 1, height: 10, borderRadius: 99, background: '#E7D7A4', border: `2px solid ${INK}`, overflow: 'hidden' }}><i style={{ display: 'block', width: '70%', height: '100%', background: '#F2A7C8' }} /></span>
        </div>
        <div style={{ marginTop: 8, fontSize: 11 }}>ALSO SEND TO</div>
        <div style={{ marginTop: 4, background: '#fff', border: `2px solid ${INK}`, borderRadius: 8, padding: '4px 8px', fontSize: 12 }}>{send}</div>
        <div style={{ marginTop: 4, fontSize: 10 }}>The host gets the MIDI either way.</div>
      </div>
      <div style={{ background: CREAM, border: `3px solid ${INK}`, borderRadius: 14, boxShadow: `4px 4px 0 ${INK}`, padding: 8 }}>
        <div style={{ ...display, fontSize: 13 }}>PREVIEW KIT</div>
        <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
          <Mini on={kit === 'OFF'}>OFF</Mini>
          <Mini on={kit === 'DRUMS'} bg={SLIME}>DRUMS</Mini>
          <Mini on={kit === 'FARTS'} bg={SLIME}>FARTS</Mini>
        </div>
        <div style={{ marginTop: 6, fontSize: 11 }}>VOLUME −3.0 dB</div>
      </div>
    </div>
  );
}

function Teaser({ portrait }) {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const p = frame / (durationInFrames - 1);
  return (
    <AbsoluteFill style={{ background: CONCRETE, alignItems: 'center', justifyContent: 'center', backgroundImage: 'radial-gradient(rgba(255,255,255,.2) 0.7px, transparent 0.8px), radial-gradient(rgba(0,0,0,.16) 0.7px, transparent 0.8px)', backgroundSize: '5px 6px, 8px 11px' }}>
      <Window p={p} portrait={portrait} />
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

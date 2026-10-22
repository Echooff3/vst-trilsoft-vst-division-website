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

const INK = '#1C140C';
const SLIME = '#7CFF3A';
const CREAM = '#F6E7C1';
const PAPER = '#FFF6DE';
const YELLOW = '#FFE14A';
const PURPLE = '#7A3EE0';
const PINK = '#F7C4D8';
const RED = '#E23B3B';
const GREEN = '#3CB043';
const CONCRETE = '#8E918A';

const GROOVES = [
  ['dusty-break-126.mid', '126'],
  ['alley-shuffle.mid', '98'],
  ['can-lid-funk.mid', '110'],
  ['sids-backbeat.mid', '104'],
  ['dumpster-16ths.mid', '128'],
  ['rotten-clave.mid', '100'],
];

const LANES = [
  ['KICK', '#E23B3B', [0.05, 0.5]],
  ['SNARE', '#F08A3A', [0.25, 0.75]],
  ['HAT', '#E6B325', [0, 0.12, 0.25, 0.37, 0.5, 0.62, 0.75, 0.87]],
  ['TOM', '#E070B0', [0.62]],
  ['CLAP', '#6A3CC4', [0.25, 0.75]],
];

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const seg = (p, a, b) => clamp((p - a) / (b - a));

const display = { fontFamily: 'Titan One, Impact, sans-serif', fontWeight: 400 };
const body = { fontFamily: 'Comic Neue, Comic Sans MS, sans-serif', fontWeight: 700 };

function drips(h) {
  const bumps = [6, 18, 29, 41, 54, 67, 79, 91];
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: h + 26, zIndex: 6, pointerEvents: 'none' }}>
      <div style={{ height: h, background: SLIME, borderBottom: `3px solid ${INK}` }} />
      {bumps.map((x, i) => (
        <div key={x} style={{ position: 'absolute', left: `${x}%`, top: h - 2, width: 14 + (i % 3) * 8, height: 16 + (i % 4) * 6, borderRadius: '0 0 20px 20px', background: SLIME, border: `3px solid ${INK}`, borderTop: 'none' }} />
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
  const kit = p < 0.9 ? 'OFF' : 'FARTS';
  const enter = 1;
  const rows = GROOVES.filter((g, i) => !showBreak || i === 0 || g[0].includes('break'));
  const groove = GROOVES[showBreak ? 0 : sel];

  const shell = portrait
    ? { width: 600, height: 1120 }
    : { width: 1100, height: 640 };

  const titleSize = portrait ? 28 : 34;

  return (
    <div style={{ ...shell, ...body, position: 'relative', background: CONCRETE, borderRadius: 22, border: `4px solid ${INK}`, boxShadow: `8px 8px 0 ${INK}`, overflow: 'hidden', color: INK, transform: `scale(${0.98 + enter * 0.02})`, opacity: enter, backgroundImage: 'radial-gradient(rgba(255,255,255,.22) 0.7px, transparent 0.8px), radial-gradient(rgba(0,0,0,.18) 0.7px, transparent 0.8px)', backgroundSize: '5px 6px, 9px 11px' }}>
      {drips(portrait ? 14 : 12)}

      <div style={{ position: 'absolute', left: 16, top: portrait ? 28 : 22, right: portrait ? 118 : 140 }}>
        <div style={{ ...display, fontSize: titleSize, lineHeight: 0.9, color: YELLOW, WebkitTextStroke: '6px #1C140C', paintOrder: 'stroke fill' }}>MIDI FART SNIFFER</div>
        <div style={{ marginTop: 6, display: 'inline-flex', alignItems: 'center', height: 26, padding: '0 10px', background: RED, color: '#fff', border: `3px solid ${INK}`, borderRadius: 8, boxShadow: `3px 3px 0 ${INK}`, ...display, fontSize: 12, letterSpacing: 0.6 }}>SNIFF OUT A GROOVE</div>
      </div>

      <div style={{ position: 'absolute', right: 14, top: portrait ? 22 : 20, width: portrait ? 96 : 112, background: CREAM, border: `3px solid ${INK}`, borderRadius: 12, boxShadow: `4px 4px 0 ${INK}`, overflow: 'hidden' }}>
        <Img src={staticFile('sid.webp')} style={{ width: '100%', height: portrait ? 72 : 78, objectFit: 'cover', objectPosition: 'center 20%', display: 'block' }} />
        <div style={{ ...display, textAlign: 'center', fontSize: 10, letterSpacing: 0.6, background: INK, color: YELLOW, padding: '3px 0 2px' }}>SNIFFIN' SID</div>
      </div>

      <div style={{ position: 'absolute', left: 16, top: portrait ? 108 : 96, display: 'flex', gap: 8 }}>
        <Pill bg={playing ? GREEN : SLIME} style={{ height: 36, padding: '0 14px', fontSize: 14, color: INK }}>▶ RIP IT</Pill>
        <Pill bg={RED} style={{ height: 36, padding: '0 14px', fontSize: 14 }}>■ HOLD IT</Pill>
        <Pill bg={CREAM} color={INK} style={{ height: 32, padding: '0 12px', fontSize: 12, alignSelf: 'center' }}>✓ LOOP</Pill>
        <Pill bg={CREAM} color={INK} style={{ height: 32, padding: '0 12px', fontSize: 12, alignSelf: 'center' }}>✓ AUTO</Pill>
      </div>

      <Dump x={14} y={portrait ? 160 : 148} w={portrait ? 572 : 268} h={portrait ? 250 : 476} rows={rows} typed={typed} showBreak={showBreak} sel={sel} />

      <Card x={14} y={portrait ? 422 : 148} w={portrait ? 572 : 470} h={portrait ? 390 : 476} groove={groove} head={head} muted={muted} playing={playing} portrait={portrait} />

      <Side x={portrait ? 14 : 760} y={portrait ? 824 : 148} w={portrait ? 572 : 326} h={portrait ? 280 : 476} portrait={portrait} tempo={tempo} launch={launch} port={port} kit={kit} />
    </div>
  );
}

function Dump({ x, y, w, h, rows, typed, showBreak, sel }) {
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: w, height: h, background: CREAM, border: `3px solid ${INK}`, borderRadius: 16, boxShadow: `5px 5px 0 ${INK}`, padding: 10, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ ...display, fontSize: 13, background: GREEN, color: '#fff', border: `2px solid ${INK}`, borderRadius: 999, padding: '3px 8px' }}>DUMPSTER</span>
        <span style={{ ...display, fontSize: 13, background: PAPER, border: `2px solid ${INK}`, borderRadius: 999, padding: '3px 8px' }}>FAVES</span>
        <span style={{ marginLeft: 'auto', ...display, fontSize: 12 }}>▲ OPEN</span>
      </div>
      <div style={{ marginTop: 8, height: 32, borderRadius: 999, border: `3px solid ${INK}`, background: PAPER, display: 'flex', alignItems: 'center', padding: '0 12px', color: typed ? INK : '#8a7d68', fontSize: 14 }}>{typed || 'sniff for a groove...'}</div>
      <div style={{ marginTop: 8, display: 'grid', gap: 6 }}>
        {rows.slice(0, 6).map((g) => {
          const on = GROOVES.indexOf(g) === (showBreak ? 0 : sel);
          return (
            <div key={g[0]} style={{ display: 'flex', alignItems: 'center', gap: 8, height: 32, padding: '0 8px', borderRadius: 10, border: `2px solid ${INK}`, background: on ? '#d7f5c4' : PAPER, boxShadow: on ? `3px 3px 0 ${INK}` : 'none', fontSize: 13 }}>
              <i style={{ width: 10, height: 10, borderRadius: 10, background: on ? GREEN : '#3B6FE0', border: `2px solid ${INK}`, flex: 'none' }} />
              <span style={{ overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{g[0]}</span>
              <span style={{ marginLeft: 'auto' }}>{g[1]}</span>
            </div>
          );
        })}
      </div>
      <div style={{ marginTop: 'auto', paddingTop: 8, fontSize: 12, lineHeight: 1.25 }}>675 grooves<br />Up/Down sniffs the next one</div>
    </div>
  );
}

function Card({ x, y, w, h, groove, head, muted, playing, portrait }) {
  const laneH = portrait ? 46 : 52;
  const top = portrait ? 46 : 52;
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: w, height: h, background: PURPLE, border: `4px solid ${INK}`, borderRadius: 18, boxShadow: `5px 5px 0 ${INK}`, overflow: 'hidden' }}>
      <div style={{ ...display, color: '#fff', fontSize: portrait ? 16 : 18, letterSpacing: 1, padding: '10px 14px 0' }}>NOW SNIFFING</div>
      <div style={{ position: 'absolute', right: 12, top: 10, width: 28, height: 28, borderRadius: 8, background: YELLOW, border: `2px solid ${INK}`, display: 'grid', placeItems: 'center', ...display, fontSize: 14 }}>★</div>
      <div style={{ position: 'absolute', left: 12, right: 12, top, bottom: portrait ? 78 : 86, background: PINK, border: `3px solid ${INK}`, borderRadius: 12, overflow: 'hidden', backgroundImage: 'repeating-linear-gradient(90deg, transparent 0, transparent calc(16.66% - 2px), rgba(28,20,12,.28) calc(16.66% - 2px), rgba(28,20,12,.28) 16.66%)' }}>
        {LANES.map((lane, i) => (
          <div key={lane[0]} style={{ position: 'absolute', left: 0, right: 0, top: 8 + i * laneH, height: laneH - 6, opacity: muted === i ? 0.35 : 1 }}>
            <div style={{ position: 'absolute', left: 6, top: 8, width: 62, fontSize: 11, textDecoration: muted === i ? 'line-through' : 'none' }}>{lane[0]}</div>
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
      <div style={{ position: 'absolute', left: 12, right: 12, bottom: portrait ? 40 : 44, height: 32, background: YELLOW, border: `3px solid ${INK}`, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 10px', ...display, fontSize: 13 }}>
        <span>DRAG ME</span>
        <span style={{ ...body, fontSize: 12, maxWidth: '62%', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{groove[0].replace('.mid', '')}</span>
      </div>
      <div style={{ position: 'absolute', left: 12, right: 12, bottom: 12, height: 16, borderRadius: 999, background: INK, overflow: 'hidden' }}>
        <div style={{ width: `${Math.round(head * 100)}%`, height: '100%', background: `linear-gradient(90deg, #C6FF4A, ${GREEN})` }} />
      </div>
    </div>
  );
}

function Side({ x, y, w, h, portrait, tempo, launch, port, kit }) {
  const items = [
    ['TEMPO', tempo, tempo === 'HOST'],
    ['LAUNCH', launch ? 'BAR' : 'NOW', launch],
    ['ALSO SEND TO', port ? 'VIRTUAL PORT' : 'OFF', port],
    ['PREVIEW KIT', kit, kit === 'FARTS'],
  ];
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: w, height: h, display: 'grid', gridTemplateColumns: portrait ? '1fr 1fr' : '1fr', gridTemplateRows: portrait ? '1fr 1fr' : '1fr 1fr 1fr 1fr', gap: 8 }}>
      {items.map(([label, value, hot]) => (
        <div key={label} style={{ background: CREAM, border: `3px solid ${INK}`, borderRadius: 14, boxShadow: `4px 4px 0 ${INK}`, padding: '8px 10px 10px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ fontSize: 11, letterSpacing: 0.8 }}>{label}</div>
          <div style={{ marginTop: 6, ...display, fontSize: portrait ? 16 : 18, background: hot ? SLIME : PAPER, border: `3px solid ${INK}`, borderRadius: 10, padding: '6px 8px', boxShadow: `2px 2px 0 ${INK}` }}>{value}</div>
        </div>
      ))}
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

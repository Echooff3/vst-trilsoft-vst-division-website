import React from 'react';
import { AbsoluteFill, Composition, continueRender, delayRender, registerRoot, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';

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

const GROOVES = [
  ['dusty-break-126.mid', '126'],
  ['alley-shuffle.mid', '98'],
  ['can-lid-funk.mid', '110'],
  ['sids-backbeat.mid', '104'],
  ['dumpster-16ths.mid', '128'],
  ['rotten-clave.mid', '100'],
];

const LANES = [
  ['KICK', [0.02, 0.5]],
  ['SNARE', [0.25, 0.75]],
  ['HAT', [0, 0.12, 0.25, 0.37, 0.5, 0.62, 0.75, 0.87]],
  ['TOM', [0.62]],
  ['CLAP', [0.25, 0.75]],
];

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const seg = (p, a, b) => clamp((p - a) / (b - a));
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

function Sid({ size = 120 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" aria-hidden="true">
      <ellipse cx="60" cy="108" rx="28" ry="8" fill="rgba(0,0,0,.25)" />
      <path d="M18 58c-14 4-16 28-4 34 10 5 18-6 18-16z" fill="#6d4a32" />
      <path d="M102 58c14 4 16 28 4 34-10 5-18-6-18-16z" fill="#6d4a32" />
      <ellipse cx="60" cy="62" rx="40" ry="36" fill="#c9844a" />
      <ellipse cx="60" cy="74" rx="26" ry="18" fill="#f0c48a" />
      <ellipse cx="42" cy="56" rx="8" ry="9" fill="#fff" />
      <ellipse cx="78" cy="56" rx="8" ry="9" fill="#fff" />
      <ellipse cx="44" cy="57" rx="4" ry="5" fill="#1a120c" />
      <ellipse cx="80" cy="57" rx="4" ry="5" fill="#1a120c" />
      <ellipse cx="60" cy="72" rx="10" ry="7" fill="#2a1a14" />
      <ellipse cx="60" cy="70" rx="6" ry="4" fill="#5c4034" />
      <path d="M48 84c6 8 18 8 24 0" fill="none" stroke="#1a120c" strokeWidth="3" strokeLinecap="round" />
      <path d="M70 84c2 10-6 16-12 12" fill="#e23b4a" />
      <path d="M22 40c8-16 22-10 24 2" fill="none" stroke="#1a120c" strokeWidth="3" />
      <path d="M98 40c-8-16-22-10-24 2" fill="none" stroke="#1a120c" strokeWidth="3" />
    </svg>
  );
}

function Window({ p, portrait }) {
  const typed = 'break'.slice(0, Math.round(seg(p, 0.12, 0.28) * 5));
  const showBreak = typed.length > 0;
  const sel = p < 0.34 ? 0 : p < 0.46 ? 1 : 2;
  const playing = p > 0.32;
  const head = playing ? (p * 3.2) % 1 : 0.02;
  const muted = p > 0.55 ? 2 : -1;
  const tempo = p < 0.62 ? 'FILE' : p < 0.7 ? 'SET' : 'HOST';
  const launch = p > 0.74;
  const port = p > 0.82;
  const kit = p < 0.9 ? 'OFF' : 'FARTS';
  // Frame 0 is already the window. The homepage lid does the entrance,
  // and the start poster has to show the plug-in, not an empty frame.
  const enter = 1;
  const rows = GROOVES.filter((g, i) => !showBreak || i === 0 || g[0].includes('break'));

  const shell = {
    width: portrait ? 660 : 1180,
    height: portrait ? 1180 : 660,
    transform: `translateY(${(1 - enter) * 40}px) scale(${0.96 + enter * 0.04})`,
    opacity: enter,
  };

  return (
    <div style={{ ...shell, background: 'linear-gradient(180deg,#d7dbd6,#9aa19c)', borderRadius: 18, boxShadow: '0 30px 0 #1a120c, 0 40px 80px rgba(0,0,0,.45)', position: 'relative', overflow: 'hidden', color: '#1a120c', fontFamily: 'Comic Neue, Comic Sans MS, sans-serif' }}>
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(90deg,rgba(255,255,255,.18) 0 2px,transparent 2px 7px), repeating-linear-gradient(0deg,rgba(0,0,0,.05) 0 1px,transparent 1px 11px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', left: 18, right: 18, top: 14, height: portrait ? 92 : 72, display: 'flex', alignItems: 'center', gap: 14 }}>
        <Sid size={portrait ? 84 : 68} />
        <div>
          <div style={{ fontFamily: 'Titan One, Impact, sans-serif', fontSize: portrait ? 42 : 36, lineHeight: 0.9, color: '#e7ff4a', WebkitTextStroke: '6px #1a120c', paintOrder: 'stroke fill', letterSpacing: 0.5 }}>MIDI FART SNIFFER</div>
          <div style={{ marginTop: 4, fontWeight: 700, letterSpacing: 1, fontSize: 14 }}>DIV-003 · point it at the drum MIDI</div>
        </div>
      </div>
      <div style={{ position: 'absolute', left: 18, top: portrait ? 118 : 98, width: portrait ? 624 : 360, bottom: portrait ? 620 : 18, background: '#1c2420', borderRadius: 12, padding: 12, color: '#e7ffb0', boxShadow: 'inset 0 0 0 3px #0e1411' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: 'Titan One, Impact, sans-serif', letterSpacing: 1 }}>
          <span>DUMPSTER</span><span style={{ fontSize: 12, opacity: 0.7 }}>▲ OPEN</span>
        </div>
        <div style={{ marginTop: 8, background: '#0e1411', borderRadius: 8, padding: '8px 10px', color: typed ? '#e7ff4a' : '#6d7a72', fontWeight: 700 }}>{typed || 'filter the folder'}</div>
        <div style={{ marginTop: 8, display: 'grid', gap: 6 }}>
          {rows.map((g, i) => {
            const on = GROOVES.indexOf(g) === (showBreak ? 0 : sel);
            return (
              <div key={g[0]} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 10px', borderRadius: 8, background: on ? '#b6e23a' : '#24302a', color: on ? '#1a120c' : '#d5e7c4', fontWeight: 700, transform: `translateX(${on ? 6 : 0}px)` }}>
                <span>{g[0]}</span><span>{g[1]}</span>
              </div>
            );
          })}
        </div>
      </div>
      <div style={{ position: 'absolute', left: portrait ? 18 : 394, right: 18, top: portrait ? 560 : 98, height: portrait ? 430 : 420, background: '#f4e2b0', borderRadius: 14, boxShadow: '0 8px 0 #1a120c', overflow: 'hidden' }}>
        <div style={{ height: 54, background: '#e23b2f', color: '#fff8e8', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 14px', fontFamily: 'Titan One, Impact, sans-serif', fontSize: 22 }}>
          <span>DRAG ME</span>
          <span>{GROOVES[showBreak ? 0 : sel][0].replace('.mid', '')}</span>
          <span style={{ width: 36, height: 36, borderRadius: '50%', background: '#f4e2b0', color: '#1a120c', display: 'grid', placeItems: 'center', fontSize: 16 }}>★</span>
        </div>
        <div style={{ position: 'absolute', right: 16, top: 64, width: 54, height: 54, background: '#1a120c', color: '#e7ff4a', borderRadius: 8, display: 'grid', placeItems: 'center', fontFamily: 'Titan One, Impact, sans-serif', transform: 'rotate(8deg)' }}>003</div>
        <div style={{ position: 'absolute', left: 12, right: 12, top: 70, bottom: 36 }}>
          {LANES.map((lane, i) => (
            <div key={lane[0]} style={{ position: 'absolute', left: 0, right: 0, top: i * 58, height: 52, opacity: muted === i ? 0.28 : 1 }}>
              <div style={{ position: 'absolute', left: 0, top: 16, width: 78, fontWeight: 800, fontSize: 13 }}>{lane[0]}</div>
              <div style={{ position: 'absolute', left: 84, right: 0, top: 22, height: 8, background: 'rgba(26,18,12,.15)', borderRadius: 4 }} />
              {lane[1].map((h) => {
                const near = Math.abs(((h - head + 1) % 1)) < 0.06 || Math.abs(((head - h + 1) % 1)) < 0.06;
                return <div key={h} style={{ position: 'absolute', left: `calc(84px + (100% - 84px) * ${h})`, top: near ? 6 : 14, width: near ? 22 : 14, height: near ? 40 : 24, marginLeft: -7, borderRadius: 6, background: muted === i ? '#8a7a62' : '#2f6b22' }} />;
              })}
            </div>
          ))}
          <div style={{ position: 'absolute', top: 0, bottom: 0, left: `calc(84px + (100% - 84px) * ${head})`, width: 3, background: '#e23b2f' }} />
        </div>
        <div style={{ position: 'absolute', left: 12, right: 12, bottom: 10, height: 16, borderRadius: 8, background: 'linear-gradient(90deg,#7CFF3A,#3d8f22)', boxShadow: 'inset 0 0 0 2px #1a120c' }} />
      </div>
      <div style={{ position: 'absolute', left: portrait ? 18 : 394, right: 18, bottom: portrait ? 18 : 18, height: portrait ? 150 : 118, display: portrait ? 'grid' : 'flex', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <Chip label="TEMPO" value={tempo} hot={tempo === 'HOST'} />
        <Chip label="LAUNCH" value={launch ? 'BAR' : 'NOW'} hot={launch} />
        <Chip label="ALSO SEND TO" value={port ? 'VIRTUAL PORT' : 'OFF'} hot={port} />
        <Chip label="PREVIEW KIT" value={kit} hot={kit === 'FARTS'} />
      </div>
    </div>
  );
}

function Chip({ label, value, hot }) {
  return (
    <div style={{ flex: 1, background: hot ? '#b6e23a' : '#1c2420', color: hot ? '#1a120c' : '#e7ffb0', borderRadius: 10, padding: '8px 10px', boxShadow: '0 4px 0 #0e1411' }}>
      <div style={{ fontSize: 11, letterSpacing: 1, fontWeight: 800, opacity: 0.7 }}>{label}</div>
      <div style={{ fontFamily: 'Titan One, Impact, sans-serif', fontSize: 18 }}>{value}</div>
    </div>
  );
}

function Teaser({ portrait }) {
  const frame = useCurrentFrame();
  const { width, height, durationInFrames } = useVideoConfig();
  const p = frame / (durationInFrames - 1);
  return (
    <AbsoluteFill style={{ background: '#14110e', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 40%, #2a2418, #14110e 70%)' }} />
      {Array.from({ length: 8 }).map((_, i) => {
        const y = ((i * 137 + frame * (6 + (i % 3))) % (height + 40)) - 20;
        const x = (i * 97) % width;
        return <div key={i} style={{ position: 'absolute', left: x, top: y, width: 8, height: 5, borderRadius: 4, background: '#1a120c', opacity: 0.55 }} />;
      })}
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

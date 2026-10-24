// Copy what the teaser shares with the site into public/, so the teaser
// draws the exact window the /midi-fart-sniffer tour does.
import { copyFileSync, mkdirSync } from 'node:fs';
const site = new URL('../../public/', import.meta.url);
const here = new URL('./public/', import.meta.url);
mkdirSync(here, { recursive: true });
for (const [from, to] of [
  ['mfs-window.css', 'mfs-window.css'],
  ['js/mfs-window.js', 'mfs-window.js'],
  ['assets/mfs-can.webp', 'mfs-can.webp'],
  ['assets/mfs-steel.webp', 'mfs-steel.webp'],
  ['assets/sniffin-sid.webp', 'sid.webp'],
]) copyFileSync(new URL(from, site), new URL(to, here));
console.log('synced the window, its CSS and art from public/');

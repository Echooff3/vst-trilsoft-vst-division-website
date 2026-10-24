// Copy what the teaser shares with the site into public/, so the teaser
// draws the exact window the /bruno tour does.
import { copyFileSync, mkdirSync } from 'node:fs';
const site = new URL('../../public/', import.meta.url);
const here = new URL('./public/', import.meta.url);
mkdirSync(new URL('fonts/', here), { recursive: true });
for (const [from, to] of [
  ['js/bruno-window.js', 'bruno-window.js'],
  ['assets/bruno-art.webp', 'bruno-art.webp'],
  ['assets/fonts/bruno/Rye-Regular.ttf', 'fonts/Rye-Regular.ttf'],
  ['assets/fonts/bruno/TitanOne-Regular.ttf', 'fonts/TitanOne-Regular.ttf'],
  ['assets/fonts/bruno/ComicNeue-Bold.ttf', 'fonts/ComicNeue-Bold.ttf'],
]) copyFileSync(new URL(from, site), new URL(to, here));
console.log("synced Bruno's window, his art and fonts from public/");

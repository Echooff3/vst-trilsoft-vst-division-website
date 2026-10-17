/**
 * Static server for the Tril$oft marketing site.
 *
 * Railway (Dockerfile CMD) and local dev use the same command:
 *   node server.js
 *
 * Listens on 0.0.0.0:$PORT (default 8080).
 *
 * Clean URLs: /plugin and /plugin/ serve public/plugin.html when that
 * file exists, and /plugin.html still serves the file directly.
 * HTML is revalidated; images are cached for a week; responses are
 * gzip-compressed when the client accepts it and the type is text.
 *
 * If API_BASE_URL is set to an http(s) URL, it overrides the empty
 * placeholder in public/js/site-config.js at request time.
 */
'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const ROOT = path.resolve(__dirname, 'public');
const PORT = Number(process.env.PORT) || 8080;
const HOST = '0.0.0.0';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
};

const COMPRESSIBLE = new Set(['.html', '.js', '.css', '.svg', '.txt', '.json']);

function cacheControl(filePath) {
  const base = path.basename(filePath);
  const ext = path.extname(filePath).toLowerCase();
  if (base === 'site-config.js' || ext === '.html') {
    return 'public, max-age=0, must-revalidate';
  }
  if (ext === '.jpg' || ext === '.jpeg' || ext === '.png' || ext === '.webp' || ext === '.gif' || ext === '.svg' || ext === '.ico') {
    return 'public, max-age=604800';
  }
  return 'public, max-age=3600';
}

function safeResolve(urlPath) {
  let decoded;
  try {
    decoded = decodeURIComponent(urlPath);
  } catch (err) {
    return null;
  }
  if (decoded.includes('\0')) return null;
  const parts = decoded.split('/').filter((part) => part && part !== '.');
  const abs = path.resolve(ROOT, ...parts);
  const rootWithSep = ROOT.endsWith(path.sep) ? ROOT : ROOT + path.sep;
  if (abs !== ROOT && !abs.startsWith(rootWithSep)) return null;
  return abs;
}

async function isFile(abs) {
  try {
    const stat = await fs.promises.stat(abs);
    return stat.isFile();
  } catch (err) {
    return false;
  }
}

async function resolveRequest(pathname) {
  const trimmed = pathname.length > 1 ? pathname.replace(/\/+$/, '') : '/';
  const candidates = [];
  if (trimmed === '/') {
    candidates.push('/index.html');
  } else {
    candidates.push(trimmed);
    if (!path.extname(trimmed)) {
      candidates.push(trimmed + '.html');
      candidates.push(trimmed + '/index.html');
    }
  }
  for (const rel of candidates) {
    const abs = safeResolve(rel);
    if (abs && await isFile(abs)) return abs;
  }
  return null;
}

function overlayApiBase(buf) {
  const raw = (process.env.API_BASE_URL || '').trim();
  if (!raw) return buf;
  let parsed;
  try {
    parsed = new URL(raw);
  } catch (err) {
    console.warn('Ignoring API_BASE_URL (not an absolute URL)');
    return buf;
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    console.warn('Ignoring API_BASE_URL (must be http or https)');
    return buf;
  }
  parsed.search = '';
  parsed.hash = '';
  const base = (parsed.origin + parsed.pathname).replace(/\/$/, '');
  const src = buf.toString('utf8');
  const next = src.replace(
    /API_BASE_URL:\s*"(?:[^"\\]|\\.)*"/,
    'API_BASE_URL: ' + JSON.stringify(base)
  );
  if (next === src) {
    console.warn('API_BASE_URL is set but public/js/site-config.js has no API_BASE_URL assignment to override');
    return buf;
  }
  return Buffer.from(next);
}

function send(req, res, status, filePath, body) {
  const ext = path.extname(filePath).toLowerCase();
  const headers = {
    'Content-Type': MIME[ext] || 'application/octet-stream',
    'Cache-Control': cacheControl(filePath),
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'X-Frame-Options': 'SAMEORIGIN',
    'Vary': 'Accept-Encoding',
  };
  const accept = String(req.headers['accept-encoding'] || '');
  const canGzip = COMPRESSIBLE.has(ext) && body.length >= 256 && /\bgzip\b/.test(accept);

  const finish = (payload, encoding) => {
    if (encoding) headers['Content-Encoding'] = encoding;
    headers['Content-Length'] = Buffer.byteLength(payload);
    res.writeHead(status, headers);
    if (req.method === 'HEAD') res.end();
    else res.end(payload);
  };

  if (!canGzip) {
    finish(body);
    return;
  }
  zlib.gzip(body, (err, gz) => {
    if (err || gz.length >= body.length) finish(body);
    else finish(gz, 'gzip');
  });
}

async function handle(req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { Allow: 'GET, HEAD', 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Method not allowed');
    return;
  }

  let pathname;
  try {
    pathname = new URL(req.url, 'http://127.0.0.1').pathname;
  } catch (err) {
    res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Bad request');
    return;
  }

  const file = await resolveRequest(pathname);
  if (!file) {
    const notFound = path.join(ROOT, '404.html');
    const body = await fs.promises.readFile(notFound);
    send(req, res, 404, notFound, body);
    return;
  }

  let body = await fs.promises.readFile(file);
  if (path.basename(file) === 'site-config.js') body = overlayApiBase(body);
  send(req, res, 200, file, body);
}

const server = http.createServer((req, res) => {
  handle(req, res).catch((err) => {
    console.error(err);
    if (res.headersSent) {
      res.end();
      return;
    }
    res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Internal error');
  });
});

server.listen(PORT, HOST, () => {
  console.log('Tril$oft site listening on http://' + HOST + ':' + PORT);
  const raw = (process.env.API_BASE_URL || '').trim();
  if (!raw) return;
  try {
    const parsed = new URL(raw);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      const base = (parsed.origin + parsed.pathname).replace(/\/$/, '');
      console.log('Checkout API overlay: ' + base);
      return;
    }
  } catch (err) {
    console.warn('Ignoring API_BASE_URL (not an absolute URL)');
    return;
  }
  console.warn('Ignoring API_BASE_URL (must be http or https)');
});

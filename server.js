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
 * PAYMENT_LINK_<SLUG> (https only) overrides paymentLinks.<slug>
 * the same way — PAYMENT_LINK_WILDCARD for "wildcard" — and that
 * URL is also written into Buy Now hrefs in HTML, so the link works
 * with JavaScript disabled.
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
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
};

const COMPRESSIBLE = new Set(['.html', '.js', '.css', '.svg', '.txt', '.json']);

function cacheControl(filePath) {
  const base = path.basename(filePath);
  const ext = path.extname(filePath).toLowerCase();
  if (base === 'site-config.js' || ext === '.html') {
    return 'public, max-age=0, must-revalidate';
  }
  if (ext === '.jpg' || ext === '.jpeg' || ext === '.png' || ext === '.webp' || ext === '.gif' || ext === '.svg' || ext === '.ico' || ext === '.mp4' || ext === '.webm') {
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

const warned = new Set();
function warnOnce(message) {
  if (warned.has(message)) return;
  warned.add(message);
  console.warn(message);
}

function httpsUrl(raw) {
  const text = String(raw || '').trim();
  if (!text) return '';
  let parsed;
  try {
    parsed = new URL(text);
  } catch (err) {
    return '';
  }
  return parsed.protocol === 'https:' ? parsed.href : '';
}

function filePaymentLinks(src) {
  const links = {};
  const block = src.match(/paymentLinks\s*:\s*\{([\s\S]*?)\n[ \t]*\}/);
  if (!block) return links;
  const re = /["']?([A-Za-z0-9_-]+)["']?\s*:\s*"((?:[^"\\]|\\.)*)"/g;
  let match;
  while ((match = re.exec(block[1]))) {
    let value = '';
    try {
      value = JSON.parse('"' + match[2] + '"');
    } catch (err) {
      continue;
    }
    if (String(value).trim() === '') {
      links[match[1]] = '';
      continue;
    }
    const url = httpsUrl(value);
    if (url) links[match[1]] = url;
  }
  return links;
}

function envPaymentLink(slug) {
  const name = 'PAYMENT_LINK_' + slug.toUpperCase().replace(/-/g, '_');
  if (!Object.prototype.hasOwnProperty.call(process.env, name)) return '';
  const url = httpsUrl(process.env[name]);
  if (!url) {
    warnOnce('Ignoring ' + name + ' (must be an https URL)');
    return '';
  }
  return url;
}

function effectivePaymentLinks(src) {
  const links = filePaymentLinks(src);
  for (const slug of Object.keys(links)) {
    const override = envPaymentLink(slug);
    if (override) links[slug] = override;
  }
  for (const name of Object.keys(process.env)) {
    const match = /^PAYMENT_LINK_([A-Z0-9_]+)$/.exec(name);
    if (!match) continue;
    const slug = match[1].toLowerCase().replace(/_/g, '-');
    if (!Object.prototype.hasOwnProperty.call(links, slug)) {
      warnOnce(name + ' is set but site-config.js has no paymentLinks.' + slug + ' entry');
    }
  }
  return links;
}

function writePaymentLinks(src, links) {
  const block = /paymentLinks\s*:\s*\{[\s\S]*?\n[ \t]*\}/;
  if (!block.test(src)) {
    warnOnce('site-config.js has no paymentLinks block to override');
    return src;
  }
  const lines = Object.keys(links).map((slug) => {
    const key = /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(slug) ? slug : JSON.stringify(slug);
    return '    ' + key + ': ' + JSON.stringify(links[slug]) + ',';
  });
  return src.replace(block, 'paymentLinks: {\n' + lines.join('\n') + '\n  }');
}

function overlayApiBase(src) {
  const raw = (process.env.API_BASE_URL || '').trim();
  if (!raw) return src;
  let parsed;
  try {
    parsed = new URL(raw);
  } catch (err) {
    warnOnce('Ignoring API_BASE_URL (not an absolute URL)');
    return src;
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    warnOnce('Ignoring API_BASE_URL (must be http or https)');
    return src;
  }
  parsed.search = '';
  parsed.hash = '';
  const base = (parsed.origin + parsed.pathname).replace(/\/$/, '');
  const next = src.replace(
    /API_BASE_URL:\s*"(?:[^"\\]|\\.)*"/,
    'API_BASE_URL: ' + JSON.stringify(base)
  );
  if (next === src) {
    warnOnce('API_BASE_URL is set but public/js/site-config.js has no API_BASE_URL assignment to override');
    return src;
  }
  return next;
}

function escapeAttr(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;');
}

function injectBuyHrefs(html, links) {
  return html.replace(/<a\b[^>]*>/gi, (tag) => {
    if (!/\bdata-stripe\b/i.test(tag)) return tag;
    const slugMatch = /\bdata-product\s*=\s*["']([^"']+)["']/i.exec(tag);
    if (!slugMatch) return tag;
    const link = links[slugMatch[1]];
    if (!link) return tag;
    const href = 'href="' + escapeAttr(link) + '"';
    if (/\bhref\s*=\s*["'][^"']*["']/i.test(tag)) {
      return tag.replace(/\bhref\s*=\s*["'][^"']*["']/i, href);
    }
    return tag.replace(/<a\b/i, '<a ' + href);
  });
}

async function configSource() {
  return fs.promises.readFile(path.join(ROOT, 'js/site-config.js'), 'utf8');
}

async function prepareBody(file, body) {
  const ext = path.extname(file).toLowerCase();
  if (path.basename(file) === 'site-config.js') {
    const src = body.toString('utf8');
    const links = effectivePaymentLinks(src);
    const fileLinks = filePaymentLinks(src);
    const overridden = Object.keys(fileLinks).some((slug) => links[slug] !== fileLinks[slug]);
    const withLinks = overridden ? writePaymentLinks(src, links) : src;
    return Buffer.from(overlayApiBase(withLinks));
  }
  if (ext === '.html') {
    const links = effectivePaymentLinks(await configSource());
    if (Object.keys(links).length === 0) return body;
    return Buffer.from(injectBuyHrefs(body.toString('utf8'), links));
  }
  return body;
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
  if ((ext === '.mp4' || ext === '.webm') && status === 200) {
    headers['Accept-Ranges'] = 'bytes';
    const range = String(req.headers.range || '');
    if (range) {
      const size = body.length;
      const match = /^bytes=(\d*)-(\d*)$/.exec(range);
      const unsat = () => {
        res.writeHead(416, {
          'Content-Range': 'bytes */' + size,
          'Accept-Ranges': 'bytes',
          'Content-Type': headers['Content-Type'],
        });
        res.end();
      };
      if (!match) {
        unsat();
        return;
      }
      let start;
      let end;
      if (match[1] === '') {
        const suffix = Number(match[2]);
        if (!Number.isFinite(suffix) || suffix <= 0) {
          unsat();
          return;
        }
        start = Math.max(0, size - suffix);
        end = size - 1;
      } else {
        start = Number(match[1]);
        end = match[2] === '' ? size - 1 : Number(match[2]);
      }
      if (!Number.isFinite(start) || !Number.isFinite(end) || start < 0 || start >= size || end < start) {
        unsat();
        return;
      }
      if (end >= size) end = size - 1;
      const chunk = body.subarray(start, end + 1);
      headers['Content-Range'] = 'bytes ' + start + '-' + end + '/' + size;
      headers['Content-Length'] = chunk.length;
      res.writeHead(206, headers);
      if (req.method === 'HEAD') res.end();
      else res.end(chunk);
      return;
    }
  }

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
  body = await prepareBody(file, body);
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
  fs.promises.readFile(path.join(ROOT, 'js/site-config.js'), 'utf8').then((src) => {
    const links = effectivePaymentLinks(src);
    for (const slug of Object.keys(links)) {
      if (links[slug]) console.log('Payment link ' + slug + ': ' + links[slug]);
    }
  }).catch((err) => {
    console.warn('Could not read site-config.js: ' + err.message);
  });
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
    warnOnce('Ignoring API_BASE_URL (not an absolute URL)');
    return;
  }
  warnOnce('Ignoring API_BASE_URL (must be http or https)');
});

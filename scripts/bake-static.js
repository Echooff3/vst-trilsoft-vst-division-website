#!/usr/bin/env node
/**
 * Copy public/ to dist/ and bake the same request-time overlays server.js
 * applies: PAYMENT_LINK_* into site-config.js, API_BASE_URL, and Buy Now
 * hrefs. Also writes extensionless copies of page HTML so /mac works on
 * S3 even when CloudFront does not rewrite the URI.
 *
 * Clean-url keys are listed in dist/.clean-urls (excluded from the bucket).
 */
'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const srcDir = path.join(root, 'public');
const outDir = path.join(root, 'dist');

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
    console.warn('Ignoring ' + name + ' (must be an https URL)');
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
  return links;
}

function writePaymentLinks(src, links) {
  const block = /paymentLinks\s*:\s*\{[\s\S]*?\n[ \t]*\}/;
  if (!block.test(src)) {
    console.warn('site-config.js has no paymentLinks block to override');
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
    console.warn('Ignoring API_BASE_URL (not an absolute URL)');
    return src;
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    console.warn('Ignoring API_BASE_URL (must be http or https)');
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
    console.warn('API_BASE_URL is set but site-config.js has no API_BASE_URL assignment to override');
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

function walk(dir, acc) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const abs = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(abs, acc);
    else if (ent.isFile()) acc.push(abs);
  }
  return acc;
}

function main() {
  if (!fs.existsSync(path.join(srcDir, 'index.html'))) {
    console.error('public/index.html is missing; refusing to bake');
    process.exit(1);
  }
  fs.rmSync(outDir, { recursive: true, force: true });
  fs.cpSync(srcDir, outDir, { recursive: true });

  const configPath = path.join(outDir, 'js', 'site-config.js');
  const original = fs.readFileSync(configPath, 'utf8');
  const fileLinks = filePaymentLinks(original);
  const links = effectivePaymentLinks(original);
  const overridden = Object.keys(fileLinks).some((slug) => links[slug] !== fileLinks[slug]);
  let config = overridden ? writePaymentLinks(original, links) : original;
  config = overlayApiBase(config);
  fs.writeFileSync(configPath, config);

  const clean = [];
  for (const file of walk(outDir, [])) {
    if (path.extname(file).toLowerCase() !== '.html') continue;
    const html = injectBuyHrefs(fs.readFileSync(file, 'utf8'), links);
    fs.writeFileSync(file, html);
    const base = path.basename(file);
    if (base === 'index.html' || base === '404.html') continue;
    const dest = path.join(path.dirname(file), base.slice(0, -'.html'.length));
    if (fs.existsSync(dest)) {
      console.warn('Not writing clean URL; path already exists: ' + path.relative(outDir, dest));
      continue;
    }
    fs.writeFileSync(dest, html);
    clean.push(path.relative(outDir, dest).split(path.sep).join('/'));
  }
  fs.writeFileSync(path.join(outDir, '.clean-urls'), clean.join('\n') + (clean.length ? '\n' : ''));
  console.log('Baked ' + walk(outDir, []).length + ' files, ' + clean.length + ' clean URLs');
  for (const slug of Object.keys(links)) {
    if (links[slug]) console.log('Payment link ' + slug + ': ' + links[slug]);
  }
}

main();

/* Wires every <a data-stripe data-product="slug"> to site-config.js.
   A slug with a payment link is a plain link; the browser follows it.
   Otherwise, if API_BASE_URL is set, POST the checkout API and follow
   the URL it returns. Anything else: the click is cancelled. */
(function () {
  var cfg = window.TRILOSOFT || {};
  var warned = false;
  var pending = false;

  function apiBase() {
    var raw = String(cfg.API_BASE_URL || '').trim();
    if (!raw) return '';
    try {
      var url = new URL(raw);
      if (url.protocol !== 'http:' && url.protocol !== 'https:') return '';
      return (url.origin + url.pathname).replace(/\/$/, '');
    } catch (err) {
      return '';
    }
  }

  function productId(el) {
    var slug = el.getAttribute('data-product') || '';
    var products = cfg.products || {};
    if (!slug || !Object.prototype.hasOwnProperty.call(products, slug)) return '';
    return String(products[slug] || '');
  }

  function paymentLink(el) {
    var slug = el.getAttribute('data-product') || '';
    var links = cfg.paymentLinks || {};
    if (!slug || !Object.prototype.hasOwnProperty.call(links, slug)) return '';
    try {
      var url = new URL(String(links[slug] || '').trim());
      return url.protocol === 'https:' ? url.href : '';
    } catch (err) {
      return '';
    }
  }

  // Config wins. If it has no link, keep an https buy.stripe.com href the
  // server already wrote into the HTML (the no-JS fallback).
  function stripeHref(el) {
    var fromConfig = paymentLink(el);
    if (fromConfig) return fromConfig;
    try {
      var url = new URL(el.getAttribute('href') || '', window.location.href);
      if (url.protocol === 'https:' && url.hostname === 'buy.stripe.com') return url.href;
    } catch (err) {}
    return '';
  }

  function endpointFor(product) {
    var base = apiBase();
    if (!base || !product) return '';
    return base + '/checkout?product=' + encodeURIComponent(product);
  }

  function checkoutUrl(data) {
    if (!data || typeof data !== 'object') return '';
    var url = data.url || data.checkoutUrl || data.checkout_url || '';
    if (typeof url !== 'string') return '';
    try {
      var parsed = new URL(url);
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return '';
      return parsed.href;
    } catch (err) {
      return '';
    }
  }

  function upgrade(root) {
    var nodes = (root || document).querySelectorAll('a[data-stripe]');
    var base = apiBase();
    for (var i = 0; i < nodes.length; i++) {
      var anchor = nodes[i];
      var link = stripeHref(anchor);
      if (link) {
        if (anchor.getAttribute('href') !== link) anchor.setAttribute('href', link);
        anchor.removeAttribute('aria-disabled');
        continue;
      }
      var href = endpointFor(productId(anchor));
      anchor.setAttribute('href', href || '#');
      if (base && href) anchor.removeAttribute('aria-disabled');
      else anchor.setAttribute('aria-disabled', 'true');
    }
  }

  function formPost(endpoint, product) {
    var form = document.createElement('form');
    form.method = 'POST';
    form.action = endpoint;
    var input = document.createElement('input');
    input.type = 'hidden';
    input.name = 'product';
    input.value = product;
    form.appendChild(input);
    document.body.appendChild(form);
    form.submit();
  }

  async function begin(anchor) {
    var product = productId(anchor);
    var endpoint = endpointFor(product);
    if (!endpoint || pending) return;
    pending = true;
    anchor.setAttribute('aria-busy', 'true');
    try {
      var res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ product: product }),
        redirect: 'manual',
      });
      if (res.type === 'opaqueredirect' || (res.status >= 300 && res.status < 400)) {
        formPost(endpoint, product);
        return;
      }
      var data = null;
      try {
        data = await res.json();
      } catch (err) {
        data = null;
      }
      var next = checkoutUrl(data);
      if (res.ok && next) {
        window.location.assign(next);
        return;
      }
      console.warn('Tril$oft checkout: the API did not return a checkout URL (status ' + res.status + ').');
    } catch (err) {
      formPost(endpoint, product);
      return;
    } finally {
      pending = false;
      anchor.removeAttribute('aria-busy');
    }
  }

  document.addEventListener('click', function (event) {
    var anchor = event.target && event.target.closest && event.target.closest('a[data-stripe]');
    if (!anchor) return;
    if (stripeHref(anchor)) return;
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    var endpoint = endpointFor(productId(anchor));
    if (!endpoint) {
      event.preventDefault();
      if (!warned) {
        warned = true;
        console.info('Tril$oft: Buy Now stays on the page until paymentLinks or API_BASE_URL is set in /js/site-config.js');
      }
      return;
    }
    event.preventDefault();
    begin(anchor);
  });

  upgrade(document);
  var observer = new MutationObserver(function () {
    upgrade(document);
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
})();

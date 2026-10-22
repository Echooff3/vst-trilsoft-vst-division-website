/* Get Free Key forms. A form[data-free-key] POSTs JSON to
   {licenseBase}/api/free-key. The product id comes from
   products[data-product] in site-config.js. website is the honeypot. */
(function () {
  var cfg = window.TRILOSOFT || {};

  function licenseBase() {
    var raw = String(cfg.licenseBase || '').trim();
    if (!raw) return '';
    try {
      var url = new URL(raw);
      if (url.protocol !== 'http:' && url.protocol !== 'https:') return '';
      return (url.origin + url.pathname).replace(/\/$/, '');
    } catch (err) {
      return '';
    }
  }

  function productId(form) {
    var slug = form.getAttribute('data-product') || '';
    var products = cfg.products || {};
    if (!slug || !Object.prototype.hasOwnProperty.call(products, slug)) return '';
    return String(products[slug] || '');
  }

  function noteOf(form) {
    return form.querySelector('.keynote');
  }

  function say(form, text, kind) {
    var note = noteOf(form);
    if (!note) return;
    note.textContent = text || '';
    note.classList.toggle('ok', kind === 'ok');
    note.classList.toggle('bad', kind === 'bad');
    if (text) note.removeAttribute('hidden');
    else note.setAttribute('hidden', '');
  }

  function emailOk(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  async function send(form) {
    if (form.getAttribute('aria-busy') === 'true') return;
    var email = String((form.elements.email && form.elements.email.value) || '').trim();
    var website = String((form.elements.website && form.elements.website.value) || '');
    if (!emailOk(email)) {
      say(form, 'Need an email address to send the key.', 'bad');
      if (form.elements.email) form.elements.email.focus();
      return;
    }
    var product = productId(form);
    var root = licenseBase();
    if (!product || !root) {
      say(form, 'The key desk is not set up yet.', 'bad');
      return;
    }
    var button = form.querySelector('button[type="submit"]');
    form.setAttribute('aria-busy', 'true');
    if (button) button.disabled = true;
    say(form, '', '');
    try {
      var res = await fetch(root + '/api/free-key', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ product: product, email: email, website: website }),
      });
      var data = null;
      try {
        data = await res.json();
      } catch (err) {
        data = null;
      }
      var errText = data && typeof data.error === 'string' ? data.error.trim() : '';
      if (errText.length > 180) errText = errText.slice(0, 180);
      if (data && data.ok === true && res.ok) {
        var who = typeof data.sent_to === 'string' ? data.sent_to.trim() : '';
        say(form, who ? "Key's on its way to " + who + '.' : "Key's on its way.", 'ok');
        if (form.elements.email) form.elements.email.value = '';
        return;
      }
      if (res.status === 429) {
        say(form, errText || 'Too many tries. Give it a minute.', 'bad');
        return;
      }
      say(form, errText || "That didn't go through. Try again in a bit.", 'bad');
    } catch (err) {
      say(form, "Couldn't reach the key desk. Try again in a bit.", 'bad');
    } finally {
      form.removeAttribute('aria-busy');
      if (button) button.disabled = false;
    }
  }

  document.addEventListener('submit', function (event) {
    var form = event.target;
    if (!form || !form.matches || !form.matches('form[data-free-key]')) return;
    event.preventDefault();
    send(form);
  });
})();

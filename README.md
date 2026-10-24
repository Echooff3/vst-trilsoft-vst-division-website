# Tril$oft VST Division

Static marketing site. The homepage is a full-screen scroll film with a desktop layout and a portrait layout (tablet portrait and phones). Each plug-in gets its own page and its own theme. Wild Card is the first one.

No framework and no build step. Railway runs the same command you use locally: `node server.js`.

## Run locally

```bash
node server.js
```

Then open [http://localhost:8080](http://localhost:8080).

`PORT` defaults to `8080`. The process listens on `0.0.0.0`, which is what Railway expects. `npm start` is the same command.

| URL | Page |
| --- | --- |
| `/` | Homepage |
| `/wildcard` | Wild Card |
| `/wildcard.html` | Same Wild Card page |
| `/conceal-n-strike` | Conceal-N-Strike |
| `/conceal-n-strike.html` | Same Conceal-N-Strike page |
| `/bruno` | Bruno |
| `/bruno.html` | Same Bruno page |
| `/midi-fart-sniffer` | MIDI Fart Sniffer |
| `/midi-fart-sniffer.html` | Same MIDI Fart Sniffer page |

Paid plug-ins are listed before MIDI Fart Sniffer. The free section stays last.
| `/privacy` | Privacy policy |
| `/faq` | FAQ. Refunds live at `/faq#refunds`. Installers live at `/faq#installers`. |
| `/refunds` | Redirects to `/faq#refunds` (`/refunds.html` too) |
| `/llms.txt` | Short site summary for language models |

## Deploy on Railway

This repo has a `Dockerfile`. Railway builds that image and starts it with `node server.js`. The server reads `PORT` from the environment (Railway sets it). `railway.toml` points the health check at `/`.

1. Create a Railway project from this GitHub repo.
2. Leave the builder on the Dockerfile. There is nothing to compile.
3. Deploy, then attach a public domain in the service settings.

To ship a change, merge to the branch Railway watches and let it redeploy. HTML is sent with `Cache-Control: public, max-age=0, must-revalidate`. Images under `public/assets/` are cached for seven days. Text responses are gzip-compressed when the browser allows it.

## Buy Now

Every Buy Now button reads [`public/js/site-config.js`](public/js/site-config.js). Wild Card is a plain link to its Stripe Payment Link (test mode for now):

```js
window.TRILOSOFT = {
  paymentLinks: {
    wildcard: "https://buy.stripe.com/test_6oUaEZ4y2gtAa9g21V9R600",
    "conceal-n-strike": "https://buy.stripe.com/test_aFa5kF5C67X42GOfSL9R601",
    bruno: "https://buy.stripe.com/test_aFacN74y2918ftA6ib9R602",
  },
  API_BASE_URL: "",
  products: {
    wildcard: "wildcard",
    "conceal-n-strike": "conceal-n-strike",
    bruno: "bruno",
  },
};
```

`server.js` copies `paymentLinks.wildcard` into each Wild Card Buy Now `href`, including the homepage fallback inside `<noscript>`. The button is an ordinary link.

To go live, set `PAYMENT_LINK_WILDCARD` or `PAYMENT_LINK_CONCEAL_N_STRIKE` on the Railway service to the live Payment Link. The server uses that variable in place of the value in the file, both in `/js/site-config.js` and in the HTML `href`s, and one plug-in's link is never copied onto the other. Hyphens in a slug become underscores in the variable name (`conceal-n-strike` → `PAYMENT_LINK_CONCEAL_N_STRIKE`).

MIDI Fart Sniffer is free. Its page and the homepage section use a Get Free Key form, not Buy Now. The form POSTs JSON `{"product":"fart-sniffer","email":"...","website":""}` to `{licenseBase}/api/free-key`. `licenseBase` in `site-config.js` is `https://vst-license.trilsoft.com`. `website` is a hidden honeypot. The price on the page is the word Free.

Bruno is $50. `paymentLinks.bruno` is his Stripe Payment Link, and the bar on `public/bruno.html` shows `$50`. Set `PAYMENT_LINK_BRUNO` on the service to replace the link in the file. An empty value is what keeps a Buy Now button on the page, so don't clear his entry.

`API_BASE_URL` is only the fallback for a plug-in with no payment link. Leave it empty and those buttons stay on the page. When it is an `http` or `https` origin (the `API_BASE_URL` environment variable overrides the file), a click POSTs `{API_BASE_URL}/checkout?product=<id>` with JSON `{ "product": "<id>" }` and follows a returned `url` (`checkoutUrl` and `checkout_url` too), or submits a form POST so the API can answer with a redirect. `products` maps the button's `data-product` slug to that id.

## Add a plug-in page

Each plug-in is one HTML file with its own look. Copy the idea of [`public/wildcard.html`](public/wildcard.html), not its purple/lime theme, unless the plug-in really shares it.

1. Add `public/<slug>.html`. Point every home link at `/` (the wordmark, the footer, "all plug-ins").
2. Put images in `public/assets/` and reference them from the root, such as `/assets/my-ui.jpg`. Root paths keep working at both `/<slug>` and `/<slug>.html`.
3. Link to the page from the homepage with `/<slug>`.
4. Add Buy Now only where you want it:

   ```html
   <a href="#" data-stripe data-product="my-plugin">Buy Now</a>
   ```

5. Load the shared scripts at the end of `<body>`:

   ```html
   <script src="/js/site-config.js"></script>
   <script src="/js/checkout.js"></script>
   ```

6. Register the slug in `public/js/site-config.js`. A payment link makes Buy Now a plain link. Use `""` until a link exists so the slug stays overridable by `PAYMENT_LINK_<SLUG>` and does not reuse another plug-in's URL.

   ```js
   paymentLinks: {
     wildcard: "https://buy.stripe.com/test_6oUaEZ4y2gtAa9g21V9R600",
     "conceal-n-strike": "https://buy.stripe.com/test_aFa5kF5C67X42GOfSL9R601",
   },
   products: {
     wildcard: "wildcard",
     "my-plugin": "my-plugin",
   },
   ```

You do not need to edit `server.js`. `/<slug>` and `/<slug>/` are served from `public/<slug>.html` whenever that file is there, and `/<slug>.html` keeps working. A missing path returns `public/404.html` with status 404.

## Layout

```
public/
  index.html            homepage
  wildcard.html         Wild Card
  conceal-n-strike.html Conceal-N-Strike
  bruno.html            Bruno
  midi-fart-sniffer.html MIDI Fart Sniffer
  privacy.html          privacy policy
  faq.html              FAQ, including the refund policy
  refunds.html          redirect stub for /faq#refunds
  llms.txt              llmstxt.org summary
  tour.css              scroll tutorial styles
  tour.js               scroll tutorial engine
  mfs-window.css        MIDI Fart Sniffer's window, rebuilt from the plug-in (with js/mfs-window.js);
                        the tour page and the homepage teaser both draw it
  js/bruno-window.js    Bruno's window, redrawn on a canvas from the plug-in's egui code, with the
                        mood pad's real dots; assets/fonts/bruno holds his three typefaces (OFL)
  404.html
  footer.css            shared footer, same markup on every page
  favicon.svg
  assets/               images, root-addressed
  js/site-config.js     the only purchase config
  js/checkout.js
server.js               static server; Railway start command
teasers/bruno           Remotion source for Bruno's homepage teaser, the same way
teasers/midi-fart-sniffer  Remotion source for the homepage teaser: `npm run render`
                        (syncs the window from public/, renders, re-encodes with a 6-frame GOP)
tools/make-mfs-steel.py the plug-in's galvanized steel as mfs-can.webp and mfs-steel.webp
Dockerfile
railway.toml
```

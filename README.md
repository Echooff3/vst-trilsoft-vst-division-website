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

## Deploy on Railway

This repo has a `Dockerfile`. Railway builds that image and starts it with `node server.js`. The server reads `PORT` from the environment (Railway sets it). `railway.toml` points the health check at `/`.

1. Create a Railway project from this GitHub repo.
2. Leave the builder on the Dockerfile. There is nothing to compile.
3. Deploy, then attach a public domain in the service settings.

To ship a change, merge to the branch Railway watches and let it redeploy. HTML is sent with `Cache-Control: public, max-age=0, must-revalidate`. Images under `public/assets/` are cached for seven days. Text responses are gzip-compressed when the browser allows it.

## Set the checkout API

Purchases are not handled here. A separate API (also on Railway) will create the Stripe Checkout session. Every Buy Now button reads one file: [`public/js/site-config.js`](public/js/site-config.js).

```js
window.TRILOSOFT = {
  API_BASE_URL: "",
  products: {
    wildcard: "wildcard",
  },
};
```

Leave `API_BASE_URL` empty until that API exists. Buy Now then does nothing visible: the click is cancelled, the page does not jump, and no request is sent.

Set the base URL in either place. When `server.js` is serving the site, the environment variable wins:

1. Edit `API_BASE_URL` in `public/js/site-config.js`, or
2. Set `API_BASE_URL` on the Railway service, for example `https://your-api.up.railway.app`.

The value has to be an absolute `http` or `https` URL. A trailing slash is removed. Query strings and hashes are ignored. Anything else is left unused and the buttons stay idle.

`products` maps the slug on the button (`data-product`) to the id the API receives. A button whose slug is missing from this map does nothing.

When the base URL and the product are both set, a click does this:

1. `POST {API_BASE_URL}/checkout?product=wildcard` with JSON `{ "product": "wildcard" }`.
2. If the body is JSON and includes `url` (also `checkoutUrl` or `checkout_url`), the browser navigates there. That value should be the Stripe Checkout URL.
3. If the response is a redirect, or the browser cannot read it (no CORS), the browser submits a normal POST form to the same URL with a `product` field. The API can answer that with `302` or `303` to Stripe.

Suggested API shape, for when you build it:

- `POST /checkout?product={id}`
- JSON body `{ "product": "{id}" }`, and the same field as `application/x-www-form-urlencoded` for the form fallback
- Success: `200` `{ "url": "https://checkout.stripe.com/..." }` or `303` to that URL
- If you return JSON, allow this site's origin in CORS (`POST`, and the `Content-Type` and `Accept` headers)

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

6. Register the slug in `public/js/site-config.js`:

   ```js
   products: {
     wildcard: "wildcard",
     "my-plugin": "my-plugin",
   }
   ```

You do not need to edit `server.js`. `/<slug>` and `/<slug>/` are served from `public/<slug>.html` whenever that file is there, and `/<slug>.html` keeps working. A missing path returns `public/404.html` with status 404.

## Layout

```
public/
  index.html            homepage
  wildcard.html         Wild Card
  404.html
  favicon.svg
  assets/               images, root-addressed
  js/site-config.js     the only purchase config
  js/checkout.js
server.js               static server; Railway start command
Dockerfile
railway.toml
```

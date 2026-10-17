/* Tril$oft purchase config.
   This is the only file Buy Now buttons read.

   API_BASE_URL
     Origin of the separate checkout API (no trailing slash).
     Leave it as an empty string until that service exists.
     Buy Now then stays on the page: no navigation, no error screen.
     When this site is served by server.js, an API_BASE_URL environment
     variable (http or https) replaces the empty string below. On
     Railway, set that variable on the service. Locally you can export
     it or edit the string in this file. The environment variable wins.

   products
     Plug-in slug → product id sent to the API.
     Each Buy Now anchor sets data-product to the slug.

   Placeholder contract (the API is not part of this repo):
     POST {API_BASE_URL}/checkout?product=<id>
     JSON body: {"product":"<id>"}
     Success: 200 {"url":"https://checkout.stripe.com/..."}
              (checkoutUrl and checkout_url are also accepted)
              or 302/303 to that Stripe Checkout URL.
     If the browser cannot read the JSON response, it falls back to a
     normal form POST of a "product" field to the same URL, which the
     API can answer with a redirect. */
window.TRILOSOFT = {
  API_BASE_URL: "",
  products: {
    wildcard: "wildcard",
  },
};

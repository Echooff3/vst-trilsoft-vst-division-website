/* Tril$oft purchase config.
   This is the only file Buy Now buttons read.

   paymentLinks
     Plug-in slug → Stripe Payment Link (https://buy.stripe.com/...),
     or "" when that plug-in has no link yet. An empty entry does not
     borrow another plug-in's URL. Buy Now is a plain link when the
     value is https, including the no-JS fallback (server.js writes
     the href into the HTML).
     A PAYMENT_LINK_<SLUG> environment variable replaces the value here
     at serve time. Hyphens in the slug become underscores, so wildcard
     is PAYMENT_LINK_WILDCARD and conceal-n-strike is
     PAYMENT_LINK_CONCEAL_N_STRIKE. The value must be https. On Railway,
     set the variable to publish a link without a code change.
     MIDI Fart Sniffer is free and has no payment link. Bruno's link is
     still empty (a stub): Buy Now stays on the page until it's set.

   licenseBase
     Origin of the license server. Get Free Key POSTs JSON to
     {licenseBase}/api/free-key. http or https, no trailing slash
     required.

   API_BASE_URL (fallback only)
     Used only for a slug that has no payment link. Buy Now then POSTs
     {API_BASE_URL}/checkout?product=<id> and follows the returned URL.
     Leave it empty and those buttons stay on the page. An API_BASE_URL
     environment variable (http or https) overrides the string below.

   products
     Plug-in slug → product id. Buy Now sends it to the checkout
     fallback. Get Free Key sends it as "product" in the JSON body. */
window.TRILOSOFT = {
  paymentLinks: {
    wildcard: "https://buy.stripe.com/test_6oUaEZ4y2gtAa9g21V9R600",
    "conceal-n-strike": "https://buy.stripe.com/test_aFa5kF5C67X42GOfSL9R601",
    bruno: "",
  },
  licenseBase: "https://vst-license.trilsoft.com",
  API_BASE_URL: "",
  products: {
    wildcard: "wildcard",
    "conceal-n-strike": "conceal-n-strike",
    bruno: "bruno",
    "midi-fart-sniffer": "fart-sniffer",
  },
};

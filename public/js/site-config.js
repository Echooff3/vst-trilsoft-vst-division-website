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

   API_BASE_URL (fallback only)
     Used only for a slug that has no payment link. Buy Now then POSTs
     {API_BASE_URL}/checkout?product=<id> and follows the returned URL.
     Leave it empty and those buttons stay on the page. An API_BASE_URL
     environment variable (http or https) overrides the string below.

   products
     Plug-in slug → product id sent to that fallback API. */
window.TRILOSOFT = {
  paymentLinks: {
    wildcard: "https://buy.stripe.com/test_6oUaEZ4y2gtAa9g21V9R600",
    "conceal-n-strike": "https://buy.stripe.com/test_aFa5kF5C67X42GOfSL9R601",
  },
  API_BASE_URL: "",
  products: {
    wildcard: "wildcard",
    "conceal-n-strike": "conceal-n-strike",
  },
};

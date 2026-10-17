/* Tril$oft purchase config.
   This is the only file Buy Now buttons read.

   paymentLinks
     Plug-in slug → Stripe Payment Link (https://buy.stripe.com/...).
     Buy Now is a plain link to that URL, including the no-JS fallback
     (server.js writes the href into the HTML).
     A PAYMENT_LINK_<SLUG> environment variable replaces the value here
     at serve time. Hyphens in the slug become underscores, so wildcard
     is PAYMENT_LINK_WILDCARD and my-plugin is PAYMENT_LINK_MY_PLUGIN.
     The value must be https. On Railway, set the variable to switch
     from the test link to the live link without a code change.

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
  },
  API_BASE_URL: "",
  products: {
    wildcard: "wildcard",
  },
};

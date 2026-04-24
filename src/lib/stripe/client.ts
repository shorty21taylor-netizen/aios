import Stripe from "stripe";

/**
 * Lazy Stripe client. We defer instantiation so `next build` can bundle API
 * route modules without STRIPE_SECRET_KEY being set in the build env. Runtime
 * calls throw a clear error if the key is missing.
 */
let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (_stripe) return _stripe;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error(
      "STRIPE_SECRET_KEY not set — cannot call Stripe API. Configure in Railway env."
    );
  }
  _stripe = new Stripe(key, {
    apiVersion: "2025-08-27.basil",
    typescript: true,
  });
  return _stripe;
}

export function isStripeConfigured(): boolean {
  return Boolean(
    process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET
  );
}

/**
 * Pricing IDs. These must exist in the Stripe dashboard. We hold them here
 * so the app can refer to them by semantic name.
 *
 *  - STRIPE_PRICE_SETUP_ID: $2,500 one-time setup fee
 *  - STRIPE_PRICE_MONTHLY_ID: $897/mo recurring
 */
export const PRICING = {
  setup: () => requireEnv("STRIPE_PRICE_SETUP_ID"),
  monthly: () => requireEnv("STRIPE_PRICE_MONTHLY_ID"),
};

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(name + " not set in environment");
  return v;
}

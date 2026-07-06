/**
 * Stripe integration for subscriptions.
 *
 * Flow:
 *   1. User visits /billing → clicks "Upgrade"
 *   2. Server creates Checkout Session → redirects to Stripe
 *   3. Stripe redirects back → Webhook confirms payment
 *   4. Webhook updates user tier in MySQL
 *
 * To test locally: stripe listen --forward-to localhost:3000/api/webhooks/stripe
 */

import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_placeholder", {
  apiVersion: "2025-06-16.basil",
  typescript: true,
});

export const PLANS = {
  starter: {
    priceId: process.env.STRIPE_PRICE_STARTER,
    name: "Starter",
    amount: 29,
  },
  pro: {
    priceId: process.env.STRIPE_PRICE_PRO,
    name: "Pro",
    amount: 79,
  },
  business: {
    priceId: process.env.STRIPE_PRICE_BUSINESS,
    name: "Business",
    amount: 199,
  },
} as const;

export type PlanKey = keyof typeof PLANS;

/**
 * Create a Stripe Checkout Session for subscription.
 */
export async function createCheckoutSession({
  customerId,
  plan,
  successUrl,
  cancelUrl,
}: {
  customerId?: string;
  plan: PlanKey;
  successUrl: string;
  cancelUrl: string;
}) {
  const planConfig = PLANS[plan];

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [
      {
        price: planConfig.priceId,
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    allow_promotion_codes: true,
  });

  return session;
}

/**
 * Create a Stripe Customer Portal session (for managing existing subscription).
 */
export async function createPortalSession({
  customerId,
  returnUrl,
}: {
  customerId: string;
  returnUrl: string;
}) {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });

  return session;
}

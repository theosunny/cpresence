/**
 * Stripe Webhook Handler.
 *
 * Processes subscription events: created, updated, deleted.
 * Updates user tier in SQLite.
 *
 * Test locally:
 *   1. stripe login
 *   2. stripe listen --forward-to localhost:3000/api/webhooks/stripe
 *   3. stripe trigger checkout.session.completed
 */

import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { getDemoUserId, getOne, run } from "@/lib/db-sqlite";
import Stripe from "stripe";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "whsec_placeholder";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature") ?? "";

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(subscription);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      default:
        console.log(`Unhandled Stripe event: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Stripe webhook error:", err);
    return NextResponse.json({ error: "Handler error" }, { status: 500 });
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const subscriptionId = session.subscription as string;
  const clientReferenceId = session.client_reference_id;

  if (!clientReferenceId) return;

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const priceId = subscription.items.data[0]?.price.id;
  const tier = mapPriceToTier(priceId);

  run(
    "UPDATE users SET tier = ?, stripe_subscription_id = ?, updated_at = datetime('now') WHERE id = ?",
    [tier, subscriptionId, clientReferenceId]
  );
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const userId = getDemoUserId();
  const priceId = subscription.items.data[0]?.price.id;
  const tier = subscription.status === "active" ? mapPriceToTier(priceId) : "starter";

  run(
    "UPDATE users SET tier = ?, updated_at = datetime('now') WHERE id = ?",
    [tier, userId]
  );
}

async function handleSubscriptionDeleted(_subscription: Stripe.Subscription) {
  const userId = getDemoUserId();
  run(
    "UPDATE users SET tier = 'starter', stripe_subscription_id = NULL, updated_at = datetime('now') WHERE id = ?",
    [userId]
  );
}

function mapPriceToTier(priceId: string | undefined): "starter" | "pro" | "business" {
  if (!priceId) return "starter";
  if (priceId === process.env.STRIPE_PRICE_PRO) return "pro";
  if (priceId === process.env.STRIPE_PRICE_BUSINESS) return "business";
  return "starter";
}

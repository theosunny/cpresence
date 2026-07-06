/**
 * Stripe Webhook Handler.
 *
 * Processes subscription events: created, updated, deleted.
 * Updates user tier in MySQL via Prisma.
 *
 * Test locally:
 *   1. stripe login
 *   2. stripe listen --forward-to localhost:3000/api/webhooks/stripe
 *   3. stripe trigger checkout.session.completed
 */

import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/db";
import Stripe from "stripe";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "whsec_placeholder";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature") ?? "";

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("Stripe webhook signature verification failed:", err);
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

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        console.warn("Payment failed for customer:", invoice.customer);
        // Optionally notify user, downgrade account, etc.
        break;
      }

      default:
        console.log(`Unhandled Stripe event: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Stripe webhook handler error:", err);
    return NextResponse.json(
      { error: "Webhook handler error" },
      { status: 500 }
    );
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const customerId = session.customer as string;
  const subscriptionId = session.subscription as string;
  const clientReferenceId = session.client_reference_id; // Our user ID

  if (!clientReferenceId) {
    console.warn("No client_reference_id on checkout session");
    return;
  }

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const priceId = subscription.items.data[0]?.price.id;

  // Map Stripe price ID to tier
  const tier = mapPriceToTier(priceId);

  await prisma.user.update({
    where: { id: clientReferenceId },
    data: {
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscriptionId,
      tier,
    },
  });

  console.log(`User ${clientReferenceId} upgraded to ${tier}`);
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  const priceId = subscription.items.data[0]?.price.id;
  const tier = mapPriceToTier(priceId);
  const status = subscription.status;

  const user = await prisma.user.findFirst({
    where: { stripeCustomerId: customerId },
  });

  if (!user) return;

  const newTier = status === "active" ? tier : "starter";

  await prisma.user.update({
    where: { id: user.id },
    data: { tier: newTier },
  });

  console.log(`User ${user.id} subscription updated to ${newTier} (${status})`);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;

  const user = await prisma.user.findFirst({
    where: { stripeCustomerId: customerId },
  });

  if (!user) return;

  await prisma.user.update({
    where: { id: user.id },
    data: { tier: "starter", stripeSubscriptionId: null },
  });

  console.log(`User ${user.id} subscription cancelled — downgraded to starter`);
}

function mapPriceToTier(priceId: string | undefined): "starter" | "pro" | "business" {
  if (!priceId) return "starter";
  if (priceId === process.env.STRIPE_PRICE_PRO) return "pro";
  if (priceId === process.env.STRIPE_PRICE_BUSINESS) return "business";
  return "starter";
}

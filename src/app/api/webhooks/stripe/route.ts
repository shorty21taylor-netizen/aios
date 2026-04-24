import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import { db } from "@/lib/db";
import { workspaces } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getStripe } from "@/lib/stripe/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/webhooks/stripe
 *
 * Verifies Stripe signature, then handles a small set of events that affect
 * workspace.subscription_status:
 *   - checkout.session.completed: first signup, set subscription_id
 *   - customer.subscription.updated: status may flip (active/past_due/canceled)
 *   - customer.subscription.deleted: cancellation finalized
 */
export async function POST(req: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json(
      { error: "webhook_not_configured" },
      { status: 503 }
    );
  }

  const body = await req.text();
  const hdrs = await headers();
  const signature = hdrs.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "missing_signature" }, { status: 400 });
  }

  let stripe: Stripe;
  try {
    stripe = getStripe();
  } catch (err) {
    return NextResponse.json(
      { error: "stripe_not_configured", message: asMessage(err) },
      { status: 503 }
    );
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    return NextResponse.json(
      { error: "invalid_signature", message: asMessage(err) },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session, stripe);
        break;
      }
      case "customer.subscription.updated":
      case "customer.subscription.created": {
        const sub = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpsert(sub);
        break;
      }
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(sub);
        break;
      }
      default:
        // no-op for events we don't care about
        break;
    }
    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("[stripe-webhook] handler failed", err);
    return NextResponse.json(
      { error: "handler_failed", message: asMessage(err) },
      { status: 500 }
    );
  }
}

async function handleCheckoutCompleted(
  session: Stripe.Checkout.Session,
  stripe: Stripe
) {
  const workspaceId = (session.metadata && (session.metadata as Record<string, string>)["workspace_id"]) ||
    (session.subscription && typeof session.subscription === "string"
      ? await lookupWorkspaceFromSub(session.subscription, stripe)
      : null);
  const subscriptionId =
    typeof session.subscription === "string" ? session.subscription : session.subscription?.id || null;
  const customerId =
    typeof session.customer === "string" ? session.customer : session.customer?.id || null;

  if (!workspaceId) {
    console.warn("[stripe-webhook] checkout.session.completed without workspace_id", session.id);
    return;
  }

  const updates: Record<string, unknown> = {
    subscriptionStatus: "active",
    updatedAt: new Date(),
  };
  if (subscriptionId) updates.stripeSubscriptionId = subscriptionId;
  if (customerId) updates.stripeCustomerId = customerId;

  await db.update(workspaces).set(updates).where(eq(workspaces.id, workspaceId));
}

async function handleSubscriptionUpsert(sub: Stripe.Subscription) {
  const workspaceId = (sub.metadata && (sub.metadata as Record<string, string>)["workspace_id"]) || null;
  if (!workspaceId) {
    // fall back to customer lookup
    const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer?.id;
    if (!customerId) return;
    const rows = await db
      .select()
      .from(workspaces)
      .where(eq(workspaces.stripeCustomerId, customerId))
      .limit(1);
    const ws = rows[0];
    if (!ws) return;
    await db
      .update(workspaces)
      .set({
        stripeSubscriptionId: sub.id,
        subscriptionStatus: sub.status,
        subscriptionCurrentPeriodEnd: periodEndDate(sub),
        updatedAt: new Date(),
      })
      .where(eq(workspaces.id, ws.id));
    return;
  }
  await db
    .update(workspaces)
    .set({
      stripeSubscriptionId: sub.id,
      subscriptionStatus: sub.status,
      subscriptionCurrentPeriodEnd: periodEndDate(sub),
      updatedAt: new Date(),
    })
    .where(eq(workspaces.id, workspaceId));
}

async function handleSubscriptionDeleted(sub: Stripe.Subscription) {
  const workspaceId = (sub.metadata && (sub.metadata as Record<string, string>)["workspace_id"]) || null;
  if (workspaceId) {
    await db
      .update(workspaces)
      .set({
        subscriptionStatus: "canceled",
        updatedAt: new Date(),
      })
      .where(eq(workspaces.id, workspaceId));
    return;
  }
  const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer?.id;
  if (!customerId) return;
  await db
    .update(workspaces)
    .set({ subscriptionStatus: "canceled", updatedAt: new Date() })
    .where(eq(workspaces.stripeCustomerId, customerId));
}

async function lookupWorkspaceFromSub(
  subscriptionId: string,
  stripe: Stripe
): Promise<string | null> {
  try {
    const sub = await stripe.subscriptions.retrieve(subscriptionId);
    const meta = sub.metadata as Record<string, string> | null;
    return meta?.workspace_id || null;
  } catch {
    return null;
  }
}

function periodEndDate(sub: Stripe.Subscription): Date | null {
  // `current_period_end` is not on every Subscription shape in newer API versions.
  const anySub = sub as unknown as { current_period_end?: number };
  if (typeof anySub.current_period_end === "number") {
    return new Date(anySub.current_period_end * 1000);
  }
  return null;
}

function asMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return String(err);
}

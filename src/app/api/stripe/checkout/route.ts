import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { workspaces } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getStripe, PRICING } from "@/lib/stripe/client";
import { getWorkspaceForAuth } from "@/lib/auth/workspace";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/stripe/checkout
 *
 * Creates a Checkout session for the current workspace.
 *  - mode: "subscription"
 *  - line_items: setup (one-time, $2,500) + monthly ($897 recurring)
 *  - success_url: /checkout/success?session_id={CHECKOUT_SESSION_ID}
 *  - cancel_url: /checkout/canceled
 *
 * Returns { url } to redirect the browser to.
 */
export async function POST() {
  const { userId, orgId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!orgId) {
    return NextResponse.json(
      { error: "org_required", message: "Create an organization first" },
      { status: 400 }
    );
  }

  const workspace = await getWorkspaceForAuth();
  if (!workspace) {
    return NextResponse.json({ error: "no_workspace" }, { status: 400 });
  }

  let stripe;
  try {
    stripe = getStripe();
  } catch (err) {
    return NextResponse.json(
      {
        error: "stripe_not_configured",
        message: err instanceof Error ? err.message : String(err),
      },
      { status: 503 }
    );
  }

  // Ensure we have a Stripe customer for this workspace.
  let customerId = workspace.stripeCustomerId;
  if (!customerId) {
    const user = await currentUser();
    const email = user?.primaryEmailAddress?.emailAddress || undefined;
    const customer = await stripe.customers.create({
      email,
      name: workspace.name,
      metadata: {
        clerk_org_id: workspace.clerkOrgId,
        workspace_id: workspace.id,
        workspace_slug: workspace.slug,
      },
    });
    customerId = customer.id;
    await db
      .update(workspaces)
      .set({ stripeCustomerId: customerId, updatedAt: new Date() })
      .where(eq(workspaces.id, workspace.id));
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://aios-production-c72a.up.railway.app";

  let setupPriceId: string;
  let monthlyPriceId: string;
  try {
    setupPriceId = PRICING.setup();
    monthlyPriceId = PRICING.monthly();
  } catch (err) {
    return NextResponse.json(
      {
        error: "price_ids_missing",
        message: err instanceof Error ? err.message : String(err),
      },
      { status: 503 }
    );
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [
      { price: setupPriceId, quantity: 1 },
      { price: monthlyPriceId, quantity: 1 },
    ],
    subscription_data: {
      metadata: {
        workspace_id: workspace.id,
        clerk_org_id: workspace.clerkOrgId,
      },
    },
    success_url: appUrl + "/checkout/success?session_id={CHECKOUT_SESSION_ID}",
    cancel_url: appUrl + "/checkout/canceled",
    allow_promotion_codes: true,
    billing_address_collection: "auto",
  });

  if (!session.url) {
    return NextResponse.json({ error: "no_session_url" }, { status: 500 });
  }

  return NextResponse.json({ url: session.url, session_id: session.id });
}

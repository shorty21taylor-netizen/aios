import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getStripe } from "@/lib/stripe/client";
import { getWorkspaceForAuth } from "@/lib/auth/workspace";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/stripe/portal
 *
 * Creates a Stripe Billing Portal session for the current workspace and
 * returns the URL. The portal lets the customer cancel, update payment
 * method, see invoices, etc. — all hosted by Stripe.
 */
export async function POST() {
  const { userId, orgId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!orgId) {
    return NextResponse.json({ error: "org_required" }, { status: 400 });
  }

  const workspace = await getWorkspaceForAuth();
  if (!workspace) {
    return NextResponse.json({ error: "no_workspace" }, { status: 400 });
  }
  if (!workspace.stripeCustomerId) {
    return NextResponse.json(
      {
        error: "no_customer",
        message:
          "No Stripe customer on file for this workspace. Complete checkout first.",
      },
      { status: 400 }
    );
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

  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    "https://aios-production-c72a.up.railway.app";

  const session = await stripe.billingPortal.sessions.create({
    customer: workspace.stripeCustomerId,
    return_url: appUrl + "/dashboard/settings/billing",
  });

  return NextResponse.json({ url: session.url });
}

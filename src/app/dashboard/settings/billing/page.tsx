import Link from "next/link";
import { redirect } from "next/navigation";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { getWorkspaceForAuth } from "@/lib/auth/workspace";
import { ArrowLeft } from "lucide-react";
import { ManageBillingButton } from "./manage-billing-button";

export const dynamic = "force-dynamic";

const STATUS_LABELS: Record<string, { label: string; tone: string }> = {
  active: { label: "Active", tone: "bg-emerald-100 text-emerald-800" },
  trialing: { label: "Trialing", tone: "bg-sky-100 text-sky-800" },
  past_due: { label: "Past due — update payment", tone: "bg-amber-100 text-amber-800" },
  canceled: { label: "Canceled", tone: "bg-red-100 text-red-800" },
  unpaid: { label: "Unpaid — access suspended", tone: "bg-red-100 text-red-800" },
  incomplete: { label: "Incomplete checkout", tone: "bg-grey-100 text-grey-700" },
  incomplete_expired: { label: "Checkout expired", tone: "bg-grey-100 text-grey-700" },
};

export default async function BillingPage() {
  const workspace = await getWorkspaceForAuth();
  if (!workspace) redirect("/onboarding");

  const status = workspace.subscriptionStatus;
  const statusInfo = status
    ? STATUS_LABELS[status] || { label: status, tone: "bg-grey-100 text-grey-700" }
    : null;

  const periodEnd = workspace.subscriptionCurrentPeriodEnd
    ? new Date(workspace.subscriptionCurrentPeriodEnd).toLocaleDateString()
    : null;

  const hasCheckoutYet = Boolean(workspace.stripeCustomerId);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <Link
        href="/dashboard/settings"
        className="inline-flex items-center gap-1 text-sm text-grey-600 hover:text-grey-950"
      >
        <ArrowLeft className="h-4 w-4" /> Settings
      </Link>
      <h1 className="mt-4 font-display text-3xl font-semibold text-grey-950">
        Billing
      </h1>
      <p className="mt-2 text-sm text-grey-600">
        Manage your salesyAI Operator subscription, payment method, and invoices.
      </p>

      <Card className="mt-8">
        <CardTitle>Current plan</CardTitle>
        <CardContent>
          <div className="flex items-start justify-between gap-6">
            <div>
              <div className="font-display text-xl text-grey-950">salesyAI Operator</div>
              <div className="mt-1 text-sm text-grey-600">
                $2,500 one-time setup · $897/mo · $200 per closed deal on reactivated revenue
              </div>
              <div className="mt-4 flex items-center gap-3">
                {statusInfo ? (
                  <span
                    className={
                      "rounded-full px-3 py-1 text-xs font-semibold " + statusInfo.tone
                    }
                  >
                    {statusInfo.label}
                  </span>
                ) : (
                  <span className="rounded-full bg-grey-100 px-3 py-1 text-xs font-semibold text-grey-700">
                    No subscription yet
                  </span>
                )}
                {periodEnd ? (
                  <span className="text-xs text-grey-500">
                    Renews {periodEnd}
                  </span>
                ) : null}
              </div>
            </div>
            <div>
              {hasCheckoutYet ? (
                <ManageBillingButton />
              ) : (
                <Link
                  href="/checkout"
                  className="inline-flex items-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 px-5 py-3 text-sm font-semibold text-white shadow-sm"
                >
                  Start subscription
                </Link>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 text-xs text-grey-500">
        Billing is handled securely by Stripe. salesyAI never sees or stores your card details.
      </div>
    </div>
  );
}

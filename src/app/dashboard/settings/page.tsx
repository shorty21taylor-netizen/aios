import Link from "next/link";

import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-white">Settings</h1>

      <Link href="/dashboard/settings/api-keys" className="block">
        <Card className="hover:border-indigo-500 transition-colors cursor-pointer">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>API Keys</CardTitle>
              <CardContent className="p-0 mt-2">
                <p className="text-sm text-slate-400">
                  Manage API keys for n8n integration
                </p>
              </CardContent>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400" />
          </div>
        </Card>
      </Link>

      <Link href="/dashboard/settings/billing" className="block">
        <Card className="hover:border-indigo-500 transition-colors cursor-pointer">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Billing</CardTitle>
              <CardContent className="p-0 mt-2">
                <p className="text-sm text-slate-400">
                  Subscription, invoices, payment method
                </p>
              </CardContent>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400" />
          </div>
        </Card>
      </Link>
    </div>
  );
}

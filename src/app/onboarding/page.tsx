"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [timezone, setTimezone] = useState("America/Chicago");
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/admin/workspaces", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, slug, timezone }),
      });

      if (response.ok) {
        setStep(3);
        const keyResponse = await fetch("/api/admin/api-keys", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ label: "Initial setup key" }),
        });

        if (keyResponse.ok) {
          const keyData = await keyResponse.json();
          setCreatedKey(keyData.key);
        }
      }
    } catch (error) {
      console.error("Error creating workspace:", error);
      alert("Failed to create workspace. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardTitle className="text-2xl">Welcome to AIOS</CardTitle>
        <CardContent>
          {step === 1 && (
            <div className="space-y-6 mt-6">
              <div>
                <p className="text-slate-300 mb-4">
                  Let's set up your workspace. This is where all your n8n events
                  will be tracked.
                </p>
              </div>
              <Button
                variant="primary"
                onClick={() => setStep(2)}
                className="w-full"
              >
                Get Started
              </Button>
            </div>
          )}

          {step === 2 && (
            <form onSubmit={handleCreateWorkspace} className="space-y-6 mt-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Workspace Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="e.g., My Company"
                  className="w-full bg-slate-900 border border-slate-700 rounded px-4 py-2 text-white placeholder-slate-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Slug (URL-safe)
                </label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  required
                  placeholder="e.g., my-company"
                  className="w-full bg-slate-900 border border-slate-700 rounded px-4 py-2 text-white placeholder-slate-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Timezone
                </label>
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-4 py-2 text-white"
                >
                  <option>America/Chicago</option>
                  <option>America/New_York</option>
                  <option>America/Los_Angeles</option>
                  <option>America/Denver</option>
                  <option>UTC</option>
                </select>
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full"
                disabled={loading}
              >
                {loading ? "Creating..." : "Create Workspace"}
              </Button>
            </form>
          )}

          {step === 3 && createdKey && (
            <div className="space-y-6 mt-6">
              <div className="bg-emerald-900 border border-emerald-700 rounded p-4">
                <p className="text-emerald-200 font-medium">
                  Workspace Created Successfully!
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-300 mb-3">
                  Use this API key in your n8n workflows:
                </p>
                <div className="bg-slate-900 p-4 rounded font-mono text-xs break-all">
                  {createdKey}
                </div>
                <Button
                  variant="secondary"
                  onClick={() =>
                    navigator.clipboard.writeText(createdKey)
                  }
                  className="w-full mt-3"
                >
                  Copy API Key
                </Button>
              </div>

              <Button
                variant="primary"
                onClick={() => router.push("/dashboard")}
                className="w-full"
              >
                Go to Dashboard
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

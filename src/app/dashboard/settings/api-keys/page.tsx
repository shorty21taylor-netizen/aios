"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Copy, Trash2, Plus } from "lucide-react";

interface ApiKey {
  id: string;
  label: string;
  isActive: boolean;
  lastUsedAt?: string;
  createdAt: string;
  revokedAt?: string;
}

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [label, setLabel] = useState("");
  const [createdKey, setCreatedKey] = useState<{ key: string; label: string } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchKeys();
  }, []);

  async function fetchKeys() {
    try {
      const response = await fetch("/api/admin/api-keys");
      if (response.ok) {
        const data = await response.json();
        setKeys(data.keys || []);
      }
    } catch (error) {
      console.error("Error fetching API keys:", error);
    } finally {
      setLoading(false);
    }
  }

  async function createKey(e: React.FormEvent) {
    e.preventDefault();
    try {
      const response = await fetch("/api/admin/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label }),
      });

      if (response.ok) {
        const data = await response.json();
        setCreatedKey({ key: data.key, label: data.label });
        setLabel("");
        setShowForm(false);
        fetchKeys();
      }
    } catch (error) {
      console.error("Error creating API key:", error);
    }
  }

  async function revokeKey(id: string) {
    try {
      const response = await fetch(`/api/admin/api-keys/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchKeys();
      }
    } catch (error) {
      console.error("Error revoking API key:", error);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">API Keys</h1>
        {!showForm && (
          <Button
            variant="primary"
            onClick={() => setShowForm(true)}
            className="flex gap-2"
          >
            <Plus className="w-4 h-4" />
            New Key
          </Button>
        )}
      </div>

      {createdKey && (
        <Card className="border-emerald-500 bg-slate-900">
          <CardTitle className="text-emerald-400">API Key Created</CardTitle>
          <CardContent>
            <p className="text-sm text-slate-400 mb-4">
              Copy this key now. You will not see it again.
            </p>
            <div className="bg-slate-950 p-4 rounded font-mono text-sm break-all flex items-center justify-between">
              <span className="flex-1">{createdKey.key}</span>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(createdKey.key);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
              >
                <Copy className="w-4 h-4" />
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>
            <Button
              variant="secondary"
              onClick={() => setCreatedKey(null)}
              className="mt-4 w-full"
            >
              Done
            </Button>
          </CardContent>
        </Card>
      )}

      {showForm && (
        <Card>
          <CardTitle>Create New API Key</CardTitle>
          <CardContent>
            <form onSubmit={createKey} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Label (e.g., "n8n production")
                </label>
                <input
                  type="text"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  required
                  placeholder="Label for this key"
                  className="w-full bg-slate-950 border border-slate-700 rounded px-4 py-2 text-white placeholder-slate-500"
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" variant="primary">
                  Create
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setShowForm(false);
                    setLabel("");
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardTitle>Active Keys</CardTitle>
        <CardContent>
          {loading ? (
            <p className="text-slate-400">Loading keys...</p>
          ) : keys.length === 0 ? (
            <p className="text-slate-400">No API keys created yet.</p>
          ) : (
            <div className="space-y-3">
              {keys.map((key) => (
                <div
                  key={key.id}
                  className="flex items-center justify-between p-4 bg-slate-900 rounded border border-slate-700"
                >
                  <div className="flex-1">
                    <p className="font-medium text-white">{key.label}</p>
                    <p className="text-xs text-slate-500">
                      Created {new Date(key.createdAt).toLocaleDateString()}
                      {key.lastUsedAt &&
                        ` | Last used ${new Date(key.lastUsedAt).toLocaleString()}`}
                    </p>
                    {key.revokedAt && (
                      <p className="text-xs text-red-400">
                        Revoked {new Date(key.revokedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  {key.isActive && (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => revokeKey(key.id)}
                      className="flex gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Revoke
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

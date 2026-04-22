import { redirect } from "next/navigation";
import { getWorkspaceForAuth } from "@/lib/auth/workspace";
import { getAgentRosterForWorkspace } from "@/lib/agents/queries";
import { AgentRosterClient } from "./agent-roster-client";

export default async function AgentsPage() {
  const workspace = await getWorkspaceForAuth();
  if (!workspace) redirect("/sign-in");

  const roster = await getAgentRosterForWorkspace(workspace.id);

  // Turn Date objects into ISO strings so we can pass to client component safely
  const serialized = roster.map((a) => ({
    ...a,
    lastEventAt: a.lastEventAt ? a.lastEventAt.toISOString() : null,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-white">Agents</h2>
        <p className="text-slate-400 mt-1">
          Your 8 AI agents. Each one is a standalone n8n workflow that reads your
          business profile at runtime and calls Claude directly for personalized
          responses.
        </p>
      </div>
      <AgentRosterClient agents={serialized} />
    </div>
  );
}

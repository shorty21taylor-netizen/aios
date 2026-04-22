import { NextResponse } from "next/server";
import { z } from "zod";
import { getWorkspaceForAuth } from "@/lib/auth/workspace";
import { setAgentEnabled } from "@/lib/agents/queries";
import { getAgentBySlug } from "@/lib/agents/catalog";

const ToggleSchema = z.object({
  agentSlug: z.string().min(1),
  isEnabled: z.boolean(),
});

export async function POST(request: Request) {
  const workspace = await getWorkspaceForAuth();
  if (!workspace) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = ToggleSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const { agentSlug, isEnabled } = parsed.data;

  const agentDef = getAgentBySlug(agentSlug);
  if (!agentDef) {
    return NextResponse.json(
      { error: `Unknown agent: ${agentSlug}` },
      { status: 400 }
    );
  }

  await setAgentEnabled(workspace.id, agentSlug, isEnabled);

  return NextResponse.json({
    success: true,
    agentSlug,
    isEnabled,
  });
}

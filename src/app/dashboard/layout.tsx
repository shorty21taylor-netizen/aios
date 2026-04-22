import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { getWorkspaceForAuth } from "@/lib/auth/workspace";
import { UserButton, OrganizationSwitcher } from "@clerk/nextjs";
import { getProfileByWorkspaceId } from "@/lib/profile/queries";

const NAV_LINKS: Array<{ href: string; label: string }> = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/agents", label: "Agents" },
  { href: "/dashboard/settings/profile", label: "Profile" },
];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { orgId } = await auth();

  if (!orgId) {
    redirect("/sign-in");
  }

  const workspace = await getWorkspaceForAuth();
  if (!workspace) {
    redirect("/onboarding");
  }

  // Check if profile onboarding is complete
  const profile = await getProfileByWorkspaceId(workspace.id);
  if (!profile || !profile.onboardingCompletedAt) {
    redirect("/onboarding");
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <header className="border-b border-slate-700 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <h1 
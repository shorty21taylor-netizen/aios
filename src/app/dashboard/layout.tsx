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

  const profile = await getProfileByWorkspaceId(workspace.id);
  if (!profile || !profile.onboardingCompletedAt) {
    redirect("/onboarding");
  }

  return (
    <div className="min-h-screen bg-ink-975">
      <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-ink-975/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="font-display text-xl font-semibold tracking-tight">
              <span className="text-ink-50">salesy</span>
              <span className="bg-gradient-to-r from-brand-400 to-cyan-500 bg-clip-text text-transparent">
                AI
              </span>
            </Link>
            <nav className="flex items-center gap-4">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-ink-300 transition-colors hover:text-ink-50"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <OrganizationSwitcher />
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8">{children}</main>
    </div>
  );
}

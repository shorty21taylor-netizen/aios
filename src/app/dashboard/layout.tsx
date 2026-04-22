import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getWorkspaceForAuth } from "@/lib/auth/workspace";
import { UserButton, OrganizationSwitcher } from "@clerk/nextjs";

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

  return (
    <div className="min-h-screen bg-slate-950">
      <header className="border-b border-slate-700 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-white">AIOS</h1>
            <OrganizationSwitcher />
          </div>
          <UserButton />
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}

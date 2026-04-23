import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId, orgId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  if (!orgId) {
    redirect("/create-organization");
  }

  return <>{children}</>;
}

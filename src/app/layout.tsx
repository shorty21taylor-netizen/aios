import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

export const metadata: Metadata = {
  title: "salesyAI — AI Operating Sales Enablement",
  description: "The AI Operating Sales Enablement system for local home service based companies",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className="bg-slate-950 text-slate-200">{children}</body>
      </html>
    </ClerkProvider>
  );
}

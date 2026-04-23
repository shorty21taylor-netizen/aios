import Link from "next/link";
import { Button } from "@/components/ui/button";


export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
      <div className="text-center max-w-2xl">
        <h1 className="text-5xl font-bold text-white mb-4">AIOS</h1>
        <p className="text-xl text-slate-300 mb-8">
          AI Operating System for home service contractors
        </p>
        <p className="text-slate-400 mb-12">
          Receive events from your n8n workflows and see them instantly on your
          dashboard.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/sign-in">
            <Button variant="primary" size="lg">
              Sign In
            </Button>
          </Link>
          <Link href="/sign-up">
            <Button variant="secondary" size="lg">
              Sign Up
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

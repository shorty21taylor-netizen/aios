import Link from "next/link";
import {
  PhoneOff,
  FileX,
  UserX,
  PhoneCall,
  MessageSquare,
  Workflow,
  CheckCircle2,
  ChevronDown,
} from "lucide-react";

const GRID_BACKDROP_STYLE = {
  backgroundImage:
    "radial-gradient(circle at 1px 1px, rgba(195, 202, 224, 0.22) 1px, transparent 0)",
  backgroundSize: "56px 56px",
  WebkitMaskImage:
    "radial-gradient(ellipse at 50% 0%, black 40%, transparent 80%)",
  maskImage:
    "radial-gradient(ellipse at 50% 0%, black 40%, transparent 80%)",
} as const;

export default function LandingPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-ink-975 text-ink-50 font-sans">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 opacity-[0.35]"
        style={GRID_BACKDROP_STYLE}
      />
      <SiteNav />
      <Hero />
      <StatStrip />
      <Pain />
      <HowItWorks />
      <Pricing />
      <TrustStrip />
      <FAQ />
      <SiteFooter />
    </main>
  );
}

function SiteNav() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-ink-975/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="font-display text-xl font-semibold tracking-tight">
          <span className="text-ink-50">salesy</span>
          <span className="bg-gradient-to-r from-brand-400 to-cyan-500 bg-clip-text text-transparent">
            AI
          </span>
        </Link>
        <nav className="flex items-center gap-3 sm:gap-4">
          <Link
            href="/sign-in"
            className="text-sm text-ink-300 transition-colors hover:text-ink-50"
          >
            Sign In
          </Link>
          <Link
            href="/sign-up"
            className="rounded-xl bg-brand-500 px-4 py-2 text-sm font-medium text-white shadow-[0_0_0_1px_rgba(124,92,255,0.6),0_8px_28px_-10px_rgba(124,92,255,0.7)] transition-colors hover:bg-brand-400"
          >
            Sign Up
          </Link>
          <Link
            href="#demo"
            className="hidden rounded-xl border border-white/10 bg-white/[0.02] px-4 py-2 text-sm font-medium text-ink-50 backdrop-blur-xl transition-colors hover:border-white/20 sm:inline-block"
          >
            Book Demo
          </Link>
        </nav>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-brand-500/30 blur-[120px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute right-0 top-0 h-[360px] w-[360px] translate-x-1/3 rounded-full bg-cyan-500/20 blur-[100px]"
      />
      <div className="relative mx-auto max-w-6xl px-6 pb-20 pt-20 sm:pt-28">
        <div className="font-mono text-xs uppercase tracking-[0.2em] text-brand-400">
          salesyAI · Residential Services
        </div>
        <h1 className="mt-6 bg-gradient-to-br from-ink-50 via-ink-50 to-brand-300 bg-clip-text font-display text-5xl font-medium leading-[1.05] tracking-tight text-transparent md:text-7xl">
          Recover the missed calls and dead estimates already in your business.
        </h1>
        <p className="mt-6 max-w-3xl text-lg text-ink-300 sm:text-xl">
          salesyAI plugs into your existing software, answers every call,
          follows up on every quote, and only charges{" "}
          <span className="text-cyan-400">$200</span> when we close a
          reactivated deal.
        </p>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Link
            href="#demo"
            className="inline-flex items-center justify-center rounded-xl bg-brand-500 px-6 py-3 text-sm font-medium text-white shadow-[0_0_0_1px_rgba(124,92,255,0.6),0_12px_40px_-12px_rgba(124,92,255,0.7)] transition-colors hover:bg-brand-400"
          >
            Book a 15-min demo
          </Link>
          <Link
            href="#how"
            className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/[0.02] px-6 py-3 text-sm font-medium text-ink-50 backdrop-blur-xl transition-colors hover:border-white/20"
          >
            See how it works
          </Link>
        </div>
        <p className="mt-8 text-sm text-ink-400">
          Built for HVAC, plumbing, electrical, roofing, and pest-control owners
          doing real call volume.
        </p>
      </div>
    </section>
  );
}

function StatStrip() {
  const stats = [
    {
      big: "$1,200",
      label: "avg value of a missed home-service call (Housecall Pro)",
    },
    {
      big: "1–2 jobs/mo",
      label: "payback at our pricing",
    },
    {
      big: "60 contractors",
      label: "we're scaling to",
    },
  ];
  return (
    <section className="relative">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid grid-cols-1 divide-y divide-white/[0.06] overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-xl md:grid-cols-3 md:divide-x md:divide-y-0">
          {stats.map((s) => (
            <div key={s.big} className="px-8 py-10">
              <div className="bg-gradient-to-br from-ink-50 to-brand-300 bg-clip-text font-display text-5xl font-medium text-transparent">
                {s.big}
              </div>
              <div className="mt-3 font-mono text-xs uppercase tracking-[0.2em] text-ink-400">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Pain() {
  const cards = [
    {
      icon: PhoneOff,
      title: "Missed calls after hours",
      body:
        "Every unanswered ring is a competitor's booked job. Nights, weekends, storm weeks — the phone never sleeps, but your office does.",
    },
    {
      icon: FileX,
      title: "Stale quotes nobody followed up on",
      body:
        "Sent an estimate a week ago? Two weeks? It's already cold. The follow-up that closes it never happens because someone is always busy.",
    },
    {
      icon: UserX,
      title: "Old customers nobody re-engaged",
      body:
        "Your CRM is full of past customers who loved the service and never heard from you again. That's the cheapest revenue you'll ever buy.",
    },
  ];
  return (
    <section className="relative py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="font-display text-3xl font-medium tracking-tight text-ink-50 sm:text-5xl">
          If your phone misses it, it&apos;s gone.
        </h2>
        <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-3">
          {cards.map(({ icon: Icon, title, body }) => (
            <div
              key={title}
              className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 ring-1 ring-inset ring-white/[0.03] backdrop-blur-xl transition-colors hover:border-brand-500/40"
            >
              <div className="grid h-12 w-12 place-items-center rounded-xl border border-white/[0.08] bg-gradient-to-br from-brand-500/20 to-cyan-500/10">
                <Icon className="h-5 w-5 text-brand-400" />
              </div>
              <h3 className="mt-6 font-display text-xl font-medium text-ink-50">
                {title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-ink-300">
                {body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      num: "01",
      title: "Capture",
      body: "n8n watches every call, SMS, form, and missed touch.",
      icon: PhoneCall,
    },
    {
      num: "02",
      title: "Decide",
      body:
        "salesyAI's brain reads your business profile + history and decides the next action.",
      icon: Workflow,
    },
    {
      num: "03",
      title: "Act",
      body:
        "Voice agent, SMS, and follow-up sequences fire automatically. You see every action in your dashboard.",
      icon: MessageSquare,
    },
  ];
  return (
    <section id="how" className="relative py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="font-display text-3xl font-medium tracking-tight text-ink-50 sm:text-5xl">
          How it works.
        </h2>
        <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-3">
          {steps.map(({ num, title, body, icon: Icon }) => (
            <div
              key={num}
              className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 ring-1 ring-inset ring-white/[0.03] backdrop-blur-xl transition-colors hover:border-brand-500/40"
            >
              <div className="flex items-start justify-between">
                <span className="font-mono text-sm uppercase tracking-[0.2em] text-brand-400">
                  {num}
                </span>
                <div className="grid h-10 w-10 place-items-center rounded-xl border border-white/[0.08] bg-gradient-to-br from-brand-500/20 to-cyan-500/10">
                  <Icon className="h-4 w-4 text-brand-400" />
                </div>
              </div>
              <h3 className="mt-6 font-display text-xl font-medium text-ink-50">
                {title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-ink-300">
                {body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  const bullets = [
    "We answer every inbound (voice + SMS)",
    "We re-engage every cold quote and dead customer",
    "We only charge $200 when a reactivated deal actually closes — upside stays aligned",
    "Live dashboard for every recovered call, booked job, and closed reactivation",
  ];
  return (
    <section id="demo" className="relative py-20 sm:py-28">
      <div className="mx-auto max-w-2xl px-6">
        <div className="rounded-3xl border-2 border-brand-500/40 bg-gradient-to-br from-brand-500/[0.08] via-white/[0.02] to-cyan-500/[0.06] p-10 shadow-[0_0_80px_-20px_rgba(124,92,255,0.35)] backdrop-blur-xl">
          <div className="text-center">
            <span className="inline-flex items-center rounded-full border border-brand-500/30 bg-brand-500/10 px-3 py-1 font-mono text-xs uppercase tracking-[0.2em] text-brand-400">
              Pricing
            </span>
            <h2 className="mt-6 font-display text-3xl font-medium tracking-tight text-ink-50 sm:text-4xl">
              <span className="bg-gradient-to-br from-ink-50 to-brand-300 bg-clip-text text-transparent">
                $2,500
              </span>{" "}
              setup
              <span className="text-ink-600"> • </span>
              <span className="bg-gradient-to-br from-ink-50 to-brand-300 bg-clip-text text-transparent">
                $897
              </span>
              /month
              <span className="text-ink-600"> • </span>
              <span className="bg-gradient-to-br from-ink-50 to-cyan-500 bg-clip-text text-transparent">
                $200
              </span>{" "}
              per closed reactivated deal
            </h2>
          </div>
          <ul className="mt-10 space-y-4">
            {bullets.map((b) => (
              <li key={b} className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 flex-none text-mint-500" />
                <span className="text-ink-200">{b}</span>
              </li>
            ))}
          </ul>
          <div className="mt-10 flex justify-center">
            <Link
              href="https://cal.com/"
              className="inline-flex items-center justify-center rounded-xl bg-brand-500 px-8 py-3 text-sm font-medium text-white shadow-[0_0_0_1px_rgba(124,92,255,0.6),0_12px_40px_-12px_rgba(124,92,255,0.7)] transition-colors hover:bg-brand-400"
            >
              Book a 15-min demo
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function TrustStrip() {
  const names = [
    "ServiceTitan",
    "Housecall Pro",
    "Jobber",
    "Twilio",
    "ElevenLabs",
  ];
  return (
    <section className="relative border-y border-white/[0.04] py-8">
      <div className="mx-auto max-w-6xl px-6 text-center">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-ink-500">
          Plugs into the software you already use.
        </p>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
          {names.map((n, i) => (
            <div key={n} className="flex items-center gap-8">
              <span className="font-mono text-sm uppercase tracking-[0.2em] text-ink-500">
                {n}
              </span>
              {i < names.length - 1 && (
                <span className="hidden text-ink-700 sm:inline" aria-hidden>
                  •
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQ() {
  const faqs = [
    {
      q: "How long until I see my first recovered deal?",
      a: "Most contractors see their first recovered call within 48 hours of going live, and a first closed reactivation within the first 30 days. Onboarding takes about a week so we can load your business profile, past customers, and open estimates.",
    },
    {
      q: "Do I need to switch CRMs?",
      a: "No — we plug in. salesyAI sits on top of whatever you already run (ServiceTitan, Housecall Pro, Jobber, or your own stack). We connect through APIs and n8n so your office never has to log into a new tool.",
    },
    {
      q: "Does this work outside HVAC/plumbing?",
      a: "We're purpose-built for the five residential service verticals where the math is obvious: HVAC, plumbing, electrical, roofing, and pest control. If you're in one of those, we're a fit. Other verticals — let's talk, but we'll be honest if it's not right.",
    },
    {
      q: "How does the $200 per closed deal work?",
      a: "Every reactivation we close — an old customer, a dead quote, a cold lead — gets attributed through your CRM. You only pay the $200 success fee when that job actually closes and is invoiced. If we don't close it, you don't pay it. The upside stays aligned.",
    },
    {
      q: "What happens after the demo?",
      a: "If it's a fit, we send a one-page agreement, collect the $2,500 setup, and kick off onboarding that week. You'll have a dedicated Slack channel, a live dashboard, and your first recovered calls flowing before the next invoice.",
    },
  ];
  return (
    <section className="relative py-20 sm:py-28">
      <div className="mx-auto max-w-3xl px-6">
        <h2 className="font-display text-3xl font-medium tracking-tight text-ink-50 sm:text-5xl">
          Questions.
        </h2>
        <div className="mt-10 space-y-3">
          {faqs.map((f) => (
            <details
              key={f.q}
              className="group rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-xl transition-colors hover:border-brand-500/30"
            >
              <summary className="flex cursor-pointer items-center justify-between gap-4 p-6 text-left [&::-webkit-details-marker]:hidden">
                <span className="font-display text-lg font-medium text-ink-50">
                  {f.q}
                </span>
                <ChevronDown className="h-5 w-5 flex-none text-brand-400 transition-transform group-open:rotate-180" />
              </summary>
              <p className="px-6 pb-6 text-base leading-relaxed text-ink-300">
                {f.a}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function SiteFooter() {
  return (
    <footer className="relative border-t border-white/[0.06] bg-ink-950">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="max-w-md">
            <div className="font-display text-xl font-semibold">
              <span className="text-ink-50">salesy</span>
              <span className="bg-gradient-to-r from-brand-400 to-cyan-500 bg-clip-text text-transparent">
                AI
              </span>
            </div>
            <p className="mt-3 text-sm text-ink-400">
              salesyAI — The AI Operating Sales Enablement system for local home
              service based companies
            </p>
          </div>
          <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink-300">
            <Link href="/sign-in" className="hover:text-ink-50">
              Sign In
            </Link>
            <Link href="/sign-up" className="hover:text-ink-50">
              Sign Up
            </Link>
            <Link href="#" className="hover:text-ink-50">
              Privacy
            </Link>
            <Link href="#" className="hover:text-ink-50">
              Terms
            </Link>
          </nav>
        </div>
        <div className="mt-10 border-t border-white/[0.06] pt-6 font-mono text-xs uppercase tracking-[0.2em] text-ink-500">
          © 2026 salesyAI
        </div>
      </div>
    </footer>
  );
}

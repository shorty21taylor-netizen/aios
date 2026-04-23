import Link from "next/link";
import {
  PhoneOff,
  FileX,
  UserX,
  PhoneCall,
  MessageSquare,
  Workflow,
  CheckCircle2,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-ink-950 text-ink-50 font-sans">
      <SiteNav />
      <Hero />
      <StatStrip />
      <Pain />
      <HowItWorks />
      <Pricing />
      <TrustStrip />
      <FAQ />
      <SiteFooter />
    </div>
  );
}

function SiteNav() {
  return (
    <header className="sticky top-0 z-40 border-b border-ink-800 bg-ink-950/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="font-display text-2xl font-bold tracking-tight">
          <span className="text-ink-50">salesy</span>
          <span className="text-brand-500">AI</span>
        </Link>
        <nav className="flex items-center gap-3 sm:gap-4">
          <Link
            href="/sign-in"
            className="text-sm text-ink-200 transition-colors hover:text-ink-50"
          >
            Sign In
          </Link>
          <Link
            href="/sign-up"
            className="rounded-md bg-brand-500 px-4 py-2 text-sm font-semibold text-ink-950 transition-colors hover:bg-brand-400"
          >
            Sign Up
          </Link>
          <Link
            href="#demo"
            className="hidden rounded-md border border-ink-50/80 px-4 py-2 text-sm font-semibold text-ink-50 transition-colors hover:border-ink-50 hover:bg-ink-50 hover:text-ink-950 sm:inline-block"
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
    <section className="bg-ink-950">
      <div className="mx-auto max-w-6xl px-6 pb-20 pt-20 sm:pt-28">
        <h1 className="font-display text-4xl font-bold leading-[1.05] tracking-tight text-ink-50 sm:text-6xl md:text-7xl">
          Recover the missed calls and dead estimates already in your business.
        </h1>
        <p className="mt-6 max-w-3xl text-lg text-ink-200 sm:text-xl">
          salesyAI plugs into your existing software, answers every call,
          follows up on every quote, and only charges{" "}
          <span className="text-brand-400">$200</span> when we close a
          reactivated deal.
        </p>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Link
            href="#demo"
            className="inline-flex items-center justify-center rounded-md bg-brand-500 px-6 py-3 text-base font-semibold text-ink-950 transition-colors hover:bg-brand-400"
          >
            Book a 15-min demo
          </Link>
          <Link
            href="#how"
            className="inline-flex items-center justify-center rounded-md border border-ink-50/80 px-6 py-3 text-base font-semibold text-ink-50 transition-colors hover:border-ink-50 hover:bg-ink-50 hover:text-ink-950"
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
    <section className="border-y border-ink-800 bg-ink-900">
      <div className="mx-auto grid max-w-6xl grid-cols-1 divide-y divide-ink-800 md:grid-cols-3 md:divide-x md:divide-y-0">
        {stats.map((s) => (
          <div key={s.big} className="px-6 py-8 md:px-10 md:py-10">
            <div className="font-display text-3xl font-bold text-brand-400 sm:text-4xl">
              {s.big}
            </div>
            <div className="mt-2 text-sm text-ink-300 sm:text-base">
              {s.label}
            </div>
          </div>
        ))}
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
    <section className="bg-ink-950 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="font-display text-3xl font-bold tracking-tight text-ink-50 sm:text-5xl">
          If your phone misses it, it&apos;s gone.
        </h2>
        <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-3">
          {cards.map(({ icon: Icon, title, body }) => (
            <div
              key={title}
              className="rounded-xl border border-ink-800 bg-ink-900 p-6"
            >
              <Icon className="h-8 w-8 text-brand-500" />
              <h3 className="mt-5 font-display text-xl font-semibold text-ink-50">
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
      body:
        "n8n watches every call, SMS, form, and missed touch.",
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
    <section id="how" className="border-y border-ink-800 bg-ink-900 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="font-display text-3xl font-bold tracking-tight text-ink-50 sm:text-5xl">
          How it works.
        </h2>
        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          {steps.map(({ num, title, body, icon: Icon }) => (
            <div
              key={num}
              className="rounded-xl border border-ink-800 bg-ink-950 p-7"
            >
              <div className="flex items-center justify-between">
                <span className="font-display text-4xl font-bold text-brand-500">
                  {num}
                </span>
                <Icon className="h-6 w-6 text-ink-400" />
              </div>
              <h3 className="mt-5 font-display text-xl font-semibold text-ink-50">
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
    <section id="demo" className="bg-ink-950 py-20 sm:py-28">
      <div className="mx-auto max-w-3xl px-6">
        <div className="rounded-2xl border border-ink-800 bg-ink-900 p-8 sm:p-12">
          <div className="text-center">
            <div className="inline-flex items-center rounded-full border border-brand-500/30 bg-brand-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand-400">
              Pricing
            </div>
            <h2 className="mt-5 font-display text-3xl font-bold tracking-tight text-ink-50 sm:text-4xl">
              <span className="text-brand-400">$2,500</span> setup
              <span className="text-ink-500"> • </span>
              <span className="text-brand-400">$897</span>/month
              <span className="text-ink-500"> • </span>
              <span className="text-brand-400">$200</span> per closed reactivated deal
            </h2>
          </div>
          <ul className="mt-10 space-y-4">
            {bullets.map((b) => (
              <li key={b} className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 flex-none text-brand-500" />
                <span className="text-ink-200">{b}</span>
              </li>
            ))}
          </ul>
          <div className="mt-10 flex justify-center">
            <Link
              href="https://cal.com/"
              className="inline-flex items-center justify-center rounded-md bg-brand-500 px-8 py-3 text-base font-semibold text-ink-950 transition-colors hover:bg-brand-400"
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
    <section className="border-y border-ink-800 bg-ink-900 py-12">
      <div className="mx-auto max-w-6xl px-6 text-center">
        <p className="text-sm text-ink-400">
          Plugs into the software you already use.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-3 text-ink-400">
          {names.map((n, i) => (
            <span key={n} className="flex items-center gap-10">
              <span className="font-display text-base font-medium sm:text-lg">
                {n}
              </span>
              {i < names.length - 1 && (
                <span className="hidden text-ink-700 sm:inline" aria-hidden>
                  •
                </span>
              )}
            </span>
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
    <section className="bg-ink-950 py-20 sm:py-28">
      <div className="mx-auto max-w-3xl px-6">
        <h2 className="font-display text-3xl font-bold tracking-tight text-ink-50 sm:text-5xl">
          Questions.
        </h2>
        <div className="mt-10 divide-y divide-ink-800 border-y border-ink-800">
          {faqs.map((f) => (
            <details key={f.q} className="group px-1 py-5">
              <summary className="flex cursor-pointer items-center justify-between text-left text-lg font-medium text-ink-50 marker:hidden [&::-webkit-details-marker]:hidden">
                <span className="font-display">{f.q}</span>
                <span className="ml-4 text-brand-500 transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-4 text-base leading-relaxed text-ink-300">
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
    <footer className="border-t border-ink-800 bg-ink-950">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="max-w-md">
            <div className="font-display text-xl font-bold">
              <span className="text-ink-50">salesy</span>
              <span className="text-brand-500">AI</span>
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
        <div className="mt-10 border-t border-ink-800 pt-6 text-xs text-ink-500">
          © 2026 salesyAI
        </div>
      </div>
    </footer>
  );
}

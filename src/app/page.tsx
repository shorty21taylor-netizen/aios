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

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-white text-grey-900 font-sans">
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
    <header className="sticky top-0 z-40 border-b border-grey-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="font-display text-xl font-semibold text-grey-950"
        >
          <span>salesy</span>
          <span className="text-brand-500">AI</span>
        </Link>
        <nav className="flex items-center gap-4 sm:gap-6">
          <Link
            href="/sign-in"
            className="text-sm font-medium text-grey-600 transition-colors hover:text-grey-950"
          >
            Sign In
          </Link>
          <Link
            href="/sign-up"
            className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-600"
          >
            Sign Up
          </Link>
          <Link
            href="#demo"
            className="hidden rounded-lg border border-grey-200 bg-white px-4 py-2 text-sm font-medium text-grey-900 transition-colors hover:border-grey-300 hover:bg-grey-50 sm:inline-block"
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
    <section className="bg-white">
      <div className="mx-auto max-w-6xl px-6 py-32">
        <div className="text-xs font-medium uppercase tracking-[0.14em] text-brand-500">
          salesyAI · Residential Services
        </div>
        <h1 className="mt-6 font-display text-5xl font-medium leading-[1.05] tracking-[-0.02em] text-grey-950 md:text-7xl">
          Recover the missed calls and dead estimates already in your business.
        </h1>
        <p className="mt-6 max-w-xl text-lg text-grey-600">
          salesyAI plugs into your existing software, answers every call,
          follows up on every quote, and only charges{" "}
          <span className="text-grey-950">$200</span> when we close a
          reactivated deal.
        </p>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Link
            href="#demo"
            className="inline-flex items-center justify-center rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-600"
          >
            Book a 15-min demo
          </Link>
          <Link
            href="#how"
            className="inline-flex items-center justify-center rounded-lg border border-grey-200 bg-white px-5 py-2.5 text-sm font-medium text-grey-900 transition-colors hover:border-grey-300 hover:bg-grey-50"
          >
            See how it works
          </Link>
        </div>
        <p className="mt-10 text-sm text-grey-500">
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
    <section className="bg-white">
      <div className="mx-auto max-w-6xl px-6 pb-20">
        <div className="grid grid-cols-1 divide-y divide-grey-200 overflow-hidden rounded-2xl border border-grey-200 bg-grey-50 md:grid-cols-3 md:divide-x md:divide-y-0">
          {stats.map((s) => (
            <div key={s.big} className="px-8 py-10">
              <div className="font-display text-5xl font-semibold text-grey-950">
                {s.big}
              </div>
              <div className="mt-2 text-xs uppercase tracking-[0.14em] text-grey-500">
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
    <section className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="font-display text-3xl font-medium tracking-[-0.02em] text-grey-950 sm:text-5xl">
          If your phone misses it, it&apos;s gone.
        </h2>
        <div className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-3">
          {cards.map(({ icon: Icon, title, body }) => (
            <div
              key={title}
              className="rounded-2xl border border-grey-200 bg-white p-6 transition-colors hover:border-grey-300"
            >
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-brand-50">
                <Icon className="h-5 w-5 text-brand-600" />
              </div>
              <h3 className="mt-6 font-display text-lg font-medium text-grey-950">
                {title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-grey-600">
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
    <section id="how" className="bg-grey-50 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="font-display text-3xl font-medium tracking-[-0.02em] text-grey-950 sm:text-5xl">
          How it works.
        </h2>
        <div className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-3">
          {steps.map(({ num, title, body, icon: Icon }) => (
            <div
              key={num}
              className="rounded-2xl border border-grey-200 bg-white p-6 transition-colors hover:border-grey-300"
            >
              <div className="flex items-start justify-between">
                <span className="text-xs font-medium uppercase tracking-[0.14em] text-brand-500">
                  {num}
                </span>
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-brand-50">
                  <Icon className="h-4 w-4 text-brand-600" />
                </div>
              </div>
              <h3 className="mt-6 font-display text-lg font-medium text-grey-950">
                {title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-grey-600">
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
    <section id="demo" className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-2xl px-6">
        <div className="rounded-3xl border border-grey-200 bg-white p-10 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)]">
          <div className="text-center">
            <span className="inline-flex items-center rounded-full bg-brand-50 px-3 py-1 text-xs font-medium uppercase tracking-[0.14em] text-brand-600">
              Pricing
            </span>
            <h2 className="mt-6 font-display text-4xl font-medium tracking-[-0.02em] text-grey-950 md:text-5xl">
              $2,500 setup
              <span className="text-grey-300"> • </span>
              $897/month
              <span className="text-grey-300"> • </span>
              $200 per closed reactivated deal
            </h2>
          </div>
          <ul className="mt-10 space-y-4">
            {bullets.map((b) => (
              <li key={b} className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 flex-none text-brand-500" />
                <span className="text-grey-700">{b}</span>
              </li>
            ))}
          </ul>
          <div className="mt-10 flex justify-center">
            <Link
              href="https://cal.com/"
              className="inline-flex items-center justify-center rounded-lg bg-brand-500 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-600"
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
    <section className="border-y border-grey-200 bg-white py-8">
      <div className="mx-auto max-w-6xl px-6 text-center">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-grey-500">
          Plugs into the software you already use.
        </p>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
          {names.map((n, i) => (
            <div key={n} className="flex items-center gap-8">
              <span className="text-sm uppercase tracking-[0.14em] text-grey-400">
                {n}
              </span>
              {i < names.length - 1 && (
                <span className="hidden text-grey-300 sm:inline" aria-hidden>
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
    <section className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-3xl px-6">
        <h2 className="font-display text-3xl font-medium tracking-[-0.02em] text-grey-950 sm:text-5xl">
          Questions.
        </h2>
        <div className="mt-12 space-y-3">
          {faqs.map((f) => (
            <details
              key={f.q}
              className="group rounded-2xl border border-grey-200 bg-white transition-colors hover:border-grey-300"
            >
              <summary className="flex cursor-pointer items-center justify-between gap-4 p-6 text-left [&::-webkit-details-marker]:hidden">
                <span className="font-display text-base font-medium text-grey-950">
                  {f.q}
                </span>
                <ChevronDown className="h-5 w-5 flex-none text-grey-400 transition-transform group-open:rotate-180" />
              </summary>
              <p className="px-6 pb-6 text-base leading-relaxed text-grey-600">
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
    <footer className="border-t border-grey-200 bg-grey-50">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="max-w-md">
            <div className="font-display text-xl font-semibold text-grey-950">
              <span>salesy</span>
              <span className="text-brand-500">AI</span>
            </div>
            <p className="mt-3 text-sm text-grey-600">
              salesyAI — The AI Operating Sales Enablement system for local home
              service based companies
            </p>
          </div>
          <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-grey-600">
            <Link href="/sign-in" className="hover:text-grey-950">
              Sign In
            </Link>
            <Link href="/sign-up" className="hover:text-grey-950">
              Sign Up
            </Link>
            <Link href="#" className="hover:text-grey-950">
              Privacy
            </Link>
            <Link href="#" className="hover:text-grey-950">
              Terms
            </Link>
          </nav>
        </div>
        <div className="mt-10 border-t border-grey-200 pt-6 text-xs uppercase tracking-[0.14em] text-grey-400">
          © 2026 salesyAI
        </div>
      </div>
    </footer>
  );
}

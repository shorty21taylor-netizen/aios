"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function LandingPage() {
  // Scroll reveal + cursor spotlight + magnetic CTA wiring
  useEffect(() => {
    // Scroll reveal
    const revs = document.querySelectorAll<HTMLElement>(".reveal");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revs.forEach((r) => io.observe(r));

    // Pain card cursor spotlight
    const onMove = (e: MouseEvent, card: HTMLElement) => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${((e.clientX - rect.left) / rect.width) * 100}%`);
      card.style.setProperty("--my", `${((e.clientY - rect.top) / rect.height) * 100}%`);
    };
    const painCards = document.querySelectorAll<HTMLElement>("[data-spot]");
    const painHandlers: Array<[HTMLElement, (e: MouseEvent) => void]> = [];
    painCards.forEach((card) => {
      const h = (e: MouseEvent) => onMove(e, card);
      card.addEventListener("mousemove", h);
      painHandlers.push([card, h]);
    });

    // Magnetic CTA
    const mag = document.getElementById("magneticCta") as HTMLElement | null;
    const magMove = (e: MouseEvent) => {
      if (!mag) return;
      const rect = mag.getBoundingClientRect();
      const x = (e.clientX - rect.left - rect.width / 2) * 0.25;
      const y = (e.clientY - rect.top - rect.height / 2) * 0.35;
      mag.style.transform = `translate(${x}px, ${y}px)`;
    };
    const magLeave = () => {
      if (mag) mag.style.transform = "";
    };
    if (mag) {
      mag.addEventListener("mousemove", magMove);
      mag.addEventListener("mouseleave", magLeave);
    }

    return () => {
      io.disconnect();
      painHandlers.forEach(([card, h]) => card.removeEventListener("mousemove", h));
      if (mag) {
        mag.removeEventListener("mousemove", magMove);
        mag.removeEventListener("mouseleave", magLeave);
      }
    };
  }, []);

  return (
    <main className="landing-ambient relative min-h-screen bg-white font-sans text-grey-950">
      <SiteNav />
      <Hero />
      <Marquee />
      <Pain />
      <HowItWorks />
      <Pricing />
      <PullQuote />
      <FAQ />
      <SiteFooter />
    </main>
  );
}

/* ------------------------- NAV ------------------------- */
function SiteNav() {
  return (
    <header className="sticky top-0 z-40 border-b border-grey-200 bg-white/80 backdrop-blur-[22px] backdrop-saturate-150">
      <div className="mx-auto flex max-w-[1240px] items-center justify-between px-7 py-4">
        <Link href="/" className="font-display text-[26px] font-medium tracking-[-0.01em] text-grey-950">
          <span>salesy</span>
          <span className="italic text-brand-500">AI</span>
        </Link>
        <nav className="flex items-center gap-8">
          <Link href="#how" className="link-under hidden text-sm text-grey-600 transition-colors hover:text-grey-950 md:inline">
            How it works
          </Link>
          <Link href="#pricing" className="link-under hidden text-sm text-grey-600 transition-colors hover:text-grey-950 md:inline">
            Pricing
          </Link>
          <Link href="#faq" className="link-under hidden text-sm text-grey-600 transition-colors hover:text-grey-950 md:inline">
            FAQ
          </Link>
          <Link
            href="/sign-in"
            className="rounded-lg border border-grey-300 bg-white px-[18px] py-2.5 text-sm font-medium text-grey-950 transition-all hover:border-brand-500 hover:bg-brand-50 hover:text-brand-700"
          >
            Sign In
          </Link>
          <Link
            href="#demo"
            className="btn-sheen inline-flex items-center gap-2 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 px-[18px] py-2.5 text-sm font-semibold text-white shadow-[0_1px_0_rgba(255,255,255,0.35)_inset,0_8px_24px_-8px_rgba(0,154,73,0.55)] transition-all hover:-translate-y-px hover:shadow-[0_1px_0_rgba(255,255,255,0.35)_inset,0_14px_32px_-10px_rgba(0,154,73,0.7)]"
          >
            Book demo <span>→</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}

/* ------------------------- HERO ------------------------- */
function Hero() {
  return (
    <section className="relative overflow-hidden px-0 pb-[140px] pt-[120px] sm:pb-[140px] sm:pt-[120px]">
      <div className="hero-mesh" aria-hidden="true" />
      <div className="relative z-[2] mx-auto max-w-[980px] px-7 text-center">
        <span className="reveal inline-flex items-center gap-2.5 font-mono text-[11px] font-medium uppercase tracking-[0.22em] text-brand-600 before:h-px before:w-6 before:bg-brand-600 before:opacity-70 before:content-['']">
          salesyAI · Residential Services
        </span>
        <h1
          className="reveal mx-auto mt-7 max-w-[920px] font-display text-[clamp(48px,6.4vw,88px)] font-normal leading-[1.02] tracking-[-0.018em] text-grey-950"
          data-d="1"
        >
          Recover the <span className="strike-wrap">missed calls</span> and{" "}
          <span className="italic text-brand-500">dead estimates</span>
          <br />
          already living in your business.
        </h1>
        <p className="reveal mx-auto mt-7 max-w-[620px] text-[19px] leading-[1.55] text-grey-600" data-d="2">
          <strong className="font-semibold text-grey-950">salesyAI</strong> plugs into your existing software, answers
          every call, follows up on every quote — and only charges{" "}
          <strong className="font-semibold text-grey-950">$200</strong> when we close a reactivated deal.
        </p>
        <div className="reveal mt-10 inline-flex flex-wrap justify-center gap-3.5" data-d="3">
          <Link
            href="#demo"
            id="magneticCta"
            className="btn-sheen inline-flex items-center gap-2.5 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 px-6 py-4 text-[15px] font-semibold text-white shadow-[0_1px_0_rgba(255,255,255,0.35)_inset,0_22px_46px_-18px_rgba(0,154,73,0.7)] transition-[box-shadow] duration-300 hover:shadow-[0_1px_0_rgba(255,255,255,0.35)_inset,0_26px_52px_-16px_rgba(0,154,73,0.8)]"
          >
            Book a 15-min demo
            <span className="transition-transform group-hover:translate-x-0.5">→</span>
          </Link>
          <Link
            href="#how"
            className="rounded-xl border border-grey-300 bg-white px-[22px] py-4 text-[15px] font-medium text-grey-950 transition-all hover:border-brand-500 hover:bg-brand-50 hover:text-brand-700"
          >
            See how it works
          </Link>
        </div>
        <div className="reveal mt-[22px] font-mono text-[13px] uppercase tracking-[0.16em] text-grey-500" data-d="3">
          Built for HVAC · Plumbing · Electrical · Roofing · Pest-Control
        </div>
      </div>

      {/* STAT STRIP */}
      <div className="mx-auto max-w-[1240px] px-7">
        <div
          className="reveal mx-auto mt-[90px] grid max-w-[1100px] grid-cols-1 overflow-hidden rounded-[18px] border border-grey-200 bg-white shadow-[0_1px_0_rgba(10,10,10,0.02),0_8px_28px_-20px_rgba(10,10,10,0.12)] md:grid-cols-3"
          data-d="3"
        >
          <div className="border-b border-grey-200 px-8 py-[34px] md:border-b-0 md:border-r">
            <div className="font-display text-[54px] leading-none tracking-[-0.02em] text-grey-950">
              <em className="not-italic text-brand-500">$</em>1,200
            </div>
            <div className="mt-3 font-mono text-[11px] uppercase tracking-[0.22em] text-grey-500">
              Avg value · Missed home-service call (Housecall Pro)
            </div>
          </div>
          <div className="border-b border-grey-200 px-8 py-[34px] md:border-b-0 md:border-r">
            <div className="font-display text-[54px] leading-none tracking-[-0.02em] text-grey-950">
              1–2
              <span className="ml-2 text-[0.45em] italic text-grey-600">jobs/mo</span>
            </div>
            <div className="mt-3 font-mono text-[11px] uppercase tracking-[0.22em] text-grey-500">
              Payback at our pricing
            </div>
          </div>
          <div className="px-8 py-[34px]">
            <div className="font-display text-[54px] leading-none tracking-[-0.02em] text-grey-950">
              60
              <span className="ml-2 text-[0.45em] italic text-grey-600">contractors</span>
            </div>
            <div className="mt-3 font-mono text-[11px] uppercase tracking-[0.22em] text-grey-500">
              Founding cohort we&apos;re scaling to
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------- MARQUEE ------------------------- */
function Marquee() {
  const items = ["ServiceTitan", "Housecall Pro", "Jobber", "Twilio", "ElevenLabs", "Stripe", "QuickBooks"];
  const rendered = [...items, ...items];
  return (
    <section className="mt-[100px] border-y border-grey-200 bg-grey-50 px-0 pb-10 pt-20">
      <div className="mb-[26px] text-center font-mono text-[11px] uppercase tracking-[0.22em] text-grey-500">
        Plugs into the tools you already run
      </div>
      <div className="marquee">
        <div className="marquee-track">
          {rendered.map((name, i) => (
            <span key={i} className="flex items-center gap-16">
              <span className="font-display text-[28px] italic text-grey-600 opacity-85">{name}</span>
              <span className="font-display text-[28px] italic text-grey-600 opacity-85">·</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------- PAIN ------------------------- */
function Pain() {
  const cards = [
    {
      title: "Missed calls after hours.",
      body: "The owner can't pick up at 7pm. The call goes to voicemail. The homeowner calls the next guy in Google.",
      ref: "Ref · Housecall Pro, 2024",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.8a2 2 0 0 1-.45 2.11L8 10.09a16 16 0 0 0 6 6l1.46-1.36a2 2 0 0 1 2.11-.45c.9.34 1.84.57 2.8.7A2 2 0 0 1 22 16.92Z" />
          <line x1="22" y1="2" x2="2" y2="22" />
        </svg>
      ),
    },
    {
      title: "Stale quotes nobody chased.",
      body: "You sent the estimate. They said they'd think about it. Nobody followed up on day 3, day 10, day 30.",
      ref: "Ref · NerdWallet contractor guide",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="9" y1="15" x2="15" y2="15" />
        </svg>
      ),
    },
    {
      title: "Old customers nobody re-engaged.",
      body: "Three years since the last service. Annual reminder never sent. They're on a different company's maintenance plan now.",
      ref: "Ref · salesyAI 2025 cohort avg",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <line x1="17" y1="11" x2="23" y2="5" />
          <line x1="23" y1="11" x2="17" y2="5" />
        </svg>
      ),
    },
  ];
  return (
    <section className="px-0 pb-20 pt-[140px]">
      <div className="mx-auto max-w-[1240px] px-7">
        <div className="reveal mx-auto mb-[70px] max-w-[760px] text-center">
          <span className="inline-flex items-center gap-2.5 font-mono text-[11px] font-medium uppercase tracking-[0.22em] text-brand-600 before:h-px before:w-6 before:bg-brand-600 before:opacity-70 before:content-['']">
            What you&apos;re losing
          </span>
          <h2 className="mt-[18px] font-display text-[clamp(40px,4.8vw,64px)] font-normal leading-[1.05] tracking-[-0.015em] text-grey-950">
            If your phone misses it, <span className="italic text-brand-500">it&apos;s gone.</span>
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {cards.map((c, i) => (
            <div
              key={c.title}
              data-spot
              className="pain-card reveal rounded-[22px] border border-grey-200 bg-white p-[30px] transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-500/30 hover:shadow-[0_18px_40px_-28px_rgba(0,154,73,0.35)]"
              data-d={String(i + 1)}
            >
              <div className="mb-[22px] grid h-[46px] w-[46px] place-items-center rounded-xl border border-brand-500/30 bg-gradient-to-br from-brand-500/20 to-brand-500/5 text-brand-600">
                {c.icon}
              </div>
              <h3 className="font-display text-[26px] font-normal leading-[1.15] text-grey-950">{c.title}</h3>
              <p className="mt-3 text-[15px] leading-[1.55] text-grey-600">{c.body}</p>
              <div className="mt-5 font-mono text-[10px] uppercase tracking-[0.22em] text-grey-500">{c.ref}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------- HOW IT WORKS ------------------------- */
function HowItWorks() {
  const steps = [
    {
      num: "01 · Capture",
      title: "We listen to every signal.",
      body:
        "n8n watches every call, SMS, form submission, and missed touch across Twilio, Google Voice, and your website.",
      lines: [
        { dot: "green", text: "17:42 · Inbound call · no answer" },
        { dot: "amber", text: "17:42 · salesyAI firing…" },
        { dot: null, text: "   → normalizing to event" },
      ],
    },
    {
      num: "02 · Decide",
      title: "Claude reads your business.",
      body:
        "Every signal goes through salesyAI's brain — your tenant profile, pricing, trade, and recent history decide the next best action.",
      lines: [
        { dot: "green", text: "Trade: HVAC · After-hours" },
        { dot: "green", text: "Intent score: 0.82" },
        { dot: null, text: "   → action: SMS + voicemail drop" },
      ],
    },
    {
      num: "03 · Act",
      title: "Voice, SMS, follow-up — fired.",
      body:
        "ElevenLabs voice agent dials back. Smart SMS sequences follow up until they book or opt out. Every action lands on your dashboard.",
      lines: [
        { dot: "green", text: "17:43 · SMS sent" },
        { dot: "green", text: "17:44 · Voice callback initiated" },
        { dot: null, text: "   → booked · $1,480 AC repair" },
      ],
    },
  ];
  return (
    <section id="how" className="bg-grey-50 px-0 py-[120px]">
      <div className="mx-auto max-w-[1240px] px-7">
        <div className="reveal mx-auto mb-[70px] max-w-[760px] text-center">
          <span className="inline-flex items-center gap-2.5 font-mono text-[11px] font-medium uppercase tracking-[0.22em] text-brand-600 before:h-px before:w-6 before:bg-brand-600 before:opacity-70 before:content-['']">
            How it works
          </span>
          <h2 className="mt-[18px] font-display text-[clamp(40px,4.8vw,64px)] font-normal leading-[1.05] tracking-[-0.015em] text-grey-950">
            Three moves. <span className="italic text-brand-500">Every minute</span>, every deal.
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-[22px] md:grid-cols-3">
          {steps.map((s, i) => (
            <div key={s.num} className="reveal overflow-hidden rounded-[22px] border border-grey-200 bg-white p-[34px_28px]" data-d={String(i + 1)}>
              <div className="font-mono text-xs font-semibold uppercase tracking-[0.22em] text-brand-600">{s.num}</div>
              <h3 className="mt-3.5 font-display text-[30px] font-normal leading-[1.1] text-grey-950">{s.title}</h3>
              <p className="mt-3 text-[15px] leading-[1.55] text-grey-600">{s.body}</p>
              <div className="mt-[22px] min-h-[88px] rounded-[14px] border border-[#1a1a1a] bg-[#0A0A0A] p-3.5 font-mono text-[11px] leading-[1.75] text-[#D4D4D4]">
                {s.lines.map((l, j) => (
                  <div key={j} className={l.dot === null ? "text-[#737373]" : ""}>
                    {l.dot && (
                      <span
                        className={`mr-1.5 inline-block h-2 w-2 rounded-full align-middle ${
                          l.dot === "green"
                            ? "bg-[#00B858] shadow-[0_0_8px_rgba(0,184,88,0.6)]"
                            : "bg-[#F2C94C]"
                        }`}
                      />
                    )}
                    {l.text}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------- PRICING ------------------------- */
function Pricing() {
  const feats = [
    "ElevenLabs voice agent with cloned owner voice",
    "Twilio number or port your own",
    "Live dashboard · KPIs · booking attribution",
    "Dedicated Anthony onboarding call",
    "Cancel any time · month-to-month",
    "Founding 60 price locked for life",
  ];
  return (
    <section id="pricing" className="px-0 py-[140px]">
      <div className="mx-auto max-w-[1240px] px-7">
        <div className="reveal mx-auto mb-[70px] max-w-[760px] text-center">
          <span className="inline-flex items-center gap-2.5 font-mono text-[11px] font-medium uppercase tracking-[0.22em] text-brand-600 before:h-px before:w-6 before:bg-brand-600 before:opacity-70 before:content-['']">
            Founding 60 pricing
          </span>
          <h2 className="mt-[18px] font-display text-[clamp(40px,4.8vw,64px)] font-normal leading-[1.05] tracking-[-0.015em] text-grey-950">
            One price. <span className="italic text-brand-500">One handshake.</span> One system.
          </h2>
          <p className="mt-4 text-[17px] leading-[1.6] text-grey-600">
            We only make money when salesyAI makes you money. The $200 per closed deal only fires when we reactivated it — not on jobs you would have closed anyway.
          </p>
        </div>

        <div id="demo" className="reveal price-ring mx-auto max-w-[760px] rounded-[28px] p-[54px]">
          <span className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-3 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-700">
            Founding 60 · Home-service contractors
          </span>
          <h2 className="mt-5 font-display text-[44px] font-normal tracking-[-0.015em] text-grey-950">
            salesyAI <span className="italic text-brand-500">Operator</span>
          </h2>

          <div className="mt-7 grid grid-cols-1 gap-3 md:grid-cols-3">
            {[
              { k: "One-time setup", v: "2,500", sub: "Custom tenant build · prompts · voice agent" },
              { k: "Monthly", v: "897", sub: "Voice · SMS · dashboard · unlimited events" },
              { k: "Per closed deal", v: "200", sub: "Only on reactivated revenue · 0 on new leads" },
            ].map((c) => (
              <div key={c.k} className="rounded-[14px] border border-grey-200 bg-grey-50 p-5">
                <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-grey-500">{c.k}</div>
                <div className="mt-1.5 font-display text-[32px] tracking-[-0.01em] text-grey-950">
                  <em className="mr-0.5 text-[0.6em] not-italic text-brand-500">$</em>
                  {c.v}
                </div>
                <div className="mt-1 text-xs text-grey-600">{c.sub}</div>
              </div>
            ))}
          </div>

          <div className="mt-[34px] grid grid-cols-1 gap-x-[26px] gap-y-3 md:grid-cols-2">
            {feats.map((f) => (
              <div key={f} className="flex items-start gap-2.5 text-sm leading-[1.5] text-grey-800">
                <svg className="mt-0.5 h-[18px] w-[18px] flex-none text-brand-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
                {f}
              </div>
            ))}
          </div>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Link
              href="/sign-up?redirect_url=%2Fcheckout"
              className="btn-sheen inline-flex items-center gap-2.5 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 px-6 py-4 text-[15px] font-semibold text-white shadow-[0_1px_0_rgba(255,255,255,0.35)_inset,0_22px_46px_-18px_rgba(0,154,73,0.7)] transition-shadow hover:shadow-[0_1px_0_rgba(255,255,255,0.35)_inset,0_26px_52px_-16px_rgba(0,154,73,0.8)]"
            >
              Claim founding spot <span>→</span>
            </Link>
            <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-grey-500">60 seats · 12 claimed</span>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------- PULL QUOTE ------------------------- */
function PullQuote() {
  return (
    <section className="border-y border-grey-200 bg-grey-50 px-0 py-[120px]">
      <div className="mx-auto max-w-[1240px] px-7">
        <p className="mx-auto max-w-[900px] text-center font-display text-[clamp(32px,3.8vw,48px)] leading-[1.2] tracking-[-0.01em] text-grey-950">
          &ldquo;We used to lose <span className="italic text-brand-500">four calls a week</span> after 5pm. salesyAI answered them for us the first Tuesday we turned it on.{" "}
          <span className="italic text-brand-500">Paid for itself</span> that same week.&rdquo;
        </p>
        <div className="mt-7 text-center font-mono text-[11px] uppercase tracking-[0.22em] text-grey-500">
          — Owner · 32-tech HVAC shop · Raleigh, NC
        </div>
      </div>
    </section>
  );
}

/* ------------------------- FAQ ------------------------- */
function FAQ() {
  const faqs = [
    {
      q: "Will this really replace my front desk?",
      a: "No. It replaces the moments your front desk can't cover — after hours, lunch, the 3-call pileup at 8am. Your team still runs the day; salesyAI covers the gaps.",
    },
    {
      q: "What if a homeowner hates talking to an AI?",
      a: "The voice agent opens with \"calling on behalf of [your company]\" and offers a callback option on the first reply. Everything escalates to your crew if the caller asks for a person.",
    },
    {
      q: "How long does setup take?",
      a: "48–72 hours. We capture your pricing, service area, hours, and voice samples. Anthony personally walks you through the first live inbound.",
    },
    {
      q: "What software does it plug into?",
      a: "ServiceTitan, Housecall Pro, Jobber, QuickBooks, Twilio, and Stripe out of the box. If you run something custom, we'll build the connector in your setup week.",
    },
    {
      q: "What counts as a \"reactivated\" deal?",
      a: "Any closed job that came from a signal salesyAI originated — missed-call callback, stale-quote follow-up, dormant-customer re-engagement. Net-new leads from ads or walk-ups are never charged $200.",
    },
  ];
  return (
    <section id="faq" className="px-0 pb-[140px] pt-[110px]">
      <div className="mx-auto max-w-[1240px] px-7">
        <div className="reveal mx-auto mb-[70px] max-w-[760px] text-center">
          <span className="inline-flex items-center gap-2.5 font-mono text-[11px] font-medium uppercase tracking-[0.22em] text-brand-600 before:h-px before:w-6 before:bg-brand-600 before:opacity-70 before:content-['']">
            FAQ
          </span>
          <h2 className="mt-[18px] font-display text-[clamp(40px,4.8vw,64px)] font-normal leading-[1.05] tracking-[-0.015em] text-grey-950">
            The <span className="italic text-brand-500">honest</span> answers.
          </h2>
        </div>
        <div className="mx-auto flex max-w-[820px] flex-col gap-2.5">
          {faqs.map((f, idx) => (
            <details
              key={f.q}
              className="group rounded-2xl border border-grey-200 bg-white transition-all open:border-brand-500/30 open:shadow-[0_8px_28px_-20px_rgba(0,154,73,0.35)]"
              open={idx === 0}
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-[22px_24px] font-display text-[22px] font-normal text-grey-950 [&::-webkit-details-marker]:hidden">
                <span>{f.q}</span>
                <span className="text-[22px] text-brand-500 transition-transform duration-300 group-open:rotate-45">+</span>
              </summary>
              <div className="px-6 pb-[22px] text-[15px] leading-[1.65] text-grey-600">{f.a}</div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------- FOOTER ------------------------- */
function SiteFooter() {
  return (
    <footer className="bg-grey-950 px-0 py-[60px_0_50px] text-[#D4D4D4]">
      <div className="mx-auto max-w-[1240px] px-7">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-[1.3fr_1fr_1fr_1fr]">
          <div>
            <Link href="/" className="font-display text-[24px] font-medium tracking-[-0.01em] text-white">
              <span>salesy</span>
              <span className="italic text-[#00B858]">AI</span>
            </Link>
            <p className="mt-3.5 max-w-[280px] text-sm leading-[1.6] text-[#A3A3A3]">
              The AI operating sales enablement system for local home-service companies.
            </p>
          </div>
          <div>
            <h4 className="mb-4 font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-[#737373]">Product</h4>
            <FootLink href="#how">How it works</FootLink>
            <FootLink href="#pricing">Pricing</FootLink>
            <FootLink href="#">Voice agent</FootLink>
            <FootLink href="/dashboard">Dashboard</FootLink>
          </div>
          <div>
            <h4 className="mb-4 font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-[#737373]">Company</h4>
            <FootLink href="#">About</FootLink>
            <FootLink href="#pricing">Founding 60</FootLink>
            <FootLink href="#demo">Book a demo</FootLink>
          </div>
          <div>
            <h4 className="mb-4 font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-[#737373]">Legal</h4>
            <FootLink href="#">Terms</FootLink>
            <FootLink href="#">Privacy</FootLink>
            <FootLink href="#">Compliance</FootLink>
          </div>
        </div>
        <div className="mt-[46px] flex justify-between font-mono text-[11px] uppercase tracking-[0.18em] text-[#737373]">
          <span>© 2026 salesyAI · Residential Services</span>
          <span>Built in Raleigh, NC</span>
        </div>
      </div>
    </footer>
  );
}

function FootLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="block py-1 text-sm text-[#D4D4D4] transition-colors hover:text-white">
      {children}
    </Link>
  );
}

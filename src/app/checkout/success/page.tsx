import Link from "next/link";

export default function CheckoutSuccessPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-6">
      <div className="max-w-lg text-center">
        <div className="font-display text-2xl font-semibold text-grey-950">
          salesy<span className="text-brand-500">AI</span>
        </div>
        <div className="mt-6 inline-flex h-14 w-14 items-center justify-center rounded-full bg-brand-500 text-white">
          <svg
            className="h-7 w-7"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m5 13 4 4 10-10" />
          </svg>
        </div>
        <h1 className="mt-5 font-display text-3xl font-normal tracking-tight text-grey-950">
          You&apos;re in. Welcome to the Founding 60.
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-grey-600">
          Anthony gets a notification now and will reach out within 24 hours to schedule your onboarding call.
          Meanwhile, your workspace is ready to configure.
        </p>
        <Link
          href="/dashboard"
          className="mt-8 inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 px-6 py-3 text-[15px] font-semibold text-white shadow-[0_1px_0_rgba(255,255,255,0.35)_inset,0_22px_46px_-18px_rgba(0,154,73,0.7)]"
        >
          Open your dashboard <span aria-hidden>→</span>
        </Link>
      </div>
    </div>
  );
}

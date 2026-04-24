import Link from "next/link";

export default function CheckoutCanceledPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-6">
      <div className="max-w-md text-center">
        <div className="font-display text-2xl font-semibold text-grey-950">
          salesy<span className="text-brand-500">AI</span>
        </div>
        <h1 className="mt-6 font-display text-3xl font-normal tracking-tight text-grey-950">
          No charge.
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-grey-600">
          You cancelled the checkout before submitting payment. Nothing was charged and your workspace is unchanged.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/checkout"
            className="inline-flex items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 px-5 py-3 text-sm font-semibold text-white shadow-sm"
          >
            Try again
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-xl border border-grey-300 bg-white px-5 py-3 text-sm font-medium text-grey-700 shadow-sm transition-colors hover:bg-grey-50"
          >
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}

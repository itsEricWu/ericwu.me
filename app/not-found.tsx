import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-5 px-4 text-center">
      <p className="eyebrow">Error 404</p>
      <h1 className="font-display text-[clamp(4rem,14vw,8rem)] leading-none font-semibold tracking-[-0.03em]">
        Lost<span className="text-glacier">.</span>
      </h1>
      <p className="max-w-[40ch] text-[15px] text-pretty text-ink-2">
        This trail doesn&apos;t exist. Even Bert couldn&apos;t sniff it out.
      </p>
      <Link
        className="lg mt-2 inline-flex h-10 items-center rounded-full px-5 text-sm font-medium"
        href="/"
      >
        <span aria-hidden className="lg-caustic" />
        <span>Back to basecamp</span>
      </Link>
    </div>
  );
}

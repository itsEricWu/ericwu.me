"use client";

import { useEffect } from "react";

import { useT } from "@/components/locale-provider";

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  const t = useT().error;

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="eyebrow">{t.eyebrow}</p>
      <h1 className="font-display text-4xl font-semibold tracking-[-0.015em]">
        {t.title}
      </h1>
      <button
        className="lg mt-2 inline-flex h-10 items-center rounded-full px-5 text-sm font-medium"
        type="button"
        onClick={() => reset()}
      >
        <span aria-hidden className="lg-caustic" />
        <span>{t.retry}</span>
      </button>
    </div>
  );
}

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 px-4 text-center">
      <h1 className="text-7xl md:text-9xl font-bold text-[#2a2f35] dark:text-[#eef0f7]">
        404
      </h1>
      <p className="text-lg md:text-xl text-[#666] dark:text-[#888]">
        This page doesn&apos;t exist.
      </p>
      <Link
        className="mt-2 px-6 py-3 rounded-full bg-[#ece7e7] dark:bg-[#1e2228] dark:border-2 dark:border-knight text-sm font-medium hover:opacity-80 transition-opacity"
        href="/"
      >
        Back to Home
      </Link>
    </div>
  );
}

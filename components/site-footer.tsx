import { Shortcut } from "@/components/nav/shortcut";
import { siteConfig } from "@/config/site";

export function SiteFooter() {
  return (
    <footer className="relative z-10 mx-auto flex w-full max-w-[1240px] flex-col gap-2 px-4 pb-28 text-[12.5px] text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:pb-10">
      <p>
        © {new Date().getFullYear()} {siteConfig.author} · Seattle, WA
        <span className="max-sm:hidden">
          {" "}
          ·{" "}
          <kbd className="rounded-md border border-line px-1.5 py-0.5 font-sans text-[11px]">
            <Shortcut />
          </kbd>{" "}
          to explore
        </span>
      </p>
    </footer>
  );
}

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
            ⌘K
          </kbd>{" "}
          to explore
        </span>
      </p>
      <p>
        Background: Mount Rainier contours from{" "}
        <a
          className="underline decoration-line-strong underline-offset-2 hover:text-ink"
          href="https://registry.opendata.aws/terrain-tiles/"
          rel="noopener noreferrer"
          target="_blank"
        >
          AWS Terrain Tiles
        </a>{" "}
        (USGS 3DEP)
      </p>
    </footer>
  );
}

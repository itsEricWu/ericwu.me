import { LanguageLink } from "@/components/nav/language-link";
import { Shortcut } from "@/components/nav/shortcut";
import { siteConfig } from "@/config/site";
import type { Locale } from "@/lib/i18n";
import { getMessages } from "@/messages";

/**
 * One step below the page, spanning its column with the text on the column's
 * text edge (see .site-footer). On phones it ends just clear of the floating nav.
 */
export function SiteFooter({ lang }: { lang: Locale }) {
  const t = getMessages(lang);
  const links = [
    { label: "GitHub", href: siteConfig.links.github },
    { label: "LinkedIn", href: siteConfig.links.linkedin },
    { label: t.common.email, href: siteConfig.links.email },
  ];

  return (
    <footer className="site-footer relative z-10 mx-auto w-full max-w-[1240px] px-3 pb-[calc(max(14px,env(safe-area-inset-bottom))+72px)] sm:px-6 sm:pb-9">
      <div className="mx-auto flex max-w-(--footer-col) flex-col gap-2.5 px-(--footer-inset) text-[12.5px] text-muted min-[480px]:flex-row min-[480px]:items-center min-[480px]:justify-between">
        <p>
          © {new Date().getFullYear()} {siteConfig.author} · {t.common.location}
          <span className="max-sm:hidden">
            {" "}
            ·{" "}
            <kbd className="rounded-md border border-line px-1.5 py-0.5 font-sans text-[11px]">
              <Shortcut />
            </kbd>{" "}
            {t.footer.explore}
          </span>
        </p>
        <ul className="flex items-center gap-5">
          {links.map((l) => (
            <li key={l.label}>
              {/* Padding cancelled by margin: a bigger tap target, same layout. */}
              <a
                className="-mx-1.5 -my-2 inline-block px-1.5 py-2 transition-colors hover:text-ink"
                data-cursor={l.label}
                href={l.href}
                rel="noopener noreferrer"
                target={l.href.startsWith("http") ? "_blank" : undefined}
              >
                {l.label}
              </a>
            </li>
          ))}
          <li>
            <LanguageLink className="-mx-1.5 -my-2 inline-block px-1.5 py-2 transition-colors hover:text-ink" />
          </li>
        </ul>
      </div>
    </footer>
  );
}

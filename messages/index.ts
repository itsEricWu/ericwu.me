import { en, type Messages } from "./en";
import { zh } from "./zh";

import type { Locale } from "@/lib/i18n";

export type { Messages };

export const messages: Record<Locale, Messages> = { en, zh };

export const getMessages = (lang: Locale) => messages[lang];

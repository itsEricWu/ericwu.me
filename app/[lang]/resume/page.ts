import { redirect } from "next/navigation";

import { isLocale, localePath } from "@/lib/i18n";

const Page = async ({ params }: { params: Promise<{ lang: string }> }) => {
  const { lang } = await params;

  redirect(localePath(isLocale(lang) ? lang : "en", "/"));
};

export default Page;

import { notFound } from "next/navigation";

// Any path no page matches: the 404 in the page's language (../not-found.tsx).
export default function CatchAll() {
  notFound();
}

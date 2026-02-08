import { Suspense } from "react";

import Loading from "@/components/loading";
import HomeClient from "@/components/home-client";
import { getHomeData } from "@/lib/data";

// Cache the page for 1 hour — avoids re-fetching Firebase URLs on every request
export const revalidate = 3600;

async function HomeContent() {
  const data = await getHomeData();

  return <HomeClient {...data} />;
}

export default function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <HomeContent />
    </Suspense>
  );
}

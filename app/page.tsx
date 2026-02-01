import { Suspense } from "react";

import Loading from "@/components/loading";
import HomeClient from "@/components/home-client";
import { getHomeData } from "@/lib/data";

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

"use client"

import React, { Suspense } from "react";
import dynamic from "next/dynamic";

const HomePageClient = dynamic(() => import("./components/HomePageClient"), {
  ssr: false,
});

function Loading() {
  return <div>Loading...</div>;
}

export default function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <HomePageClient />
    </Suspense>
  );
}

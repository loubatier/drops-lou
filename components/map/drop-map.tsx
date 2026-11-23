"use client";

import dynamic from "next/dynamic";

export type { DropMapProps, MapPin } from "./drop-map-view";

export const DropMap = dynamic(
  () => import("./drop-map-view").then((mod) => mod.DropMapView),
  {
    ssr: false,
    loading: () => (
      <div
        aria-hidden
        className="size-full min-h-32 animate-pulse bg-muted"
      />
    ),
  },
);

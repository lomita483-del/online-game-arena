import { createFileRoute } from "@tanstack/react-router";
import { IsometricCity } from "@/components/game/IsometricCity";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NEW OWERRI — Your Life, Your City" },
      {
        name: "description",
        content:
          "Explore a tilted isometric city, discover places, work for money, and build your own story in this browser-based Nigerian life simulator.",
      },
      { property: "og:title", content: "NEW OWERRI — Your Life, Your City" },
      {
        property: "og:description",
        content: "A new city. A fresh start. Your story is waiting.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: IsometricCity,
});

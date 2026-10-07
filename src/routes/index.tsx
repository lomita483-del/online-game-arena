import { createFileRoute } from "@tanstack/react-router";
import { ImoLifeGame } from "@/components/game/ImoLifeGame";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "IMO LIFE — Owerri Is Yours to Live" },
      {
        name: "description",
        content:
          "Build your life, make your money, and find your people in a shared, living Owerri. Welcome to IMO LIFE.",
      },
      { property: "og:title", content: "IMO LIFE — Owerri Is Yours to Live" },
      {
        property: "og:description",
        content: "Your story begins in Owerri. The city is alive. Come make it yours.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ImoLifeGame,
});
import { createFileRoute } from "@tanstack/react-router";
import { ImoLifeGame } from "@/components/game/ImoLifeGame";

export const Route = createFileRoute("/game")({
  head: () => ({
    meta: [
      { title: "Step into Owerri — IMO LIFE" },
      {
        name: "description",
        content: "Choose your next stop, earn your living, and meet neighbours in a lively Owerri.",
      },
      { property: "og:title", content: "Step into Owerri — IMO LIFE" },
      {
        property: "og:description",
        content: "The city is alive. Find your place in it in IMO LIFE.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ImoLifeGame,
});
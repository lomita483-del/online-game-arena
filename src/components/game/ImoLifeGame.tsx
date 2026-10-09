import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const STORAGE_KEY = "imo-life-save-v1";

type NeedKey = "hunger" | "energy" | "hygiene" | "bladder" | "fun" | "social";
type BackgroundKey = "village_child" | "owerri_born" | "returnee" | "nepo" | "lapo";
type TraitKey =
  | "hustler"
  | "charming"
  | "village_pride"
  | "bookish"
  | "street_smart"
  | "calm"
  | "ambitious"
  | "creative"
  | "resilient"
  | "social_butterfly";
type LocationId =
  | "home"
  | "market"
  | "transport"
  | "campus"
  | "mall"
  | "square"
  | "culture"
  | "stadium";

type GameState = {
  name: string;
  background: BackgroundKey;
  trait: TraitKey;
  money: number;
  rentDue: number;
  location: LocationId;
  day: number;
  mood: string;
  needs: Record<NeedKey, number>;
  skills: Record<string, number>;
  businessLevel: number;
  businessProfit: number;
  businessName: string;
  log: string[];
};

type ActionResult = { label: string; detail: string };

type Draft = {
  name: string;
  background: BackgroundKey;
  trait: TraitKey;
};

const backgrounds: Array<{ id: BackgroundKey; name: string; description: string; cash: number }> = [
  { id: "village_child", name: "Village Child", description: "Low starting cash, strong work ethic.", cash: 12000 },
  { id: "owerri_born", name: "Owerri Born", description: "Balanced start and hometown knowledge.", cash: 35000 },
  { id: "returnee", name: "Returnee", description: "A bit more money, a bit more to prove.", cash: 55000 },
  { id: "nepo", name: "Nepo", description: "Support and a good start in the city.", cash: 120000 },
  { id: "lapo", name: "Lapo", description: "A lean start with debt pressure.", cash: 8000 },
];

const traits: Array<{ id: TraitKey; name: string; description: string }> = [
  { id: "hustler", name: "Hustler", description: "You see an opportunity everywhere." },
  { id: "charming", name: "Charming", description: "People warm up to you fast." },
  { id: "village_pride", name: "Village Pride", description: "Your roots give you strength." },
  { id: "bookish", name: "Bookish", description: "You learn fast and think deeper." },
  { id: "street_smart", name: "Street Smart", description: "You read the city well." },
  { id: "calm", name: "Calm", description: "Pressure does not rattle you." },
  { id: "ambitious", name: "Ambitious", description: "You want the next stairs up." },
  { id: "creative", name: "Creative", description: "You make things happen with style." },
  { id: "resilient", name: "Resilient", description: "Setbacks do not stop your grind." },
  { id: "social_butterfly", name: "Social Butterfly", description: "Every room gets brighter with you in it." },
];

const locations: Array<{ id: LocationId; name: string; district: string; description: string }> = [
  { id: "home", name: "Railway Estate", district: "HOME", description: "Sleep, clean up, and pay rent." },
  { id: "market", name: "Relief Market", district: "MARKET", description: "Eat, trade, and hustle for money." },
  { id: "transport", name: "Orlu Road Park", district: "TRANSPORT", description: "Take a ride and make cash." },
  { id: "campus", name: "IMSU Campus", district: "CAMPUS", description: "Study, network, and build your career." },
  { id: "mall", name: "Owerri Mall", district: "SHOPPING", description: "Bathroom break, good food, and more movement." },
  { id: "square", name: "Heroes Square", district: "CITY CENTRE", description: "Great place to kick back and socialize." },
  { id: "culture", name: "Mbari Cultural Centre", district: "CULTURE", description: "Fun, music, and a bit of joy." },
  { id: "stadium", name: "Dan Anyiam Stadium", district: "STADIUM", description: "Go out, recharge, and enjoy the city." },
];

const defaultNeeds: Record<NeedKey, number> = {
  hunger: 82,
  energy: 84,
  hygiene: 78,
  bladder: 88,
  fun: 79,
  social: 80,
};

const clamp = (value: number, min = 0, max = 100) => Math.min(max, Math.max(min, value));

const formatMoney = (value: number) => `₦${new Intl.NumberFormat("en-NG").format(Math.round(value))}`;

const getMoodFromNeeds = (needs: Record<NeedKey, number>) => {
  const avg = (Object.values(needs).reduce((sum, value) => sum + value, 0) / Object.values(needs).length) | 0;
  if (avg >= 75) return "Thriving";
  if (avg >= 55) return "Balanced";
  if (avg >= 35) return "Stressed";
  return "Exhausted";
};

const initialDraft: Draft = {
  name: "",
  background: "owerri_born",
  trait: "hustler",
};

const createDefaultGame = (draft: Draft): GameState => {
  const backgroundInfo = backgrounds.find((item) => item.id === draft.background) ?? backgrounds[1];
  const skillSeed = {
    cooking: 12,
    business: 10,
    charisma: 13,
    trading: 11,
    fitness: 12,
    academics: 10,
    creativity: 11,
  };

  return {
    name: draft.name.trim() || "Ada Owerri",
    background: backgroundInfo.id,
    trait: draft.trait,
    money: backgroundInfo.cash,
    rentDue: 18000,
    location: "home",
    day: 1,
    mood: "Thriving",
    needs: { ...defaultNeeds },
    skills: skillSeed,
    businessLevel: 0,
    businessProfit: 0,
    businessName: "No business yet",
    log: ["Your story begins in Owerri. Pick your next move."],
  };
};

const loadGame = (): GameState | null => {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as GameState;
  } catch {
    return null;
  }
};

const saveGame = (game: GameState) => {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(game));
  }
};

const applyNeedDelta = (state: GameState, key: NeedKey, delta: number) => ({
  ...state,
  needs: {
    ...state.needs,
    [key]: clamp(state.needs[key] + delta),
  },
});

const getAvailableActions = (location: LocationId): ActionResult[] => {
  const map: Record<LocationId, ActionResult[]> = {
    home: [
      { label: "Sleep", detail: "+32 energy" },
      { label: "Shower", detail: "+28 hygiene" },
      { label: "Pay rent", detail: "-₦18,000" },
    ],
    market: [
      { label: "Eat", detail: "+26 hunger" },
      { label: "Hustle", detail: "+₦4,000" },
      { label: "Buy kiosk", detail: "-₦15,000" },
    ],
    transport: [
      { label: "Work shift", detail: "+₦6,500" },
      { label: "Travel", detail: "+move across city" },
    ],
    campus: [
      { label: "Study", detail: "+academics + social" },
      { label: "Work short shift", detail: "+₦5,000" },
    ],
    mall: [
      { label: "Eat", detail: "+26 hunger" },
      { label: "Go out", detail: "+22 fun" },
    ],
    square: [
      { label: "Socialize", detail: "+24 social" },
      { label: "Take a walk", detail: "+14 fun" },
    ],
    culture: [
      { label: "Enjoy the event", detail: "+30 fun" },
      { label: "Connect with people", detail: "+22 social" },
    ],
    stadium: [
      { label: "Play out", detail: "+24 fun" },
      { label: "Watch a match", detail: "+18 social" },
    ],
  };

  return map[location] ?? [];
};

const moveToLocation = (state: GameState, nextLocation: LocationId): GameState => ({
  ...state,
  location: nextLocation,
  log: [`You moved to ${locations.find((item) => item.id === nextLocation)?.name ?? "another district"}.`, ...state.log.slice(0, 4)],
});

const consumeNeedsOverTime = (state: GameState): GameState => {
  const nextNeeds: Record<NeedKey, number> = {
    hunger: clamp(state.needs.hunger - 7),
    energy: clamp(state.needs.energy - 6),
    hygiene: clamp(state.needs.hygiene - 4),
    bladder: clamp(state.needs.bladder - 6),
    fun: clamp(state.needs.fun - 5),
    social: clamp(state.needs.social - 4),
  };

  return {
    ...state,
    needs: nextNeeds,
    mood: getMoodFromNeeds(nextNeeds),
    log: [`The city keeps moving. Your needs tick down.`, ...state.log.slice(0, 4)],
  };
};

const handleAction = (state: GameState, action: string): GameState => {
  const busyState = consumeNeedsOverTime(state);

  const base = { ...busyState, log: busyState.log.slice(0, 5) };

  switch (action) {
    case "Sleep": {
      const next = applyNeedDelta(base, "energy", 30);
      return {
        ...next,
        needs: { ...next.needs, hygiene: clamp(next.needs.hygiene + 12) },
        mood: "Recovered",
        log: ["You slept well and woke up calmer.", ...next.log.slice(0, 4)],
      };
    }
    case "Shower": {
      const next = applyNeedDelta(base, "hygiene", 30);
      return {
        ...next,
        mood: "Fresh and ready",
        log: ["A quick shower gets you looking and feeling better.", ...next.log.slice(0, 4)],
      };
    }
    case "Pay rent": {
      const nextMoney = base.money - base.rentDue;
      return {
        ...base,
        money: nextMoney,
        rentDue: 18000,
        mood: "Stable",
        log: ["Rent was paid. The landlord is satisfied for now.", ...base.log.slice(0, 4)],
      };
    }
    case "Eat": {
      const next = applyNeedDelta(base, "hunger", 26);
      const withCash = { ...next, money: next.money - 600 };
      return {
        ...withCash,
        log: ["A hot meal settles the stomach and clears the mind.", ...withCash.log.slice(0, 4)],
      };
    }
    case "Hustle": {
      const earned = 4000 + Math.round(base.skills.business * 16);
      return {
        ...applyNeedDelta(base, "social", 8),
        money: base.money + earned,
        skills: { ...base.skills, business: clamp(base.skills.business + 1) },
        mood: "Driven",
        log: [`You hustled the market and made ${formatMoney(earned)}.`, ...base.log.slice(0, 4)],
      };
    }
    case "Buy kiosk": {
      if (base.money < 15000) {
        return { ...base, log: ["You need more cash to buy a kiosk.", ...base.log.slice(0, 4)] };
      }
      return {
        ...base,
        money: base.money - 15000,
        businessLevel: 1,
        businessName: "Roadside Kiosk",
        businessProfit: 2500,
        log: ["You opened a roadside kiosk. The city is now your customer base.", ...base.log.slice(0, 4)],
      };
    }
    case "Work shift": {
      const wage = 6500 + base.skills.trading * 18 + (base.trait === "hustler" ? 1400 : 0);
      return {
        ...applyNeedDelta(base, "energy", -12),
        money: base.money + wage,
        skills: { ...base.skills, trading: clamp(base.skills.trading + 2) },
        mood: "Worked hard",
        log: [`You clocked in and earned ${formatMoney(wage)}.`, ...base.log.slice(0, 4)],
      };
    }
    case "Study": {
      return {
        ...applyNeedDelta(base, "social", 10),
        skills: { ...base.skills, academics: clamp(base.skills.academics + 2) },
        mood: "Learning",
        log: ["You studied hard and levelled up your academics.", ...base.log.slice(0, 4)],
      };
    }
    case "Go out": {
      return {
        ...applyNeedDelta(base, "fun", 24),
        money: base.money - 800,
        mood: "Happy",
        log: ["You spent the evening out in Owerri and came back refreshed.", ...base.log.slice(0, 4)],
      };
    }
    case "Socialize": {
      return {
        ...applyNeedDelta(base, "social", 25),
        skills: { ...base.skills, charisma: clamp(base.skills.charisma + 2) },
        mood: "Connected",
        log: ["You had a good conversation and built your network.", ...base.log.slice(0, 4)],
      };
    }
    case "Travel": {
      const nextLocation = locations[(locations.findIndex((item) => item.id === base.location) + 1) % locations.length].id;
      return moveToLocation(base, nextLocation);
    }
    case "Collect profit": {
      if (base.businessLevel === 0) {
        return { ...base, log: ["You do not own a business yet.", ...base.log.slice(0, 4)] };
      }
      return {
        ...base,
        money: base.money + base.businessProfit,
        businessProfit: base.businessProfit + 1500,
        mood: "Business is moving",
        log: [`Your business paid out ${formatMoney(base.businessProfit)}.`, ...base.log.slice(0, 4)],
      };
    }
    case "Work short shift": {
      const wage = 5000 + base.skills.business * 10;
      return {
        ...applyNeedDelta(base, "energy", -10),
        money: base.money + wage,
        skills: { ...base.skills, business: clamp(base.skills.business + 2) },
        mood: "Productive",
        log: [`A short shift brought in ${formatMoney(wage)}.`, ...base.log.slice(0, 4)],
      };
    }
    case "Take a walk": {
      return {
        ...applyNeedDelta(base, "fun", 12),
        mood: "Chilled",
        log: ["A walk around the city clears out the pressure.", ...base.log.slice(0, 4)],
      };
    }
    case "Enjoy the event": {
      return {
        ...applyNeedDelta(base, "fun", 28),
        skills: { ...base.skills, creativity: clamp(base.skills.creativity + 2) },
        mood: "Joyful",
        log: ["You enjoyed a good set and felt more plugged into the city.", ...base.log.slice(0, 4)],
      };
    }
    case "Play out": {
      return {
        ...applyNeedDelta(base, "fun", 26),
        money: base.money - 600,
        mood: "Energised",
        log: ["You went out and had a proper good time.", ...base.log.slice(0, 4)],
      };
    }
    default:
      return base;
  }
};

export function ImoLifeGame() {
  const [draft, setDraft] = useState<Draft>(initialDraft);
  const [game, setGame] = useState<GameState | null>(() => loadGame());

  useEffect(() => {
    if (game) {
      saveGame(game);
    }
  }, [game]);

  const nextActionLabel = useMemo(() => getAvailableActions(game?.location ?? "home"), [game]);

  const createCharacter = () => {
    const created = createDefaultGame(draft);
    setGame(created);
  };

  const performAction = (action: string) => {
    if (!game) return;
    setGame((current) => (current ? handleAction(current, action) : current));
  };

  const advanceDay = () => {
    setGame((current) => {
      if (!current) return current;
      return {
        ...current,
        day: current.day + 1,
        money: current.money + (current.businessLevel > 0 ? current.businessProfit : 0),
        log: [`Day ${current.day + 1} begins in Owerri. The city wags on.`, ...current.log.slice(0, 4)],
      };
    });
  };

  if (!game) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#1f2f5f,_#0f172a_45%,_#020817)] px-4 py-10 text-white">
        <div className="mx-auto max-w-5xl">
          <div className="mb-8 text-center">
            <p className="text-sm uppercase tracking-[0.35em] text-emerald-300">IMO LIFE</p>
            <h1 className="mt-3 text-4xl font-black tracking-tight md:text-6xl">Build your life in Owerri</h1>
            <p className="mt-3 text-lg text-slate-300">Create your character, manage your needs, work, and grow your hustle in the city.</p>
          </div>

          <div className="grid gap-6 md:grid-cols-[1.2fr_0.8fr]">
            <Card className="border-slate-700 bg-slate-900/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Character Creator</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">Player name</label>
                  <input
                    value={draft.name}
                    onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none ring-0 placeholder:text-slate-500"
                    placeholder="Ada Owerri"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">Background</label>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {backgrounds.map((background) => (
                      <button
                        key={background.id}
                        type="button"
                        onClick={() => setDraft((current) => ({ ...current, background: background.id }))}
                        className={`rounded-xl border p-3 text-left transition ${
                          draft.background === background.id
                            ? "border-emerald-400 bg-emerald-500/10"
                            : "border-slate-700 bg-slate-900/60 hover:border-slate-500"
                        }`}
                      >
                        <div className="flex items-center justify-between text-sm font-semibold text-white">
                          <span>{background.name}</span>
                          <span className="text-emerald-300">{formatMoney(background.cash)}</span>
                        </div>
                        <p className="mt-2 text-xs text-slate-300">{background.description}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">Starting trait</label>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {traits.map((trait) => (
                      <button
                        key={trait.id}
                        type="button"
                        onClick={() => setDraft((current) => ({ ...current, trait: trait.id }))}
                        className={`rounded-xl border p-3 text-left transition ${
                          draft.trait === trait.id
                            ? "border-cyan-400 bg-cyan-500/10"
                            : "border-slate-700 bg-slate-900/60 hover:border-slate-500"
                        }`}
                      >
                        <div className="font-semibold text-white">{trait.name}</div>
                        <p className="mt-1 text-xs text-slate-300">{trait.description}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <Button onClick={createCharacter} className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold">
                  Start your life in Owerri
                </Button>
              </CardContent>
            </Card>

            <Card className="border-slate-700 bg-slate-900/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>City Snapshot</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-slate-300">
                <div className="rounded-xl border border-slate-700 bg-slate-950/60 p-4">
                  <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Live loop</p>
                  <ul className="mt-3 space-y-2 text-sm">
                    <li>• Manage six needs in real time</li>
                    <li>• Work jobs and earn local income</li>
                    <li>• Buy a business and collect profit</li>
                    <li>• Socialize, travel, and grow in the city</li>
                  </ul>
                </div>
                <div className="rounded-xl border border-slate-700 bg-slate-950/60 p-4">
                  <p className="text-xs uppercase tracking-[0.25em] text-slate-400">MVP systems active</p>
                  <ul className="mt-3 space-y-2 text-sm">
                    <li>• Needs & mood loop</li>
                    <li>• Jobs & rent</li>
                    <li>• Business investment</li>
                    <li>• Shared city map</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  const needEntries: Array<{ key: NeedKey; label: string; value: number }> = [
    { key: "hunger", label: "Hunger", value: game.needs.hunger },
    { key: "energy", label: "Energy", value: game.needs.energy },
    { key: "hygiene", label: "Hygiene", value: game.needs.hygiene },
    { key: "bladder", label: "Bladder", value: game.needs.bladder },
    { key: "fun", label: "Fun", value: game.needs.fun },
    { key: "social", label: "Social", value: game.needs.social },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-4 py-6">
        <header className="mb-6 rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-xl shadow-slate-950/20">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-emerald-300">IMO LIFE</p>
              <h1 className="mt-1 text-2xl font-black tracking-tight">Owerri, live your story</h1>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <div className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1.5 text-emerald-200">{game.name}</div>
              <div className="rounded-full border border-slate-700 bg-slate-950 px-3 py-1.5">Day {game.day}</div>
              <div className="rounded-full border border-slate-700 bg-slate-950 px-3 py-1.5">Mood: {game.mood}</div>
              <div className="rounded-full border border-yellow-500/40 bg-yellow-500/10 px-3 py-1.5 text-yellow-200">{formatMoney(game.money)}</div>
            </div>
          </div>
        </header>

        <main className="grid gap-6 xl:grid-cols-[320px_1fr_300px]">
          <aside className="space-y-6">
            <Card className="border-slate-800 bg-slate-900/80">
              <CardHeader>
                <CardTitle>Needs</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {needEntries.map((need) => (
                  <div key={need.key}>
                    <div className="mb-1 flex items-center justify-between text-sm text-slate-300">
                      <span>{need.label}</span>
                      <span>{need.value}%</span>
                    </div>
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-800">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400"
                        style={{ width: `${need.value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-slate-800 bg-slate-900/80">
              <CardHeader>
                <CardTitle>Character</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-300">
                <div className="rounded-xl border border-slate-700 bg-slate-950/50 p-3">
                  <div className="text-xs uppercase tracking-[0.25em] text-slate-400">Background</div>
                  <div className="mt-2 font-semibold text-white">
                    {backgrounds.find((item) => item.id === game.background)?.name ?? "Owerri Born"}
                  </div>
                </div>
                <div className="rounded-xl border border-slate-700 bg-slate-950/50 p-3">
                  <div className="text-xs uppercase tracking-[0.25em] text-slate-400">Trait</div>
                  <div className="mt-2 font-semibold text-white">{traits.find((item) => item.id === game.trait)?.name ?? "Hustler"}</div>
                </div>
                <div className="rounded-xl border border-slate-700 bg-slate-950/50 p-3">
                  <div className="text-xs uppercase tracking-[0.25em] text-slate-400">Rent due</div>
                  <div className="mt-2 font-semibold text-yellow-200">{formatMoney(game.rentDue)}</div>
                </div>
              </CardContent>
            </Card>
          </aside>

          <section className="space-y-6">
            <Card className="border-slate-800 bg-slate-900/80">
              <CardHeader>
                <CardTitle>Map</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {locations.map((location) => (
                    <button
                      key={location.id}
                      type="button"
                      onClick={() => setGame((current) => (current ? moveToLocation(current, location.id) : current))}
                      className={`rounded-2xl border p-4 text-left transition ${
                        game.location === location.id
                          ? "border-emerald-400 bg-emerald-500/10"
                          : "border-slate-700 bg-slate-950/60 hover:border-slate-500"
                      }`}
                    >
                      <div className="text-xs uppercase tracking-[0.2em] text-slate-400">{location.district}</div>
                      <div className="mt-2 text-lg font-bold text-white">{location.name}</div>
                      <p className="mt-2 text-sm text-slate-300">{location.description}</p>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-800 bg-slate-900/80">
              <CardHeader>
                <CardTitle>Actions at {locations.find((item) => item.id === game.location)?.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 md:grid-cols-2">
                  {nextActionLabel.map((action) => (
                    <Button
                      key={action.label}
                      type="button"
                      onClick={() => performAction(action.label)}
                      variant="outline"
                      className="h-auto justify-start border-slate-700 bg-slate-950/80 p-4 text-left"
                    >
                      <div>
                        <div className="font-semibold text-white">{action.label}</div>
                        <div className="mt-1 text-xs text-slate-300">{action.detail}</div>
                      </div>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </section>

          <aside className="space-y-6">
            <Card className="border-slate-800 bg-slate-900/80">
              <CardHeader>
                <CardTitle>Business</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-slate-300">
                <div className="rounded-xl border border-slate-700 bg-slate-950/50 p-3">
                  <div className="text-xs uppercase tracking-[0.25em] text-slate-400">Current</div>
                  <div className="mt-2 font-semibold text-white">{game.businessName}</div>
                </div>
                <div className="rounded-xl border border-slate-700 bg-slate-950/50 p-3">
                  <div className="text-xs uppercase tracking-[0.25em] text-slate-400">Profit</div>
                  <div className="mt-2 font-semibold text-emerald-300">{formatMoney(game.businessProfit)}</div>
                </div>
                <Button onClick={() => performAction("Collect profit")} className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold">
                  Collect profit
                </Button>
                <Button onClick={() => performAction("Buy kiosk")} variant="outline" className="w-full">
                  Buy kiosk for ₦15,000
                </Button>
              </CardContent>
            </Card>

            <Card className="border-slate-800 bg-slate-900/80">
              <CardHeader>
                <CardTitle>City log</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm text-slate-300">
                  {game.log.map((entry, index) => (
                    <div key={`${entry}-${index}`} className="rounded-xl border border-slate-700 bg-slate-950/50 p-3">
                      {entry}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Button onClick={advanceDay} className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold">
              Advance day
            </Button>
          </aside>
        </main>
      </div>
    </div>
  );
}

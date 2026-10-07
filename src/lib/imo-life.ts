import type { LucideIcon } from "lucide-react";
import {
  Banknote,
  Building2,
  GraduationCap,
  Landmark,
  Music2,
  ShoppingBag,
  Store,
  Trophy,
  UsersRound,
  Utensils,
} from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

export type PlayerProfile = Tables<"game_profiles">;
export type CityMessage = Tables<"game_messages">;
export type CityLocation = PlayerProfile["location"];
export type BackgroundKey = PlayerProfile["background"];
export type TraitKey = PlayerProfile["trait"];
export type NeedKey = "hunger" | "energy" | "hygiene" | "bladder" | "fun" | "social";
export type GameAction =
  | "heartbeat"
  | "eat"
  | "sleep"
  | "shower"
  | "bathroom"
  | "socialize"
  | "have_fun"
  | "work"
  | "travel"
  | "buy_kiosk"
  | "restock"
  | "collect_profit"
  | "pay_rent";

export const cityLocations: ReadonlyArray<{
  id: CityLocation;
  name: string;
  district: string;
  description: string;
  icon: LucideIcon;
  mapPin: string;
  actions: ReadonlyArray<GameAction>;
}> = [
  {
    id: "railway_estate",
    name: "Railway Estate",
    district: "HOME",
    description: "Put your feet up. Get some rest.",
    icon: Building2,
    mapPin: "life-map-pin--home",
    actions: ["sleep", "shower", "pay_rent"],
  },
  {
    id: "relief_market",
    name: "Relief Market",
    district: "MARKET",
    description: "Hot food, good people, big business.",
    icon: Store,
    mapPin: "life-map-pin--market",
    actions: ["eat", "socialize", "work", "buy_kiosk"],
  },
  {
    id: "transport_park",
    name: "Orlu Road Park",
    district: "TRANSPORT",
    description: "The city moves. Pick up a driving shift.",
    icon: Banknote,
    mapPin: "life-map-pin--park",
    actions: ["work"],
  },
  {
    id: "imsu",
    name: "IMSU",
    district: "CAMPUS",
    description: "Campus is calling. Go make your mark.",
    icon: GraduationCap,
    mapPin: "life-map-pin--imsu",
    actions: ["socialize", "work"],
  },
  {
    id: "owerri_mall",
    name: "Owerri Mall",
    district: "SHOPPING",
    description: "A bite to eat, a bathroom break, or fashion work.",
    icon: ShoppingBag,
    mapPin: "life-map-pin--mall",
    actions: ["eat", "bathroom", "socialize", "work"],
  },
  {
    id: "heroes_square",
    name: "Heroes Square",
    district: "CITY CENTRE",
    description: "Room to roam. Everybody ends up here.",
    icon: Landmark,
    mapPin: "life-map-pin--square",
    actions: ["have_fun", "socialize"],
  },
  {
    id: "mbari_cultural_centre",
    name: "Mbari Cultural Centre",
    district: "CULTURE",
    description: "Get a feel for the city and its stories.",
    icon: Music2,
    mapPin: "life-map-pin--mbari",
    actions: ["have_fun"],
  },
  {
    id: "dan_anyiam_stadium",
    name: "Dan Anyiam Stadium",
    district: "STADIUM",
    description: "Catch a game and clear your head.",
    icon: Trophy,
    mapPin: "life-map-pin--stadium",
    actions: ["have_fun"],
  },
];

export const backgrounds: ReadonlyArray<{
  id: BackgroundKey;
  label: string;
  description: string;
  startingCash: string;
}> = [
  { id: "village_child", label: "Village child", description: "Roots run deep; your path starts close to the land.", startingCash: "₦12,000" },
  { id: "owerri_born", label: "Owerri born", description: "You know these streets. Your next chapter is yours to write.", startingCash: "₦35,000" },
  { id: "returnee", label: "The returnee", description: "You came back with a little something to your name.", startingCash: "₦55,000" },
  { id: "nepo", label: "Well-connected", description: "A soft landing; now make something of your own.", startingCash: "₦120,000" },
  { id: "lapo", label: "Fresh start", description: "Start with less. Nobody can say you didn't earn it.", startingCash: "₦8,000" },
];

export const traits: ReadonlyArray<{ id: TraitKey; label: string; description: string }> = [
  { id: "hustler", label: "Hustler", description: "You see a side gig in every conversation." },
  { id: "charming", label: "Charming", description: "Even the longest queue makes room for you." },
  { id: "village_pride", label: "Village pride", description: "Your roots give you somewhere to stand." },
  { id: "bookish", label: "Bookish", description: "Always three pages ahead of the rest." },
  { id: "street_smart", label: "Street smart", description: "You know when to go fast and when to wait." },
  { id: "calm", label: "Calm", description: "Go-slow doesn't get under your skin." },
  { id: "ambitious", label: "Ambitious", description: "A bigger vision than the one you started with." },
  { id: "creative", label: "Creative", description: "You can make something from almost nothing." },
  { id: "resilient", label: "Resilient", description: "A hard week is still a week you survived." },
  { id: "social_butterfly", label: "Social butterfly", description: "If it's happening in Owerri, you know." },
];

export const careers: ReadonlyArray<{
  id: string;
  title: string;
  location: CityLocation;
  income: string;
  icon: LucideIcon;
  action: Extract<GameAction, "work">;
}> = [
  { id: "trader", title: "Market trader", location: "relief_market", income: "₦14,000+", icon: Store, action: "work" },
  { id: "delivery_rider", title: "Keke driver", location: "transport_park", income: "₦12,000+", icon: Banknote, action: "work" },
  { id: "teacher", title: "Teaching assistant", location: "imsu", income: "₦18,000+", icon: GraduationCap, action: "work" },
  { id: "designer", title: "Fashion assistant", location: "owerri_mall", income: "₦16,000+", icon: Utensils, action: "work" },
];

export const needs: ReadonlyArray<{
  id: NeedKey;
  label: string;
  icon: LucideIcon;
  barClass: string;
}> = [
  { id: "hunger", label: "Hunger", icon: Utensils, barClass: "life-need-progress--hunger" },
  { id: "energy", label: "Energy", icon: Building2, barClass: "life-need-progress--energy" },
  { id: "hygiene", label: "Hygiene", icon: UsersRound, barClass: "life-need-progress--hygiene" },
  { id: "bladder", label: "Bladder", icon: Building2, barClass: "life-need-progress--bladder" },
  { id: "fun", label: "Good times", icon: Music2, barClass: "life-need-progress--fun" },
  { id: "social", label: "Social", icon: UsersRound, barClass: "life-need-progress--social" },
];

export const transportOptions: ReadonlyArray<{
  id: "walk" | "bus" | "keke" | "okada" | "taxi";
  label: string;
  fare: number;
}> = [
  { id: "walk", label: "Walk", fare: 0 },
  { id: "bus", label: "Bus", fare: 350 },
  { id: "keke", label: "Keke", fare: 700 },
  { id: "okada", label: "Okada", fare: 900 },
  { id: "taxi", label: "Taxi", fare: 1800 },
];

export const needRecovery: ReadonlyArray<{
  id: Extract<GameAction, "eat" | "sleep" | "shower" | "bathroom" | "socialize" | "have_fun">;
  label: string;
  detail: string;
  icon: LucideIcon;
  enabledHere: (location: CityLocation) => boolean;
}> = [
  { id: "eat", label: "Grab a meal", detail: "₦600 · +42 hunger", icon: Utensils, enabledHere: (location) => location === "relief_market" || location === "owerri_mall" },
  { id: "sleep", label: "Take a nap", detail: "+66 energy · home", icon: Building2, enabledHere: (location) => location === "railway_estate" },
  { id: "shower", label: "Freshen up", detail: "+75 hygiene · home", icon: UsersRound, enabledHere: (location) => location === "railway_estate" },
  { id: "bathroom", label: "Use the restroom", detail: "+100 bladder · home or mall", icon: Building2, enabledHere: (location) => location === "railway_estate" || location === "owerri_mall" },
  { id: "socialize", label: "Meet the neighbours", detail: "+32 social · public places", icon: UsersRound, enabledHere: (location) => ["heroes_square", "relief_market", "owerri_mall", "imsu"].includes(location) },
  { id: "have_fun", label: "Go out", detail: "₦300 · +42 good times", icon: Music2, enabledHere: (location) => ["dan_anyiam_stadium", "mbari_cultural_centre", "heroes_square"].includes(location) },
];

export function formatNaira(amount: number): string {
  return `₦${new Intl.NumberFormat("en-NG").format(amount)}`;
}

export function formatCashBalance(amount: number): string {
  return formatNaira(amount);
}

export function readableAge(isoDate: string, now = Date.now()): string {
  const seconds = Math.max(0, Math.floor((now - new Date(isoDate).getTime()) / 1000));
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}
export type PartyId = "cssd" | "ods" | "kscm" | "kdu" | "us";
export type BackgroundId = "dravec" | "pravnik" | "patriot" | "aparatcik";
export type StatKey = "charisma" | "intrigue" | "economy" | "integrity";

export type Effects = Partial<{
  pp: number;
  account: number; // mil. Kč
  blackFund: number; // mil. Kč
  seniority: number;
  heat: number;
  peace: number;
  unity: number;
  debt: number; // mld. Kč
  revenue: number; // mld. Kč / rok
  spending: number; // mld. Kč / rok
  growth: number; // p.b. ročního růstu
  rating: number;
  kompromat: number;
  charisma: number;
  intrigue: number;
  economy: number;
  integrity: number;
  flag: string;
  support: Partial<Record<PartyId, number>>;
}>;

export interface Lagged {
  days: number;
  effects: Effects;
  text: string;
}

export interface RegionDef {
  id: string;
  name: string;
  short: string;
  col: number;
  row: number;
  pop: number;
  unemployment: number;
  gdpIdx: number;
  boss: string;
  support: Record<PartyId, number>;
  infra: string[];
}

export interface RegionState {
  unemployment: number;
  gdpIdx: number;
  support: Record<PartyId, number>;
  bossLoyalty: number;
}

export interface FocusDef {
  id: string;
  tree: "personal" | "national";
  title: string;
  desc: string;
  days: 35 | 56 | 70;
  x: number;
  y: number;
  requires?: string[];
  effects: Effects;
  failEffects?: Effects;
  lagged?: Lagged;
  vote?: { name: string; stance: Record<PartyId, number> };
}

export interface EventOption {
  label: string;
  effects: Effects;
  lagged?: Lagged;
  requires?: Partial<Record<StatKey | "blackFund", number>>;
  special?: "election";
}

export interface GameEvent {
  id: string;
  title: string;
  text: string;
  date?: string;
  random?: boolean;
  condition?: { heatMin?: number; peaceMax?: number; unityMax?: number; intrigueMin?: number };
  options: EventOption[];
}

export interface Kompromat {
  id: string;
  party: PartyId;
  desc: string;
}

export interface LawParams {
  dph: number;
  dppo: number;
  skrty: number;
}

export interface GameState {
  version: 1;
  date: string;
  player: {
    name: string;
    party: PartyId;
    region: string;
    background: BackgroundId;
    stats: Record<StatKey, number>;
    position: number;
    seniority: number;
    account: number;
    blackFund: number;
    pp: number;
    traits: string[];
  };
  economy: {
    gdp: number;
    debt: number;
    revenue: number;
    spending: { pensions: number; health: number; defense: number; other: number };
    growth: number;
    rating: number; // 1..10 (10 = AAA)
    debtBrake: boolean;
  };
  peace: number;
  unity: number;
  heat: number;
  regions: Record<string, RegionState>;
  seats: Record<PartyId, number>;
  government: PartyId[];
  flags: string[];
  focus: { personal: { id: string; progress: number } | null; national: { id: string; progress: number } | null };
  completed: string[];
  scheduled: { date: string; effects: Effects; text: string }[];
  pendingEvent: string | null;
  firedEvents: string[];
  kompromat: Kompromat[];
  lastLawDate: string | null;
  lobby: Partial<Record<PartyId, number>>;
  log: { date: string; text: string; tone?: "good" | "bad" | "info" }[];
  gameOver: string | null;
  lastElection: Record<PartyId, number> | null;
}

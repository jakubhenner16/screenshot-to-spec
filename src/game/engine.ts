import {
  BACKGROUNDS,
  DEBT_BRAKE,
  END_DATE,
  EVENTS,
  FOCUSES,
  MAJORITY,
  PARTIES,
  PARTY_IDS,
  POSITIONS,
  REGIONS,
  START_DATE,
  eventById,
  focusById,
} from "./data";
import type { BackgroundId, Effects, GameState, LawParams, Lagged, PartyId, StatKey } from "./types";

type Rng = () => number;
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const round1 = (v: number) => Math.round(v * 10) / 10;

// ---------- Dates ----------
export function addDays(iso: string, n: number): string {
  const d = new Date(iso + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}
export function formatDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d}. ${m}. ${y}`;
}

// ---------- Creation ----------
export interface NewPlayer {
  name: string;
  party: PartyId;
  region: string;
  background: BackgroundId;
  stats: Record<StatKey, number>;
}

export function createGame(p: NewPlayer): GameState {
  const bg = BACKGROUNDS[p.background];
  const stats = { ...p.stats };
  (Object.keys(bg.stats) as StatKey[]).forEach((k) => (stats[k] = clamp(stats[k] + (bg.stats[k] ?? 0), 0, 100)));
  const regions: GameState["regions"] = {};
  for (const r of REGIONS) {
    const support = { ...r.support };
    if (r.id === p.region) support[p.party] += p.background === "patriot" ? 6 : 2;
    regions[r.id] = { unemployment: r.unemployment, gdpIdx: r.gdpIdx, support, bossLoyalty: r.id === p.region ? 40 : 10 };
  }
  return {
    version: 1,
    date: START_DATE,
    player: {
      ...p,
      stats,
      position: 0,
      seniority: bg.seniority,
      account: bg.account,
      blackFund: bg.blackFund,
      pp: 30,
      traits: [],
    },
    economy: {
      gdp: 2190,
      debt: 380,
      revenue: 600,
      spending: { pensions: 220, health: 120, defense: 45, other: 230 },
      growth: 3,
      rating: 7,
      debtBrake: false,
    },
    peace: 60,
    unity: 55,
    heat: bg.heat,
    regions,
    seats: { cssd: 74, ods: 63, kscm: 24, kdu: 20, us: 19 },
    government: ["cssd"],
    flags: [],
    focus: { personal: null, national: null },
    completed: [],
    scheduled: [],
    pendingEvent: null,
    firedEvents: [],
    kompromat: [],
    lastLawDate: null,
    lobby: {},
    log: [{ date: START_DATE, text: `${p.name} skládá poslanecký slib za ${PARTIES[p.party].short}.`, tone: "info" }],
    gameOver: null,
    lastElection: null,
  };
}

// ---------- Derived ----------
export const debtRatio = (s: GameState) => s.economy.debt / s.economy.gdp;
export const interest = (s: GameState) => s.economy.debt * (0.045 + (10 - s.economy.rating) * 0.004);
export const totalSpending = (s: GameState) => {
  const sp = s.economy.spending;
  return sp.pensions + sp.health + sp.defense + sp.other + interest(s);
};
export const deficit = (s: GameState) => totalSpending(s) - s.economy.revenue;

export function nationalSupport(s: GameState): Record<PartyId, number> {
  const out = Object.fromEntries(PARTY_IDS.map((p) => [p, 0])) as Record<PartyId, number>;
  let pop = 0;
  for (const r of REGIONS) {
    pop += r.pop;
    const sup = s.regions[r.id].support;
    for (const p of PARTY_IDS) out[p] += sup[p] * r.pop;
  }
  const total = PARTY_IDS.reduce((a, p) => a + out[p], 0);
  for (const p of PARTY_IDS) out[p] = round1(((out[p] / pop) * 100) / (total / pop));
  return out;
}

/** Largest-remainder seat allocation among parties >= 5 %. */
export function allocateSeats(support: Record<PartyId, number>, seats = 200): Record<PartyId, number> {
  const eligible = PARTY_IDS.filter((p) => support[p] >= 5);
  const total = eligible.reduce((a, p) => a + support[p], 0);
  const res = Object.fromEntries(PARTY_IDS.map((p) => [p, 0])) as Record<PartyId, number>;
  const rem: [PartyId, number][] = [];
  let used = 0;
  for (const p of eligible) {
    const exact = (support[p] / total) * seats;
    res[p] = Math.floor(exact);
    used += res[p];
    rem.push([p, exact - res[p]]);
  }
  rem.sort((a, b) => b[1] - a[1]);
  for (let i = 0; used < seats; i++, used++) res[rem[i % rem.length][0]]++;
  return res;
}

export function canPromote(s: GameState): { ok: boolean; reason?: string } {
  const next = POSITIONS[s.player.position + 1];
  if (!next) return { ok: false, reason: "Vyšší post neexistuje." };
  if (s.player.seniority < next.seniority) return { ok: false, reason: `Potřebujete senioritu ${next.seniority}.` };
  if (s.player.pp < next.pp) return { ok: false, reason: `Potřebujete ${next.pp} PP.` };
  if (next.needsGov && !s.government.includes(s.player.party)) return { ok: false, reason: "Vaše strana není ve vládě." };
  if (s.player.position + 1 === 4) {
    const largestGov = [...s.government].sort((a, b) => s.seats[b] - s.seats[a])[0];
    if (largestGov !== s.player.party) return { ok: false, reason: "Premiéra dává nejsilnější vládní strana." };
  }
  return { ok: true };
}

// ---------- Effects ----------
export function applyEffects(s: GameState, e: Effects): GameState {
  const n: GameState = structuredClone(s);
  const pl = n.player;
  if (e.pp) pl.pp = Math.max(0, pl.pp + e.pp);
  if (e.account) pl.account = round1(pl.account + e.account);
  if (e.blackFund) pl.blackFund = round1(Math.max(0, pl.blackFund + e.blackFund));
  if (e.seniority) pl.seniority = clamp(pl.seniority + e.seniority, 0, 100);
  if (e.heat) n.heat = clamp(n.heat + e.heat, 0, 100);
  if (e.peace) n.peace = clamp(n.peace + e.peace, 0, 100);
  if (e.unity) n.unity = clamp(n.unity + e.unity, 0, 100);
  if (e.debt) n.economy.debt += e.debt;
  if (e.revenue) n.economy.revenue += e.revenue;
  if (e.spending) n.economy.spending.other += e.spending;
  if (e.growth) n.economy.growth = round1(n.economy.growth + e.growth);
  if (e.rating) n.economy.rating = clamp(n.economy.rating + e.rating, 1, 10);
  for (const k of ["charisma", "intrigue", "economy", "integrity"] as StatKey[]) {
    if (e[k]) pl.stats[k] = clamp(pl.stats[k] + e[k]!, 0, 100);
  }
  if (e.flag && !n.flags.includes(e.flag)) n.flags.push(e.flag);
  if (e.support) {
    for (const r of Object.values(n.regions)) {
      for (const [p, d] of Object.entries(e.support)) r.support[p as PartyId] = clamp(r.support[p as PartyId] + (d ?? 0), 1, 70);
    }
  }
  if (e.kompromat) {
    for (let i = 0; i < e.kompromat; i++) {
      const targets = PARTY_IDS.filter((p) => p !== pl.party);
      const party = targets[Math.floor(Math.random() * targets.length)];
      n.kompromat.push({ id: crypto.randomUUID(), party, desc: `Kompromitující materiál na poslance ${PARTIES[party].short}` });
    }
  }
  return n;
}

export function schedule(s: GameState, l: Lagged): GameState {
  return { ...s, scheduled: [...s.scheduled, { date: addDays(s.date, l.days), effects: l.effects, text: l.text }] };
}

const log = (s: GameState, text: string, tone?: "good" | "bad" | "info"): GameState => ({
  ...s,
  log: [{ date: s.date, text, tone }, ...s.log].slice(0, 120),
});

// ---------- Votes ----------
export function predictVote(
  s: GameState,
  stance: Record<PartyId, number>,
  useKompromat: PartyId[] = [],
): { yes: number; byParty: Record<PartyId, number>; passed: boolean } {
  const byParty = {} as Record<PartyId, number>;
  let yes = 0;
  for (const p of PARTY_IDS) {
    let bonus = s.lobby[p] ?? 0;
    if (s.government.includes(p)) bonus += 0.25 * (s.unity / 100);
    if (p === "ods" && s.flags.includes("opozicni") && s.government.includes("cssd")) bonus += 0.15;
    const share = clamp(0.5 + 1.5 * (stance[p] + bonus), 0, 1);
    let v = Math.round(s.seats[p] * share);
    if (useKompromat.includes(p)) v = Math.min(s.seats[p], v + 8);
    byParty[p] = v;
    yes += v;
  }
  return { yes, byParty, passed: yes >= MAJORITY };
}

export function lawStance(l: LawParams): Record<PartyId, number> {
  const tax = (l.dph - 22) / 17 + (l.dppo - 31) / 15; // >0 = higher taxes
  const cut = l.skrty / 20;
  return {
    cssd: 0.15 + 0.4 * tax - 0.6 * cut,
    ods: -0.05 - 0.6 * tax + 0.4 * cut,
    kscm: -0.2 + 0.3 * tax - 0.9 * cut,
    kdu: 0.05 - 0.2 * tax - 0.1 * cut,
    us: 0 - 0.4 * tax + 0.5 * cut,
  };
}

export function lawEffects(l: LawParams): Effects {
  return {
    revenue: round1((l.dph - 22) * 8 + (l.dppo - 31) * 3),
    spending: round1(-l.skrty * 2.5),
    peace: round1(-l.skrty * 0.6 - Math.max(0, l.dph - 22) * 0.8),
    growth: round1(-(l.dppo - 31) * 0.05),
  };
}

export function submitLaw(s: GameState, l: LawParams, kompromatIds: string[], rng: Rng = Math.random): { state: GameState; passed: boolean; yes: number } {
  const used = s.kompromat.filter((k) => kompromatIds.includes(k.id));
  const pred = predictVote(s, lawStance(l), used.map((k) => k.party));
  const yes = pred.yes + Math.round((rng() - 0.5) * 4); // tajné odchylky
  const passed = yes >= MAJORITY;
  let n: GameState = { ...s, player: { ...s.player, pp: s.player.pp - 25 }, lastLawDate: s.date, lobby: {}, kompromat: s.kompromat.filter((k) => !kompromatIds.includes(k.id)) };
  if (used.length) n = applyEffects(n, { heat: 6 * used.length });
  if (passed) {
    n = applyEffects(n, { ...lawEffects(l), seniority: 4 });
    n = log(n, `Daňový balíček prošel (${yes} hlasů).`, "good");
  } else {
    n = applyEffects(n, { pp: -10, unity: -4 });
    n = log(n, `Daňový balíček neprošel (${yes} hlasů).`, "bad");
  }
  return { state: n, passed, yes };
}

// ---------- Focus ----------
export function focusAvailable(s: GameState, id: string): { ok: boolean; reason?: string } {
  const f = focusById(id);
  if (s.completed.includes(id)) return { ok: false, reason: "Dokončeno" };
  if (s.focus[f.tree]) return { ok: false, reason: "Běží jiný focus" };
  if (f.requires && !f.requires.every((r) => s.completed.includes(r))) return { ok: false, reason: "Chybí předchozí focus" };
  if (f.tree === "national") {
    const inGov = s.government.includes(s.player.party) || (s.flags.includes("opozicni") && s.player.party === "ods");
    if (!inGov && id !== "opozicni") return { ok: false, reason: "Vaše strana nemá vládní vliv" };
    if (id === "opozicni" && !["cssd", "ods"].includes(s.player.party)) return { ok: false, reason: "Jen pro ČSSD nebo ODS" };
    if (s.player.position < 1) return { ok: false, reason: "Potřebujete alespoň post předsedy výboru" };
  }
  return { ok: true };
}

export function startFocus(s: GameState, id: string): GameState {
  const f = focusById(id);
  if (!focusAvailable(s, id).ok) return s;
  return log({ ...s, focus: { ...s.focus, [f.tree]: { id, progress: 0 } } }, `Zahájen focus: ${f.title}.`, "info");
}

function completeFocus(s: GameState, tree: "personal" | "national", rng: Rng): GameState {
  const f = focusById(s.focus[tree]!.id);
  let n: GameState = { ...s, focus: { ...s.focus, [tree]: null }, completed: [...s.completed, f.id] };
  if (f.vote) {
    const r = predictVote(n, f.vote.stance);
    const yes = r.yes + Math.round((rng() - 0.5) * 4);
    if (yes >= MAJORITY) {
      n = applyEffects(n, f.effects);
      n = log(n, `${f.vote.name}: schváleno ${yes} hlasy.`, "good");
    } else {
      n = applyEffects(n, f.failEffects ?? {});
      n = log(n, `${f.vote.name}: zamítnuto (${yes} hlasů).`, "bad");
      return n;
    }
  } else {
    n = applyEffects(n, f.effects);
    n = log(n, `Dokončen focus: ${f.title}.`, "good");
  }
  if (f.lagged) n = schedule(n, f.lagged);
  return n;
}

// ---------- Career actions ----------
export function promote(s: GameState): GameState {
  if (!canPromote(s).ok) return s;
  const next = POSITIONS[s.player.position + 1];
  const n = { ...s, player: { ...s.player, position: s.player.position + 1, pp: s.player.pp - next.pp } };
  return log(n, `Nová funkce: ${next.title}.`, "good");
}

export function defect(s: GameState, to: PartyId): GameState {
  if (to === s.player.party) return s;
  const from = s.player.party;
  const traits = s.player.traits.includes("prebehlik") ? s.player.traits : [...s.player.traits, "prebehlik"];
  let n: GameState = {
    ...s,
    seats: { ...s.seats, [from]: s.seats[from] - 1, [to]: s.seats[to] + 1 },
    player: {
      ...s.player,
      party: to,
      traits,
      seniority: Math.round(s.player.seniority * 0.3),
      position: Math.min(s.player.position, s.government.includes(to) ? 2 : 1),
      stats: { ...s.player.stats, charisma: clamp(s.player.stats.charisma - 10, 0, 100) },
    },
    focus: { ...s.focus, national: null },
  };
  n = applyEffects(n, { unity: -8 });
  return log(n, `Přeběhl jste z ${PARTIES[from].short} do ${PARTIES[to].short}. Média vás nazývají „Zrádce“.`, "bad");
}

export function campaign(s: GameState, regionId: string): GameState {
  if (s.player.account < 1 || s.player.pp < 10) return s;
  const r = s.regions[regionId];
  const bonus = 1 + s.player.stats.charisma / 50 + (regionId === s.player.region ? 1 : 0);
  const n = structuredClone(s);
  n.player.account = round1(n.player.account - 1);
  n.player.pp -= 10;
  n.regions[regionId] = { ...r, support: { ...r.support, [s.player.party]: clamp(r.support[s.player.party] + bonus, 1, 70) } };
  return log(n, `Kampaň v kraji ${REGIONS.find((x) => x.id === regionId)!.name}: +${round1(bonus)} % pro ${PARTIES[s.player.party].short}.`);
}

export function bribeBoss(s: GameState, regionId: string): GameState {
  if (s.player.blackFund < 2) return s;
  const n = structuredClone(s);
  n.player.blackFund = round1(n.player.blackFund - 2);
  n.regions[regionId].bossLoyalty = clamp(n.regions[regionId].bossLoyalty + 25, 0, 100);
  n.regions[regionId].support[s.player.party] = clamp(n.regions[regionId].support[s.player.party] + 2, 1, 70);
  n.heat = clamp(n.heat + 8 - s.player.stats.intrigue / 20, 0, 100);
  return log(n, `Kmotr v kraji ${REGIONS.find((x) => x.id === regionId)!.short} dostal svůj podíl.`);
}

export function lobby(s: GameState, party: PartyId): GameState {
  const cur = s.lobby[party] ?? 0;
  if (s.player.pp < 10 || cur >= 0.3) return s;
  return { ...s, player: { ...s.player, pp: s.player.pp - 10 }, lobby: { ...s.lobby, [party]: round1(cur + 0.1) } };
}

export function hireDetectives(s: GameState, rng: Rng = Math.random): GameState {
  if (s.player.blackFund < 1.5) return s;
  let n: GameState = { ...s, player: { ...s.player, blackFund: round1(s.player.blackFund - 1.5) } };
  const chance = 0.35 + s.player.stats.intrigue / 150;
  n = applyEffects(n, { heat: 6 });
  if (rng() < chance) {
    n = applyEffects(n, { kompromat: 1 });
    return log(n, "Detektivové přinesli odposlechy. Nová složka.", "good");
  }
  return log(n, "Detektivové nic nenašli. Peníze jsou pryč.", "bad");
}

export function leakKompromat(s: GameState, id: string): GameState {
  const k = s.kompromat.find((x) => x.id === id);
  if (!k) return s;
  let n: GameState = { ...s, kompromat: s.kompromat.filter((x) => x.id !== id) };
  n = applyEffects(n, { support: { [k.party]: -2 }, pp: 15, heat: 3 });
  return log(n, `Únik do médií poškodil ${PARTIES[k.party].short}.`, "good");
}

export function launder(s: GameState): GameState {
  if (s.player.blackFund < 2) return s;
  let n: GameState = { ...s, player: { ...s.player, blackFund: round1(s.player.blackFund - 2), account: round1(s.player.account + 1.2) } };
  n = applyEffects(n, { heat: 5 });
  return log(n, "Přes poradenskou firmu na Kypru jste vyprali 2 mil. Kč.");
}

export function puc(s: GameState, rng: Rng = Math.random): GameState {
  if (!s.flags.includes("puc_ready") || s.player.position >= 3) return s;
  let n: GameState = { ...s, flags: s.flags.filter((f) => f !== "puc_ready") };
  const chance = 0.25 + s.player.stats.intrigue / 200 + s.player.seniority / 300;
  if (rng() < chance) {
    n = { ...n, player: { ...n.player, position: 3 } };
    n = applyEffects(n, { unity: -15, seniority: 10 });
    return log(n, "Puč se podařil. Jste předsedou strany!", "good");
  }
  n = applyEffects(n, { seniority: -25, unity: -10 });
  n = { ...n, player: { ...n.player, position: 0 } };
  return log(n, "Puč selhal. Předseda vás sesadil na zadní lavici.", "bad");
}

// ---------- Election ----------
export function runElection(s: GameState): GameState {
  const sup = nationalSupport(s);
  const seats = allocateSeats(sup);
  const order = [...PARTY_IDS].sort((a, b) => seats[b] - seats[a]);
  const leader = order[0];
  const left: PartyId[] = ["cssd", "kdu", "us"];
  const right: PartyId[] = ["ods", "kdu", "us"];
  let gov: PartyId[] = [leader];
  const pool = (leader === "cssd" ? left : leader === "ods" ? right : order).filter((p) => p !== leader && seats[p] > 0);
  for (const p of pool) {
    if (gov.reduce((a, x) => a + seats[x], 0) >= MAJORITY) break;
    gov.push(p);
  }
  if (gov.reduce((a, x) => a + seats[x], 0) < MAJORITY) gov = [leader];
  let n: GameState = { ...s, seats, government: gov, lastElection: sup };
  const inGov = gov.includes(s.player.party);
  n = applyEffects(n, { seniority: inGov ? 8 : -3, unity: 15 });
  if (!inGov && n.player.position === 2) n.player.position = 1;
  if (!inGov && n.player.position === 4) n.player.position = 3;
  return log(n, `Volby: ${order.map((p) => `${PARTIES[p].short} ${seats[p]}`).join(", ")}. Vláda: ${gov.map((p) => PARTIES[p].short).join(" + ")}.`, "info");
}

// ---------- Events ----------
export function resolveEvent(s: GameState, optionIndex: number): GameState {
  if (!s.pendingEvent) return s;
  const ev = eventById(s.pendingEvent);
  const opt = ev.options[optionIndex];
  let n: GameState = { ...s, pendingEvent: null };
  n = applyEffects(n, opt.effects);
  if (opt.lagged) n = schedule(n, opt.lagged);
  if (opt.special === "election") n = runElection(n);
  return log(n, `${ev.title}: ${opt.label}.`);
}

export function optionAllowed(s: GameState, req?: Partial<Record<StatKey | "blackFund", number>>) {
  if (!req) return true;
  return Object.entries(req).every(([k, v]) => (k === "blackFund" ? s.player.blackFund >= v! : s.player.stats[k as StatKey] >= v!));
}

// ---------- Tick ----------
export function tick(s: GameState, rng: Rng = Math.random): GameState {
  if (s.gameOver || s.pendingEvent) return s;
  let n: GameState = { ...s, date: addDays(s.date, 1) };

  // Daily political power
  const ppGain = 0.25 + n.player.position * 0.15 + n.peace / 300 + n.player.stats.charisma / 400;
  n.player = { ...n.player, pp: round1(n.player.pp + ppGain) };

  // Focus progress
  for (const tree of ["personal", "national"] as const) {
    const f = n.focus[tree];
    if (!f) continue;
    const prog = f.progress + 1;
    if (prog >= focusById(f.id).days) n = completeFocus({ ...n, focus: { ...n.focus, [tree]: { ...f, progress: prog } } }, tree, rng);
    else n = { ...n, focus: { ...n.focus, [tree]: { ...f, progress: prog } } };
  }

  // Scheduled (lagged) consequences
  const due = n.scheduled.filter((x) => x.date <= n.date);
  if (due.length) {
    n = { ...n, scheduled: n.scheduled.filter((x) => x.date > n.date) };
    for (const d of due) n = log(applyEffects(n, d.effects), d.text, "bad");
  }

  // Monthly economy
  if (n.date.endsWith("-01")) n = monthly(n, rng);

  // Historical events
  const hist = EVENTS.find((e) => e.date && e.date <= n.date && !n.firedEvents.includes(e.id));
  if (hist) {
    n = { ...n, pendingEvent: hist.id, firedEvents: [...n.firedEvents, hist.id] };
  } else if (new Date(n.date + "T00:00:00Z").getUTCDay() === 1 && rng() < 0.1) {
    const pool = EVENTS.filter((e) => e.random && conditionMet(n, e.condition));
    if (pool.length) n = { ...n, pendingEvent: pool[Math.floor(rng() * pool.length)].id };
  }

  // Game over checks
  if (n.heat >= 100) n = { ...n, gameOver: "Policie si pro vás přišla. Sněmovna vás vydala k trestnímu stíhání." };
  else if (n.date >= END_DATE) n = { ...n, gameOver: "end" };
  return n;
}

function conditionMet(s: GameState, c?: { heatMin?: number; peaceMax?: number; unityMax?: number; intrigueMin?: number }) {
  if (!c) return true;
  if (c.heatMin !== undefined && s.heat < c.heatMin) return false;
  if (c.peaceMax !== undefined && s.peace > c.peaceMax) return false;
  if (c.unityMax !== undefined && s.unity > c.unityMax) return false;
  if (c.intrigueMin !== undefined && s.player.stats.intrigue < c.intrigueMin) return false;
  return true;
}

export function monthly(s: GameState, rng: Rng = Math.random): GameState {
  const n: GameState = structuredClone(s);
  const e = n.economy;
  const def = deficit(n);
  e.debt = round1(e.debt + def / 12);
  e.gdp = round1(e.gdp * (1 + e.growth / 100 / 12));
  e.revenue = round1(e.revenue * (1 + e.growth / 100 / 12));
  e.growth = round1(e.growth + (3 - e.growth) * 0.05);

  const ratio = debtRatio(n);
  if (ratio > DEBT_BRAKE && !e.debtBrake) {
    e.debtBrake = true;
    e.spending.other = round1(e.spending.other * 0.85);
    n.peace = clamp(n.peace - 15, 0, 100);
    e.rating = clamp(e.rating - 2, 1, 10);
    n.log = [{ date: n.date, text: "Dluhová brzda! Výdaje zmrazeny, společnost se bouří.", tone: "bad" as const }, ...n.log];
  } else if (ratio <= DEBT_BRAKE && e.debtBrake) e.debtBrake = false;
  if (e.debtBrake) n.peace = clamp(n.peace - 1, 0, 100);
  if (def / e.gdp > 0.05 && rng() < 0.15) e.rating = clamp(e.rating - 1, 1, 10);

  // Regions drift
  for (const r of REGIONS) {
    const rs = n.regions[r.id];
    rs.unemployment = round1(clamp(rs.unemployment + (2.5 - e.growth) * 0.05 + (rng() - 0.5) * 0.2, 2, 25));
    const govP = n.government[0];
    const mood = (n.peace - 50) / 200;
    rs.support[govP] = clamp(rs.support[govP] + mood - (rs.unemployment > 12 ? 0.15 : 0), 1, 70);
    if (rs.unemployment > 12) rs.support.kscm = clamp(rs.support.kscm + 0.1, 1, 70);
  }

  // Player income & passive changes
  const pl = n.player;
  pl.account = round1(pl.account + 0.06 + pl.position * 0.03);
  pl.seniority = clamp(pl.seniority + (pl.background === "aparatcik" ? 1 : 0.5), 0, 100);
  if (n.flags.includes("cez")) pl.account = round1(pl.account + 0.15);
  if (n.flags.includes("cepro")) {
    pl.blackFund = round1(pl.blackFund + 0.4);
    n.heat = clamp(n.heat + 1, 0, 100);
  }
  n.heat = clamp(n.heat - 0.5 - pl.stats.integrity / 100, 0, 100);
  n.unity = clamp(n.unity + (55 - n.unity) * 0.05, 0, 100);
  n.peace = clamp(n.peace + (55 - n.peace) * 0.03, 0, 100);
  return n;
}

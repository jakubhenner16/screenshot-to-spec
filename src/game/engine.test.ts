import { describe, expect, it } from "vitest";
import { allocateSeats, applyEffects, createGame, monthly, predictVote, schedule, tick } from "./engine";
import { FOCUSES, MAJORITY } from "./data";

const base = () =>
  createGame({ name: "Test", party: "cssd", region: "ms", background: "pravnik", stats: { charisma: 40, intrigue: 40, economy: 40, integrity: 40 } });

describe("pravidla hry", () => {
  it("dluhová brzda se spustí nad 55 % HDP", () => {
    const s = applyEffects(base(), { debt: 1300 }); // (380+1300)/2190 > 0.55
    const n = monthly(s, () => 0.9);
    expect(n.economy.debtBrake).toBe(true);
  });

  it("pod 55 % HDP brzda neběží", () => {
    expect(monthly(base(), () => 0.9).economy.debtBrake).toBe(false);
  });

  it("focusy trvají 35, 56 nebo 70 dní", () => {
    for (const f of FOCUSES) expect([35, 56, 70]).toContain(f.days);
  });

  it("zákon projde až se 101 hlasy", () => {
    expect(MAJORITY).toBe(101);
    const s = base();
    const all = predictVote(s, { cssd: 1, ods: 1, kscm: 1, kdu: 1, us: 1 });
    expect(all.yes).toBe(200);
    expect(all.passed).toBe(true);
    const none = predictVote(s, { cssd: -1, ods: -1, kscm: -1, kdu: -1, us: -1 });
    expect(none.passed).toBe(false);
  });

  it("rozdělí vždy 200 křesel", () => {
    const seats = allocateSeats({ cssd: 30, ods: 25, kscm: 18, kdu: 14, us: 3 });
    expect(Object.values(seats).reduce((a, b) => a + b, 0)).toBe(200);
    expect(seats.us).toBe(0);
  });

  it("zpožděný následek nastane až v naplánovaný den", () => {
    let s = schedule(base(), { days: 3, effects: { debt: 100 }, text: "x" });
    const debt0 = s.economy.debt;
    s = tick(tick(s, () => 0.99), () => 0.99);
    expect(s.economy.debt).toBe(debt0);
    s = tick(s, () => 0.99);
    expect(s.economy.debt).toBe(debt0 + 100);
  });
});

import { useState } from "react";
import { useGame } from "@/game/store";
import { PARTIES, PARTY_IDS, REGIONS } from "@/game/data";
import { bribeBoss, campaign } from "@/game/engine";
import type { PartyId } from "@/game/types";

type Mode = "politika" | "nezamestnanost" | "hdp";
const R = 46;
const W = Math.sqrt(3) * R;

function hexPoints(cx: number, cy: number) {
  return Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 180) * (60 * i - 30);
    return `${cx + R * Math.cos(a)},${cy + R * Math.sin(a)}`;
  }).join(" ");
}

export function RegionMap() {
  const { state, update } = useGame();
  const [mode, setMode] = useState<Mode>("politika");
  const [sel, setSel] = useState<string>(state?.player.region ?? "pha");
  if (!state) return null;

  const fill = (id: string) => {
    const r = state.regions[id];
    if (mode === "politika") {
      const top = PARTY_IDS.reduce<PartyId>((a, p) => (r.support[p] > r.support[a] ? p : a), "cssd");
      return PARTIES[top].color;
    }
    if (mode === "nezamestnanost") return `oklch(${0.75 - r.unemployment / 40} ${0.05 + r.unemployment / 120} 30)`;
    return `oklch(${0.35 + r.gdpIdx / 500} 0.09 150)`;
  };

  const def = REGIONS.find((r) => r.id === sel)!;
  const rs = state.regions[sel];
  const p = state.player;

  return (
    <div className="panel p-3">
      <div className="flex items-center justify-between">
        <h2 className="panel-title">Mapa krajů</h2>
        <div className="flex gap-1">
          {(["politika", "nezamestnanost", "hdp"] as Mode[]).map((m) => (
            <button key={m} onClick={() => setMode(m)} className={`rounded border px-2 py-0.5 text-xs uppercase ${mode === m ? "border-primary text-primary" : "text-muted-foreground"}`}>
              {m === "politika" ? "Preference" : m === "nezamestnanost" ? "Nezaměstn." : "HDP"}
            </button>
          ))}
        </div>
      </div>
      <svg viewBox={`-10 -10 ${W * 6.6} ${R * 5.2}`} className="mt-2 w-full">
        {REGIONS.map((r) => {
          const cx = W * r.col + (r.row % 2 ? W / 2 : 0) + W / 2;
          const cy = R * 1.5 * r.row + R;
          const active = r.id === sel;
          return (
            <g key={r.id} onClick={() => setSel(r.id)} className="cursor-pointer">
              <polygon points={hexPoints(cx, cy)} fill={fill(r.id)} fillOpacity={active ? 0.95 : 0.7} stroke={active ? "var(--primary)" : "var(--ink)"} strokeWidth={active ? 3 : 2} />
              <text x={cx} y={cy + 2} textAnchor="middle" className="fill-ink" style={{ fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: 15 }}>{r.short}</text>
              {r.id === p.region && <text x={cx} y={cy + 20} textAnchor="middle" className="fill-ink" style={{ fontSize: 12 }}>★</text>}
            </g>
          );
        })}
      </svg>

      <div className="mt-2 border-t pt-3">
        <div className="flex items-baseline justify-between">
          <h3 className="text-xl">{def.name}</h3>
          <span className="num text-xs text-muted-foreground">{(def.pop * 1).toFixed(2)} mil. obyv.</span>
        </div>
        <div className="mt-2 grid grid-cols-3 gap-2 text-sm">
          <div><div className="text-xs text-muted-foreground">Nezaměstnanost</div><div className="num">{rs.unemployment.toFixed(1)} %</div></div>
          <div><div className="text-xs text-muted-foreground">HDP (ČR=100)</div><div className="num">{rs.gdpIdx}</div></div>
          <div><div className="text-xs text-muted-foreground">Loajalita kmotra</div><div className="num">{rs.bossLoyalty}</div></div>
        </div>
        <div className="mt-2 text-sm"><span className="text-muted-foreground">Kmotr: </span>{def.boss}</div>
        <div className="mt-1 text-sm"><span className="text-muted-foreground">Infrastruktura: </span>{def.infra.join(", ")}</div>
        <div className="mt-3 space-y-1">
          {PARTY_IDS.map((pid) => (
            <div key={pid} className="flex items-center gap-2 text-xs">
              <span className="w-14">{PARTIES[pid].short}</span>
              <div className="h-2 flex-1 rounded bg-muted"><div className="h-2 rounded" style={{ width: `${rs.support[pid] * 2}%`, background: PARTIES[pid].color }} /></div>
              <span className="num w-10 text-right">{rs.support[pid].toFixed(1)}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <button disabled={p.account < 1 || p.pp < 10} onClick={() => update((s) => campaign(s, sel))} className="btn-brass rounded px-3 py-1.5 text-xs">Kampaň (1 M, 10 PP)</button>
          <button disabled={p.blackFund < 2} onClick={() => update((s) => bribeBoss(s, sel))} className="rounded border border-destructive px-3 py-1.5 text-xs uppercase tracking-wide text-destructive disabled:opacity-40">Podplatit kmotra (2 M černých)</button>
        </div>
      </div>
    </div>
  );
}

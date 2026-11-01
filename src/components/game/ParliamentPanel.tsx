import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useGame } from "@/game/store";
import { addDays, lawEffects, lawStance, lobby, predictVote, submitLaw } from "@/game/engine";
import { MAJORITY, PARTIES, PARTY_IDS } from "@/game/data";
import type { LawParams, PartyId } from "@/game/types";

function Hemicycle({ seats, gov }: { seats: Record<PartyId, number>; gov: PartyId[] }) {
  const order: PartyId[] = ["kscm", "cssd", "kdu", "us", "ods"];
  const list = order.flatMap((p) => Array(seats[p]).fill(p) as PartyId[]);
  const rows = 8;
  const pts: { x: number; y: number; a: number }[] = [];
  for (let r = 0; r < rows; r++) {
    const rad = 60 + r * 12;
    const n = Math.round((Math.PI * rad) / 12.6);
    for (let i = 0; i < n; i++) {
      const a = Math.PI - (i / (n - 1)) * Math.PI;
      pts.push({ x: 160 + rad * Math.cos(a), y: 160 - rad * Math.sin(a), a });
    }
  }
  pts.sort((a, b) => b.a - a.a);
  const used = pts.slice(0, 200);
  return (
    <svg viewBox="0 0 320 170" className="w-full">
      {used.map((pt, i) => (
        <circle key={i} cx={pt.x} cy={pt.y} r={4.6} fill={PARTIES[list[i]]?.color ?? "var(--muted)"} stroke={gov.includes(list[i]) ? "var(--primary)" : "none"} strokeWidth={1} />
      ))}
      <text x="160" y="150" textAnchor="middle" className="fill-foreground" style={{ fontFamily: "var(--font-display)", fontSize: 22 }}>200</text>
    </svg>
  );
}

export function ParliamentPanel() {
  const { state: s, update, set } = useGame();
  const [law, setLaw] = useState<LawParams>({ dph: 22, dppo: 31, skrty: 0 });
  const [komp, setKomp] = useState<string[]>([]);
  const stance = useMemo(() => lawStance(law), [law]);
  if (!s) return null;
  const used = s.kompromat.filter((k) => komp.includes(k.id)).map((k) => k.party);
  const pred = predictVote(s, stance, used);
  const fx = lawEffects(law);
  const cooldown = s.lastLawDate ? addDays(s.lastLawDate, 30) > s.date : false;
  const canSubmit = s.player.pp >= 25 && !cooldown && s.player.position >= 1;

  return (
    <div className="space-y-3">
      <div className="panel p-4">
        <h2 className="panel-title">Poslanecká sněmovna</h2>
        <Hemicycle seats={s.seats} gov={s.government} />
        <div className="flex flex-wrap justify-center gap-3 text-sm">
          {PARTY_IDS.map((p) => (
            <span key={p} className="flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: PARTIES[p].color }} />
              {PARTIES[p].short} <span className="num">{s.seats[p]}</span>
              {s.government.includes(p) && <span className="text-xs text-primary">vláda</span>}
            </span>
          ))}
        </div>
        {s.flags.includes("opozicni") && <p className="mt-2 text-center text-xs text-muted-foreground">Opoziční smlouva: ODS toleruje vládu ČSSD.</p>}
      </div>

      <div className="panel p-4">
        <h2 className="panel-title">Anatomie zákona: Daňový balíček</h2>
        <div className="mt-3 space-y-3">
          <Slider label="Základní sazba DPH" unit="%" min={5} max={22} v={law.dph} on={(v) => setLaw({ ...law, dph: v })} />
          <Slider label="Daň z příjmů právnických osob" unit="%" min={20} max={35} v={law.dppo} on={(v) => setLaw({ ...law, dppo: v })} />
          <Slider label="Škrty sociálních výdajů" unit="%" min={0} max={20} v={law.skrty} on={(v) => setLaw({ ...law, skrty: v })} />
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-muted-foreground sm:grid-cols-4">
          <span>Příjmy: <b className="num text-foreground">{fx.revenue! >= 0 ? "+" : ""}{fx.revenue}</b></span>
          <span>Výdaje: <b className="num text-foreground">{fx.spending}</b></span>
          <span>Smír: <b className="num text-foreground">{fx.peace}</b></span>
          <span>Růst: <b className="num text-foreground">{fx.growth}</b></span>
        </div>

        <h3 className="panel-title mt-4">Předpověď hlasování</h3>
        <div className="mt-2 space-y-1">
          {PARTY_IDS.map((p) => (
            <div key={p} className="flex items-center gap-2 text-sm">
              <span className="w-16">{PARTIES[p].short}</span>
              <span className="num w-14">{pred.byParty[p]}/{s.seats[p]}</span>
              <span className={`num w-12 text-xs ${stance[p] >= 0 ? "text-success" : "text-destructive"}`}>{stance[p] >= 0 ? "+" : ""}{stance[p].toFixed(2)}</span>
              <button disabled={s.player.pp < 10 || (s.lobby[p] ?? 0) >= 0.3} onClick={() => update((x) => lobby(x, p))} className="ml-auto rounded border px-2 py-0.5 text-xs disabled:opacity-40">
                Lobbovat 10 PP {s.lobby[p] ? `(+${s.lobby[p]})` : ""}
              </button>
            </div>
          ))}
        </div>
        {s.kompromat.length > 0 && (
          <div className="mt-3">
            <h3 className="panel-title">Vydírání (složky)</h3>
            <div className="mt-1 flex flex-wrap gap-2">
              {s.kompromat.map((k) => (
                <label key={k.id} className="flex items-center gap-1 rounded border px-2 py-1 text-xs">
                  <input type="checkbox" checked={komp.includes(k.id)} onChange={(e) => setKomp(e.target.checked ? [...komp, k.id] : komp.filter((x) => x !== k.id))} />
                  {PARTIES[k.party].short} (+8)
                </label>
              ))}
            </div>
          </div>
        )}
        <div className="mt-4 flex items-center justify-between">
          <span className={`num text-2xl ${pred.passed ? "text-success" : "text-destructive"}`}>{pred.yes} / {MAJORITY}</span>
          <button
            disabled={!canSubmit}
            onClick={() => {
              const r = submitLaw(s, law, komp);
              set(r.state);
              setKomp([]);
              r.passed ? toast.success(`Zákon prošel (${r.yes} hlasů)`) : toast.error(`Zákon neprošel (${r.yes} hlasů)`);
            }}
            className="btn-brass rounded px-4 py-2 text-sm"
          >
            Předložit (25 PP)
          </button>
        </div>
        {!canSubmit && <p className="mt-2 text-xs text-muted-foreground">{s.player.position < 1 ? "Zákony předkládá až předseda výboru." : cooldown ? "Další návrh nejdříve za 30 dní." : "Nedostatek politického kapitálu."}</p>}
      </div>
    </div>
  );
}

function Slider({ label, unit, min, max, v, on }: { label: string; unit: string; min: number; max: number; v: number; on: (v: number) => void }) {
  return (
    <div>
      <div className="flex justify-between text-sm"><span>{label}</span><span className="num">{v} {unit}</span></div>
      <input type="range" min={min} max={max} value={v} onChange={(e) => on(+e.target.value)} className="w-full accent-primary" />
    </div>
  );
}

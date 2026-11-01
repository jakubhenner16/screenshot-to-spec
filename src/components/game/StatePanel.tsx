import { useGame } from "@/game/store";
import { debtRatio, deficit, interest, nationalSupport } from "@/game/engine";
import { DEBT_BRAKE, PARTIES, PARTY_IDS } from "@/game/data";

export function Meter({ label, value, max = 100, warn }: { label: string; value: number; max?: number; warn?: boolean }) {
  return (
    <div>
      <div className="flex justify-between text-sm"><span>{label}</span><span className="num">{value.toFixed(0)}</span></div>
      <div className="mt-1 h-2 rounded bg-muted"><div className={`h-2 rounded ${warn ? "bg-destructive" : "bg-primary"}`} style={{ width: `${(value / max) * 100}%` }} /></div>
    </div>
  );
}

const RATING = ["D", "CCC", "B", "BB", "BBB-", "BBB", "A-", "A", "AA", "AAA"];

export function StatePanel() {
  const s = useGame((x) => x.state)!;
  const e = s.economy;
  const ratio = debtRatio(s);
  const def = deficit(s);
  const sup = nationalSupport(s);
  return (
    <div className="space-y-3">
      {e.debtBrake && <div className="panel border-destructive p-3 text-destructive">DLUHOVÁ BRZDA AKTIVNÍ – výdaje zmrazeny.</div>}
      <div className="panel p-4">
        <h2 className="panel-title">Státní rozpočet</h2>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Fig label="HDP" v={`${e.gdp.toFixed(0)} mld.`} />
          <Fig label="Dluh / HDP" v={`${(ratio * 100).toFixed(1)} %`} warn={ratio > DEBT_BRAKE - 0.05} />
          <Fig label="Deficit / rok" v={`${def.toFixed(0)} mld.`} warn={def > 0} />
          <Fig label="Rating" v={RATING[e.rating - 1]} />
          <Fig label="Růst HDP" v={`${e.growth.toFixed(1)} %`} />
          <Fig label="Příjmy" v={`${e.revenue.toFixed(0)} mld.`} />
          <Fig label="Dluh" v={`${e.debt.toFixed(0)} mld.`} />
          <Fig label="Úroky" v={`${interest(s).toFixed(0)} mld.`} />
        </div>
        <h3 className="panel-title mt-4">Mandatorní výdaje (mld./rok)</h3>
        <div className="mt-2 grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
          <div>Důchody <span className="num">{e.spending.pensions.toFixed(0)}</span></div>
          <div>Zdravotnictví <span className="num">{e.spending.health.toFixed(0)}</span></div>
          <div>Obrana <span className="num">{e.spending.defense.toFixed(0)}</span></div>
          <div>Ostatní <span className="num">{e.spending.other.toFixed(0)}</span></div>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">Při překročení {DEBT_BRAKE * 100} % dluhu k HDP se spustí dluhová brzda.</p>
      </div>
      <div className="panel space-y-3 p-4">
        <h2 className="panel-title">Společnost</h2>
        <Meter label="Společenský smír" value={s.peace} warn={s.peace < 40} />
        <Meter label="Koaliční jednota" value={s.unity} warn={s.unity < 40} />
      </div>
      <div className="panel p-4">
        <h2 className="panel-title">Celostátní preference</h2>
        <div className="mt-2 space-y-1">
          {PARTY_IDS.map((p) => (
            <div key={p} className="flex items-center gap-2 text-sm">
              <span className="w-16">{PARTIES[p].short}</span>
              <div className="h-2 flex-1 rounded bg-muted"><div className="h-2 rounded" style={{ width: `${sup[p] * 2}%`, background: PARTIES[p].color }} /></div>
              <span className="num w-12 text-right">{sup[p].toFixed(1)} %</span>
            </div>
          ))}
        </div>
        <p className="mt-2 text-xs text-muted-foreground">Příští volby: 15. 6. 2002</p>
      </div>
    </div>
  );
}

function Fig({ label, v, warn }: { label: string; v: string; warn?: boolean }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={`num text-lg ${warn ? "text-destructive" : ""}`}>{v}</div>
    </div>
  );
}

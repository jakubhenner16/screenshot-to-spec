import { useGame } from "@/game/store";
import { hireDetectives, launder, leakKompromat } from "@/game/engine";
import { Meter } from "./StatePanel";

export function FilesPanel() {
  const { state: s, update } = useGame();
  if (!s) return null;
  const heatLabel = s.heat < 30 ? "Klid" : s.heat < 60 ? "Prověrky" : s.heat < 85 ? "Vyšetřování" : "Hrozí obvinění";
  return (
    <div className="space-y-3">
      <div className="panel p-4">
        <h2 className="panel-title">Pozornost policie a státního zastupitelství</h2>
        <div className="mt-2"><Meter label={heatLabel} value={s.heat} warn={s.heat > 60} /></div>
        <p className="mt-2 text-xs text-muted-foreground">Při 100 vás Sněmovna vydá k trestnímu stíhání. Čistý štít snižuje pozornost v čase.</p>
      </div>
      <div className="panel p-4">
        <h2 className="panel-title">Černý fond</h2>
        <div className="num mt-1 text-2xl text-destructive">{s.player.blackFund.toFixed(1)} mil. Kč</div>
        <div className="mt-3 flex flex-wrap gap-2">
          <button disabled={s.player.blackFund < 1.5} onClick={() => update((x) => hireDetectives(x))} className="btn-brass rounded px-3 py-1.5 text-xs">Najmout detektivy (1,5 M)</button>
          <button disabled={s.player.blackFund < 2} onClick={() => update(launder)} className="rounded border px-3 py-1.5 text-xs uppercase disabled:opacity-40">Vyprat 2 M přes Kypr</button>
        </div>
      </div>
      <div className="panel p-4">
        <h2 className="panel-title">Složky ({s.kompromat.length})</h2>
        {s.kompromat.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">Zatím nemáte na nikoho nic. Zatím.</p>
        ) : (
          <ul className="mt-2 divide-y">
            {s.kompromat.map((k) => (
              <li key={k.id} className="flex items-center justify-between gap-2 py-2 text-sm">
                <span>{k.desc}</span>
                <button onClick={() => update((x) => leakKompromat(x, k.id))} className="rounded border px-2 py-1 text-xs">Pustit do médií</button>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-2 text-xs text-muted-foreground">Složky lze použít i k vydírání při hlasování ve Sněmovně.</p>
      </div>
    </div>
  );
}

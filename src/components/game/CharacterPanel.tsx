import { useGame } from "@/game/store";
import { canPromote, defect, promote, puc } from "@/game/engine";
import { BACKGROUNDS, PARTIES, PARTY_IDS, POSITIONS, REGIONS } from "@/game/data";
import { Meter } from "./StatePanel";

export function CharacterPanel() {
  const { state: s, update } = useGame();
  if (!s) return null;
  const p = s.player;
  const prom = canPromote(s);
  const next = POSITIONS[p.position + 1];
  return (
    <div className="space-y-3">
      <div className="panel p-4">
        <h2 className="text-2xl">{p.name}</h2>
        <p className="text-sm text-muted-foreground">{BACKGROUNDS[p.background].name} · {PARTIES[p.party].short} · {REGIONS.find((r) => r.id === p.region)!.name}</p>
        {p.traits.includes("prebehlik") && <span className="mt-2 inline-block rounded border border-destructive px-2 py-0.5 text-xs text-destructive">Přeběhlík</span>}
        <div className="mt-4 space-y-2">
          <Meter label="Charisma / Rétorika" value={p.stats.charisma} />
          <Meter label="Zákulisní intriky" value={p.stats.intrigue} />
          <Meter label="Ekonomický přehled" value={p.stats.economy} />
          <Meter label="Čistý štít" value={p.stats.integrity} />
          <Meter label="Seniorita" value={p.seniority} />
        </div>
      </div>
      <div className="panel p-4">
        <h2 className="panel-title">Kariérní žebříček</h2>
        <ol className="mt-2 space-y-1">
          {POSITIONS.map((pos, i) => (
            <li key={pos.title} className={`flex justify-between text-sm ${i === p.position ? "text-primary" : i < p.position ? "text-muted-foreground line-through" : ""}`}>
              <span>{pos.title}</span>
              <span className="num text-xs">sen. {pos.seniority} · {pos.pp} PP{pos.needsGov ? " · vláda" : ""}</span>
            </li>
          ))}
        </ol>
        {next && (
          <>
            <button disabled={!prom.ok} onClick={() => update(promote)} className="btn-brass mt-3 w-full rounded py-2 text-sm">Ucházet se o post: {next.title}</button>
            {!prom.ok && <p className="mt-1 text-xs text-muted-foreground">{prom.reason}</p>}
          </>
        )}
        {s.flags.includes("puc_ready") && p.position < 3 && (
          <button onClick={() => update((x) => puc(x))} className="mt-2 w-full rounded border border-destructive py-2 text-sm uppercase text-destructive">Spustit vnitrostranický puč</button>
        )}
      </div>
      <div className="panel p-4">
        <h2 className="panel-title">Změna dresu</h2>
        <p className="mt-1 text-xs text-muted-foreground">Ztratíte 70 % seniority a získáte nálepku přeběhlíka. Ve vládní straně ale můžete hned dostat post.</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {PARTY_IDS.filter((x) => x !== p.party).map((x) => (
            <button key={x} onClick={() => confirm(`Opravdu přeběhnout do ${PARTIES[x].short}?`) && update((st) => defect(st, x))} className="rounded border px-3 py-1 text-xs">→ {PARTIES[x].short}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

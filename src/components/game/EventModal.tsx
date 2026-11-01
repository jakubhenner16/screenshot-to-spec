import { useGame } from "@/game/store";
import { eventById } from "@/game/data";
import { formatDate, optionAllowed, resolveEvent } from "@/game/engine";
import type { Effects } from "@/game/types";

const LABELS: Record<string, string> = {
  pp: "PP", account: "Účet M", blackFund: "Černý fond M", seniority: "Seniorita", heat: "Policie", peace: "Smír", unity: "Jednota",
  debt: "Dluh mld.", revenue: "Příjmy", spending: "Výdaje", growth: "Růst", rating: "Rating", kompromat: "Složky",
  charisma: "Charisma", intrigue: "Intriky", economy: "Ekonomika", integrity: "Čistý štít",
};

function describe(e: Effects) {
  return Object.entries(e)
    .filter(([k]) => k in LABELS)
    .map(([k, v]) => `${LABELS[k]} ${(v as number) > 0 ? "+" : ""}${v}`)
    .join(" · ");
}

export function EventModal() {
  const { state: s, update } = useGame();
  if (!s?.pendingEvent) return null;
  const ev = eventById(s.pendingEvent);
  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-ink/80 p-3 sm:items-center">
      <div className="panel w-full max-w-lg p-5">
        <p className="panel-title">{formatDate(s.date)}</p>
        <h2 className="mt-1 text-2xl">{ev.title}</h2>
        <p className="mt-3 leading-relaxed text-muted-foreground">{ev.text}</p>
        <div className="mt-4 space-y-2">
          {ev.options.map((o, i) => {
            const ok = optionAllowed(s, o.requires);
            return (
              <button key={i} disabled={!ok} onClick={() => update((x) => resolveEvent(x, i))} className="w-full rounded border p-3 text-left hover:border-primary hover:bg-muted disabled:opacity-40">
                <div className="font-semibold">{o.label}</div>
                <div className="num mt-0.5 text-xs text-muted-foreground">{describe(o.effects)}{o.lagged ? " · ⏳ zpožděné následky" : ""}</div>
                {!ok && <div className="text-xs text-destructive">Nesplňujete požadavky</div>}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

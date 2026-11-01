import { Link } from "@tanstack/react-router";
import { useGame } from "@/game/store";
import { formatDate } from "@/game/engine";
import { PARTIES, POSITIONS } from "@/game/data";

function Stat({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div className="flex flex-col leading-tight">
      <span className="text-[0.65rem] uppercase tracking-widest text-muted-foreground">{label}</span>
      <span className={`num text-sm ${tone ?? ""}`}>{value}</span>
    </div>
  );
}

export function TopBar({ onSave }: { onSave: () => void }) {
  const { state, speed, setSpeed } = useGame();
  if (!state) return null;
  const p = state.player;
  return (
    <header className="sticky top-0 z-20 border-b bg-ink/95 backdrop-blur">
      <div className="mx-auto flex max-w-[1500px] flex-wrap items-center gap-x-5 gap-y-2 px-3 py-2">
        <Link to="/" className="font-display text-lg text-primary">S·2000</Link>
        <div className="flex items-center gap-1">
          <span className="num mr-2 min-w-24 text-base text-foreground">{formatDate(state.date)}</span>
          {([0, 1, 2, 3] as const).map((n) => (
            <button key={n} onClick={() => setSpeed(n)} aria-label={n ? `Rychlost ${n}` : "Pauza"} className={`h-7 w-8 rounded border text-xs ${speed === n ? "border-primary bg-secondary text-primary" : "text-muted-foreground"}`}>
              {n === 0 ? "❚❚" : "▶".repeat(n)}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-x-5 gap-y-1">
          <Stat label="Polit. kapitál" value={p.pp.toFixed(0)} tone="text-primary" />
          <Stat label="Účet" value={`${p.account.toFixed(1)} M`} />
          <Stat label="Černý fond" value={`${p.blackFund.toFixed(1)} M`} tone="text-destructive" />
          <Stat label="Seniorita" value={p.seniority.toFixed(0)} />
          <Stat label="Post" value={`${POSITIONS[p.position].title} · ${PARTIES[p.party].short}`} />
        </div>
        <button onClick={onSave} className="ml-auto rounded border px-3 py-1 text-xs uppercase tracking-wider hover:border-primary">Uložit</button>
      </div>
    </header>
  );
}

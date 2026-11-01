import { useGame } from "@/game/store";
import { formatDate } from "@/game/engine";

export function LogPanel() {
  const s = useGame((x) => x.state)!;
  return (
    <div className="panel p-4">
      <h2 className="panel-title">Deník událostí</h2>
      {s.scheduled.length > 0 && (
        <p className="mt-2 text-xs text-muted-foreground">Čekající následky rozhodnutí: {s.scheduled.length}</p>
      )}
      <ul className="mt-3 space-y-2">
        {s.log.map((l, i) => (
          <li key={i} className="border-l-2 pl-3 text-sm" style={{ borderColor: l.tone === "good" ? "var(--success)" : l.tone === "bad" ? "var(--destructive)" : "var(--border)" }}>
            <span className="num text-xs text-muted-foreground">{formatDate(l.date)}</span>
            <div>{l.text}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}

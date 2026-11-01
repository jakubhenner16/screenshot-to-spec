import { useState } from "react";
import { useGame } from "@/game/store";
import { FOCUSES, focusById } from "@/game/data";
import { focusAvailable, startFocus } from "@/game/engine";

export function FocusPanel() {
  const { state: s, update } = useGame();
  const [tree, setTree] = useState<"personal" | "national">("personal");
  if (!s) return null;
  const list = FOCUSES.filter((f) => f.tree === tree);
  const running = s.focus[tree];
  const maxY = Math.max(...list.map((f) => f.y));

  return (
    <div className="panel p-4">
      <div className="flex gap-1">
        {(["personal", "national"] as const).map((t) => (
          <button key={t} onClick={() => setTree(t)} className={`flex-1 rounded border py-1.5 text-sm uppercase tracking-wider ${tree === t ? "border-primary text-primary" : "text-muted-foreground"}`}>
            {t === "personal" ? "Osobní kariéra" : "Národní směřování"}
          </button>
        ))}
      </div>
      {running && (
        <div className="mt-3 rounded border border-primary p-3">
          <div className="flex justify-between text-sm"><span>{focusById(running.id).title}</span><span className="num">{running.progress}/{focusById(running.id).days} dní</span></div>
          <div className="mt-1 h-2 rounded bg-muted"><div className="h-2 rounded bg-primary" style={{ width: `${(running.progress / focusById(running.id).days) * 100}%` }} /></div>
        </div>
      )}
      <div className="mt-4 space-y-3">
        {Array.from({ length: maxY + 1 }, (_, y) => (
          <div key={y} className="grid grid-cols-3 gap-2">
            {[0, 1, 2].map((x) => {
              const f = list.find((q) => q.x === x && q.y === y);
              if (!f) return <div key={x} />;
              const done = s.completed.includes(f.id);
              const av = focusAvailable(s, f.id);
              const isRun = running?.id === f.id;
              return (
                <button
                  key={x}
                  disabled={!av.ok}
                  onClick={() => update((st) => startFocus(st, f.id))}
                  title={f.desc}
                  className={`flex min-h-28 flex-col rounded border p-2 text-left text-xs transition ${done ? "border-success bg-secondary" : isRun ? "border-primary" : av.ok ? "hover:border-primary hover:bg-muted" : "opacity-50"}`}
                >
                  <span className="text-sm font-semibold leading-tight">{f.title}</span>
                  <span className="num mt-1 text-muted-foreground">{f.days} dní{f.vote ? " · hlasování" : ""}</span>
                  <span className="mt-1 line-clamp-3 text-muted-foreground">{f.desc}</span>
                  {!done && !av.ok && !isRun && <span className="mt-auto pt-1 text-destructive">{av.reason}</span>}
                  {done && <span className="mt-auto pt-1 text-success">Dokončeno</span>}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

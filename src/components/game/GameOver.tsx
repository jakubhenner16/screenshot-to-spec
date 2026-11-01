import { Link } from "@tanstack/react-router";
import { useGame } from "@/game/store";
import { PARTIES, POSITIONS } from "@/game/data";

export function GameOver() {
  const s = useGame((x) => x.state)!;
  const end = s.gameOver === "end";
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/90 p-4">
      <div className="panel max-w-md p-6 text-center">
        <p className="panel-title">{end ? "Konec éry 2000–2004" : "Konec kariéry"}</p>
        <h2 className="mt-2 text-3xl">{end ? "Bilance" : "Obviněn"}</h2>
        <p className="mt-3 text-muted-foreground">{end ? "Pokračování v dalších érách přijde v příští verzi." : s.gameOver}</p>
        <div className="mt-4 space-y-1 text-sm">
          <div>Post: <b>{POSITIONS[s.player.position].title}</b> ({PARTIES[s.player.party].short})</div>
          <div>Seniorita: <b className="num">{s.player.seniority.toFixed(0)}</b> · Účet: <b className="num">{s.player.account.toFixed(1)} M</b></div>
          <div>Dokončené focusy: <b className="num">{s.completed.length}</b></div>
        </div>
        <Link to="/" className="btn-brass mt-5 inline-block rounded px-5 py-2">Hlavní menu</Link>
      </div>
    </div>
  );
}

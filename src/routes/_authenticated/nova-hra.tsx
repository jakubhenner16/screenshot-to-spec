import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { BACKGROUNDS, PARTIES, PARTY_IDS, REGIONS } from "@/game/data";
import { createGame } from "@/game/engine";
import type { BackgroundId, PartyId, StatKey } from "@/game/types";
import type { Json } from "@/integrations/supabase/types";

export const Route = createFileRoute("/_authenticated/nova-hra")({
  head: () => ({ meta: [{ title: "Tvorba postavy – Sněmovna 2000" }, { name: "description", content: "Vytvořte svého politika." }] }),
  component: NewGame,
});

const STAT_LABELS: Record<StatKey, string> = {
  charisma: "Charisma / Rétorika",
  intrigue: "Zákulisní intriky",
  economy: "Ekonomický přehled",
  integrity: "Čistý štít",
};
const POOL = 160;

function NewGame() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [party, setParty] = useState<PartyId>("cssd");
  const [region, setRegion] = useState("ms");
  const [bg, setBg] = useState<BackgroundId>("patriot");
  const [stats, setStats] = useState<Record<StatKey, number>>({ charisma: 40, intrigue: 40, economy: 40, integrity: 40 });
  const [busy, setBusy] = useState(false);
  const used = Object.values(stats).reduce((a, b) => a + b, 0);

  function setStat(k: StatKey, v: number) {
    const other = used - stats[k];
    setStats({ ...stats, [k]: Math.min(v, POOL - other) });
  }

  async function start() {
    if (!name.trim()) return toast.error("Zadejte jméno.");
    setBusy(true);
    const g = createGame({ name: name.trim(), party, region, background: bg, stats });
    const { data, error } = await supabase
      .from("saved_games")
      .insert({ name: `${g.player.name} (${PARTIES[party].short})`, game_date: g.date, state: g as unknown as Json })
      .select("id")
      .single();
    setBusy(false);
    if (error || !data) return toast.error("Hru se nepodařilo uložit.");
    navigate({ to: "/hra/$id", params: { id: data.id } });
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <p className="panel-title">Kandidátní listina</p>
      <h1 className="mt-2 text-4xl">Kdo jste?</h1>

      <section className="panel mt-6 p-4">
        <label className="panel-title">Jméno</label>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ing. Jan Novák" className="mt-2 w-full rounded border bg-input px-3 py-2 text-lg" />
      </section>

      <section className="panel mt-4 p-4">
        <h2 className="panel-title">Původ</h2>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {(Object.keys(BACKGROUNDS) as BackgroundId[]).map((id) => (
            <button key={id} onClick={() => setBg(id)} className={`rounded border p-3 text-left transition ${bg === id ? "border-primary bg-secondary" : "hover:bg-muted"}`}>
              <div className="text-lg font-semibold">{BACKGROUNDS[id].name}</div>
              <div className="text-sm text-muted-foreground">{BACKGROUNDS[id].desc}</div>
            </button>
          ))}
        </div>
      </section>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <section className="panel p-4">
          <h2 className="panel-title">Strana</h2>
          <div className="mt-3 space-y-1">
            {PARTY_IDS.map((p) => (
              <button key={p} onClick={() => setParty(p)} className={`flex w-full items-center gap-3 rounded border px-3 py-2 text-left ${party === p ? "border-primary bg-secondary" : "border-transparent hover:bg-muted"}`}>
                <span className="h-3 w-3 rounded-full" style={{ background: PARTIES[p].color }} />
                <span className="font-semibold">{PARTIES[p].short}</span>
                <span className="truncate text-xs text-muted-foreground">{PARTIES[p].name}</span>
              </button>
            ))}
          </div>
        </section>
        <section className="panel p-4">
          <h2 className="panel-title">Domovský kraj</h2>
          <select value={region} onChange={(e) => setRegion(e.target.value)} className="mt-3 w-full rounded border bg-input px-3 py-2">
            {REGIONS.map((r) => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
          <h2 className="panel-title mt-5 flex justify-between">
            <span>Vlastnosti</span>
            <span className="num">{POOL - used} bodů</span>
          </h2>
          <div className="mt-2 space-y-3">
            {(Object.keys(STAT_LABELS) as StatKey[]).map((k) => (
              <div key={k}>
                <div className="flex justify-between text-sm"><span>{STAT_LABELS[k]}</span><span className="num">{stats[k]}</span></div>
                <input type="range" min={10} max={80} value={stats[k]} onChange={(e) => setStat(k, +e.target.value)} className="w-full accent-primary" />
              </div>
            ))}
          </div>
        </section>
      </div>

      <button disabled={busy} onClick={start} className="btn-brass mt-6 w-full rounded py-3 text-lg">Složit poslanecký slib</button>
    </main>
  );
}

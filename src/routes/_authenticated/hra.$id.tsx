import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";
import { useGame, SPEED_MS } from "@/game/store";
import { tick } from "@/game/engine";
import type { GameState } from "@/game/types";
import { TopBar } from "@/components/game/TopBar";
import { RegionMap } from "@/components/game/RegionMap";
import { StatePanel } from "@/components/game/StatePanel";
import { ParliamentPanel } from "@/components/game/ParliamentPanel";
import { FocusPanel } from "@/components/game/FocusPanel";
import { FilesPanel } from "@/components/game/FilesPanel";
import { CharacterPanel } from "@/components/game/CharacterPanel";
import { LogPanel } from "@/components/game/LogPanel";
import { EventModal } from "@/components/game/EventModal";
import { GameOver } from "@/components/game/GameOver";

export const Route = createFileRoute("/_authenticated/hra/$id")({
  head: () => ({ meta: [{ title: "Hra – Sněmovna 2000" }, { name: "description", content: "Vaše politická kariéra." }] }),
  component: GamePage,
});

const TABS = [
  { id: "mapa", label: "Mapa", mobileOnly: true },
  { id: "stat", label: "Stát" },
  { id: "snemovna", label: "Sněmovna" },
  { id: "focus", label: "Focusy" },
  { id: "slozky", label: "Složky" },
  { id: "postava", label: "Postava" },
  { id: "denik", label: "Deník" },
] as const;
type Tab = (typeof TABS)[number]["id"];

function GamePage() {
  const { id } = Route.useParams();
  const { state, speed, load, gameId } = useGame();
  const [tab, setTab] = useState<Tab>("stat");
  const lastSavedMonth = useRef<string>("");

  useEffect(() => {
    supabase.from("saved_games").select("state").eq("id", id).single().then(({ data, error }) => {
      if (error || !data) return toast.error("Hru se nepodařilo načíst.");
      const s = data.state as unknown as GameState;
      lastSavedMonth.current = s.date.slice(0, 7);
      load(id, s);
    });
  }, [id, load]);

  const save = useCallback(async (s: GameState, manual = false) => {
    const { error } = await supabase.from("saved_games").update({ state: s as unknown as Json, game_date: s.date, updated_at: new Date().toISOString() }).eq("id", id);
    if (manual) error ? toast.error("Uložení selhalo.") : toast.success("Hra uložena.");
  }, [id]);

  // Game loop
  useEffect(() => {
    if (!speed || !state || state.pendingEvent || state.gameOver) return;
    const t = setInterval(() => useGame.getState().update((s) => tick(s)), SPEED_MS[speed]);
    return () => clearInterval(t);
  }, [speed, state?.pendingEvent, state?.gameOver, state]);

  // Autosave monthly
  useEffect(() => {
    if (!state || gameId !== id) return;
    const m = state.date.slice(0, 7);
    if (m !== lastSavedMonth.current) {
      lastSavedMonth.current = m;
      save(state);
    }
  }, [state, gameId, id, save]);

  if (!state || gameId !== id) return <div className="flex min-h-screen items-center justify-center panel-title">Otevírám spis…</div>;

  const content = (t: Tab) => {
    switch (t) {
      case "mapa": return <RegionMap />;
      case "stat": return <StatePanel />;
      case "snemovna": return <ParliamentPanel />;
      case "focus": return <FocusPanel />;
      case "slozky": return <FilesPanel />;
      case "postava": return <CharacterPanel />;
      case "denik": return <LogPanel />;
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <TopBar onSave={() => save(state, true)} />
      <div className="mx-auto grid w-full max-w-[1500px] flex-1 gap-3 p-3 pb-20 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:pb-3">
        <div className="hidden lg:block"><RegionMap /></div>
        <div className="flex min-w-0 flex-col gap-3">
          <nav className="hidden gap-1 lg:flex">
            {TABS.filter((t) => !("mobileOnly" in t)).map((t) => (
              <button key={t.id} onClick={() => setTab(t.id)} className={`flex-1 rounded border px-2 py-1.5 text-sm uppercase tracking-wider ${tab === t.id ? "border-primary bg-secondary text-primary" : "text-muted-foreground hover:text-foreground"}`}>{t.label}</button>
            ))}
          </nav>
          <div className="min-w-0">{content(tab === "mapa" ? "mapa" : tab)}</div>
        </div>
      </div>
      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-7 border-t bg-ink lg:hidden">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`py-3 text-[0.7rem] uppercase tracking-wide ${tab === t.id ? "text-primary" : "text-muted-foreground"}`}>{t.label}</button>
        ))}
      </nav>
      <EventModal />
      {state.gameOver && <GameOver />}
      <Link to="/" className="sr-only">Menu</Link>
    </div>
  );
}

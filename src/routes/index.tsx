import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { formatDate } from "@/game/engine";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sněmovna 2000 – česká politická grand-strategie" },
      { name: "description", content: "Od poslance k premiérovi. Ekonomika, Sněmovna, kmotři a složky – Česko od 1. 1. 2000." },
      { property: "og:title", content: "Sněmovna 2000 – česká politická grand-strategie" },
      { property: "og:description", content: "Od poslance k premiérovi. Ekonomika, Sněmovna, kmotři a složky – Česko od 1. 1. 2000." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

interface Save {
  id: string;
  name: string;
  game_date: string;
  updated_at: string;
}

function Index() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [saves, setSaves] = useState<Save[]>([]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("saved_games")
      .select("id,name,game_date,updated_at")
      .order("updated_at", { ascending: false })
      .then(({ data }) => setSaves(data ?? []));
  }, [user]);

  async function remove(id: string) {
    if (!confirm("Skartovat tuto hru?")) return;
    await supabase.from("saved_games").delete().eq("id", id);
    setSaves((s) => s.filter((x) => x.id !== id));
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-5 py-12">
      <p className="panel-title">Česká republika · 1. ledna 2000</p>
      <h1 className="mt-3 text-5xl leading-none sm:text-7xl">
        Sněmovna <span className="text-primary">2000</span>
      </h1>
      <p className="mt-5 max-w-xl text-lg text-muted-foreground">
        Opoziční smlouva, pád IPB, kmotři v krajích a krabice od vína. Začnete jako řadový poslanec. Kam dojdete, záleží na tom, komu budete dlužit.
      </p>

      {user === undefined ? null : user ? (
        <section className="mt-10 space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <Link to="/nova-hra" className="btn-brass rounded px-6 py-3">Nová kariéra</Link>
            <button
              onClick={async () => {
                await supabase.auth.signOut();
                setUser(null);
                navigate({ to: "/", replace: true });
              }}
              className="rounded border px-4 py-3 text-sm text-muted-foreground hover:text-foreground"
            >
              Odhlásit ({user.email})
            </button>
          </div>
          {saves.length > 0 && (
            <div className="panel p-4">
              <h2 className="panel-title mb-3">Uložené hry</h2>
              <ul className="divide-y">
                {saves.map((s) => (
                  <li key={s.id} className="flex items-center justify-between gap-3 py-2">
                    <Link to="/hra/$id" params={{ id: s.id }} className="flex-1 hover:text-primary">
                      <div className="text-lg font-semibold">{s.name}</div>
                      <div className="num text-xs text-muted-foreground">{formatDate(s.game_date)}</div>
                    </Link>
                    <button onClick={() => remove(s.id)} className="text-xs text-muted-foreground hover:text-destructive">Smazat</button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      ) : (
        <div className="mt-10">
          <Link to="/auth" className="btn-brass rounded px-6 py-3">Přihlásit a hrát</Link>
        </div>
      )}
    </main>
  );
}

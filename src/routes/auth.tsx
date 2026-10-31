import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import "@lovable.dev/cloud-auth-js/styles.css";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Přihlášení – Sněmovna 2000" },
      { name: "description", content: "Přihlaste se a pokračujte ve své politické kariéře." },
      { property: "og:title", content: "Přihlášení – Sněmovna 2000" },
      { property: "og:description", content: "Přihlaste se a pokračujte ve své politické kariéře." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    if (mode === "in") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setBusy(false);
      if (error) return toast.error("Přihlášení selhalo: " + error.message);
      navigate({ to: "/" });
    } else {
      const { error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin } });
      setBusy(false);
      if (error) return toast.error(error.message);
      setSent(true);
    }
  }

  async function oauth(provider: "google" | "lovable") {
    const r = await lovable.auth.signInWithOAuth(provider, { redirect_uri: window.location.origin });
    if (r.error) return toast.error("Přihlášení selhalo.");
    if (r.redirected) return;
    navigate({ to: "/" });
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="panel w-full max-w-sm p-6">
        <Link to="/" className="panel-title">← Sněmovna 2000</Link>
        <h1 className="mt-3 text-3xl">{mode === "in" ? "Vstup do Sněmovny" : "Nová registrace"}</h1>
        {sent ? (
          <p className="mt-4 text-muted-foreground">Na váš e-mail jsme poslali potvrzovací odkaz. Po kliknutí se můžete přihlásit.</p>
        ) : (
          <>
            <form onSubmit={submit} className="mt-5 space-y-3">
              <input className="w-full rounded border bg-input px-3 py-2" type="email" placeholder="E-mail" required value={email} onChange={(e) => setEmail(e.target.value)} />
              <input className="w-full rounded border bg-input px-3 py-2" type="password" placeholder="Heslo" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
              <button disabled={busy} className="btn-brass w-full rounded py-2">{mode === "in" ? "Přihlásit" : "Registrovat"}</button>
            </form>
            <div className="my-4 text-center text-xs uppercase tracking-widest text-muted-foreground">nebo</div>
            <div className="space-y-2">
              <button onClick={() => oauth("google")} className="w-full rounded border bg-secondary py-2 hover:bg-muted">Pokračovat přes Google</button>
              <button type="button" onClick={() => oauth("lovable")} className="lovable-auth-button w-full">Continue with Lovable</button>
            </div>
            <button onClick={() => setMode(mode === "in" ? "up" : "in")} className="mt-4 w-full text-sm text-primary underline-offset-4 hover:underline">
              {mode === "in" ? "Nemáte účet? Zaregistrujte se" : "Máte účet? Přihlaste se"}
            </button>
          </>
        )}
      </div>
    </main>
  );
}

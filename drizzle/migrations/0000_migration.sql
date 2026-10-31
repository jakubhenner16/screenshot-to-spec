CREATE TABLE public.saved_games (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  name text NOT NULL,
  game_date text NOT NULL,
  state jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.saved_games TO authenticated;
GRANT ALL ON public.saved_games TO service_role;
ALTER TABLE public.saved_games ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own select" ON public.saved_games FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own insert" ON public.saved_games FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own update" ON public.saved_games FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own delete" ON public.saved_games FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE INDEX saved_games_user_idx ON public.saved_games(user_id, updated_at DESC);
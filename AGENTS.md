<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Architecture
- Game logic lives in pure TypeScript under `src/game/` (engine.ts, data.ts, types.ts); UI only calls engine functions, so rules stay testable in `src/game/engine.test.ts`.
- Saved games are stored as one JSON `state` per row in `saved_games` (owner-only RLS); the game page autosaves monthly in game time.

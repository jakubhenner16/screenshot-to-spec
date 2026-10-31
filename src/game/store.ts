import { create } from "zustand";
import type { GameState } from "./types";

interface Store {
  gameId: string | null;
  state: GameState | null;
  speed: 0 | 1 | 2 | 3;
  load: (id: string, s: GameState) => void;
  set: (s: GameState) => void;
  update: (fn: (s: GameState) => GameState) => void;
  setSpeed: (n: 0 | 1 | 2 | 3) => void;
}

export const useGame = create<Store>((set, get) => ({
  gameId: null,
  state: null,
  speed: 0,
  load: (id, s) => set({ gameId: id, state: s, speed: 0 }),
  set: (s) => set({ state: s }),
  update: (fn) => {
    const s = get().state;
    if (s) set({ state: fn(s) });
  },
  setSpeed: (speed) => set({ speed }),
}));

export const SPEED_MS = { 1: 900, 2: 350, 3: 90 } as const;

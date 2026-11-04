"use client";

import { createContext, useContext, useMemo, useSyncExternalStore } from "react";
import {
  addScore,
  getScoresSnapshot,
  getServerScoresSnapshot,
  getServerUserSnapshot,
  getUserSnapshot,
  subscribe,
  writeUser,
  type SavedScore,
  type User,
} from "@/lib/storage";

interface SessionContextValue {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  scores: SavedScore[];
  saveScore: (entry: SavedScore) => void;
}

const SessionContext = createContext<SessionContextValue | null>(null);

const login = (user: User) => writeUser(user);
const logout = () => writeUser(null);
const saveScore = (entry: SavedScore) => addScore(entry);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  // En servidor e hidratación se usa el snapshot vacío (null / []);
  // después React pasa al valor real de localStorage sin mismatch.
  const user = useSyncExternalStore(subscribe, getUserSnapshot, getServerUserSnapshot);
  const scores = useSyncExternalStore(subscribe, getScoresSnapshot, getServerScoresSnapshot);

  const value = useMemo(() => ({ user, login, logout, scores, saveScore }), [user, scores]);

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession debe usarse dentro de <SessionProvider>");
  return ctx;
}

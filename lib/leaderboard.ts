// Rankings = mock determinista (seededScores) + puntuaciones guardadas en localStorage.

import { seededScores, type ScoreRow } from "@/lib/games";
import type { SavedScore } from "@/lib/storage";

// Semillas del template: cada pantalla genera su propio ranking mock.
export const detailSeed = (gameId: string) => gameId.length * 17 + 3;
export const salonSeed = (gameId: string) => gameId.length * 23 + 7;

// Filas mock que usa bestFor para la "lista completa" (default de seededScores).
const FULL_MOCK_COUNT = 12;

function formatDate(at: number): string {
  const d = new Date(at);
  const day = String(d.getDate()).padStart(2, "0");
  const mon = String(d.getMonth() + 1).padStart(2, "0");
  return `${day}/${mon}/${d.getFullYear()}`;
}

interface MergedRow extends ScoreRow {
  saved?: SavedScore;
}

// Lista mezclada completa: mock + guardadas del juego, ordenada por score desc
// y con rank recalculado. sort es estable: a igual score, el mock va primero.
function merge(gameId: string, saved: SavedScore[], seed: number, mockCount: number): MergedRow[] {
  const own: MergedRow[] = saved
    .filter((s) => s.game === gameId)
    .map((s) => ({ rank: 0, name: s.name, score: s.score, date: formatDate(s.at), saved: s }));
  return [...seededScores(seed, mockCount), ...own]
    .sort((a, b) => b.score - a.score)
    .map((r, i) => ({ ...r, rank: i + 1 }));
}

export function buildLeaderboard(
  gameId: string,
  saved: SavedScore[],
  count: number,
  seed: number,
): ScoreRow[] {
  return merge(gameId, saved, seed, count)
    .slice(0, count)
    .map(({ rank, name, score, date }) => ({ rank, name, score, date }));
}

// Mejor SavedScore del usuario en ese juego, con su rank en la lista completa
// mezclada; null si no tiene ninguna.
export function bestFor(
  gameId: string,
  userName: string,
  saved: SavedScore[],
  seed: number,
): { rank: number; score: number; date: string } | null {
  const mine = saved.filter((s) => s.game === gameId && s.name === userName);
  if (mine.length === 0) return null;
  const best = mine.reduce((a, b) => (b.score > a.score ? b : a));
  const row = merge(gameId, saved, seed, FULL_MOCK_COUNT).find((r) => r.saved === best);
  return row ? { rank: row.rank, score: row.score, date: row.date } : null;
}

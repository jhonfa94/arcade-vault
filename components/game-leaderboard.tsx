"use client";

import { useMemo } from "react";
import { useSession } from "@/components/session-provider";
import { buildLeaderboard, detailSeed } from "@/lib/leaderboard";

const TOP_CLASS = [" top1", " top2", " top3"];

export function GameLeaderboard({ gameId }: { gameId: string }) {
  const { scores } = useSession();
  const rows = useMemo(() => buildLeaderboard(gameId, scores, 10, detailSeed(gameId)), [gameId, scores]);

  return (
    <div className="leaderboard">
      <h3>MEJORES PUNTUACIONES</h3>
      {rows.map((r, i) => (
        // rank como key: un mismo nombre puede aparecer varias veces con puntuaciones guardadas.
        <div key={r.rank} className={"lb-row" + (TOP_CLASS[i] ?? "")}>
          <div className="rk">#{String(r.rank).padStart(2, "0")}</div>
          <div className="pl">
            {r.name}
            <div style={{ fontSize: 10, color: "var(--ink-faint)", letterSpacing: "0.1em" }}>{r.date}</div>
          </div>
          <div className="sc">{r.score.toLocaleString("es-ES")}</div>
        </div>
      ))}
    </div>
  );
}

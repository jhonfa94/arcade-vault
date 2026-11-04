"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useSession } from "@/components/session-provider";
import { GAMES } from "@/lib/games";
import { bestFor, buildLeaderboard, salonSeed } from "@/lib/leaderboard";

const TOP_CLASS = [" top1", " top2", " top3"];
const YELLOW = "var(--yellow)";

export function HallOfFame() {
  const { user, scores } = useSession();
  const [tab, setTab] = useState(GAMES[0].id);
  const game = GAMES.find((g) => g.id === tab) ?? GAMES[0];

  const rows = useMemo(() => buildLeaderboard(tab, scores, 12, salonSeed(tab)), [tab, scores]);
  // Solo con datos reales del usuario: sin sesión o sin puntuaciones, no hay fila.
  const best = useMemo(
    () => (user ? bestFor(tab, user.name, scores, salonSeed(tab)) : null),
    [tab, user, scores],
  );

  const [first, second, third] = rows;

  return (
    <div className="av-hall fade-in">
      <div className="hall-head">
        <h1>SALÓN DE LA FAMA</h1>
        <p className="pixel" style={{ fontSize: 10 }}>
          LOS NOMBRES QUE NUNCA SE BORRAN DE LA PANTALLA
        </p>
      </div>

      <div className="hall-tabs" role="group" aria-label="Elegir juego">
        {GAMES.map((g) => (
          <button
            key={g.id}
            type="button"
            className={"chip" + (tab === g.id ? " active" : "")}
            aria-pressed={tab === g.id}
            onClick={() => setTab(g.id)}
          >
            {g.title}
          </button>
        ))}
      </div>

      <div className="podium">
        <div className="podium-slot silver">
          <div className="rank-num">02</div>
          <div className="name">{second.name}</div>
          <div className="score">{second.score.toLocaleString("es-ES")}</div>
          <div className="date">{second.date}</div>
        </div>
        <div className="podium-slot gold">
          <div className="pixel" style={{ fontSize: 9, color: "var(--gold)", letterSpacing: "0.18em" }}>
            CAMPEÓN
          </div>
          <div className="rank-num" style={{ fontSize: 36, marginTop: 4 }}>
            01
          </div>
          <div className="name">{first.name}</div>
          <div className="score" style={{ fontSize: 20 }}>
            {first.score.toLocaleString("es-ES")}
          </div>
          <div className="date">{first.date}</div>
        </div>
        <div className="podium-slot bronze">
          <div className="rank-num">03</div>
          <div className="name">{third.name}</div>
          <div className="score">{third.score.toLocaleString("es-ES")}</div>
          <div className="date">{third.date}</div>
        </div>
      </div>

      <div className="hall-table">
        <div className="th">
          <div>RANGO</div>
          <div>JUGADOR</div>
          <div>PUNTUACIÓN</div>
          <div>FECHA</div>
        </div>
        {rows.map((r, i) => (
          <div
            key={`${tab}-${r.rank}`}
            className={"tr" + (TOP_CLASS[i] ?? "")}
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <div className="rk">#{String(r.rank).padStart(2, "0")}</div>
            <div className="pl">{r.name}</div>
            <div className="sc">{r.score.toLocaleString("es-ES")}</div>
            <div className="dt">{r.date}</div>
          </div>
        ))}
        {user && best && (
          <>
            <div className="tr you-label">▸ TU MEJOR MARCA EN {game.title}</div>
            <div className="tr you" style={{ animationDelay: `${rows.length * 50 + 50}ms` }}>
              <div className="rk" style={{ color: YELLOW }}>
                #{String(best.rank).padStart(2, "0")}
              </div>
              <div className="pl" style={{ color: YELLOW }}>
                {user.name}
              </div>
              <div className="sc" style={{ color: YELLOW, textShadow: "0 0 6px rgba(245,255,0,0.5)" }}>
                {best.score.toLocaleString("es-ES")}
              </div>
              <div className="dt">{best.date}</div>
            </div>
          </>
        )}
      </div>

      <div style={{ textAlign: "center", marginTop: 32 }}>
        <Link href="/" className="btn lg">
          VOLVER A LA BIBLIOTECA
        </Link>
      </div>
    </div>
  );
}

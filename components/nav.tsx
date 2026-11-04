"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense } from "react";
import { useSession } from "@/components/session-provider";

type Section = "biblioteca" | "salon" | null;

function sectionFor(pathname: string): Section {
  if (pathname === "/" || pathname.startsWith("/juegos")) return "biblioteca";
  if (pathname === "/salon" || pathname.startsWith("/salon/")) return "salon";
  return null;
}

function NavBar({ active }: { active: Section }) {
  const { user, logout } = useSession();

  return (
    <nav className="av-nav">
      <Link href="/" className="logo" aria-label="Arcade Vault, ir a la biblioteca">
        <div className="logo-mark" aria-hidden="true"></div>
        <div className="logo-text neon-cyan">
          ARCADE <span className="neon-magenta">VAULT</span>
        </div>
      </Link>
      <div className="links">
        <Link
          href="/"
          className={active === "biblioteca" ? "active" : ""}
          aria-current={active === "biblioteca" ? "page" : undefined}
        >
          Biblioteca
        </Link>
        <Link
          href="/salon"
          className={active === "salon" ? "active" : ""}
          aria-current={active === "salon" ? "page" : undefined}
        >
          Salón de la Fama
        </Link>
      </div>
      <div className="spacer"></div>
      <div className="coin-counter">
        <span className="coin"></span>
        <span>CRÉDITOS · 03</span>
      </div>
      {user ? (
        <button type="button" className="btn ghost auth-btn" onClick={logout}>
          {user.name} ▾
        </button>
      ) : (
        <Link href="/auth" className="btn auth-btn">
          Iniciar Sesión
        </Link>
      )}
    </nav>
  );
}

function ActiveNavBar() {
  const pathname = usePathname();
  return <NavBar active={sectionFor(pathname)} />;
}

// Con cacheComponents, usePathname suspende en rutas con params no
// prerenderizados (p. ej. /juegos/no-existe). El fallback es el mismo Nav
// sin link activo, así el resto del layout se sigue prerenderizando.
export function Nav() {
  return (
    <Suspense fallback={<NavBar active={null} />}>
      <ActiveNavBar />
    </Suspense>
  );
}

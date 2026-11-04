import Link from "next/link";

export default function NotFound() {
  return (
    <section className="av-404 fade-in">
      <div className="code" aria-hidden="true">404</div>
      <h1 className="pixel neon-magenta">GAME OVER</h1>
      <p>Este juego no está en el vault. Puede que la dirección esté mal escrita.</p>
      <Link href="/" className="btn lg">
        VOLVER AL VAULT
      </Link>
    </section>
  );
}

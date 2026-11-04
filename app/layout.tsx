import type { Metadata } from "next";
import { Courier_Prime, JetBrains_Mono } from "next/font/google";
import localFont from "next/font/local";
import { Nav } from "@/components/nav";
import { SessionProvider } from "@/components/session-provider";
import "./globals.css";

// Press Start 2P va en local: el archivo que descarga next/font/google tiene
// métricas distintas al de Google Fonts y ensancha los textos del template.
const pressStart = localFont({
  src: "./fonts/press-start-2p-latin.woff2",
  variable: "--font-press-start",
  weight: "400",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
});

const courierPrime = Courier_Prime({
  variable: "--font-courier-prime",
  weight: ["400", "700"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Arcade Vault · Portal Retro",
    template: "%s · Arcade Vault",
  },
  description: "Juega clásicos arcade y compite por el puntaje más alto.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      // Extensiones como LanguageTool inyectan atributos en <html> antes de hidratar
      suppressHydrationWarning
      className={`${pressStart.variable} ${jetbrainsMono.variable} ${courierPrime.variable}`}
    >
      <body>
        <div className="av-bg" aria-hidden="true" />
        <div className="av-noise" aria-hidden="true" />
        <SessionProvider>
          <div className="av-root">
            <Nav />
            <main className="av-main">{children}</main>
            <footer className="av-footer">© 2026 ARCADE VAULT · HECHO CON PIXELES Y NEÓN · v2.6.0</footer>
          </div>
        </SessionProvider>
      </body>
    </html>
  );
}

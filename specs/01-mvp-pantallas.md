# SPEC 01 — MVP de Arcade Vault: las cinco pantallas del template en Next.js

> **Estado:** Aprobado
> **Depende de:** —
> **Fecha:** 2026-11-04
> **Objetivo:** Portar a Next.js App Router las pantallas de `references/templates/` (Biblioteca, Detalle, Reproductor, Auth y Salón de la Fama) con datos mock y persistencia en `localStorage`.

## Por qué existe este spec

El repo es todavía el scaffold de Create Next App. El diseño ya existe como prototipo SPA (React UMD + Babel, routing por hash) en `references/templates/`. Este spec convierte ese prototipo en la base real de la app sin rediseñarlo. La fidelidad visual al template es prioritaria sobre reescribir el CSS.

## Alcance

**Dentro:**

- Rutas reales de App Router:
    - `/` → Biblioteca (hero, buscador por nombre, chips de categoría, grid de tarjetas, estado "NO HAY RESULTADOS").
    - `/juegos/[id]` → Detalle (portada, tags, descripción, stat-strip, botones JUGAR AHORA / VOLVER AL VAULT, ranking de 10).
    - `/juegos/[id]/jugar` → Reproductor simulado (HUD, PAUSA/REANUDAR, FIN, SALIR, arena CRT decorativa, modal de fin con guardar puntuación, JUGAR DE NUEVO, VOLVER AL VAULT).
    - `/auth` → Auth (pestañas INICIAR SESIÓN / CREAR CUENTA, JUGAR COMO INVITADO, botones Google/GitHub decorativos).
    - `/salon` → Salón de la Fama (pestañas por juego, podio top 3, tabla de 12, fila "TU MEJOR MARCA").
- `Nav` global y footer en `app/layout.tsx`, con link activo según la ruta.
- Página 404 temática en `app/not-found.tsx`, usada por `notFound()` para ids de juego inexistentes.
- Portar `references/templates/styles.css` como CSS global y los fondos `av-bg` / `av-noise`.
- Fuentes Press Start 2P, JetBrains Mono y Courier Prime vía `next/font/google`.
- Sesión mock en `localStorage` (`av_user`): cualquier usuario/contraseña entra; no se valida nada.
- Puntuaciones guardadas en `localStorage` (`av_scores`) y mezcladas con los rankings mock.
- Elementos decorativos que se mantienen: contador `CRÉDITOS · 03`, botones Google/GitHub sin acción, efecto tilt 3D en tarjetas.
- Nav en móvil: sin hamburguesa; los links quedan visibles en formato compacto (se ajusta el `@media (max-width: 840px)`).

**Fuera de alcance (para specs futuros):**

- Juegos jugables reales (un spec por juego).
- Backend, base de datos y autenticación real (contraseñas, OAuth Google/GitHub).
- Menú móvil lateral (hamburguesa + panel).
- Lógica real de créditos.
- Dropdown de usuario en el Nav.
- Protección de rutas: el Reproductor no exige sesión.
- Tests automatizados (no hay test runner configurado).

## Modelo de datos

```ts
// lib/games.ts
export type GameCategory = "ARCADE" | "PUZZLE" | "SHOOTER" | "VERSUS";
export type GameColor = "cyan" | "magenta" | "yellow" | "green";

export interface Game {
    id: string; // slug usado en la URL: "bloque-buster"
    title: string;
    short: string;
    long: string;
    cat: GameCategory;
    cover: string; // clase CSS de portada: "cover-bricks"
    color: GameColor;
    best: number;
    plays: string; // "12.4K"
}

export const GAMES: Game[]; // los 8 juegos de data.jsx, sin cambios
export const CATS = ["TODOS", "ARCADE", "PUZZLE", "SHOOTER", "VERSUS"] as const;
export function getGame(id: string): Game | undefined;

export interface ScoreRow {
    rank: number;
    name: string;
    score: number;
    date: string; // "DD/MM/2026"
}
export function seededScores(seed: number, count?: number): ScoreRow[]; // portado 1:1 (determinista)
```

```ts
// lib/storage.ts — solo se usa en Client Components
export interface User {
    name: string;
} // MAYÚSCULAS, máx. 10 caracteres

export interface SavedScore {
    game: string; // Game.id
    score: number;
    name: string; // MAYÚSCULAS, máx. 10 caracteres
    at: number; // Date.now()
}

// Claves de localStorage (mismas que el template)
// "av_user"   → User | null
// "av_scores" → SavedScore[]
```

```ts
// lib/leaderboard.ts
// Mezcla seededScores(seed, n) con los SavedScore del juego,
// ordena por score desc, recorta a n y recalcula rank.
export function buildLeaderboard(
    gameId: string,
    saved: SavedScore[],
    count: number,
): ScoreRow[];
// Mejor SavedScore del usuario en ese juego, con su rank en la lista completa mezclada; null si no tiene.
export function bestFor(
    gameId: string,
    userName: string,
    saved: SavedScore[],
): { rank: number; score: number; date: string } | null;
```

Convenciones:

- Semillas: Detalle usa `id.length * 17 + 3` (10 filas); Salón usa `id.length * 23 + 7` (12 filas). Igual que el template.
- Números formateados con `toLocaleString("es-ES")`.
- Fechas de puntuaciones guardadas en formato `DD/MM/YYYY`.
- Lectura de `localStorage` siempre dentro de `try/catch`; si falla, se trata como vacío.

## Plan de implementación

1. **Estilos y fuentes.** Copiar `references/templates/styles.css` a `app/arcade.css` e importarlo en `app/layout.tsx`. Reemplazar el `<link>` de Google Fonts por `next/font/google` exponiendo variables CSS que alimentan `--pixel` y `--mono`. Limpiar `app/globals.css` del boilerplate y mapear los tokens neón a `@theme inline`. Añadir `<div className="av-bg">` y `<div className="av-noise">` en el layout. Verificación: `npm run dev` muestra el fondo del template.
2. **Datos.** Crear `lib/games.ts` con `Game`, `GAMES`, `CATS`, `getGame`, `ScoreRow` y `seededScores` portados desde `data.jsx`.
3. **Storage y sesión.** Crear `lib/storage.ts` (lectura/escritura de `av_user` y `av_scores`) y `components/session-provider.tsx` (Client Component con contexto `{ user, login, logout, scores, saveScore }`). El estado inicial es `null`/`[]` y se hidrata desde `localStorage` en el cliente para evitar mismatch de hidratación. Envolver la app en el layout.
4. **Nav y footer.** Crear `components/nav.tsx` (Client) con `Link` de `next/link` y `usePathname` para el link activo: Biblioteca activa en `/`, `/juegos/*`; Salón activo en `/salon`. Logo → `/`. Sin sesión: botón "Iniciar Sesión" → `/auth`. Con sesión: botón `NOMBRE ▾` que llama a `logout`. Quitar hamburguesa y ajustar el `@media (max-width: 840px)` para mostrar links compactos. Footer en el layout.
5. **Biblioteca.** `app/page.tsx` renderiza `components/library.tsx` (Client: búsqueda, chips, grid) y `components/game-card.tsx` (Client: tilt 3D). Click en tarjeta o en JUGAR → `/juegos/[id]`.
6. **Leaderboard.** Crear `lib/leaderboard.ts` con `buildLeaderboard` y `bestFor`.
7. **Detalle y 404.** `app/juegos/[id]/page.tsx` con `generateStaticParams` sobre `GAMES`; si `getGame(id)` es `undefined`, llamar `notFound()`. El ranking lateral es `components/game-leaderboard.tsx` (Client) usando `buildLeaderboard(id, scores, 10)`. Crear `app/not-found.tsx` con estilo neón y botón "VOLVER AL VAULT".
8. **Reproductor.** `app/juegos/[id]/jugar/page.tsx` (con `generateStaticParams` y `notFound()`) renderiza `components/game-player.tsx` (Client) portado de `reproductor.jsx`. Nombre por defecto: `user.name` o `INVITADO`. GUARDAR PUNTUACIÓN llama `saveScore({ game, score, name, at })`. SALIR → `/juegos/[id]`; VOLVER AL VAULT → `/`.
9. **Auth.** `app/auth/page.tsx` renderiza `components/auth-form.tsx` (Client). Submit → `login({ name: (usuario || "PLAYER1").toUpperCase().slice(0, 10) })` y `router.push("/")`. JUGAR COMO INVITADO → `logout()` y `router.push("/")`. Google/GitHub sin acción.
10. **Salón de la Fama.** `app/salon/page.tsx` renderiza `components/hall-of-fame.tsx` (Client): pestañas por juego (primera por defecto), podio con filas 1–3 y tabla con `buildLeaderboard(tab, scores, 12)`. La fila "TU MEJOR MARCA EN {TÍTULO}" solo aparece si hay sesión y `bestFor` no es `null`.
11. **Metadatos y limpieza.** `metadata` en el layout (`title: "Arcade Vault · Portal Retro"`, `lang="es"`) y `title` por página. Eliminar assets del boilerplate en `public/` que ya no se usen. `npm run lint` y `npm run build` sin errores.

## Criterios de aceptación

- [ ] `npm run build` termina sin errores.
- [ ] `npm run lint` termina sin errores.
- [ ] `/` muestra el hero "ARCADE VAULT" y las 8 tarjetas de juego.
- [ ] Escribir "ser" en el buscador deja solo SERPENTINA.
- [ ] Pulsar el chip PUZZLE deja solo CAÍDA.
- [ ] Una búsqueda sin coincidencias muestra "NO HAY RESULTADOS".
- [ ] Pulsar una tarjeta navega a `/juegos/<id>` y la URL cambia.
- [ ] `/juegos/no-existe` y `/juegos/no-existe/jugar` muestran la 404 temática con botón a `/`.
- [ ] `/juegos/caida` muestra título, descripción larga, stat-strip y un ranking de 10 filas.
- [ ] JUGAR AHORA navega a `/juegos/<id>/jugar` y la puntuación del HUD aumenta sola.
- [ ] PAUSA detiene la puntuación y muestra "EN PAUSA"; REANUDAR la continúa.
- [ ] FIN abre el modal con la puntuación final.
- [ ] Sin sesión, el nombre por defecto del modal es "INVITADO".
- [ ] GUARDAR PUNTUACIÓN añade una entrada a `av_scores` en `localStorage` y muestra "PUNTUACIÓN GUARDADA".
- [ ] Una puntuación guardada mayor que la 10ª del ranking aparece en el ranking de `/juegos/<id>`.
- [ ] JUGAR DE NUEVO reinicia puntuación a 0, vidas a 3 y nivel a 01.
- [ ] En `/auth`, enviar el formulario con usuario "px_kai" guarda `{"name":"PX_KAI"}` en `av_user` y redirige a `/`.
- [ ] Con sesión iniciada, el Nav muestra "PX_KAI ▾"; al pulsarlo se borra `av_user` y vuelve "Iniciar Sesión".
- [ ] La pestaña CREAR CUENTA muestra el campo "Correo electrónico".
- [ ] Recargar la página conserva la sesión y las puntuaciones guardadas.
- [ ] `/salon` muestra pestañas de los 8 juegos, podio con 3 jugadores y tabla de 12 filas.
- [ ] Con sesión y una puntuación guardada en ese juego, `/salon` muestra la fila "TU MEJOR MARCA" con esa puntuación.
- [ ] Sin sesión, o sin puntuaciones del usuario en ese juego, la fila "TU MEJOR MARCA" no aparece.
- [ ] El link activo del Nav es "Biblioteca" en `/`, `/juegos/<id>` y `/juegos/<id>/jugar`, y "Salón de la Fama" en `/salon`.
- [ ] A 375px de ancho los links Biblioteca y Salón de la Fama son visibles y no hay scroll horizontal.
- [ ] La consola del navegador no muestra errores de hidratación en ninguna ruta.

## Decisiones

- **Sí:** rutas reales de App Router (`/`, `/juegos/[id]`, `/juegos/[id]/jugar`, `/auth`, `/salon`). URLs compartibles y aprovecha el framework.
- **No:** replicar el router por hash del template. Desaprovecha Next y rompe enlaces directos.
- **Sí:** Reproductor simulado como el template. Los juegos reales son trabajo grande e independiente; cada uno irá en su spec.
- **Sí:** auth y puntuaciones mock en `localStorage` con las mismas claves del template (`av_user`, `av_scores`). Backend y DB requieren decisiones de infraestructura que merecen su propio spec.
- **No:** validar contraseñas o email. Es un mock; validar daría falsa sensación de seguridad.
- **Sí:** portar `styles.css` tal cual como CSS global. Máxima fidelidad visual y menor esfuerzo.
- **No:** reescribir en Tailwind ni partir en CSS Modules. Lento y con riesgo de divergir del diseño.
- **Sí:** rankings = mock determinista + puntuaciones guardadas. Guardar una puntuación tiene efecto visible.
- **No:** fila "TU MEJOR MARCA" inventada como en el template. Solo se muestra con datos reales del usuario.
- **Sí:** `notFound()` + `app/not-found.tsx` temático para ids inexistentes.
- **Sí:** invitado puede jugar sin sesión, con nombre por defecto "INVITADO".
- **Sí:** clic en `NOMBRE ▾` cierra sesión directamente, como el template.
- **No:** menú móvil lateral. Se sustituye por links compactos siempre visibles.
- **Sí:** mantener decorativos sin lógica: `CRÉDITOS · 03`, botones Google/GitHub, tilt 3D.
- **Sí:** `lib/` y `components/` en la raíz del repo, usando el alias `@/`.
- **Sí:** páginas como Server Components y la interactividad/`localStorage` aislada en Client Components.

## Riesgos

| Riesgo                                                                 | Mitigación                                                                                                             |
| ---------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Mismatch de hidratación al leer `localStorage` durante el render       | El provider arranca con `null`/`[]` y lee `localStorage` en un efecto del cliente.                                     |
| `cacheComponents` exige manejar `params` dinámicos de forma específica | `generateStaticParams` sobre `GAMES` y consultar `node_modules/next/dist/docs/` antes de escribir las rutas dinámicas. |
| `localStorage` deshabilitado o con JSON corrupto                       | Toda lectura en `try/catch`; si falla se usa estado vacío y la app sigue funcionando sin persistir.                    |
| El CSS global del template choca con el preflight de Tailwind v4       | Importar `arcade.css` después de Tailwind y revisar visualmente cada pantalla contra el template.                      |
| Ajustar el Nav móvil rompe el layout a anchos intermedios              | Criterio de aceptación explícito a 375px sin scroll horizontal.                                                        |

## Lo que **no** entra en este spec

- Juegos jugables reales.
- Backend, base de datos y autenticación real (incluido OAuth Google/GitHub).
- Menú móvil lateral con hamburguesa.
- Lógica de créditos.
- Dropdown de usuario.
- Protección de rutas por sesión.
- Tests automatizados.

Cada uno de esos, si llega, va en su propio spec.

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Project

Arcade Vault is an online platform for playing games and competing for the highest score. It is currently a fresh Create Next App scaffold (`app/layout.tsx`, `app/page.tsx` are still boilerplate).

Development follows **Spec Driven Design** using the `/spec` and `/spec-impl` skills from https://github.com/Klerith/fernando-skills (install with `npx skills@latest add Klerith/fernando-skills`). New features should go through a spec first, then implementation from that spec.

## Commands

- `npm run dev` — dev server (Turbopack)
- `npm run build` — production build
- `npm run start` — serve the production build
- `npm run lint` — ESLint (flat config, `eslint-config-next` core-web-vitals + typescript)

No test runner is configured yet.

## Stack and non-default configuration

- Next.js 16.4 (App Router, `app/` directory), React 19.3, TypeScript strict, Tailwind CSS v4.
- Next.js APIs differ from older versions — consult `node_modules/next/dist/docs/` (`01-app/`, `03-architecture/`, …) before using framework APIs.
- `next.config.ts` enables `cacheComponents` and `partialPrefetching` (plus `experimental.agentFeedback`). With Cache Components on, data fetching/caching semantics follow the `"use cache"` / Partial Prerendering model — check the docs before adding dynamic data access or route segment config.
- Tailwind is wired through a Turbopack loader rule (`@tailwindcss/turbopack` on `*.css`) rather than a PostCSS config. Theme tokens live in `app/globals.css` via `@theme inline` (CSS variables `--background`/`--foreground`, Geist fonts from `next/font/google`).
- Route props use Next's generated global helper types (e.g. `LayoutProps<"/">`), generated into `.next/types` during dev/build.
- Path alias: `@/*` maps to the repo root.

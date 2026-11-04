// Persistencia mock en localStorage — solo se usa en Client Components.
// Mismas claves que el template: "av_user" y "av_scores".

export interface User {
  name: string; // MAYÚSCULAS, máx. 10 caracteres
}

export interface SavedScore {
  game: string; // Game.id
  score: number;
  name: string; // MAYÚSCULAS, máx. 10 caracteres
  at: number; // Date.now()
}

const USER_KEY = "av_user";
const SCORES_KEY = "av_scores";

function isUser(value: unknown): value is User {
  return typeof value === "object" && value !== null && typeof (value as User).name === "string";
}

function isSavedScore(value: unknown): value is SavedScore {
  if (typeof value !== "object" || value === null) return false;
  const s = value as SavedScore;
  return (
    typeof s.game === "string" &&
    typeof s.score === "number" &&
    typeof s.name === "string" &&
    typeof s.at === "number"
  );
}

// Toda lectura va en try/catch: si localStorage no está disponible
// o el JSON está corrupto, se trata como vacío. Si no se puede escribir,
// se guarda en memoria y la app sigue funcionando sin persistir.
const memory = new Map<string, string>();

function readRaw(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return memory.get(key) ?? null;
  }
}

function writeRaw(key: string, value: string | null): void {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {
    if (value === null) memory.delete(key);
    else memory.set(key, value);
  }
  emit();
}

function parseUser(raw: string | null): User | null {
  try {
    const parsed: unknown = JSON.parse(raw || "null");
    return isUser(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function parseScores(raw: string | null): SavedScore[] {
  try {
    const parsed: unknown = JSON.parse(raw || "[]");
    return Array.isArray(parsed) ? parsed.filter(isSavedScore) : [];
  } catch {
    return [];
  }
}

// ===== Store externo para useSyncExternalStore =====
// Los snapshots se cachean por el string crudo para devolver siempre
// la misma referencia mientras localStorage no cambie.

const EMPTY_SCORES: SavedScore[] = [];

let userRaw: string | null = null;
let userCache: User | null = null;
let scoresRaw: string | null = null;
let scoresCache: SavedScore[] = EMPTY_SCORES;

export function getUserSnapshot(): User | null {
  const raw = readRaw(USER_KEY);
  if (raw !== userRaw) {
    userRaw = raw;
    userCache = parseUser(raw);
  }
  return userCache;
}

export function getScoresSnapshot(): SavedScore[] {
  const raw = readRaw(SCORES_KEY);
  if (raw !== scoresRaw) {
    scoresRaw = raw;
    scoresCache = parseScores(raw);
  }
  return scoresCache;
}

// Servidor e hidratación: siempre vacío, así el HTML coincide.
export const getServerUserSnapshot = (): User | null => null;
export const getServerScoresSnapshot = (): SavedScore[] => EMPTY_SCORES;

const listeners = new Set<() => void>();

function emit(): void {
  listeners.forEach((listener) => listener());
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  // Cambios hechos desde otras pestañas.
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

// ===== Escritura =====

export function writeUser(user: User | null): void {
  writeRaw(USER_KEY, user ? JSON.stringify(user) : null);
}

export function addScore(entry: SavedScore): void {
  // Se relee para no pisar entradas escritas desde otra pestaña.
  const all = parseScores(readRaw(SCORES_KEY));
  writeRaw(SCORES_KEY, JSON.stringify([...all, entry]));
}

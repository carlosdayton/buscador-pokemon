import { MappedPokemon } from "../mappers/pokemonMapper.js";
import { SearchHistory } from "../types/pokemon.js";

const STORAGE_KEY = "pokemon-history";
const MAX_HISTORY = 10;

// ✅ Conceito: type guard customizado
// Verifica em runtime se um objeto tem a forma que esperamos
function isValidHistoryEntry(entry: unknown): entry is SearchHistory {
  if (typeof entry !== "object" || entry === null) return false;

  const e = entry as Record<string, unknown>;

  return (
    typeof e.searchedAt === "string" &&
    typeof e.pokemon === "object" &&
    e.pokemon !== null &&
    typeof (e.pokemon as Record<string, unknown>).name === "string" &&
    typeof (e.pokemon as Record<string, unknown>).displayId === "string"
  );
}

// Carrega do localStorage — valida cada entrada antes de aceitar
function loadHistory(): SearchHistory[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];

    // ✅ Filtra entradas inválidas em vez de rejeitar tudo
    const valid = parsed.filter(isValidHistoryEntry);

    // Converte searchedAt de string de volta para Date
    return valid.map((entry) => ({
      ...entry,
      searchedAt: new Date(entry.searchedAt),
    }));

  } catch {
    // JSON.parse pode lançar erro se a string estiver corrompida
    return [];
  }
}

// Salva no localStorage
function saveHistory(history: SearchHistory[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

// Estado em memória — inicializado a partir do localStorage
let history: SearchHistory[] = loadHistory();

export function addToHistory(pokemon: MappedPokemon): void {
  const existingIndex = history.findIndex(
    (entry) => entry.pokemon.displayId === pokemon.displayId
  );

  if (existingIndex !== -1) {
    history.splice(existingIndex, 1);
  }

  history.unshift({
    pokemon,
    searchedAt: new Date(),
  });

  if (history.length > MAX_HISTORY) {
    history.pop();
  }

  // ✅ Persiste sempre que o histórico muda
  saveHistory(history);
}

export function getHistory(): readonly SearchHistory[] {
  return history;
}

export function clearHistory(): void {
  history.length = 0;
  localStorage.removeItem(STORAGE_KEY);
}
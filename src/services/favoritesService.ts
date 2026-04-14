import { MappedPokemon } from '../mappers/pokemonMapper.js';

const STORAGE_KEY = 'pokemon-favorites';

function load(): string[] {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? (JSON.parse(raw) as string[]) : [];
    } catch {
        return [];
    }
}

function save(ids: string[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
}

let favorites: string[] = load();

export function isFavorite(displayId: string): boolean {
    return favorites.includes(displayId);
}

export function toggleFavorite(pokemon: MappedPokemon): boolean {
    const idx = favorites.indexOf(pokemon.displayId);
    if (idx === -1) {
        favorites.unshift(pokemon.displayId);
    } else {
        favorites.splice(idx, 1);
    }
    save(favorites);
    return idx === -1; // true = adicionado
}

export function getFavoriteIds(): readonly string[] {
    return favorites;
}

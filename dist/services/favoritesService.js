const STORAGE_KEY = 'pokemon-favorites';
function load() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    }
    catch {
        return [];
    }
}
function save(ids) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
}
let favorites = load();
export function isFavorite(displayId) {
    return favorites.includes(displayId);
}
export function toggleFavorite(pokemon) {
    const idx = favorites.indexOf(pokemon.displayId);
    if (idx === -1) {
        favorites.unshift(pokemon.displayId);
    }
    else {
        favorites.splice(idx, 1);
    }
    save(favorites);
    return idx === -1; // true = adicionado
}
export function getFavoriteIds() {
    return favorites;
}

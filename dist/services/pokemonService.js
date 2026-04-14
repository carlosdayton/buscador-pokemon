// Cache em memória — evita refetch do mesmo Pokémon
const cache = new Map();
export async function fetchPokemon(nameOrId) {
    const key = nameOrId.toLowerCase().trim();
    if (cache.has(key)) {
        return cache.get(key);
    }
    const url = `https://pokeapi.co/api/v2/pokemon/${key}`;
    let response;
    try {
        response = await fetch(url);
    }
    catch {
        throw new Error('Sem conexão com a internet. Verifique sua rede e tente novamente.');
    }
    if (response.status === 404) {
        throw new Error(`Pokémon "${nameOrId}" não encontrado. Verifique o nome ou número.`);
    }
    if (response.status === 429) {
        throw new Error('Muitas requisições. Aguarde um momento e tente novamente.');
    }
    if (!response.ok) {
        throw new Error(`Erro ao buscar Pokémon (código ${response.status}). Tente novamente.`);
    }
    const data = await response.json();
    cache.set(key, data);
    // também cacheia pelo id numérico
    cache.set(String(data.id), data);
    return data;
}
export function getRandomPokemonId() {
    // Geração 1-9 tem até 1025 Pokémon
    return Math.floor(Math.random() * 1025) + 1;
}

import { Pokemon } from '../types/pokemon.js';
import { BFF_BASE_URL } from '../config.js';

// Cache em memória — evita refetch do mesmo Pokémon dentro da sessão
const cache = new Map<string, Pokemon>();

export async function fetchPokemon(nameOrId: string): Promise<Pokemon> {
    const key = nameOrId.toLowerCase().trim();

    if (cache.has(key)) {
        return cache.get(key)!;
    }

    const url = `${BFF_BASE_URL}/pokemon/${key}`;

    let response: Response;

    try {
        response = await fetch(url);
    } catch {
        throw new Error('Sem conexão com a internet. Verifique sua rede e tente novamente.');
    }

    if (response.status === 404) {
        throw new Error(`Pokémon "${nameOrId}" não encontrado. Verifique o nome ou número.`);
    }

    if (response.status === 503) {
        throw new Error('Serviço temporariamente indisponível. Tente novamente mais tarde.');
    }

    if (response.status === 429) {
        throw new Error('Muitas requisições. Aguarde um momento e tente novamente.');
    }

    if (!response.ok) {
        throw new Error(`Erro ao buscar Pokémon (código ${response.status}). Tente novamente.`);
    }

    const data = await response.json() as Pokemon;
    cache.set(key, data);
    cache.set(String(data.id), data);

    return data;
}

export function getRandomPokemonId(): number {
    return Math.floor(Math.random() * 1025) + 1;
}

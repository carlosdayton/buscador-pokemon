// AQUI BUSCA OS DADOS DA API (PESO, STATS, ETC)

import { Pokemon } from '../types/pokemon.js'

export async function fetchPokemon(name: string): Promise<Pokemon> {
    const url = `https://pokeapi.co/api/v2/pokemon/${name.toLowerCase()}`;
    const response = await fetch(url)

    if(!response.ok) {
        throw new Error(`Pokemon "${name} não encontrado`)
    }

    const data = await response.json() as Pokemon;
    return data
}
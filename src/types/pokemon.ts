// MODELO DE COMO DEVE SER ENTREGUE OS DADOS DOS POKEMONS

import { MappedPokemon } from "../mappers/pokemonMapper";

export interface PokemonSprites {
    front_default: string;
}

export interface PokemonType {
    type: {
        name: string;
    }
}

export interface PokemonStat {
    base_stat: number;
    stat: {
        name: string;
    }
}

export interface Pokemon {
    name: string;
    id: number;
    height: number;
    weight: number;
    sprites: PokemonSprites;
    types: PokemonType[];
    stats: PokemonStat[];
}

export interface SearchHistory {
    pokemon: MappedPokemon;
    searchedAt: Date;
}
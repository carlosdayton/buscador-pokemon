import { MappedPokemon } from "../mappers/pokemonMapper";

export interface PokemonSprites {
    front_default: string;
    front_shiny: string;
    other: {
        'official-artwork': {
            front_default: string;
            front_shiny: string;
        };
    };
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

export interface PokemonAbility {
    ability: {
        name: string;
    };
    is_hidden: boolean;
}

export interface Pokemon {
    name: string;
    id: number;
    height: number;
    weight: number;
    sprites: PokemonSprites;
    types: PokemonType[];
    stats: PokemonStat[];
    abilities: PokemonAbility[];
}

export interface SearchHistory {
    pokemon: MappedPokemon;
    searchedAt: Date;
}

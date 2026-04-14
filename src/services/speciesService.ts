interface FlavorTextEntry {
    flavor_text: string;
    language: { name: string };
    version: { name: string };
}

interface PokemonSpecies {
    flavor_text_entries: FlavorTextEntry[];
    genera: { genus: string; language: { name: string } }[];
}

const cache = new Map<string, PokemonSpecies>();

export async function fetchSpecies(nameOrId: string): Promise<PokemonSpecies> {
    const key = nameOrId.toLowerCase();
    if (cache.has(key)) return cache.get(key)!;

    const response = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${key}`);
    if (!response.ok) throw new Error('Espécie não encontrada.');

    const data = await response.json() as PokemonSpecies;
    cache.set(key, data);
    return data;
}

export function extractFlavorText(species: PokemonSpecies): string {
    const entry = species.flavor_text_entries.find(e => e.language.name === 'pt-br')
                ?? species.flavor_text_entries.find(e => e.language.name === 'en')
                ?? species.flavor_text_entries[0];
    return entry
        ? entry.flavor_text.replace(/\f|\n/g, ' ').trim()
        : '';
}

export function extractGenus(species: PokemonSpecies): string {
    const entry = species.genera.find(g => g.language.name === 'en');
    return entry ? entry.genus : '';
}

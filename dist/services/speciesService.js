const cache = new Map();
export async function fetchSpecies(nameOrId) {
    const key = nameOrId.toLowerCase();
    if (cache.has(key))
        return cache.get(key);
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${key}`);
    if (!response.ok)
        throw new Error('Espécie não encontrada.');
    const data = await response.json();
    cache.set(key, data);
    return data;
}
export function extractFlavorText(species) {
    const entry = species.flavor_text_entries.find(e => e.language.name === 'pt-br')
        ?? species.flavor_text_entries.find(e => e.language.name === 'en')
        ?? species.flavor_text_entries[0];
    return entry
        ? entry.flavor_text.replace(/\f|\n/g, ' ').trim()
        : '';
}
export function extractGenus(species) {
    const entry = species.genera.find(g => g.language.name === 'en');
    return entry ? entry.genus : '';
}

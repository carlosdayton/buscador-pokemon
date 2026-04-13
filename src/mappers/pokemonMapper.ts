import { Pokemon } from '../types/pokemon.js';

export interface MappedPokemon {
    name: string;
    displayId: string;
    imageUrl: string;
    spriteUrl: string;
    typesHtml: string;
    primaryType: string;
    heightText: string;
    weightText: string;
    statsHtml: string;
    abilitiesHtml: string;
    weaknessesHtml: string;
}

const STAT_MAX: Record<string, number> = {
    hp: 255,
    attack: 190,
    defense: 230,
    'special-attack': 194,
    'special-defense': 230,
    speed: 200,
};

// Fraquezas por tipo (tipos que causam dano x2)
const TYPE_WEAKNESSES: Record<string, string[]> = {
    normal:   ['fighting'],
    fire:     ['water', 'ground', 'rock'],
    water:    ['electric', 'grass'],
    electric: ['ground'],
    grass:    ['fire', 'ice', 'poison', 'flying', 'bug'],
    ice:      ['fire', 'fighting', 'rock', 'steel'],
    fighting: ['flying', 'psychic', 'fairy'],
    poison:   ['ground', 'psychic'],
    ground:   ['water', 'grass', 'ice'],
    flying:   ['electric', 'ice', 'rock'],
    psychic:  ['bug', 'ghost', 'dark'],
    bug:      ['fire', 'flying', 'rock'],
    rock:     ['water', 'grass', 'fighting', 'ground', 'steel'],
    ghost:    ['ghost', 'dark'],
    dragon:   ['ice', 'dragon', 'fairy'],
    dark:     ['fighting', 'bug', 'fairy'],
    steel:    ['fire', 'fighting', 'ground'],
    fairy:    ['poison', 'steel'],
};

export function calcStatBarWidth(statValue: number, statName: string): number {
    const max = STAT_MAX[statName] ?? 255;
    return Math.max(1, Math.min(100, Math.floor((statValue / max) * 100)));
}

function getWeaknesses(types: string[]): string[] {
    const weakSet = new Set<string>();
    const immuneSet = new Set<string>();

    // Imunidades simples
    const IMMUNITIES: Record<string, string[]> = {
        normal:   ['ghost'],
        ghost:    ['normal', 'fighting'],
        flying:   ['ground'],
        ground:   ['electric'],
        dark:     ['psychic'],
        steel:    ['poison'],
        fairy:    ['dragon'],
    };

    types.forEach(t => {
        (TYPE_WEAKNESSES[t] ?? []).forEach(w => weakSet.add(w));
        (IMMUNITIES[t] ?? []).forEach(i => immuneSet.add(i));
    });

    // Remove imunidades e fraquezas canceladas entre tipos
    return [...weakSet].filter(w => !immuneSet.has(w));
}

export function mapPokemonToUI(apiData: Pokemon): MappedPokemon {
    const typeNames = apiData.types.map(t => t.type.name.toLowerCase());
    const primaryType = typeNames[0] ?? 'normal';

    const weaknesses = getWeaknesses(typeNames);

    return {
        name: apiData.name.toUpperCase(),
        displayId: `#${apiData.id.toString().padStart(3, '0')}`,
        imageUrl: apiData.sprites.other['official-artwork'].front_default
                  || apiData.sprites.front_default,
        spriteUrl: apiData.sprites.front_default,
        primaryType,

        typesHtml: typeNames
            .map(t => `<span class="type-badge type-${t}">${t}</span>`)
            .join(''),

        heightText: `${apiData.height / 10}m`,
        weightText: `${apiData.weight / 10}kg`,

        statsHtml: apiData.stats.map(s => {
            const pct = calcStatBarWidth(s.base_stat, s.stat.name);
            return `
                <div class="stat-row">
                    <span class="stat-name">${s.stat.name}</span>
                    <div class="stat-bar-wrapper">
                        <div class="stat-bar" style="width: ${pct}%"></div>
                    </div>
                    <span class="stat-value">${s.base_stat}</span>
                </div>
            `;
        }).join(''),

        abilitiesHtml: apiData.abilities
            .map(a => {
                const label = a.ability.name.replace(/-/g, ' ');
                const hidden = a.is_hidden ? ' <span class="ability-hidden">oculta</span>' : '';
                return `<span class="ability-badge">${label}${hidden}</span>`;
            })
            .join(''),

        weaknessesHtml: weaknesses.length > 0
            ? weaknesses.map(w => `<span class="type-badge type-${w}">${w}</span>`).join('')
            : '<span class="no-weakness">Nenhuma</span>',
    };
}

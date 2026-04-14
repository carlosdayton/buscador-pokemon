import { MappedPokemon } from '../mappers/pokemonMapper.js';
import { SearchHistory } from '../types/pokemon.js';
import { isFavorite } from '../services/favoritesService.js';

const TYPE_COLOR_MAP: Record<string, string> = {
    normal:   '#A8A878', fire:     '#FF4500', water:    '#4169E1',
    electric: '#FFD700', grass:    '#32CD32', ice:      '#00CED1',
    fighting: '#DC143C', poison:   '#9400D3', ground:   '#DAA520',
    flying:   '#87CEEB', psychic:  '#FF1493', bug:      '#6B8E23',
    rock:     '#808080', ghost:    '#483D8B', dragon:   '#4B0082',
    dark:     '#2F2F2F', steel:    '#B0C4DE', fairy:    '#FF69B4',
};

// Radar chart SVG — 6 stats em hexágono
function buildRadarSvg(statsHtml: string): string {
    // Extrai valores das barras (width: X%)
    const pcts = [...statsHtml.matchAll(/width:\s*(\d+)%/g)].map(m => parseInt(m[1]) / 100);
    if (pcts.length < 6) return '';

    const cx = 100, cy = 100, r = 80;
    const labels = ['HP', 'ATK', 'DEF', 'SpA', 'SpD', 'SPD'];
    const colors = ['#FF4444','#FF8C00','#4169E1','#9400D3','#32CD32','#00CED1'];
    const angles = labels.map((_, i) => (Math.PI * 2 * i) / 6 - Math.PI / 2);

    const gridPoints = (scale: number) =>
        angles.map(a => `${cx + r * scale * Math.cos(a)},${cy + r * scale * Math.sin(a)}`).join(' ');

    const dataPoints = angles.map((a, i) =>
        `${cx + r * pcts[i] * Math.cos(a)},${cy + r * pcts[i] * Math.sin(a)}`
    ).join(' ');

    const gridLines = [0.25, 0.5, 0.75, 1].map(s =>
        `<polygon points="${gridPoints(s)}" fill="none" stroke="currentColor" stroke-width="0.5" opacity="0.2"/>`
    ).join('');

    const axisLines = angles.map(a =>
        `<line x1="${cx}" y1="${cy}" x2="${cx + r * Math.cos(a)}" y2="${cy + r * Math.sin(a)}" stroke="currentColor" stroke-width="0.5" opacity="0.2"/>`
    ).join('');

    const dots = angles.map((a, i) => {
        const x = cx + r * pcts[i] * Math.cos(a);
        const y = cy + r * pcts[i] * Math.sin(a);
        return `<circle cx="${x}" cy="${y}" r="4" fill="${colors[i]}" stroke="#000" stroke-width="1.5"/>`;
    }).join('');

    const labelEls = angles.map((a, i) => {
        const lx = cx + (r + 16) * Math.cos(a);
        const ly = cy + (r + 16) * Math.sin(a);
        return `<text x="${lx}" y="${ly}" text-anchor="middle" dominant-baseline="middle" font-size="10" font-weight="900" font-family="Space Grotesk,sans-serif" fill="${colors[i]}">${labels[i]}</text>`;
    }).join('');

    return `
    <svg viewBox="0 0 200 200" class="radar-chart" aria-label="Radar de stats">
      ${gridLines}
      ${axisLines}
      <polygon points="${dataPoints}" fill="rgba(0,0,0,0.08)" stroke="#000" stroke-width="2"/>
      ${dots}
      ${labelEls}
    </svg>`;
}

export function renderPokemon(pokemon: MappedPokemon): void {
    const result = document.getElementById("result")!;
    const headerColor = TYPE_COLOR_MAP[pokemon.primaryType] ?? '#ADFF2F';
    const fav = isFavorite(pokemon.displayId);
    const radar = buildRadarSvg(pokemon.statsHtml);

    result.innerHTML = `
        <div class="pokemon-card">
            <div class="pokemon-card__header" data-primary-type="${pokemon.primaryType}" style="background-color: ${headerColor}">
                <div class="header-left">
                    <span class="pokemon-card__id">${pokemon.displayId}</span>
                    ${pokemon.genus ? `<span class="pokemon-card__genus">${pokemon.genus}</span>` : ''}
                </div>
                <div class="header-right">
                    <button class="fav-btn ${fav ? 'fav-btn--active' : ''}" data-action="favorite" title="Favoritar">
                        ${fav ? '★' : '☆'}
                    </button>
                    <h2 class="pokemon-card__name">${pokemon.name}</h2>
                </div>
            </div>

            <div class="pokemon-img-wrapper">
                <img id="pokemon-main-img" src="${pokemon.imageUrl}" class="pokemon-img" alt="${pokemon.name}"
                     onerror="this.src='${pokemon.spriteUrl}'" />
                <button class="shiny-btn" data-action="shiny"
                        data-normal="${pokemon.imageUrl}"
                        data-shiny="${pokemon.shinyUrl}"
                        data-normal-fallback="${pokemon.spriteUrl}"
                        title="Ver versão shiny">
                    ✨ Shiny
                </button>
            </div>

            ${pokemon.flavorText ? `<div class="flavor-text">${pokemon.flavorText}</div>` : ''}

            <div class="types-container">${pokemon.typesHtml}</div>

            <div class="measurements">
                <div class="measurement-item">
                    <span class="measurement-label">Altura</span>
                    <span class="measurement-value">${pokemon.heightText}</span>
                </div>
                <div class="measurement-item">
                    <span class="measurement-label">Peso</span>
                    <span class="measurement-value">${pokemon.weightText}</span>
                </div>
            </div>

            <div class="abilities-container">
                <span class="section-label">Habilidades</span>
                <div class="abilities-list">${pokemon.abilitiesHtml}</div>
            </div>

            <div class="weaknesses-container">
                <span class="section-label">Fraquezas</span>
                <div class="weaknesses-list">${pokemon.weaknessesHtml}</div>
            </div>

            ${radar ? `<div class="radar-wrapper">${radar}</div>` : ''}

            <div class="stats-container">${pokemon.statsHtml}</div>
        </div>
    `;
}

export function renderError(message: string): void {
    const result = document.getElementById("result")!;
    result.innerHTML = `
        <div class="error-card">
            <span class="error-icon">✕</span>
            <p class="error-message">${message}</p>
        </div>
    `;
}

export function renderHistory(history: readonly SearchHistory[]): void {
    const container = document.getElementById("history")!;

    if (history.length === 0) {
        container.innerHTML = '';
        return;
    }

    const items = history.map((entry, index) => {
        const time = entry.searchedAt.toLocaleTimeString('pt-BR', {
            hour: '2-digit', minute: '2-digit',
        });
        return `
            <div class="history-item" data-name="${entry.pokemon.name.toLowerCase()}" tabindex="0" data-index="${index}">
                <img src="${entry.pokemon.spriteUrl}" alt="${entry.pokemon.name}" />
                <div class="history-info">
                    <span class="history-name">${entry.pokemon.name}</span>
                    <span class="history-id">${entry.pokemon.displayId}</span>
                </div>
                <span class="history-time">${time}</span>
            </div>
        `;
    }).join('');

    container.innerHTML = `
        <div class="history-header">
            <span>Buscas recentes</span>
            <button id="clear-btn">Limpar</button>
        </div>
        <div class="history-list">${items}</div>
    `;
}

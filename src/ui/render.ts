import { MappedPokemon } from '../mappers/pokemonMapper.js';
import { SearchHistory } from '../types/pokemon.js';
import { isFavorite } from '../services/favoritesService.js';

const TYPE_COLOR_MAP: Record<string, string> = {
    normal:   '#9e9e7e', fire:     '#e8603c', water:    '#3b7bdd',
    electric: '#d4a800', grass:    '#28a745', ice:      '#00acc1',
    fighting: '#c62828', poison:   '#8e24aa', ground:   '#c8963a',
    flying:   '#5b9fc9', psychic:  '#d81b60', bug:      '#558b2f',
    rock:     '#757575', ghost:    '#4527a0', dragon:   '#4a1a8c',
    dark:     '#333333', steel:    '#8ea2b0', fairy:    '#e91e8c',
};

// Radar chart SVG — 6 stats em hexágono
function buildRadarSvg(statsHtml: string): string {
    const pcts = [...statsHtml.matchAll(/width:\s*(\d+)%/g)].map(m => parseInt(m[1]) / 100);
    if (pcts.length < 6) return '';

    const cx = 100, cy = 100, r = 72;
    const labels = ['HP', 'ATK', 'DEF', 'SpA', 'SpD', 'SPD'];
    const colors = ['#ef4444','#f97316','#3b82f6','#a855f7','#22c55e','#06b6d4'];
    const angles = labels.map((_, i) => (Math.PI * 2 * i) / 6 - Math.PI / 2);

    const gridPoints = (scale: number) =>
        angles.map(a => `${cx + r * scale * Math.cos(a)},${cy + r * scale * Math.sin(a)}`).join(' ');

    const dataPoints = angles.map((a, i) =>
        `${cx + r * pcts[i] * Math.cos(a)},${cy + r * pcts[i] * Math.sin(a)}`
    ).join(' ');

    const gridLines = [0.25, 0.5, 0.75, 1].map(s =>
        `<polygon points="${gridPoints(s)}" fill="none" stroke="currentColor" stroke-width="0.5" opacity="0.12"/>`
    ).join('');

    const axisLines = angles.map(a =>
        `<line x1="${cx}" y1="${cy}" x2="${cx + r * Math.cos(a)}" y2="${cy + r * Math.sin(a)}" stroke="currentColor" stroke-width="0.5" opacity="0.12"/>`
    ).join('');

    const filled = `<polygon points="${dataPoints}" fill="url(#radFill)" fill-opacity="0.25" stroke="url(#radStroke)" stroke-width="1.5"/>`;

    const dots = angles.map((a, i) => {
        const x = cx + r * pcts[i] * Math.cos(a);
        const y = cy + r * pcts[i] * Math.sin(a);
        return `<circle cx="${x}" cy="${y}" r="3.5" fill="${colors[i]}" opacity="0.9"/>`;
    }).join('');

    const labelEls = angles.map((a, i) => {
        const lx = cx + (r + 18) * Math.cos(a);
        const ly = cy + (r + 18) * Math.sin(a);
        return `<text x="${lx}" y="${ly}" text-anchor="middle" dominant-baseline="middle" font-size="9" font-weight="700" font-family="Inter,sans-serif" fill="${colors[i]}" opacity="0.85">${labels[i]}</text>`;
    }).join('');

    return `
    <svg viewBox="0 0 200 200" class="radar-chart" aria-label="Radar de stats">
      <defs>
        <linearGradient id="radFill" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#7c6af7"/>
          <stop offset="100%" stop-color="#e96df0"/>
        </linearGradient>
        <linearGradient id="radStroke" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#7c6af7"/>
          <stop offset="100%" stop-color="#e96df0"/>
        </linearGradient>
      </defs>
      ${gridLines}
      ${axisLines}
      ${filled}
      ${dots}
      ${labelEls}
    </svg>`;
}

export function renderPokemon(pokemon: MappedPokemon): void {
    const result = document.getElementById("result")!;
    const heroColor = TYPE_COLOR_MAP[pokemon.primaryType] ?? '#7c6af7';
    const fav = isFavorite(pokemon.displayId);
    const radar = buildRadarSvg(pokemon.statsHtml);

    result.innerHTML = `
        <div class="pokemon-card">

            <!-- Hero -->
            <div class="pokemon-card__hero">
                <div class="pokemon-card__hero-bg" style="background: ${heroColor}; opacity: 0.14;"></div>
                <div class="pokemon-card__hero-glow" style="--hero-color: ${heroColor}66;"></div>

                <!-- Buttons -->
                <button class="fav-btn ${fav ? 'fav-btn--active' : ''}" data-action="favorite" title="Favoritar">
                    ${fav ? '★' : '☆'}
                </button>
                <button class="shiny-btn" data-action="shiny"
                        data-normal="${pokemon.imageUrl}"
                        data-shiny="${pokemon.shinyUrl}"
                        data-normal-fallback="${pokemon.spriteUrl}"
                        data-state="normal"
                        title="Ver versão shiny">
                    ✨ Shiny
                </button>

                <!-- Image -->
                <div class="pokemon-card__img-wrap">
                    <img id="pokemon-main-img" src="${pokemon.imageUrl}" class="pokemon-img" alt="${pokemon.name}"
                         onerror="this.src='${pokemon.spriteUrl}'" />
                </div>

                <!-- Meta -->
                <div class="pokemon-card__meta">
                    <span class="pokemon-card__id">${pokemon.displayId}</span>
                    <h2 class="pokemon-card__name">${pokemon.name.toLowerCase()}</h2>
                    ${pokemon.genus ? `<span class="pokemon-card__genus">${pokemon.genus}</span>` : ''}
                    <div class="pokemon-card__type-row">${pokemon.typesHtml}</div>
                </div>
            </div>

            <!-- Body -->
            <div class="pokemon-card__body">

                ${pokemon.flavorText ? `<div class="flavor-text">${pokemon.flavorText}</div>` : ''}

                <!-- Height / Weight -->
                <div class="info-row">
                    <div class="info-item">
                        <span class="info-label">Altura</span>
                        <span class="info-value">${pokemon.heightText}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Peso</span>
                        <span class="info-value">${pokemon.weightText}</span>
                    </div>
                </div>

                <!-- Abilities -->
                <div class="section">
                    <p class="section__title">Habilidades</p>
                    <div class="badges-row">${pokemon.abilitiesHtml}</div>
                </div>

                <!-- Weaknesses -->
                <div class="section">
                    <p class="section__title">Fraquezas</p>
                    <div class="badges-row">${pokemon.weaknessesHtml}</div>
                </div>

                <!-- Radar -->
                ${radar ? `
                <div class="section" style="border-bottom: 1px solid var(--border);">
                    <p class="section__title">Radar de Stats</p>
                    <div class="radar-wrapper">${radar}</div>
                </div>` : ''}

                <!-- Stats bars -->
                <div class="section">
                    <p class="section__title">Base Stats</p>
                    <div>${pokemon.statsHtml}</div>
                </div>

            </div>
        </div>
    `;
}

export function renderError(message: string): void {
    const result = document.getElementById("result")!;
    result.innerHTML = `
        <div class="error-card">
            <div class="error-icon">✕</div>
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
                    <span class="history-name">${entry.pokemon.name.toLowerCase()}</span>
                    <span class="history-id">${entry.pokemon.displayId}</span>
                </div>
                <span class="history-time">${time}</span>
                <span class="history-arrow">›</span>
            </div>
        `;
    }).join('');

    container.innerHTML = `
        <div class="history-header">
            <span class="history-header__title">Buscas recentes</span>
            <button id="clear-btn">Limpar</button>
        </div>
        <div class="history-list">${items}</div>
    `;
}

const TYPE_COLOR_MAP = {
    normal: '#A8A878',
    fire: '#FF4500',
    water: '#4169E1',
    electric: '#FFD700',
    grass: '#32CD32',
    ice: '#00CED1',
    fighting: '#DC143C',
    poison: '#9400D3',
    ground: '#DAA520',
    flying: '#87CEEB',
    psychic: '#FF1493',
    bug: '#6B8E23',
    rock: '#808080',
    ghost: '#483D8B',
    dragon: '#4B0082',
    dark: '#2F2F2F',
    steel: '#B0C4DE',
    fairy: '#FF69B4',
};
export function renderPokemon(pokemon) {
    const result = document.getElementById("result");
    const headerColor = TYPE_COLOR_MAP[pokemon.primaryType] ?? '#FFE500';
    result.innerHTML = `
        <div class="pokemon-card">
            <div class="pokemon-card__header" data-primary-type="${pokemon.primaryType}" style="background-color: ${headerColor}">
                <span class="pokemon-card__id">${pokemon.displayId}</span>
                <h2 class="pokemon-card__name">${pokemon.name}</h2>
            </div>
            <div class="pokemon-img-wrapper">
                <img src="${pokemon.imageUrl}" class="pokemon-img" alt="${pokemon.name}"
                     onerror="this.src='${pokemon.spriteUrl}'" />
            </div>
            <div class="types-container">
                ${pokemon.typesHtml}
            </div>
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
            <div class="stats-container">
                ${pokemon.statsHtml}
            </div>
        </div>
    `;
}
export function renderError(message) {
    const result = document.getElementById("result");
    result.innerHTML = `
        <div class="error-card">
            <span class="error-icon">✕</span>
            <p class="error-message">${message}</p>
        </div>
    `;
}
export function renderHistory(history) {
    const container = document.getElementById("history");
    if (history.length === 0) {
        container.innerHTML = '';
        return;
    }
    const items = history.map((entry, index) => {
        const time = entry.searchedAt.toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit',
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

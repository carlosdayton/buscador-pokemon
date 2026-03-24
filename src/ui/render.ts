import { MappedPokemon } from '../mappers/pokemonMapper.js';
import { SearchHistory } from '../types/pokemon.js';

export function renderPokemon(pokemon: MappedPokemon): void {
    const result = document.getElementById("result")!;

    result.innerHTML = `
        <div class="pokemon-card">
        <h2>${pokemon.name}</h2>
        <img src="${pokemon.imageUrl}" class="pokemon-img">

        <div class="types-container">
        ${pokemon.typesHtml} </div>

        <div class="measurements">
        <span>📏 ${pokemon.heightText}</span>
        <span>⚖️ ${pokemon.weightText}</span>
        </div>

        <div class="stats-container">
        ${pokemon.statsHtml} </div>
    </div>
    `;
}

export function renderError(message: string): void {
    const result = document.getElementById("result")!;
    result.innerHTML = `<p class="error">❌ ${message}</p>`;
}

export function renderHistory(history: readonly SearchHistory[]): void {
    const container = document.getElementById("history")!

    if (history.length === 0){
        container.innerHTML = ''
        return
    }

    const items = history.map((entry) => {
    // Formata a hora: "14:32"
    const time = entry.searchedAt.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });

    return `
      <div class="history-item" data-name="${entry.pokemon.name.toLowerCase()}">
        <img src="${entry.pokemon.imageUrl}" alt="${entry.pokemon.name}" />
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
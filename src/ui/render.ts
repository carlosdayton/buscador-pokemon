import { MappedPokemon } from '../mappers/pokemonMapper.js';

export function renderPokemon(pokemon: MappedPokemon): void {
    const result = document.getElementById("result")!;

    result.innerHTML = `
        <div class="pokemon-card">
        <h2>${pokemon.name}</h2>
        <img src="${pokemon.imageUrl}" class="pokemon-img">

        <div class="types-container">
        ${pokemon.typesHtml} </div>

        <div class="measurements">
        <span>📏 ${pokemon.heightText}m</span>
        <span>⚖️ ${pokemon.weightText}kg</span>
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
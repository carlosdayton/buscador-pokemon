export function renderPokemon(pokemon) {
    const result = document.getElementById("result");
    result.innerHTML = `
        <div class="pokemon-card">
            <div class="card-header">
                <h2>${pokemon.name}</h2>
                <span class="pokemon-id">${pokemon.id}</span>
            </div>
            
            <img class="pokemon-img" src="${pokemon.imageUrl}" alt="${pokemon.name}" />
            
            <div class="pokemon-types">
                ${pokemon.typesHtml}
            </div>
            
            <div class="pokemon-measurements">
                <p>📏 ${pokemon.heightText}</p>
                <p>⚖️ ${pokemon.weightText}</p>
            </div>
            
            <div class="pokemon-stats">
                ${pokemon.statsHtml}
            </div>
        </div>
    `;
}
export function renderError(message) {
    const result = document.getElementById("result");
    result.innerHTML = `<p class="error">❌ ${message}</p>`;
}

import { fetchPokemon } from './services/pokemonService.js';
import { mapPokemonToUI, MappedPokemon } from './mappers/pokemonMapper.js';
import { renderPokemon, renderError, renderHistory } from './ui/render.js';
import { addToHistory, getHistory, clearHistory } from './services/historyService.js';

const btn = document.getElementById("btn") as HTMLButtonElement;
const input = document.getElementById("input") as HTMLInputElement;

async function handleSearch() {
  const name = input.value.trim();

  if (!name) {
    renderError("Digite o nome de um Pokémon!");
    return;
  }

  try {
    const result = document.getElementById("result")!;
    result.innerHTML = "<div class='loader'></div>";

    const rawPokemon = await fetchPokemon(name);
    const mappedPokemon = mapPokemonToUI(rawPokemon);

    renderPokemon(mappedPokemon);
    addToHistory(mappedPokemon);
    renderHistory(getHistory());

    // Delega o clique no "Limpar" para o documento
    // porque o botão é criado dinamicamente pelo renderHistory
    input.value = '';

  } catch (error) {
    if (error instanceof Error) {
      renderError(error.message);
    }
  }
}

// Delegação de evento para o botão "Limpar" (criado dinamicamente)
document.addEventListener("click", (event: MouseEvent) => {
  const target = event.target as HTMLElement;

  // ✅ Conceito: event delegation — um único listener no documento
  // captura cliques de elementos criados dinamicamente
  if (target.id === "clear-btn") {
    clearHistory();
    renderHistory(getHistory());
  }

  // Clique em item do histórico refaz a busca
  const historyItem = target.closest(".history-item") as HTMLElement | null;
  if (historyItem) {
    const pokemonName = historyItem.dataset.name;
    if (pokemonName) {
      input.value = pokemonName;
      handleSearch();
    }
  }
});

btn.addEventListener("click", handleSearch);
input.addEventListener("keypress", (event: KeyboardEvent) => {
  if (event.key === "Enter") handleSearch();
});

renderHistory(getHistory())
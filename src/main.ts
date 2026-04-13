import { fetchPokemon } from './services/pokemonService.js';
import { mapPokemonToUI } from './mappers/pokemonMapper.js';
import { renderPokemon, renderError, renderHistory } from './ui/render.js';
import { addToHistory, getHistory, clearHistory } from './services/historyService.js';

const btn = document.getElementById("btn") as HTMLButtonElement;
const input = document.getElementById("input") as HTMLInputElement;

async function handleSearch(query?: string) {
    const name = (query ?? input.value).trim();

    if (!name) {
        renderError("Digite o nome ou número de um Pokémon!");
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

        input.value = '';

    } catch (error) {
        if (error instanceof Error) {
            renderError(error.message);
        }
    }
}

// Event delegation — captura cliques e teclado em elementos dinâmicos
document.addEventListener("click", (event: MouseEvent) => {
    const target = event.target as HTMLElement;

    if (target.id === "clear-btn") {
        clearHistory();
        renderHistory(getHistory());
        return;
    }

    const historyItem = target.closest(".history-item") as HTMLElement | null;
    if (historyItem) {
        const pokemonName = historyItem.dataset.name;
        if (pokemonName) handleSearch(pokemonName);
    }
});

// Navegação por teclado no histórico
document.addEventListener("keydown", (event: KeyboardEvent) => {
    const target = event.target as HTMLElement;

    // Enter em item focado do histórico
    if (event.key === "Enter" && target.classList.contains("history-item")) {
        const pokemonName = target.dataset.name;
        if (pokemonName) handleSearch(pokemonName);
        return;
    }

    // Setas para navegar entre itens do histórico
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        const items = Array.from(document.querySelectorAll<HTMLElement>(".history-item"));
        if (items.length === 0) return;

        const currentIndex = items.indexOf(target);

        if (event.key === "ArrowDown") {
            const next = currentIndex === -1 ? items[0] : items[currentIndex + 1];
            if (next) { event.preventDefault(); next.focus(); }
        } else {
            const prev = items[currentIndex - 1];
            if (prev) { event.preventDefault(); prev.focus(); }
            else if (currentIndex === 0) { input.focus(); }
        }
    }
});

btn.addEventListener("click", () => handleSearch());
input.addEventListener("keypress", (event: KeyboardEvent) => {
    if (event.key === "Enter") handleSearch();
});

// Seta para baixo no input começa a navegar no histórico
input.addEventListener("keydown", (event: KeyboardEvent) => {
    if (event.key === "ArrowDown") {
        const first = document.querySelector<HTMLElement>(".history-item");
        if (first) { event.preventDefault(); first.focus(); }
    }
});

renderHistory(getHistory());

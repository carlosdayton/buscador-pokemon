// INICIA A BUSCA DOS DADOS DOS POKEMONS
import { fetchPokemon } from './services/pokemonService.js';
import { mapPokemonToUI } from './mappers/pokemonMapper.js';
import { renderPokemon, renderError } from './ui/render.js';
const btn = document.getElementById("btn");
const input = document.getElementById("input");
// 1. Isolamos a lógica principal numa função assíncrona
async function handleSearch() {
    const name = input.value.trim();
    if (!name) {
        renderError("Digite o nome de um Pokémon!");
        return;
    }
    try {
        const result = document.getElementById("result");
        result.innerHTML = "<p>A pesquisar...</p>"; // Estado de carregamento
        const rawPokemon = await fetchPokemon(name);
        const mappedPokemon = mapPokemonToUI(rawPokemon);
        renderPokemon(mappedPokemon);
    }
    catch (error) {
        if (error instanceof Error) {
            renderError(error.message);
        }
    }
}
// 2. O botão chama a função ao ser clicado
btn.addEventListener("click", handleSearch);
// 3. O input escuta o teclado e chama a função se a tecla for "Enter"
input.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
        handleSearch();
    }
});

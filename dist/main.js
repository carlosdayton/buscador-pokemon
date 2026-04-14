import { fetchPokemon, getRandomPokemonId } from './services/pokemonService.js';
import { fetchSpecies, extractFlavorText, extractGenus } from './services/speciesService.js';
import { mapPokemonToUI } from './mappers/pokemonMapper.js';
import { renderPokemon, renderError, renderHistory } from './ui/render.js';
import { addToHistory, getHistory, clearHistory } from './services/historyService.js';
import { toggleFavorite } from './services/favoritesService.js';
const btn = document.getElementById("btn");
const randomBtn = document.getElementById("random-btn");
const themeBtn = document.getElementById("theme-btn");
const input = document.getElementById("input");
// ── Dark mode ────────────────────────────────────────────────────────────────
const THEME_KEY = 'pokemon-theme';
function applyTheme(dark) {
    document.documentElement.classList.toggle('dark', dark);
    themeBtn.textContent = dark ? '☀️' : '🌙';
    localStorage.setItem(THEME_KEY, dark ? 'dark' : 'light');
}
const savedTheme = localStorage.getItem(THEME_KEY);
applyTheme(savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches));
themeBtn.addEventListener('click', () => applyTheme(!document.documentElement.classList.contains('dark')));
// ── Search ───────────────────────────────────────────────────────────────────
async function handleSearch(query) {
    const name = (query ?? input.value).trim();
    if (!name) {
        renderError("Digite o nome ou número de um Pokémon!");
        return;
    }
    document.getElementById("result").innerHTML = "<div class='loader'></div>";
    try {
        const [rawPokemon, species] = await Promise.allSettled([
            fetchPokemon(name),
            fetchSpecies(name),
        ]);
        if (rawPokemon.status === 'rejected')
            throw rawPokemon.reason;
        const flavorText = species.status === 'fulfilled' ? extractFlavorText(species.value) : '';
        const genus = species.status === 'fulfilled' ? extractGenus(species.value) : '';
        const mappedPokemon = mapPokemonToUI(rawPokemon.value, flavorText, genus);
        renderPokemon(mappedPokemon);
        addToHistory(mappedPokemon);
        renderHistory(getHistory());
        input.value = '';
    }
    catch (error) {
        renderError(error instanceof Error ? error.message : 'Erro desconhecido.');
    }
}
// ── Event delegation ─────────────────────────────────────────────────────────
document.addEventListener("click", (event) => {
    const target = event.target;
    // Limpar histórico
    if (target.id === "clear-btn") {
        clearHistory();
        renderHistory(getHistory());
        return;
    }
    // Shiny toggle
    if (target.dataset.action === 'shiny') {
        const btn = target;
        const img = document.getElementById('pokemon-main-img');
        const isShiny = btn.dataset.state === 'shiny';
        if (isShiny) {
            img.src = btn.dataset.normal;
            img.onerror = () => { img.src = btn.dataset.normalFallback; };
            btn.textContent = '✨ Shiny';
            btn.dataset.state = 'normal';
            btn.classList.remove('shiny-btn--active');
        }
        else {
            img.src = btn.dataset.shiny;
            img.onerror = () => { img.src = btn.dataset.normal; };
            btn.textContent = '✨ Normal';
            btn.dataset.state = 'shiny';
            btn.classList.add('shiny-btn--active');
        }
        return;
    }
    // Favorito
    if (target.dataset.action === 'favorite') {
        const card = target.closest('.pokemon-card');
        if (!card)
            return;
        const nameEl = card.querySelector('.pokemon-card__name');
        const idEl = card.querySelector('.pokemon-card__id');
        if (!nameEl || !idEl)
            return;
        // Busca o pokemon mapeado no histórico pelo displayId
        const displayId = idEl.textContent ?? '';
        const entry = getHistory().find(e => e.pokemon.displayId === displayId);
        if (!entry)
            return;
        const added = toggleFavorite(entry.pokemon);
        target.textContent = added ? '★' : '☆';
        target.classList.toggle('fav-btn--active', added);
        return;
    }
    // Clique em item do histórico
    const historyItem = target.closest(".history-item");
    if (historyItem) {
        const pokemonName = historyItem.dataset.name;
        if (pokemonName)
            handleSearch(pokemonName);
    }
});
// ── Keyboard navigation ───────────────────────────────────────────────────────
document.addEventListener("keydown", (event) => {
    const target = event.target;
    if (event.key === "Enter" && target.classList.contains("history-item")) {
        const pokemonName = target.dataset.name;
        if (pokemonName)
            handleSearch(pokemonName);
        return;
    }
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        const items = Array.from(document.querySelectorAll(".history-item"));
        if (!items.length)
            return;
        const idx = items.indexOf(target);
        if (event.key === "ArrowDown") {
            const next = idx === -1 ? items[0] : items[idx + 1];
            if (next) {
                event.preventDefault();
                next.focus();
            }
        }
        else {
            const prev = items[idx - 1];
            if (prev) {
                event.preventDefault();
                prev.focus();
            }
            else if (idx === 0)
                input.focus();
        }
    }
});
btn.addEventListener("click", () => handleSearch());
randomBtn.addEventListener("click", () => handleSearch(String(getRandomPokemonId())));
input.addEventListener("keypress", (e) => { if (e.key === "Enter")
    handleSearch(); });
input.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown") {
        const first = document.querySelector(".history-item");
        if (first) {
            e.preventDefault();
            first.focus();
        }
    }
});
renderHistory(getHistory());

# Requirements Document

## Introduction

Redesign completo da interface do Buscador de Pokémon, substituindo o estilo glassmorphism/dark atual pelo estilo **Neobrutalism**: bordas sólidas grossas, sombras offset sem blur, cores vibrantes, tipografia bold e elementos com aparência "flat" com profundidade via sombras. O redesign é puramente visual — nenhuma lógica de negócio, serviços ou tipos TypeScript serão alterados.

## Glossary

- **Renderer**: O módulo `src/ui/render.ts` responsável por gerar e injetar HTML no DOM
- **Mapper**: O módulo `src/mappers/pokemonMapper.ts` responsável por transformar dados da PokéAPI em `MappedPokemon`
- **MappedPokemon**: Interface TypeScript que representa os dados de um Pokémon formatados para exibição na UI
- **Type_Badge**: Elemento `<span>` com classes `type-badge type-{typeName}` que exibe o tipo de um Pokémon
- **Stat_Bar**: Elemento `<div class="stat-bar">` com largura inline proporcional ao valor do stat
- **Press_Effect**: Comportamento visual de "afundar" um botão ao ser clicado, via `transform: translate(4px, 4px)` e remoção da sombra
- **Design_Token**: Variável CSS definida em `:root` que centraliza valores visuais reutilizáveis
- **calcStatBarWidth**: Função pura que calcula a largura percentual da Stat_Bar dado um valor e nome de stat
- **PokéAPI**: API externa que fornece os dados dos Pokémon; seu contrato não é alterado por este redesign

---

## Requirements

### Requirement 1: Design Tokens e Variáveis CSS

**User Story:** As a developer, I want centralized CSS custom properties for all visual values, so that the Neobrutalism style is consistent and easy to maintain.

#### Acceptance Criteria

1. THE Renderer SHALL apply styles using CSS custom properties defined in `:root` for colors, shadows, borders, and typography.
2. THE Design_Token set SHALL include `--color-black`, `--color-white`, `--color-bg`, `--color-accent`, `--color-error`, `--shadow-sm`, `--shadow-md`, `--shadow-lg`, `--border`, `--border-thin`, `--font-family`, `--font-weight-bold`, `--font-weight-black`, and `--transition-press`.
3. WHEN any Neobrutalism component is rendered, THE Renderer SHALL use `var(--shadow-*)` for offset shadows and `var(--border)` or `var(--border-thin)` for solid borders — never `blur` or `backdrop-filter`.

---

### Requirement 2: Search Bar com Estilo Neobrutalism

**User Story:** As a user, I want a visually distinct search bar with Neobrutalism style, so that the interface feels bold and interactive.

#### Acceptance Criteria

1. THE Renderer SHALL render the search container with `border: 3px solid #000` and `box-shadow: 4px 4px 0px #000` and background color `#FFE500`.
2. THE Renderer SHALL render the search button with `border: 3px solid #000`, `box-shadow: 4px 4px 0px #000`, background preto e texto branco.
3. WHEN the search button is in `:active` state, THE Renderer SHALL apply `transform: translate(4px, 4px)` and `box-shadow: 0 0 0 #000` to simulate the Press_Effect.
4. WHEN the Press_Effect ends (mouseup or mouseleave), THE Renderer SHALL restore `transform: translate(0, 0)` and the original `box-shadow` value.

---

### Requirement 3: Pokemon Card com Estilo Neobrutalism

**User Story:** As a user, I want the Pokémon card to display with Neobrutalism style, so that the information is presented in a bold and visually consistent way.

#### Acceptance Criteria

1. WHEN `renderPokemon` is called with a valid `MappedPokemon`, THE Renderer SHALL inject exactly one `.pokemon-card` element into `#result`.
2. THE Renderer SHALL render the `.pokemon-card` with `border: 3px solid #000`, `box-shadow: 8px 8px 0px #000`, background branco e `border-radius: 0`.
3. THE Renderer SHALL render the `.pokemon-card__header` with background color correspondente ao tipo primário do Pokémon, conforme o mapeamento de cores definido no design.
4. THE Renderer SHALL render the `.pokemon-img` with `border: 3px solid #000`.
5. WHEN `renderPokemon` is called, THE Renderer SHALL trigger the `cardEnter` CSS animation on the `.pokemon-card`.
6. WHEN `renderPokemon` is called multiple times with the same `MappedPokemon`, THE Renderer SHALL produce identical HTML in `#result` (idempotência).

---

### Requirement 4: Stat Bar com Cálculo Proporcional

**User Story:** As a user, I want to see visual stat bars for each Pokémon stat, so that I can quickly compare stat values.

#### Acceptance Criteria

1. THE Mapper SHALL generate `statsHtml` containing one `.stat-row` element per stat, each including a `.stat-bar-wrapper` and a `.stat-bar` with `width` inline proporcional ao valor do stat.
2. WHEN `calcStatBarWidth` is called with any `statValue` between 1 and 255 and any valid `statName`, THE Mapper SHALL return an integer between 1 and 100 inclusive.
3. WHEN `calcStatBarWidth` is called with a `statName` present in the known max-values map (`hp`, `attack`, `defense`, `special-attack`, `special-defense`, `speed`), THE Mapper SHALL use the corresponding max value for the percentage calculation.
4. WHEN `calcStatBarWidth` is called with an unknown `statName`, THE Mapper SHALL use 255 as the fallback max value.
5. THE Renderer SHALL render each `.stat-bar` with `border: 2px solid #000` and solid fill color.

---

### Requirement 5: Type Badges com Paleta Neobrutalism

**User Story:** As a user, I want Pokémon type badges to display with vibrant Neobrutalism colors, so that types are visually distinct and bold.

#### Acceptance Criteria

1. THE Mapper SHALL generate `typesHtml` containing one `<span>` with classes `type-badge type-{typeName}` for each type returned by the PokéAPI.
2. FOR ALL 18 Pokémon types defined in the design palette (`normal`, `fire`, `water`, `electric`, `grass`, `ice`, `fighting`, `poison`, `ground`, `flying`, `psychic`, `bug`, `rock`, `ghost`, `dragon`, `dark`, `steel`, `fairy`), THE Renderer SHALL apply the corresponding background color and text color defined in the design.
3. IF a type returned by the PokéAPI is not present in the defined palette, THEN THE Renderer SHALL apply the `type-normal` fallback styles (`background: #A8A878`, `color: #000`).
4. THE Renderer SHALL render each Type_Badge with `border: 2px solid #000`, `border-radius: 0`, `font-weight: 800` e `text-transform: uppercase`.

---

### Requirement 6: History List com Estilo Neobrutalism

**User Story:** As a user, I want the search history list to display with Neobrutalism style, so that recent searches are visually consistent with the rest of the interface.

#### Acceptance Criteria

1. WHEN `renderHistory` is called with a non-empty history array, THE Renderer SHALL inject `.history-header` and `.history-list` into `#history`.
2. WHEN `renderHistory` is called with an empty history array, THE Renderer SHALL set `#history` innerHTML to empty string.
3. THE Renderer SHALL render each `.history-item` with `border: 2px solid #000` and `box-shadow: 3px 3px 0 #000`.
4. WHEN a `.history-item` is in `:hover` state, THE Renderer SHALL apply `transform: translate(-2px, -2px)` and `box-shadow: 5px 5px 0 #000`.
5. WHEN a `.history-item` is in `:active` state, THE Renderer SHALL apply `transform: translate(3px, 3px)` and `box-shadow: 0 0 0 #000`.
6. THE Renderer SHALL render the `#clear-btn` with `border: 2px solid #000` and `box-shadow: 2px 2px 0 #000`.
7. FOR EACH entry in the history array, THE Renderer SHALL generate a `.history-item` with `data-name` attribute set to the Pokémon name in lowercase.
8. AFTER any `renderHistory` call, THE Renderer SHALL ensure `#clear-btn` and `.history-item` elements respond correctly to the global event delegation listener without re-registering listeners.

---

### Requirement 7: Error State com Estilo Neobrutalism

**User Story:** As a user, I want error messages to display with Neobrutalism style, so that failures are clearly communicated in a visually consistent way.

#### Acceptance Criteria

1. WHEN `renderError` is called with an error message, THE Renderer SHALL inject an `.error-card` element into `#result`.
2. THE Renderer SHALL render the `.error-card` with `border: 3px solid #000`, `box-shadow: 6px 6px 0 #000`, background `#FF4444` e texto branco bold.
3. WHEN a subsequent successful search occurs after an error, THE Renderer SHALL replace the `.error-card` with the `.pokemon-card`.

---

### Requirement 8: Loader com Estilo Neobrutalism

**User Story:** As a user, I want a loading indicator with Neobrutalism style, so that I receive visual feedback during Pokémon data fetching.

#### Acceptance Criteria

1. WHEN a search is in progress, THE Renderer SHALL display a loading indicator with `border: 3px solid #000` and rotation animation — sem `border-radius` circular e sem blur.
2. WHEN the search completes (success or error), THE Renderer SHALL remove the loading indicator and display the result.

---

### Requirement 9: Tipografia e Fonte Neobrutalism

**User Story:** As a developer, I want the application to use Space Grotesk as the primary font, so that the typography reinforces the Neobrutalism aesthetic.

#### Acceptance Criteria

1. THE Renderer SHALL load `Space Grotesk` from Google Fonts with weights 400, 700 e 900 via `font-display: swap`.
2. THE Renderer SHALL apply `font-family: 'Space Grotesk', 'Inter', sans-serif` as the base font for the entire application.
3. THE Renderer SHALL apply `font-weight: 700` or `font-weight: 900` to headings, labels e type badges.

---

### Requirement 10: Sem Regressão de Lógica de Negócio

**User Story:** As a developer, I want the visual redesign to not affect any business logic, so that existing functionality remains intact.

#### Acceptance Criteria

1. WHEN `render.ts` and `pokemonMapper.ts` are modified for the redesign, THE Mapper SHALL preserve the existing contracts of `fetchPokemon`, `addToHistory`, `getHistory`, and `clearHistory` without modification.
2. THE Mapper SHALL not mutate the `apiData` object passed to `mapPokemonToUI`.
3. WHEN `mapPokemonToUI` is called with a valid `Pokemon` object, THE Mapper SHALL return a `MappedPokemon` with `displayId` in the format `#NNN` (3 digits, zero-padded).
4. WHEN `mapPokemonToUI` is called with a valid `Pokemon` object, THE Mapper SHALL return a `MappedPokemon` with `typesHtml` containing one `type-badge` span per type in `apiData.types`.

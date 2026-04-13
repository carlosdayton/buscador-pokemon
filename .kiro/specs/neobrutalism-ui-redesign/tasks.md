# Implementation Plan: Neobrutalism UI Redesign

## Overview

Substituição completa do estilo visual glassmorphism/dark pelo estilo Neobrutalism no Buscador de Pokémon. As mudanças se concentram em `index.html` (CSS e estrutura), `src/ui/render.ts` (HTML gerado dinamicamente) e `src/mappers/pokemonMapper.ts` (geração de `statsHtml` e `typesHtml`). Nenhuma lógica de negócio, serviços ou tipos TypeScript são alterados.

## Tasks

- [x] 1. Configurar Design Tokens e fonte Space Grotesk
  - Substituir o `@import` de `Inter` pelo de `Space Grotesk` (weights 400, 700, 900) com `font-display: swap` em `index.html`
  - Adicionar bloco `:root` com todas as CSS custom properties: `--color-black`, `--color-white`, `--color-bg`, `--color-accent`, `--color-error`, `--shadow-sm`, `--shadow-md`, `--shadow-lg`, `--border`, `--border-thin`, `--font-family`, `--font-weight-bold`, `--font-weight-black`, `--transition-press`
  - Aplicar `font-family: var(--font-family)` e `background: var(--color-bg)` no `body`
  - _Requirements: 1.1, 1.2, 1.3, 9.1, 9.2_

- [x] 2. Implementar Search Bar Neobrutalism
  - Reescrever os estilos de `.search-container`, `input` e `button#btn` em `index.html` usando os design tokens
  - Aplicar `border: var(--border)`, `box-shadow: var(--shadow-md)`, `background: var(--color-accent)` no container
  - Aplicar `border: var(--border)`, `box-shadow: var(--shadow-md)`, fundo preto e texto branco no botão
  - Adicionar regra CSS `:active` no botão com `transform: translate(4px, 4px)` e `box-shadow: 0 0 0 #000` e `transition: var(--transition-press)`
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [x] 3. Implementar Loader Neobrutalism
  - Substituir o spinner circular (`.loader`) por um elemento quadrado com `border: 3px solid #000`, sem `border-radius`, com animação de rotação
  - Atualizar o CSS do `.loader` em `index.html`
  - _Requirements: 8.1, 8.2_

- [x] 4. Atualizar `pokemonMapper.ts` com barras de stat e paleta de tipos
  - [x] 4.1 Adicionar `STAT_MAX` e função `calcStatBarWidth` em `pokemonMapper.ts`
    - Criar constante `STAT_MAX: Record<string, number>` com os 6 stats conhecidos
    - Implementar `calcStatBarWidth(statValue: number, statName: string): number` retornando `Math.max(1, Math.min(100, Math.floor((statValue / max) * 100)))`
    - _Requirements: 4.2, 4.3, 4.4_

  - [ ]* 4.2 Escrever property test para `calcStatBarWidth` (Property 1)
    - **Property 1: Barra de stat sempre dentro do intervalo válido**
    - Para qualquer `statValue` entre 1 e 255 e qualquer `statName`, `calcStatBarWidth` SHALL retornar inteiro entre 1 e 100 inclusive
    - **Validates: Requirements 4.2, 4.3, 4.4**

  - [x] 4.3 Atualizar `statsHtml` em `mapPokemonToUI` para incluir `.stat-bar-wrapper` e `.stat-bar`
    - Usar `calcStatBarWidth` para calcular `width` inline de cada `.stat-bar`
    - Gerar estrutura: `.stat-row > .stat-name + .stat-bar-wrapper > .stat-bar + .stat-value`
    - _Requirements: 4.1_

  - [ ]* 4.4 Escrever property test para `statsHtml` (Property 6)
    - **Property 6: statsHtml contém uma .stat-row por stat com barra proporcional**
    - Para qualquer `Pokemon` com N stats (N ≥ 1), `mapPokemonToUI` SHALL gerar N `.stat-row` cada um com `.stat-bar` com `width` entre 1% e 100%
    - **Validates: Requirements 4.1**

  - [x] 4.5 Atualizar `typesHtml` em `mapPokemonToUI` para usar paleta Neobrutalism
    - Manter a geração de `<span class="type-badge type-{typeName}">` (sem alteração de estrutura)
    - Garantir que o texto do badge seja uppercase (já está via CSS, confirmar)
    - _Requirements: 5.1, 5.4_

  - [ ]* 4.6 Escrever property test para `typesHtml` (Property 2)
    - **Property 2: typesHtml contém exatamente um badge por tipo**
    - Para qualquer array de tipos com 1 ou mais elementos, `mapPokemonToUI` SHALL gerar `typesHtml` com exatamente um `<span class="type-badge type-{typeName}">` por tipo
    - **Validates: Requirements 5.1, 10.4**

  - [ ]* 4.7 Escrever property test para fallback de tipo (Property 3)
    - **Property 3: Fallback de tipo desconhecido**
    - Para qualquer tipo não presente na paleta de 18 tipos, o HTML gerado SHALL conter a classe `type-normal` como fallback
    - **Validates: Requirements 5.3**

  - [ ]* 4.8 Escrever property test para imutabilidade do mapper (Property 8)
    - **Property 8: mapPokemonToUI não muta o objeto de entrada**
    - Para qualquer `Pokemon` válido, `mapPokemonToUI(apiData)` SHALL retornar novo `MappedPokemon` sem modificar `apiData`
    - **Validates: Requirements 10.2**

  - [ ]* 4.9 Escrever property test para `displayId` (Property 9)
    - **Property 9: displayId sempre no formato #NNN**
    - Para qualquer `id` inteiro positivo, `mapPokemonToUI` SHALL retornar `displayId` no formato `#NNN` com 3 dígitos e zero-padding
    - **Validates: Requirements 10.3**

- [x] 5. Checkpoint — Verificar mapper
  - Garantir que `mapPokemonToUI` compila sem erros TypeScript e que os testes do mapper passam, se implementados. Perguntar ao usuário se houver dúvidas.

- [x] 6. Atualizar `render.ts` com HTML Neobrutalism
  - [x] 6.1 Reescrever `renderPokemon` com nova estrutura HTML
    - Adicionar `.pokemon-card__header` com `data-primary-type` para aplicar cor temática via CSS ou JS
    - Adicionar `.pokemon-img-wrapper` ao redor da `<img>`
    - Adicionar `alt` na `<img>` com o nome do Pokémon
    - Manter `data-name` e estrutura de event delegation inalterados
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [ ]* 6.2 Escrever property test para idempotência de `renderPokemon` (Property 4)
    - **Property 4: Idempotência de renderPokemon**
    - Chamar `renderPokemon(p)` múltiplas vezes com o mesmo `p` SHALL sempre produzir HTML idêntico em `#result`
    - **Validates: Requirements 3.6**

  - [ ]* 6.3 Escrever property test para `.pokemon-card` único (Property 5)
    - **Property 5: renderPokemon sempre produz exatamente um .pokemon-card**
    - Após `renderPokemon`, `#result` SHALL conter exatamente um `.pokemon-card`
    - **Validates: Requirements 3.1**

  - [x] 6.4 Reescrever `renderError` com `.error-card` Neobrutalism
    - Substituir `<p class="error">` por `<div class="error-card">` com `.error-icon` e `.error-message`
    - _Requirements: 7.1, 7.2, 7.3_

  - [ ]* 6.5 Escrever property test para `renderError` (Property 10)
    - **Property 10: renderError sempre injeta .error-card em #result**
    - Para qualquer string de mensagem (incluindo vazia e com caracteres especiais), `renderError` SHALL injetar exatamente um `.error-card` em `#result`
    - **Validates: Requirements 7.1**

  - [x] 6.6 Reescrever `renderHistory` com classes Neobrutalism
    - Manter estrutura `.history-header`, `.history-list`, `.history-item` e `data-name`
    - Garantir que `#clear-btn` e `.history-item` continuam funcionando com event delegation existente em `main.ts`
    - _Requirements: 6.1, 6.2, 6.7, 6.8_

  - [ ]* 6.7 Escrever property test para `renderHistory` (Property 7)
    - **Property 7: renderHistory preserva data-name de cada entrada**
    - Para qualquer array de histórico com N entradas (N ≥ 1), `renderHistory` SHALL gerar N `.history-item` cada um com `data-name` igual ao nome em lowercase
    - **Validates: Requirements 6.1, 6.7**

- [x] 7. Implementar CSS dos componentes Neobrutalism em `index.html`
  - [x] 7.1 Estilos do Pokemon Card
    - `.pokemon-card`: `border: var(--border)`, `box-shadow: var(--shadow-lg)`, `background: var(--color-white)`, `border-radius: 0`, animação `cardEnter`
    - `.pokemon-card__header`: fundo via `background-color` inline (aplicado por JS em `renderPokemon`)
    - `.pokemon-img-wrapper`: `border: var(--border)`, fundo contrastante
    - `.pokemon-img`: sem alteração de tamanho
    - _Requirements: 3.2, 3.3, 3.4, 3.5_

  - [x] 7.2 Estilos das Stat Bars
    - `.stat-bar-wrapper`: `border: var(--border-thin)`, `background: #eee`, `width: 100%`
    - `.stat-bar`: `background: var(--color-black)`, `height: 100%`, sem `border-radius`
    - _Requirements: 4.5_

  - [x] 7.3 Estilos dos Type Badges — paleta completa de 18 tipos
    - `.type-badge`: `border: var(--border-thin)`, `border-radius: 0`, `font-weight: 800`, `text-transform: uppercase`, `padding: 4px 12px`
    - Adicionar regra CSS para cada um dos 18 tipos com `background-color` e `color` conforme paleta do design
    - Adicionar regra base `.type-badge` com `background: #A8A878; color: #000` como fallback para tipos desconhecidos
    - _Requirements: 5.2, 5.3, 5.4_

  - [x] 7.4 Estilos do History List
    - `.history-header`: texto uppercase bold, cor escura
    - `.history-header button` (`#clear-btn`): `border: var(--border-thin)`, `box-shadow: var(--shadow-sm)`, fundo branco
    - `.history-item`: `border: var(--border-thin)`, `box-shadow: 3px 3px 0 #000`, fundo branco, `transition: var(--transition-press)`
    - `.history-item:hover`: `transform: translate(-2px, -2px)`, `box-shadow: 5px 5px 0 #000`
    - `.history-item:active`: `transform: translate(3px, 3px)`, `box-shadow: 0 0 0 #000`
    - _Requirements: 6.3, 6.4, 6.5, 6.6_

  - [x] 7.5 Estilos do Error Card
    - `.error-card`: `border: var(--border)`, `box-shadow: 6px 6px 0 #000`, `background: var(--color-error)`, texto branco bold
    - _Requirements: 7.2_

- [x] 8. Aplicar cor temática do tipo primário ao header do card
  - Em `renderPokemon` em `render.ts`, extrair o tipo primário do `pokemon.typesHtml` ou receber via campo adicional
  - Aplicar `style="background-color: {cor}"` no `.pokemon-card__header` usando o mapeamento `TYPE_COLOR_MAP`
  - Definir `TYPE_COLOR_MAP` como constante em `render.ts` ou `pokemonMapper.ts`
  - _Requirements: 3.3_

- [x] 9. Checkpoint final — Garantir que todos os testes passam
  - Compilar o projeto TypeScript (`tsc`) e verificar que não há erros
  - Garantir que todos os testes implementados passam
  - Verificar que `main.ts` não precisou de alterações (event delegation intacto)
  - Perguntar ao usuário se houver dúvidas.

## Notes

- Tasks marcadas com `*` são opcionais e podem ser puladas para um MVP mais rápido
- Cada task referencia requisitos específicos para rastreabilidade
- Os checkpoints garantem validação incremental
- Property tests validam propriedades universais de corretude
- Unit tests validam exemplos específicos e casos de borda
- `main.ts` NÃO deve ser modificado — toda a lógica de event delegation permanece intacta

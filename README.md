<img width="926" height="817" alt="Captura de tela 2026-03-23 152710" src="https://github.com/user-attachments/assets/c4b84575-d380-434a-843e-d458fe665ece" />


# 🔍 Buscador de Pokémon (TypeScript & Clean Architecture)

Um aplicativo web rápido e responsivo para buscar dados de Pokémon consumindo a [PokéAPI](https://pokeapi.co/). 

Mais do que um simples buscador, este projeto foi desenvolvido com foco em **Boas Práticas de Engenharia de Software**, aplicando conceitos de separação de responsabilidades (SoC) e tipagem estática forte.

## 🚀 Funcionalidades

- **Busca Dinâmica:** Pesquise qualquer Pokémon pelo nome usando o botão ou a tecla `Enter`.
- **Estilização Guiada por Dados (Data-Driven):** As cores das "badges" de tipo mudam dinamicamente de acordo com o tipo do Pokémon (ex: azul para Água, laranja para Fogo).
- **Tratamento de Erros UI/UX:** Feedback visual claro caso o usuário digite um nome inválido ou ocorra falha na rede.
- **Tipagem Forte:** Zero uso de `any`. Interfaces TypeScript garantem a integridade dos dados desde a requisição até a renderização.

## 🏗️ Arquitetura e Decisões Técnicas

O projeto foge do padrão "God File" (um único arquivo fazendo tudo) e adota uma estrutura em camadas, facilitando a manutenção e a escalabilidade:

\`\`\`text
src/
├── types/         # Interfaces e contratos de dados
├── services/      # Camada de infraestrutura e comunicação com a API externa (fetch)
├── mappers/       # Camada Adapter: Transforma dados da API para a UI
├── ui/            # Camada de apresentação "burra": Apenas manipula o DOM
└── main.ts        # Ponto de entrada e orquestrador de eventos
\`\`\`

**Padrão Mapper (Adapter):** Implementado para isolar a lógica de negócios da interface visual. A API retorna dados matemáticos crus (ex: peso em decigramas), e o `pokemonMapper.ts` os converte em strings amigáveis antes de chegarem à tela, mantendo o HTML limpo e livre de cálculos.

## 🛠️ Tecnologias Utilizadas

- **HTML5 & CSS3** (Flexbox, CSS Variables, Animations)
- **TypeScript** (ESNext, Módulos Nativos)
- **Fetch API** (Requisições Assíncronas)

## 💻 Como Rodar o Projeto Localmente

1. Clone o repositório:
   \`\`\`bash
   git clone https://github.com/carlosdayton/buscador-pokemon.git
   \`\`\`
2. Abra a pasta do projeto no seu editor de código.
3. Certifique-se de ter o TypeScript instalado globalmente (`npm install -g typescript`).
4. Compile o código TypeScript para JavaScript:
   \`\`\`bash
   tsc
   \`\`\`
5. Abra o arquivo `index.html` no seu navegador ou utilize a extensão **Live Server** no VS Code.

---
*Desenvolvido com dedicação e foco em código limpo por [Carlos Dayton]([Carlos Dayton Linkedin](https://www.linkedin.com/in/carlos-dayton-r/)).*

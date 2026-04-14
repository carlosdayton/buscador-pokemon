# Requirements Document

## Introduction

Este documento descreve os requisitos para o BFF (Backend For Frontend) do projeto de busca de Pokémon. O BFF é um servidor intermediário em Python + FastAPI que atua como proxy entre o front-end (TypeScript, hospedado no GitHub Pages) e a PokéAPI pública. O servidor armazena as respostas em Redis para evitar chamadas repetidas à PokéAPI, reduzindo latência e dependência de serviços externos. O deploy será realizado no Railway dentro de uma estrutura de monorepo, com o back-end na pasta `/backend`.

## Glossary

- **BFF**: Backend For Frontend — servidor intermediário que agrega e adapta dados de APIs externas para o consumo do front-end.
- **BFF_Server**: O servidor FastAPI que compõe o BFF.
- **Cache**: Camada de armazenamento em memória (Redis) que guarda respostas da PokéAPI para evitar chamadas repetidas.
- **Redis**: Banco de dados em memória utilizado como cache pelo BFF_Server.
- **PokéAPI**: API pública externa em `https://pokeapi.co/api/v2` que fornece dados de Pokémon.
- **Front-end**: Aplicação TypeScript hospedada no GitHub Pages que consome o BFF_Server.
- **Pokemon_Endpoint**: Endpoint da PokéAPI em `/pokemon/{name}` que retorna dados gerais de um Pokémon.
- **Species_Endpoint**: Endpoint da PokéAPI em `/pokemon-species/{name}` que retorna dados de espécie de um Pokémon.
- **Cache_TTL**: Tempo de vida de uma entrada no Cache, após o qual ela é considerada expirada.
- **Railway**: Plataforma de deploy em nuvem onde o BFF_Server será hospedado.

---

## Requirements

### Requirement 1: Proxy para dados gerais do Pokémon

**User Story:** Como front-end, quero buscar dados gerais de um Pokémon via BFF, para que eu não precise chamar a PokéAPI diretamente.

#### Acceptance Criteria

1. WHEN o Front-end envia `GET /pokemon/{name}`, THE BFF_Server SHALL retornar os dados do Pokémon no mesmo formato retornado pelo Pokemon_Endpoint da PokéAPI.
2. WHEN o Front-end envia `GET /pokemon/{name}` e o Cache contém uma entrada válida para `{name}`, THE BFF_Server SHALL retornar os dados do Cache sem realizar chamada ao Pokemon_Endpoint.
3. WHEN o Front-end envia `GET /pokemon/{name}` e o Cache não contém uma entrada válida para `{name}`, THE BFF_Server SHALL buscar os dados no Pokemon_Endpoint, armazenar a resposta no Cache e retornar os dados ao Front-end.
4. WHEN o Pokemon_Endpoint retorna status 404, THE BFF_Server SHALL retornar status HTTP 404 com corpo `{"detail": "Pokémon não encontrado."}`.
5. IF o Pokemon_Endpoint retornar um status diferente de 200 ou 404, THEN THE BFF_Server SHALL retornar status HTTP 502 com corpo `{"detail": "Erro ao consultar a PokéAPI."}`.
6. IF o BFF_Server não conseguir estabelecer conexão com o Pokemon_Endpoint, THEN THE BFF_Server SHALL retornar status HTTP 503 com corpo `{"detail": "PokéAPI indisponível. Tente novamente mais tarde."}`.

---

### Requirement 2: Proxy para dados de espécie do Pokémon

**User Story:** Como front-end, quero buscar dados de espécie de um Pokémon via BFF, para que eu não precise chamar a PokéAPI diretamente.

#### Acceptance Criteria

1. WHEN o Front-end envia `GET /pokemon-species/{name}`, THE BFF_Server SHALL retornar os dados da espécie no mesmo formato retornado pelo Species_Endpoint da PokéAPI.
2. WHEN o Front-end envia `GET /pokemon-species/{name}` e o Cache contém uma entrada válida para `{name}`, THE BFF_Server SHALL retornar os dados do Cache sem realizar chamada ao Species_Endpoint.
3. WHEN o Front-end envia `GET /pokemon-species/{name}` e o Cache não contém uma entrada válida para `{name}`, THE BFF_Server SHALL buscar os dados no Species_Endpoint, armazenar a resposta no Cache e retornar os dados ao Front-end.
4. WHEN o Species_Endpoint retorna status 404, THE BFF_Server SHALL retornar status HTTP 404 com corpo `{"detail": "Espécie não encontrada."}`.
5. IF o Species_Endpoint retornar um status diferente de 200 ou 404, THEN THE BFF_Server SHALL retornar status HTTP 502 com corpo `{"detail": "Erro ao consultar a PokéAPI."}`.
6. IF o BFF_Server não conseguir estabelecer conexão com o Species_Endpoint, THEN THE BFF_Server SHALL retornar status HTTP 503 com corpo `{"detail": "PokéAPI indisponível. Tente novamente mais tarde."}`.

---

### Requirement 3: Cache com Redis e TTL configurável

**User Story:** Como operador do sistema, quero que o Cache tenha um tempo de expiração configurável, para que dados desatualizados sejam renovados periodicamente.

#### Acceptance Criteria

1. THE BFF_Server SHALL armazenar cada resposta da PokéAPI no Redis com um Cache_TTL definido por variável de ambiente `CACHE_TTL_SECONDS`.
2. WHERE `CACHE_TTL_SECONDS` não estiver definida, THE BFF_Server SHALL utilizar o valor padrão de 86400 segundos (24 horas).
3. WHEN o Cache_TTL de uma entrada expirar, THE BFF_Server SHALL buscar os dados novamente na PokéAPI na próxima requisição para aquela entrada.
4. IF o BFF_Server não conseguir conectar ao Redis na inicialização, THEN THE BFF_Server SHALL registrar o erro no log e encerrar com código de saída diferente de zero.
5. IF o Redis ficar indisponível durante a operação, THEN THE BFF_Server SHALL retornar status HTTP 503 com corpo `{"detail": "Cache indisponível. Tente novamente mais tarde."}`.

---

### Requirement 4: Normalização do identificador de busca

**User Story:** Como front-end, quero que o BFF aceite tanto o nome quanto o número do Pokémon como identificador, para que eu possa buscar por qualquer um dos dois.

#### Acceptance Criteria

1. WHEN o Front-end envia `GET /pokemon/{name}` com `{name}` em letras maiúsculas ou mistas, THE BFF_Server SHALL normalizar o identificador para letras minúsculas antes de consultar o Cache e a PokéAPI.
2. WHEN o Front-end envia `GET /pokemon/{id}` onde `{id}` é um número inteiro positivo, THE BFF_Server SHALL aceitar o identificador numérico e utilizá-lo diretamente na consulta ao Pokemon_Endpoint.
3. THE BFF_Server SHALL utilizar o identificador normalizado como chave de Cache, de forma que `Pikachu`, `pikachu` e `PIKACHU` resultem na mesma entrada de Cache.

---

### Requirement 5: CORS para o front-end no GitHub Pages

**User Story:** Como front-end hospedado no GitHub Pages, quero que o BFF permita requisições cross-origin, para que o navegador não bloqueie as chamadas.

#### Acceptance Criteria

1. THE BFF_Server SHALL incluir o header `Access-Control-Allow-Origin` em todas as respostas HTTP.
2. WHERE a variável de ambiente `ALLOWED_ORIGINS` estiver definida, THE BFF_Server SHALL restringir o header `Access-Control-Allow-Origin` aos valores listados em `ALLOWED_ORIGINS`.
3. WHERE `ALLOWED_ORIGINS` não estiver definida, THE BFF_Server SHALL utilizar o valor `*` no header `Access-Control-Allow-Origin`.
4. THE BFF_Server SHALL responder a requisições HTTP `OPTIONS` (preflight) com status 200 e os headers CORS apropriados.

---

### Requirement 6: Health check

**User Story:** Como operador do Railway, quero um endpoint de health check, para que a plataforma possa verificar se o serviço está operacional.

#### Acceptance Criteria

1. WHEN o Railway envia `GET /health`, THE BFF_Server SHALL retornar status HTTP 200 com corpo `{"status": "ok"}`.
2. WHILE o Redis estiver acessível, THE BFF_Server SHALL incluir `{"redis": "ok"}` no corpo da resposta de `GET /health`.
3. IF o Redis estiver inacessível no momento da requisição a `GET /health`, THEN THE BFF_Server SHALL retornar status HTTP 200 com corpo `{"status": "ok", "redis": "unavailable"}`.

---

### Requirement 7: Configuração via variáveis de ambiente

**User Story:** Como operador do Railway, quero configurar o BFF exclusivamente por variáveis de ambiente, para que não haja credenciais ou configurações sensíveis no código-fonte.

#### Acceptance Criteria

1. THE BFF_Server SHALL ler a URL de conexão do Redis a partir da variável de ambiente `REDIS_URL`.
2. THE BFF_Server SHALL ler a URL base da PokéAPI a partir da variável de ambiente `POKEAPI_BASE_URL`, com valor padrão `https://pokeapi.co/api/v2`.
3. THE BFF_Server SHALL ler a porta de escuta a partir da variável de ambiente `PORT`, com valor padrão `8000`.
4. IF `REDIS_URL` não estiver definida, THEN THE BFF_Server SHALL registrar um erro descritivo no log e encerrar com código de saída diferente de zero.

---

### Requirement 8: Atualização do front-end para consumir o BFF

**User Story:** Como usuário do front-end, quero que a aplicação continue funcionando normalmente após a introdução do BFF, para que a experiência de busca não seja alterada.

#### Acceptance Criteria

1. THE Front-end SHALL enviar todas as requisições de dados de Pokémon ao BFF_Server em vez de diretamente à PokéAPI.
2. THE Front-end SHALL ler a URL base do BFF_Server a partir de uma variável de build `VITE_BFF_BASE_URL` (ou equivalente no bundler atual), com valor padrão apontando para o ambiente local de desenvolvimento.
3. WHEN o BFF_Server retornar status 404, THE Front-end SHALL exibir a mensagem de erro já existente para Pokémon não encontrado.
4. WHEN o BFF_Server retornar status 503, THE Front-end SHALL exibir a mensagem "Serviço temporariamente indisponível. Tente novamente mais tarde."
5. THE Front-end SHALL manter o cache em memória existente (`Map`) para evitar chamadas repetidas ao BFF_Server dentro da mesma sessão do navegador.

---

### Requirement 9: Estrutura do monorepo e deploy no Railway

**User Story:** Como desenvolvedor, quero que o back-end esteja organizado em `/backend` dentro do monorepo existente, para que o projeto seja mantido em um único repositório.

#### Acceptance Criteria

1. THE BFF_Server SHALL residir na pasta `/backend` do repositório, com seu próprio `requirements.txt` e `Dockerfile`.
2. THE BFF_Server SHALL ser deployável no Railway a partir da pasta `/backend` sem alterações no restante do monorepo.
3. THE BFF_Server SHALL expor um `Dockerfile` que instala as dependências Python, copia o código e inicia o servidor com `uvicorn` na porta definida pela variável `PORT`.
4. WHERE o ambiente for de desenvolvimento local, THE BFF_Server SHALL ser executável com `docker compose up` a partir da raiz do repositório, subindo o BFF_Server e uma instância local do Redis.

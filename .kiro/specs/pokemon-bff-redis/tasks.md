# Plano de Implementação: pokemon-bff-redis

## Visão Geral

Implementação incremental do BFF FastAPI com cache Redis, partindo da estrutura do projeto até a integração com o front-end TypeScript existente.

## Tasks

- [x] 1. Estrutura do projeto e configuração
  - Criar a pasta `backend/` com a estrutura de diretórios definida no design
  - Criar `backend/app/__init__.py`, `backend/app/config.py` com `Settings` via `pydantic-settings`
  - Criar `backend/requirements.txt` com `fastapi`, `uvicorn`, `httpx`, `redis`, `pydantic-settings`, `pytest`, `pytest-asyncio`, `hypothesis`, `fakeredis`, `respx`
  - Criar `backend/Dockerfile` que instala dependências e inicia `uvicorn` na porta `PORT`
  - Criar `docker-compose.yml` na raiz do monorepo com serviços `bff` e `redis`
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 9.1, 9.2, 9.3, 9.4_

- [x] 2. Exceções customizadas e inicialização do app
  - [x] 2.1 Criar `backend/app/exceptions.py` com a hierarquia de exceções (`PokeAPIError`, `PokeAPINotFoundError`, `PokeAPIUpstreamError`, `PokeAPIUnavailableError`, `CacheUnavailableError`)
    - _Requirements: 1.4, 1.5, 1.6, 2.4, 2.5, 2.6, 3.5_
  - [x] 2.2 Criar `backend/app/main.py` com criação do app FastAPI, registro dos exception handlers globais e validação de `REDIS_URL` na inicialização
    - Encerrar com `sys.exit(1)` se `REDIS_URL` não estiver definida ou se a conexão inicial ao Redis falhar
    - _Requirements: 3.4, 7.4_
  - [x] 2.3 Criar `backend/app/dependencies.py` com `get_redis` e `get_settings` como dependências injetáveis
    - _Requirements: 3.4, 7.1_

- [x] 3. Serviço de cache
  - [x] 3.1 Criar `backend/app/services/cache.py` com `get` e `set` assíncronos e a função `normalize`
    - `get` retorna `dict | None`; `set` serializa o dict como JSON e aplica TTL
    - `normalize`: numérico → retorna como string; texto → `strip().lower()`
    - Levantar `CacheUnavailableError` em caso de falha de conexão ao Redis
    - _Requirements: 3.1, 3.2, 3.3, 3.5, 4.1, 4.2, 4.3_
  - [ ]* 3.2 Escrever property test para `normalize` (Property 3)
    - **Property 3: Normalização de identificador é idempotente**
    - **Validates: Requirements 4.1, 4.3**
    - Usar `@given(st.text(min_size=1))` e verificar `normalize(normalize(x)) == normalize(x)`
  - [ ]* 3.3 Escrever property test para chave de cache (Property 4)
    - **Property 4: Identificadores equivalentes compartilham a mesma chave de cache**
    - **Validates: Requirements 4.3**
    - Gerar strings e variações de capitalização; verificar que a chave resultante é idêntica
  - [ ]* 3.4 Escrever testes unitários para `cache.py`
    - Cobrir: get com hit, get com miss, set com TTL, serialização/deserialização, `CacheUnavailableError`
    - _Requirements: 3.1, 3.3, 3.5_

- [x] 4. Serviço PokéAPI
  - [x] 4.1 Criar `backend/app/services/pokeapi.py` com `fetch_pokemon` e `fetch_species` assíncronos usando `httpx`
    - Mapear 404 → `PokeAPINotFoundError`, outros erros HTTP → `PokeAPIUpstreamError`, falha de conexão → `PokeAPIUnavailableError`
    - _Requirements: 1.4, 1.5, 1.6, 2.4, 2.5, 2.6_
  - [ ]* 4.2 Escrever testes unitários para `pokeapi.py`
    - Mockar com `respx`; cobrir: 200, 404, 500, timeout
    - _Requirements: 1.4, 1.5, 1.6, 2.4, 2.5, 2.6_

- [x] 5. Routers e CORS
  - [x] 5.1 Criar `backend/app/routers/pokemon.py` com `GET /pokemon/{name}`
    - Normalizar identificador, verificar cache, buscar na PokéAPI se miss, popular cache
    - _Requirements: 1.1, 1.2, 1.3, 4.1, 4.2, 4.3_
  - [x] 5.2 Criar `backend/app/routers/species.py` com `GET /pokemon-species/{name}`
    - Mesma lógica de cache e normalização para espécies
    - _Requirements: 2.1, 2.2, 2.3, 4.1, 4.2, 4.3_
  - [x] 5.3 Criar `backend/app/routers/health.py` com `GET /health`
    - Retornar `{"status": "ok", "redis": "ok" | "unavailable"}` conforme acessibilidade do Redis
    - _Requirements: 6.1, 6.2, 6.3_
  - [x] 5.4 Registrar os routers em `main.py` e configurar `CORSMiddleware` com `ALLOWED_ORIGINS`
    - _Requirements: 5.1, 5.2, 5.3, 5.4_
  - [ ]* 5.5 Escrever testes unitários para `pokemon.py` (router)
    - Usar `fakeredis` e `respx`; cobrir: cache hit, cache miss, 404, 502, 503 PokéAPI, 503 Redis
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_
  - [ ]* 5.6 Escrever property test para cache hit (Property 1)
    - **Property 1: Cache hit evita chamada à PokéAPI**
    - **Validates: Requirements 1.2, 2.2**
    - Usar `st.text()` para nomes; mock Redis retorna hit; verificar que `httpx` não foi chamado
  - [ ]* 5.7 Escrever property test para cache miss popula Redis (Property 2)
    - **Property 2: Cache miss popula o Redis**
    - **Validates: Requirements 1.3, 2.3, 3.1**
    - Usar `st.text()` para nomes; mock Redis retorna miss; verificar entrada no Redis com TTL > 0
  - [ ]* 5.8 Escrever property test para respostas de erro (Property 5)
    - **Property 5: Respostas de erro seguem o contrato definido**
    - **Validates: Requirements 1.4, 1.5, 1.6, 2.4, 2.5, 2.6, 3.5**
    - Usar `st.sampled_from([404, 500, 503])` para status; verificar status HTTP e corpo JSON exatos
  - [ ]* 5.9 Escrever testes unitários para `species.py` e `health.py`
    - Cobrir mesmos cenários de `pokemon.py` para espécies; cobrir Redis ok e unavailable para health
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 6.1, 6.2, 6.3_

- [x] 6. Checkpoint — Garantir que todos os testes passam
  - Garantir que todos os testes passam, perguntar ao usuário se houver dúvidas.

- [x] 7. Atualização do front-end
  - [x] 7.1 Criar ou atualizar o arquivo de configuração de ambiente do Vite (`.env`, `.env.example`) com `VITE_BFF_BASE_URL`
    - _Requirements: 8.2_
  - [x] 7.2 Atualizar `src/services/pokemonService.ts` e `src/services/speciesService.ts` para ler `VITE_BFF_BASE_URL` e apontar as chamadas HTTP ao BFF em vez da PokéAPI
    - _Requirements: 8.1, 8.2_
  - [x] 7.3 Atualizar `src/ui/render.ts` (ou o módulo de tratamento de erros existente) para exibir "Serviço temporariamente indisponível. Tente novamente mais tarde." quando o BFF retornar 503
    - _Requirements: 8.3, 8.4_
  - [x] 7.4 Verificar que o cache em memória (`Map`) existente no front-end permanece funcional após a troca de URL base
    - _Requirements: 8.5_

- [x] 8. Checkpoint final — Garantir que todos os testes passam
  - Garantir que todos os testes passam, perguntar ao usuário se houver dúvidas.

## Notas

- Tasks marcadas com `*` são opcionais e podem ser puladas para um MVP mais rápido
- Cada task referencia os requisitos correspondentes para rastreabilidade
- Testes de propriedade usam `hypothesis` com mínimo de 100 iterações por propriedade
- Redis é mockado com `fakeredis` nos testes unitários; `respx` mocka as chamadas HTTP à PokéAPI
- Testes de integração (com Redis real via `docker compose`) ficam fora do escopo desta lista e devem ser executados manualmente

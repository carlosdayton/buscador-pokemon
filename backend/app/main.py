import sys

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import get_settings
from app.exceptions import (
    CacheUnavailableError,
    PokeAPINotFoundError,
    PokeAPIUnavailableError,
    PokeAPIUpstreamError,
)
from app.routers import health, pokemon, species

# ── Validação de configuração na inicialização ────────────────────────────────
settings = get_settings()

if not settings.redis_url:
    print("[ERROR] REDIS_URL é obrigatória.", file=sys.stderr)
    sys.exit(1)

# ── App ───────────────────────────────────────────────────────────────────────
app = FastAPI(title="Pokémon BFF", version="1.0.0")

# ── CORS ──────────────────────────────────────────────────────────────────────
origins = [o.strip() for o in settings.allowed_origins.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Exception handlers ────────────────────────────────────────────────────────
@app.exception_handler(PokeAPINotFoundError)
async def not_found_handler(request: Request, exc: PokeAPINotFoundError) -> JSONResponse:
    return JSONResponse(status_code=404, content={"detail": str(exc) or "Não encontrado."})


@app.exception_handler(PokeAPIUpstreamError)
async def upstream_handler(request: Request, exc: PokeAPIUpstreamError) -> JSONResponse:
    return JSONResponse(status_code=502, content={"detail": "Erro ao consultar a PokéAPI."})


@app.exception_handler(PokeAPIUnavailableError)
async def unavailable_handler(request: Request, exc: PokeAPIUnavailableError) -> JSONResponse:
    return JSONResponse(
        status_code=503,
        content={"detail": "PokéAPI indisponível. Tente novamente mais tarde."},
    )


@app.exception_handler(CacheUnavailableError)
async def cache_handler(request: Request, exc: CacheUnavailableError) -> JSONResponse:
    return JSONResponse(
        status_code=503,
        content={"detail": "Cache indisponível. Tente novamente mais tarde."},
    )


# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(pokemon.router)
app.include_router(species.router)
app.include_router(health.router)

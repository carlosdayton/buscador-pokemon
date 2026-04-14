from typing import Any

import httpx

from app.exceptions import (
    PokeAPINotFoundError,
    PokeAPIUnavailableError,
    PokeAPIUpstreamError,
)

TIMEOUT = 10.0


async def _fetch(url: str, not_found_msg: str) -> dict[str, Any]:
    try:
        async with httpx.AsyncClient(timeout=TIMEOUT) as client:
            response = await client.get(url)
    except (httpx.ConnectError, httpx.TimeoutException, httpx.NetworkError) as exc:
        raise PokeAPIUnavailableError("PokéAPI indisponível.") from exc

    if response.status_code == 404:
        raise PokeAPINotFoundError(not_found_msg)

    if response.status_code != 200:
        raise PokeAPIUpstreamError(
            f"PokéAPI retornou status inesperado: {response.status_code}"
        )

    return response.json()  # type: ignore[return-value]


async def fetch_pokemon(name: str, base_url: str) -> dict[str, Any]:
    url = f"{base_url.rstrip('/')}/pokemon/{name}"
    return await _fetch(url, "Pokémon não encontrado.")


async def fetch_species(name: str, base_url: str) -> dict[str, Any]:
    url = f"{base_url.rstrip('/')}/pokemon-species/{name}"
    return await _fetch(url, "Espécie não encontrada.")

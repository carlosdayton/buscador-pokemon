import json
from typing import Any

import redis.asyncio as aioredis

from app.exceptions import CacheUnavailableError


def normalize(identifier: str) -> str:
    """Normaliza o identificador: numérico → string; texto → strip().lower()."""
    stripped = identifier.strip()
    if stripped.isdigit():
        return stripped
    return stripped.lower()


async def get(client: aioredis.Redis, key: str) -> dict[str, Any] | None:
    """Retorna o valor do cache ou None se não existir."""
    try:
        raw = await client.get(key)
    except Exception as exc:
        raise CacheUnavailableError("Redis inacessível.") from exc

    if raw is None:
        return None
    return json.loads(raw)  # type: ignore[return-value]


async def set(
    client: aioredis.Redis,
    key: str,
    value: dict[str, Any],
    ttl: int,
) -> None:
    """Armazena o valor no cache com TTL em segundos."""
    try:
        await client.set(key, json.dumps(value), ex=ttl)
    except Exception as exc:
        raise CacheUnavailableError("Redis inacessível.") from exc


async def ping(client: aioredis.Redis) -> bool:
    """Retorna True se o Redis estiver acessível."""
    try:
        return bool(await client.ping())
    except Exception:
        return False

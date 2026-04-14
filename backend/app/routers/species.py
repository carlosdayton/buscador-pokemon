from typing import Any

import redis.asyncio as aioredis
from fastapi import APIRouter, Depends

from app.config import Settings
from app.dependencies import get_redis, get_settings_dep
from app.services import cache, pokeapi

router = APIRouter()


@router.get("/pokemon-species/{name}")
async def get_species(
    name: str,
    redis_client: aioredis.Redis = Depends(get_redis),
    settings: Settings = Depends(get_settings_dep),
) -> Any:
    key = f"species:{cache.normalize(name)}"

    cached = await cache.get(redis_client, key)
    if cached is not None:
        return cached

    data = await pokeapi.fetch_species(cache.normalize(name), settings.pokeapi_base_url)
    await cache.set(redis_client, key, data, settings.cache_ttl_seconds)
    return data

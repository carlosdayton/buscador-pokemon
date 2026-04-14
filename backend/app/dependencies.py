from functools import lru_cache
from typing import AsyncGenerator

import redis.asyncio as aioredis
from fastapi import Depends

from app.config import Settings, get_settings


@lru_cache
def _get_settings() -> Settings:
    return get_settings()


def get_settings_dep() -> Settings:
    return _get_settings()


async def get_redis(
    settings: Settings = Depends(get_settings_dep),
) -> AsyncGenerator[aioredis.Redis, None]:
    client: aioredis.Redis = aioredis.from_url(
        settings.redis_url, encoding="utf-8", decode_responses=True
    )
    try:
        yield client
    finally:
        await client.aclose()

import redis.asyncio as aioredis
from fastapi import APIRouter, Depends

from app.dependencies import get_redis
from app.services.cache import ping

router = APIRouter()


@router.get("/health")
async def health(redis_client: aioredis.Redis = Depends(get_redis)) -> dict:
    redis_status = "ok" if await ping(redis_client) else "unavailable"
    return {"status": "ok", "redis": redis_status}

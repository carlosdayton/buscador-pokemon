import sys
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    redis_url: str
    pokeapi_base_url: str = "https://pokeapi.co/api/v2"
    cache_ttl_seconds: int = 86400
    allowed_origins: str = "*"
    port: int = 8000

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")


def get_settings() -> Settings:
    try:
        return Settings()  # type: ignore[call-arg]
    except Exception as e:
        print(f"[ERROR] Configuração inválida: {e}", file=sys.stderr)
        sys.exit(1)

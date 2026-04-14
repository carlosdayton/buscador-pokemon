class PokeAPIError(Exception):
    """Base para erros relacionados à PokéAPI."""


class PokeAPINotFoundError(PokeAPIError):
    """PokéAPI retornou 404."""


class PokeAPIUpstreamError(PokeAPIError):
    """PokéAPI retornou um status inesperado (4xx/5xx != 404)."""


class PokeAPIUnavailableError(PokeAPIError):
    """Não foi possível conectar à PokéAPI (timeout / connection error)."""


class CacheUnavailableError(Exception):
    """Redis inacessível."""

from cachetools import TTLCache

weather_cache: TTLCache = TTLCache(maxsize=100, ttl=900)
cab_price_cache: TTLCache = TTLCache(maxsize=500, ttl=300)
crowd_cache: TTLCache = TTLCache(maxsize=200, ttl=600)

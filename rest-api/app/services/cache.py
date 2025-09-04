# Simple in-process LRU cache using Python's OrderedDict.
# NOTE: TTL is NOT enforced here. The 'ttl' arg is accepted for API compatibility
# with existing calls but is ignored. Eviction is purely LRU-based.

from collections import OrderedDict
from typing import Any, Optional

class LRUCache:
    def __init__(self, max_items: int = 2000):
        if max_items <= 0:
            raise ValueError("max_items must be positive")
        self._store: "OrderedDict[str, Any]" = OrderedDict()
        self._max = max_items

    def get(self, key: str) -> Optional[Any]:
        try:
            value = self._store.pop(key)    # remove to reinsert at end (most recent)
            self._store[key] = value
            return value
        except KeyError:
            return None

    # 'ttl' kept for compatibility; ignored in LRU mode
    def set(self, key: str, data: Any, ttl: int = 0) -> None:
        # If key exists, refresh position
        if key in self._store:
            self._store.pop(key)
        # Evict least recently used if at capacity
        if len(self._store) >= self._max:
            self._store.popitem(last=False)
        self._store[key] = data

    def __len__(self) -> int:
        return len(self._store)

# Export a singleton cache instance
cache = LRUCache(max_items=2000)

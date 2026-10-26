import asyncio
import logging
from typing import Dict, Optional
from contextlib import asynccontextmanager

logger = logging.getLogger("concurrency")

class JobCoordinator:
    """
    Prevents race conditions, concurrent builds on the same project directory,
    and deadlocks using timeouts and fine-grained per-project lock keys.
    """
    def __init__(self, default_timeout: float = 30.0):
        self._locks: Dict[str, asyncio.Lock] = {}
        self._global_lock = asyncio.Lock()
        self.default_timeout = default_timeout

    async def _get_lock(self, key: str) -> asyncio.Lock:
        async with self._global_lock:
            if key not in self._locks:
                self._locks[key] = asyncio.Lock()
            return self._locks[key]

    @asynccontextmanager
    async def acquire(self, key: str, timeout: Optional[float] = None):
        t = timeout or self.default_timeout
        lock = await self._get_lock(key)
        try:
            acquired = await asyncio.wait_for(lock.acquire(), timeout=t)
        except asyncio.TimeoutError:
            logger.error(f"Deadlock prevention: Timeout ({t}s) acquiring lock for '{key}'")
            raise TimeoutError(f"Resource '{key}' is locked by another operation. Please retry.")

        try:
            yield
        finally:
            if lock.locked():
                lock.release()

job_coordinator = JobCoordinator()

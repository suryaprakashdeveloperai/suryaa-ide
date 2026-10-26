import os
import logging
from typing import Dict, Any, List, Optional
from .provider_base import BaseAIProvider, AIModelInfo, AIRequest, AIResponse, AIRepairRequest, AIProviderError
from .gemini_provider import GeminiProvider
from .claude_provider import ClaudeProvider
from .arena_provider import ArenaAIProvider

logger = logging.getLogger("provider_manager")

class AIProviderManager:
    def __init__(self):
        self.gemini = GeminiProvider()
        self.claude = ClaudeProvider()
        self.arena = ArenaAIProvider()

    def get_provider(self, name: str) -> BaseAIProvider:
        name_lower = name.lower()
        if "arena" in name_lower or "coding-router" in name_lower:
            return self.arena
        elif "claude" in name_lower or "anthropic" in name_lower:
            return self.claude
        return self.gemini

    async def get_all_models(self) -> List[Dict[str, Any]]:
        gemini_models = await self.gemini.get_models()
        claude_models = await self.claude.get_models()
        arena_models = await self.arena.get_models()
        
        all_models = []
        for m in (gemini_models + claude_models + arena_models):
            is_cfg = False
            if m.provider == "gemini":
                is_cfg = self.gemini.is_configured()
            elif m.provider == "claude":
                is_cfg = self.claude.is_configured()
            elif m.provider == "arena":
                is_cfg = self.arena.is_configured() or True  # Free evaluation router available
            all_models.append({
                **m.model_dump(),
                "is_configured": is_cfg
            })
        return all_models

    async def generate_code(self, request: AIRequest) -> AIResponse:
        primary_provider = self.get_provider(request.provider)
        try:
            return await primary_provider.generate(request)
        except Exception as e:
            logger.warning(f"Primary provider '{request.provider}' encountered an issue: {e}. Attempting controlled fallback.")
            fallback_provider = self.claude if request.provider == "gemini" else self.gemini
            try:
                fallback_req = request.model_copy()
                fallback_req.provider = "claude" if request.provider == "gemini" else "gemini"
                fallback_req.model = "claude-3-5-haiku-20241022" if request.provider == "gemini" else "gemini-2.5-flash"
                resp = await fallback_provider.generate(fallback_req)
                resp.message = f"[Fallback: {fallback_req.provider}] {resp.message}"
                return resp
            except Exception as fe:
                logger.error(f"Fallback generation also failed: {fe}")
                raise AIProviderError(f"Both primary and fallback providers failed: {e}", status_code=502)

    async def repair_code(self, request: AIRepairRequest) -> AIResponse:
        provider = self.get_provider(request.provider)
        return await provider.repair(request)

ai_manager = AIProviderManager()

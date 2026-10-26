import time
import json
import logging
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field

logger = logging.getLogger("ai_provider_base")

class AIModelInfo(BaseModel):
    id: str
    name: str
    provider: str  # 'gemini' | 'claude'
    tier: str      # 'free_trial' | 'pro' | 'enterprise'
    context_window: int
    cost_per_million_input: float
    cost_per_million_output: float
    is_available: bool = True
    description: str

class AIRequest(BaseModel):
    provider: str = "gemini"
    model: str = "gemini-2.5-flash"
    mode: str = "visual_design"  # visual_design | scaffold | component | modify | repair | backend | explain
    prompt: str
    design_context: Optional[Dict[str, Any]] = None
    selected_component_id: Optional[str] = None
    existing_files: Optional[Dict[str, str]] = None
    target_platform: str = "android"
    temperature: float = 0.2
    max_output_tokens: int = 4096

class GeneratedFilePatch(BaseModel):
    path: str
    operation: str = "write"  # write | patch | delete
    content: str
    description: str = ""

class AIResponse(BaseModel):
    provider: str
    model: str
    mode: str
    status: str = "success"  # success | error | rate_limited
    message: str = ""
    patches: List[GeneratedFilePatch] = []
    explanation: Optional[str] = None
    tokens_input: int = 0
    tokens_output: int = 0
    estimated_cost_usd: float = 0.0
    latency_ms: int = 0
    raw_response: Optional[str] = None

class AIRepairRequest(BaseModel):
    provider: str = "gemini"
    model: str = "gemini-2.5-flash"
    error_output: str
    source_file_path: str
    source_file_content: str
    project_context: Optional[Dict[str, Any]] = None

class AIProviderError(Exception):
    def __init__(self, message: str, status_code: int = 500, provider: str = "unknown"):
        super().__init__(message)
        self.message = message
        self.status_code = status_code
        self.provider = provider

class BaseAIProvider:
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key
        
    def is_configured(self) -> bool:
        return bool(self.api_key and self.api_key.strip() and not self.api_key.startswith("AIza_PLACEHOLDER") and not self.api_key.startswith("sk-ant-PLACEHOLDER"))

    async def get_models(self) -> List[AIModelInfo]:
        raise NotImplementedError

    async def generate(self, request: AIRequest) -> AIResponse:
        raise NotImplementedError

    async def repair(self, request: AIRepairRequest) -> AIResponse:
        raise NotImplementedError

    def estimate_cost(self, model: str, tokens_in: int, tokens_out: int) -> float:
        return 0.0

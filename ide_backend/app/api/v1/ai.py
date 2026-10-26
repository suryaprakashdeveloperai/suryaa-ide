import logging
from fastapi import APIRouter, HTTPException, Body
from typing import Dict, Any, List
from ...ai.provider_base import AIRequest, AIResponse, AIRepairRequest, AIProviderError
from ...ai.provider_manager import ai_manager

logger = logging.getLogger("api_ai")
router = APIRouter(prefix="/ai", tags=["AI Engine"])

@router.get("/models")
async def list_ai_models() -> List[Dict[str, Any]]:
    """
    Returns discovered and available Gemini and Claude models with pricing and tier metadata.
    """
    return await ai_manager.get_all_models()

@router.post("/generate", response_model=AIResponse)
async def generate_code(request: AIRequest = Body(...)) -> AIResponse:
    """
    Executes cloud or deterministic AI code generation across Gemini & Claude models.
    Supports: visual_design, scaffold, component, modify, repair, backend, explain.
    """
    try:
        return await ai_manager.generate_code(request)
    except AIProviderError as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)
    except Exception as e:
        logger.error(f"Generation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/repair", response_model=AIResponse)
async def repair_code(request: AIRepairRequest = Body(...)) -> AIResponse:
    """
    Diagnoses analyzer or build errors and produces a focused code repair patch.
    """
    try:
        return await ai_manager.repair_code(request)
    except Exception as e:
        logger.error(f"Repair error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/patches/preview")
async def preview_patches(payload: Dict[str, Any] = Body(...)) -> Dict[str, Any]:
    from ...core.config import settings
    from ...services.patch_service import patch_service
    from ...ai.provider_base import GeneratedFilePatch
    
    project_id = payload.get("projectId") or payload.get("project_id") or "flutter_ecommerce_studio"
    p_dir = settings.projects_dir / project_id / "frontend"
    p_dir.mkdir(parents=True, exist_ok=True)
    
    raw_patches = payload.get("patches")
    if not raw_patches and payload.get("patch"):
        raw_patches = [payload.get("patch")]
        
    patches = [GeneratedFilePatch(**p) for p in (raw_patches or [])]
    results = patch_service.preview_patches(p_dir, patches)
    diff_str = results[0].diff if results and results[0].diff else ""
    return {
        "results": [r.model_dump() for r in results],
        "diff": diff_str
    }

@router.post("/patches/apply")
async def apply_patches(payload: Dict[str, Any] = Body(...)) -> Dict[str, Any]:
    from ...core.config import settings
    from ...services.patch_service import patch_service
    from ...ai.provider_base import GeneratedFilePatch
    
    project_id = payload.get("projectId") or payload.get("project_id") or "flutter_ecommerce_studio"
    p_dir = settings.projects_dir / project_id / "frontend"
    p_dir.mkdir(parents=True, exist_ok=True)
    
    raw_patches = payload.get("patches")
    if not raw_patches and payload.get("patch"):
        raw_patches = [payload.get("patch")]
        
    patches = [GeneratedFilePatch(**p) for p in (raw_patches or [])]
    backup_id = payload.get("backupId") or payload.get("backup_id")
    
    result = patch_service.apply_patches(p_dir, patches, backup_id)
    return result.model_dump()

@router.post("/patches/rollback")
async def rollback_patches(payload: Dict[str, Any] = Body(...)) -> Dict[str, Any]:
    from ...core.config import settings
    from ...services.patch_service import patch_service
    
    project_id = payload.get("projectId") or payload.get("project_id") or "flutter_ecommerce_studio"
    backup_id = payload.get("backupId") or payload.get("backup_id")
    if not backup_id:
        raise HTTPException(status_code=400, detail="backupId is required")
        
    p_dir = settings.projects_dir / project_id / "frontend"
    ok = patch_service.rollback(p_dir, backup_id)
    return {"status": "success" if ok else "not_found", "rolledBack": ok}



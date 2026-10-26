from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from typing import Dict, Any, List
from pathlib import Path
from ...services.build_service import build_service
from ...core.config import settings

router = APIRouter(prefix="/artifacts", tags=["Download Center"])

@router.get("/")
def list_artifacts() -> List[Dict[str, Any]]:
    # Also discover any zip/apk files directly in the artifacts directory
    results = [art.to_dict() for art in build_service.artifacts.values()]
    return results

@router.get("/{artifact_id}/download")
def download_artifact(artifact_id: str):
    art = build_service.artifacts.get(artifact_id)
    if not art or not art.file_path.exists():
        raise HTTPException(status_code=404, detail="Artifact file not found")
        
    return FileResponse(
        path=str(art.file_path),
        filename=art.file_path.name,
        media_type="application/octet-stream"
    )

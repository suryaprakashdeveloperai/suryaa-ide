import time
import asyncio
from fastapi import APIRouter, HTTPException, BackgroundTasks, Body
from typing import Dict, Any
from pathlib import Path
from ...core.config import settings
from ...services.build_service import build_service

router = APIRouter(prefix="/builds", tags=["Build Manager"])

@router.post("/")
async def trigger_build(
    background_tasks: BackgroundTasks,
    payload: Dict[str, Any] = Body(...)
) -> Dict[str, Any]:
    project_id = payload.get("projectId")
    target_type = payload.get("targetType", "source_export")
    
    if not project_id:
        raise HTTPException(status_code=400, detail="projectId is required")
        
    p_dir = settings.projects_dir / project_id
    if not p_dir.exists():
        raise HTTPException(status_code=404, detail="Project directory not found. Please save/generate first.")

    job_id = f"job_{int(time.time())}_{project_id}"
    
    # Run async build
    background_tasks.add_task(
        build_service.start_build_job,
        job_id,
        project_id,
        p_dir,
        target_type
    )

    return {
        "jobId": job_id,
        "projectId": project_id,
        "targetType": target_type,
        "status": "queued",
        "message": f"Build job queued for {target_type}."
    }

@router.get("/{job_id}")
def get_build_status(job_id: str) -> Dict[str, Any]:
    job = build_service.jobs.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job

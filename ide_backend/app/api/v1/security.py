from fastapi import APIRouter, HTTPException, Body, Request
from typing import Dict, Any
from pathlib import Path
from ...core.config import settings
from ...services.security_service import security_service

router = APIRouter(prefix="/security", tags=["Cybersecurity Center"])

@router.post("/scan")
async def scan_project(payload: Dict[str, Any] = Body(...)) -> Dict[str, Any]:
    project_id = payload.get("projectId")
    schema = payload.get("schema", {})
    
    if not project_id:
        raise HTTPException(status_code=400, detail="projectId is required")

    p_dir = settings.projects_dir / project_id
    # Scan project files and schema
    return await security_service.scan_project(p_dir, schema)

@router.post("/incident")
async def report_incident(request: Request, payload: Dict[str, Any] = Body(...)) -> Dict[str, Any]:
    """
    Receives verified threat callbacks from client RASP/Talsec or application monitors.
    Applies anti-replay checks, rate limiting, and enacts session containment.
    """
    client_ip = request.client.host if request.client else "127.0.0.1"
    try:
        result = security_service.incident_manager.record_incident(payload, client_ip=client_ip)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to record incident: {str(e)}")

@router.get("/sessions/{session_token}/status")
async def check_session_status(session_token: str) -> Dict[str, Any]:
    """
    Checks if a session has been revoked due to critical security incidents.
    """
    revoked = security_service.incident_manager.is_session_revoked(session_token)
    if revoked:
        details = security_service.incident_manager.get_revocation_details(session_token)
        return {"revoked": True, "details": details}
    return {"revoked": False}

@router.get("/incidents")
async def list_incidents(limit: int = 50) -> Dict[str, Any]:
    """
    Returns recent structured audit incident logs for security observability.
    """
    records = security_service.incident_manager.get_audit_records(limit=limit)
    return {"count": len(records), "incidents": records}

import os
import shutil
import difflib
import logging
from pathlib import Path
from typing import Dict, Any, List, Optional
from pydantic import BaseModel
from ..core.config import settings
from ..ai.provider_base import GeneratedFilePatch

logger = logging.getLogger("patch_service")

class PatchValidationResult(BaseModel):
    is_valid: bool
    path: str
    error: Optional[str] = None
    diff: Optional[str] = None
    original_exists: bool = False

class PatchApplyResult(BaseModel):
    status: str  # success | rejected | error
    applied_count: int
    rejected_count: int
    details: List[Dict[str, Any]]
    backup_id: Optional[str] = None

class SafePatchService:
    def validate_path(self, project_dir: Path, rel_path: str) -> Path:
        """
        Guards against path traversal, symlink escaping, and absolute writes outside workspace.
        """
        # Block directory traversal sequences
        norm_rel = os.path.normpath(rel_path).lstrip("/\\")
        if ".." in norm_rel.split(os.sep):
            raise ValueError(f"Security Alert: Path traversal sequence detected in '{rel_path}'")
            
        target_path = (project_dir / norm_rel).resolve()
        project_resolved = project_dir.resolve()
        
        # Verify target is strictly within project_dir
        try:
            target_path.relative_to(project_resolved)
        except ValueError:
            raise ValueError(f"Security Alert: Target path '{target_path}' is outside project workspace '{project_resolved}'")
            
        return target_path

    def preview_patches(self, project_dir: Path, patches: List[GeneratedFilePatch]) -> List[PatchValidationResult]:
        results: List[PatchValidationResult] = []
        
        for patch in patches:
            try:
                target_path = self.validate_path(project_dir, patch.path)
                original_content = ""
                original_exists = target_path.exists()
                
                if original_exists:
                    original_content = target_path.read_text(encoding="utf-8", errors="replace")
                    
                # Calculate unified diff
                diff_lines = list(difflib.unified_diff(
                    original_content.splitlines(keepends=True),
                    patch.content.splitlines(keepends=True),
                    fromfile=f"a/{patch.path}",
                    tofile=f"b/{patch.path}"
                ))
                diff_text = "".join(diff_lines) if diff_lines else "No changes."
                
                results.append(PatchValidationResult(
                    is_valid=True,
                    path=patch.path,
                    diff=diff_text,
                    original_exists=original_exists
                ))
            except Exception as e:
                results.append(PatchValidationResult(
                    is_valid=False,
                    path=patch.path,
                    error=str(e),
                    original_exists=False
                ))
                
        return results

    def apply_patches(self, project_dir: Path, patches: List[GeneratedFilePatch], backup_id: Optional[str] = None) -> PatchApplyResult:
        applied = 0
        rejected = 0
        details: List[Dict[str, Any]] = []
        
        # Create backup directory for rollback
        backup_dir = None
        if not backup_id:
            backup_id = f"backup_{int(os.times().elapsed)}"
        backup_dir = settings.workspace_dir / "backups" / backup_id
        backup_dir.mkdir(parents=True, exist_ok=True)
        
        for patch in patches:
            try:
                target_path = self.validate_path(project_dir, patch.path)
                
                # Backup existing file before write
                if target_path.exists():
                    backup_target = backup_dir / patch.path
                    backup_target.parent.mkdir(parents=True, exist_ok=True)
                    shutil.copy2(target_path, backup_target)
                    
                # Write file safely
                target_path.parent.mkdir(parents=True, exist_ok=True)
                temp_file = target_path.with_suffix(target_path.suffix + ".tmp")
                temp_file.write_text(patch.content, encoding="utf-8")
                
                # Atomic replace
                temp_file.replace(target_path)
                applied += 1
                details.append({"path": patch.path, "status": "applied", "description": patch.description})
            except Exception as e:
                rejected += 1
                details.append({"path": patch.path, "status": "rejected", "error": str(e)})
                logger.error(f"Failed to apply patch to '{patch.path}': {e}")
                
        status = "success" if rejected == 0 else "partial" if applied > 0 else "error"
        return PatchApplyResult(
            status=status,
            applied_count=applied,
            rejected_count=rejected,
            details=details,
            backup_id=backup_id
        )

    def rollback(self, project_dir: Path, backup_id: str) -> bool:
        backup_dir = settings.workspace_dir / "backups" / backup_id
        if not backup_dir.exists():
            return False
            
        for file in backup_dir.rglob("*.*"):
            rel = file.relative_to(backup_dir)
            target = project_dir / rel
            target.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(file, target)
            
        return True

patch_service = SafePatchService()

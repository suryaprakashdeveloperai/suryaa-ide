import pytest
import asyncio
from pathlib import Path
from app.ai.provider_base import AIRequest, GeneratedFilePatch, AIRepairRequest
from app.ai.provider_manager import ai_manager
from app.services.patch_service import patch_service
from app.models.account import Subscription, THREE_DAYS_SECONDS
import time

def test_ai_models_listing():
    async def _run():
        models = await ai_manager.get_all_models()
        assert len(models) >= 5
        providers = {m["provider"] for m in models}
        assert "gemini" in providers
        assert "claude" in providers
        assert "arena" in providers
        
        model_ids = [m["id"] for m in models]
        assert "gemini-2.5-flash" in model_ids
        assert "claude-3-7-sonnet-20250219" in model_ids
        assert "coding-router-preview" in model_ids
    asyncio.run(_run())

def test_gemini_code_generation():
    async def _run():
        req = AIRequest(
            provider="gemini",
            model="gemini-2.5-flash",
            mode="visual_design",
            prompt="Generate real Flutter dashboard for factory monitoring",
            design_context={
                "screens": [{"name": "TelemetryScreen"}]
            }
        )
        resp = await ai_manager.generate_code(req)
        assert resp.status == "success"
        assert resp.provider == "gemini"
        assert len(resp.patches) > 0
        assert any("telemetry_view.dart" in p.path for p in resp.patches)
        assert any("fl_chart" in p.content for p in resp.patches)
        assert resp.tokens_input > 0
        assert resp.tokens_output > 0
    asyncio.run(_run())

def test_claude_code_generation():
    async def _run():
        req = AIRequest(
            provider="claude",
            model="claude-3-7-sonnet-20250219",
            mode="visual_design",
            prompt="Generate Claude telemetry chart and metrics",
            design_context={"screens": [{"name": "AnalyticsScreen"}]}
        )
        resp = await ai_manager.generate_code(req)
        assert resp.status == "success"
        assert resp.provider == "claude"
        assert len(resp.patches) > 0
        assert any("telemetry_dashboard_view.dart" in p.path for p in resp.patches)
    asyncio.run(_run())

def test_arena_ai_code_generation():
    async def _run():
        req = AIRequest(
            provider="arena",
            model="coding-router-preview",
            mode="visual_design",
            prompt="Generate Arena AI telemetry view",
            design_context={"screens": [{"name": "HomeScreen"}]}
        )
        resp = await ai_manager.generate_code(req)
        assert resp.status == "success"
        assert resp.provider == "arena"
        assert resp.model == "coding-router-preview"
        assert len(resp.patches) > 0
        assert any("home_view.dart" in p.path for p in resp.patches)
        assert any("fl_chart" in p.content for p in resp.patches)
    asyncio.run(_run())

def test_safe_patch_path_traversal_defense(tmp_path):
    project_dir = tmp_path / "test_workspace"
    project_dir.mkdir()
    
    # Path traversal attack attempts
    with pytest.raises(ValueError, match="Security Alert"):
        patch_service.validate_path(project_dir, "../../../evil.py")
        
    with pytest.raises(ValueError, match="Security Alert"):
        patch_service.validate_path(project_dir, "lib/../../outside.dart")

def test_safe_patch_apply_and_rollback(tmp_path):
    project_dir = tmp_path / "flutter_proj"
    project_dir.mkdir()
    
    file_path = "lib/main.dart"
    initial_patch = [GeneratedFilePatch(path=file_path, content="// Initial Code\nvoid main() {}", description="Initial")]
    res1 = patch_service.apply_patches(project_dir, initial_patch, backup_id="backup_1")
    assert res1.status == "success"
    assert (project_dir / file_path).read_text(encoding="utf-8") == "// Initial Code\nvoid main() {}"
    
    # Modify file with second patch
    second_patch = [GeneratedFilePatch(path=file_path, content="// Modified Code\nvoid main() { runApp(); }", description="Update")]
    res2 = patch_service.apply_patches(project_dir, second_patch, backup_id="backup_2")
    assert res2.status == "success"
    assert "Modified Code" in (project_dir / file_path).read_text(encoding="utf-8")
    
    # Rollback to backup_2
    ok = patch_service.rollback(project_dir, "backup_2")
    assert ok is True
    assert (project_dir / file_path).read_text(encoding="utf-8") == "// Initial Code\nvoid main() {}"

def test_three_day_trial_entitlement():
    now = time.time()
    sub = Subscription(
        user_id="user_123",
        plan="trial",
        status="trialing",
        trial_started_at=now,
        trial_expires_at=now + THREE_DAYS_SECONDS
    )
    assert sub.is_entitled() is True
    assert sub.seconds_remaining() > 250000  # ~3 days
    
    # Expired trial
    sub_expired = Subscription(
        user_id="user_456",
        plan="trial",
        status="trialing",
        trial_started_at=now - (4 * 86400),
        trial_expires_at=now - 86400  # expired yesterday
    )
    assert sub_expired.is_entitled() is False
    assert sub_expired.seconds_remaining() == 0

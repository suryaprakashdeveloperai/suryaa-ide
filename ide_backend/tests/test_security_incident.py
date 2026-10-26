import time
import uuid
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.ssrf_defense import validate_stream_destination
from app.services.security_service import security_service
from app.generator.python.generator import PythonBackendGenerator
from pathlib import Path
import tempfile

client = TestClient(app)

from app.core.ssrf_defense import validate_stream_destination, SSRFSecurityException

def test_ssrf_defense_blocks_private_and_metadata():
    # 1. Loopback
    with pytest.raises(SSRFSecurityException) as excinfo:
        validate_stream_destination("http://127.0.0.1:8080/stream")
    assert "prohibited address" in str(excinfo.value).lower() or "ssrf" in str(excinfo.value).lower()

    with pytest.raises(SSRFSecurityException):
        validate_stream_destination("ws://localhost:9000")

    # 2. RFC 1918 Private ranges
    with pytest.raises(SSRFSecurityException):
        validate_stream_destination("http://192.168.1.100:8000")
    with pytest.raises(SSRFSecurityException):
        validate_stream_destination("http://10.0.0.5/telemetry")

    # 3. Cloud metadata
    with pytest.raises(SSRFSecurityException) as excinfo:
        validate_stream_destination("http://169.254.169.254/latest/meta-data/")
    assert "forbidden" in str(excinfo.value).lower() or "metadata" in str(excinfo.value).lower()

    # 4. Valid destination (or dev allowed loopback)
    valid, ip = validate_stream_destination("http://localhost:8000/stream", allow_local_dev=True)
    assert valid is True
    assert ip == "127.0.0.1"

def test_security_incident_reporting_and_session_revocation():
    session_token = f"sess_{uuid.uuid4().hex}"
    nonce = f"nonce_{uuid.uuid4().hex}"
    now = time.time()

    # 1. Report critical root/jailbreak threat with session token
    payload = {
        "nonce": nonce,
        "timestamp": now,
        "threat_type": "root_jailbreak_detected",
        "severity": "CRITICAL",
        "session_token": session_token,
        "device_metadata": {"platform": "android", "is_emulator": False}
    }

    res = client.post("/api/v1/security/incident", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "recorded"
    assert data["session_revoked"] is True

    # 2. Replay attack: submitting identical nonce should be rejected
    res_replay = client.post("/api/v1/security/incident", json=payload)
    assert res_replay.status_code == 400
    assert "replayed" in res_replay.json()["detail"].lower()

    # 3. Stale timestamp drift: older than 300s
    stale_payload = {
        "nonce": f"nonce_{uuid.uuid4().hex}",
        "timestamp": now - 600,
        "threat_type": "debugger_attached",
        "severity": "HIGH"
    }
    res_stale = client.post("/api/v1/security/incident", json=stale_payload)
    assert res_stale.status_code == 400

    # 4. Check session status endpoint confirms revocation
    res_status = client.get(f"/api/v1/security/sessions/{session_token}/status")
    assert res_status.status_code == 200
    status_data = res_status.json()
    assert status_data["revoked"] is True
    assert status_data["details"]["threat_type"] == "root_jailbreak_detected"

def test_python_backend_generator_docker_compose_and_security():
    schema = {
        "metadata": {"name": "IndustrialTelemetry"},
        "backend": {
            "entities": [
                {
                    "name": "MachineReading",
                    "fields": [
                        {"name": "id", "type": "int", "primary_key": True},
                        {"name": "pressure", "type": "float"},
                        {"name": "temperature", "type": "float"}
                    ]
                }
            ]
        }
    }
    with tempfile.TemporaryDirectory() as tmpdir:
        gen = PythonBackendGenerator(schema)
        files = gen.generate_all(Path(tmpdir))

        assert "docker-compose.yml" in files
        assert "postgres:16-alpine" in files["docker-compose.yml"]
        assert "postgres_data:" in files["docker-compose.yml"]
        assert "app/api/v1/endpoints/security.py" in files
        assert "alembic/script.py.mako" in files
        assert "security" in files["app/api/v1/router.py"]

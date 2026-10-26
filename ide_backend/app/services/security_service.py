import re
import json
import time
import uuid
import logging
from pathlib import Path
from typing import Dict, Any, List, Optional, Set
from collections import defaultdict
from ..core.process_runner import run_async_process
from ..core.config import settings

logger = logging.getLogger("security_service")

# 1. Expanded OWASP Top 10 Mobile & API Rules
SECRET_PATTERNS = [
    ("Hardcoded API Key / Secret", re.compile(r'(?i)(?:api_key|apikey|secret_key|secret|auth_token|access_token)\s*=\s*["\']([A-Za-z0-9_\-\.]{12,})["\']')),
    ("Hardcoded Password", re.compile(r'(?i)(?:password|passwd|pwd)\s*=\s*["\']([^"\']{4,})["\']')),
    ("AWS Access Key ID", re.compile(r'AKIA[0-9A-Z]{16}')),
    ("Google Cloud API Key", re.compile(r'AIza[0-9A-Za-z-_]{35}')),
    ("Private Key Block", re.compile(r'-----BEGIN (?:RSA|OPENSSH|DSA|EC)? PRIVATE KEY-----')),
]

INSECURE_HTTP = re.compile(r'http://(?!(?:127\.0\.0\.1|localhost))[\w\.\-]+')

TLS_BYPASS_PATTERNS = [
    ("Insecure TLS Certificate Bypass (badCertificateCallback)", re.compile(r'badCertificateCallback\s*:\s*\([^)]*\)\s*=>\s*true')),
    ("Insecure RejectUnauthorized Disabled", re.compile(r'rejectUnauthorized\s*:\s*false')),
]

UNSAFE_STORAGE_PATTERNS = [
    ("Unsafe Plaintext Token Storage", re.compile(r'(?i)SharedPreferences.*?setString\([^,]+,\s*(?:token|jwt|accessToken|secret)\)')),
]

DYNAMIC_SQL_PATTERNS = [
    ("Unsafe Dynamic SQL String Concatenation", re.compile(r'(?i)(?:execute|cursor\.execute)\s*\(\s*f["\'].*?(?:SELECT|INSERT|UPDATE|DELETE)')),
]

DANGEROUS_COMMAND_PATTERNS = [
    ("Dangerous Shell Execution (os.system)", re.compile(r'os\.system\s*\(')),
    ("Dangerous Shell Execution (subprocess shell=True)", re.compile(r'subprocess\.(?:Popen|call|run)\s*\(.*?shell\s*=\s*True')),
]

INSECURE_CORS_PATTERN = re.compile(r'allow_origins\s*=\s*\[["\']\*["\']\][\s\S]*?allow_credentials\s*=\s*True')

# 2. Runtime Security Incident Manager with Replay Defense, Rate Limiting & Session Revocation
class SecurityIncidentManager:
    """
    Handles client-side threat reporting (RASP), incident rate-limiting,
    nonce replay verification, and server-side session revocation.
    """
    def __init__(self):
        # Nonce TTL cache: nonce -> expiry timestamp
        self._nonces: Dict[str, float] = {}
        # Client IP rate-limiting: client_ip -> list of timestamps
        self._ip_rate_limits: Dict[str, List[float]] = defaultdict(list)
        # Revoked sessions: session_token -> revocation metadata
        self._revoked_sessions: Dict[str, Dict[str, Any]] = {}
        # Structured audit log
        self._audit_records: List[Dict[str, Any]] = []

    def _cleanup_expired_nonces(self):
        now = time.time()
        expired = [n for n, exp in self._nonces.items() if exp < now]
        for n in expired:
            del self._nonces[n]

    def is_rate_limited(self, client_ip: str, limit: int = 10, window_sec: float = 60.0) -> bool:
        now = time.time()
        timestamps = self._ip_rate_limits[client_ip]
        # Keep only timestamps within window
        valid = [t for t in timestamps if now - t <= window_sec]
        self._ip_rate_limits[client_ip] = valid
        if len(valid) >= limit:
            return True
        self._ip_rate_limits[client_ip].append(now)
        return False

    def is_nonce_replayed(self, nonce: str, timestamp: float, max_drift_sec: float = 300.0) -> bool:
        now = time.time()
        # Freshness check: timestamp must be within ±max_drift_sec
        if abs(now - timestamp) > max_drift_sec:
            return True

        self._cleanup_expired_nonces()
        if nonce in self._nonces:
            return True  # Replayed nonce!

        # Store nonce with expiry = timestamp + max_drift_sec
        self._nonces[nonce] = now + max_drift_sec
        return False

    def record_incident(self, incident: Dict[str, Any], client_ip: str = "127.0.0.1") -> Dict[str, Any]:
        """
        Validates, records, and enacts containment policy on a verified security incident.
        """
        # 1. Rate limiting check
        if self.is_rate_limited(client_ip):
            raise ValueError("Rate limit exceeded for security incident reporting. Try again later.")

        # 2. Replay check
        nonce = incident.get("nonce", "")
        ts = incident.get("timestamp", 0.0)
        if not nonce or not ts or self.is_nonce_replayed(nonce, ts):
            raise ValueError("Invalid or replayed incident report nonce/timestamp.")

        incident_id = f"inc_{uuid.uuid4().hex[:12]}"
        threat_type = incident.get("threat_type", "unknown_threat")
        severity = incident.get("severity", "MEDIUM").upper()
        session_token = incident.get("session_token")

        audit_entry = {
            "incident_id": incident_id,
            "threat_type": threat_type,
            "severity": severity,
            "timestamp": ts,
            "recorded_at": time.time(),
            "client_ip": client_ip,
            "device_metadata": incident.get("device_metadata", {}),
            "client_version": incident.get("client_version", "1.0.0"),
            "session_revoked": False
        }

        # 3. Containment policy: Revoke session for CRITICAL threats
        # (Root/jailbreak, hooking, debugger attachment, package tampering)
        if severity == "CRITICAL" and session_token:
            self._revoked_sessions[session_token] = {
                "incident_id": incident_id,
                "threat_type": threat_type,
                "revoked_at": time.time(),
                "reason": f"Critical security threat detected: {threat_type}"
            }
            audit_entry["session_revoked"] = True
            logger.warning(f"[SecurityIncident] Session revoked for incident {incident_id}: {threat_type}")

        self._audit_records.append(audit_entry)
        # Keep latest 500 records
        if len(self._audit_records) > 500:
            self._audit_records.pop(0)

        return {
            "status": "recorded",
            "incident_id": incident_id,
            "session_revoked": audit_entry["session_revoked"]
        }

    def is_session_revoked(self, session_token: str) -> bool:
        return session_token in self._revoked_sessions

    def get_revocation_details(self, session_token: str) -> Optional[Dict[str, Any]]:
        return self._revoked_sessions.get(session_token)

    def get_audit_records(self, limit: int = 50) -> List[Dict[str, Any]]:
        return list(reversed(self._audit_records[-limit:]))


class SecurityAuditService:
    def __init__(self):
        self.incident_manager = SecurityIncidentManager()

    async def scan_project(self, project_dir: Path, schema: Dict[str, Any]) -> Dict[str, Any]:
        findings: List[Dict[str, Any]] = []
        
        # 1. Scan for hardcoded secrets, insecure URLs, and vulnerable patterns across generated source files
        if project_dir.exists():
            for file_path in project_dir.rglob("*.*"):
                if any(ignored in file_path.parts for ignored in [".git", ".dart_tool", "build", "node_modules"]):
                    continue
                if file_path.suffix.lower() in [".dart", ".py", ".json", ".yaml", ".env"]:
                    try:
                        content = file_path.read_text(encoding="utf-8", errors="replace")
                        rel_path = str(file_path.relative_to(project_dir))
                        
                        # Secret patterns
                        for desc, pat in SECRET_PATTERNS:
                            matches = pat.findall(content)
                            if matches:
                                findings.append({
                                    "severity": "CRITICAL",
                                    "category": "Secret Exposure",
                                    "title": desc,
                                    "file": rel_path,
                                    "description": f"Potential exposed credential matching '{desc}' found in source code.",
                                    "recommendation": "Move secrets into environment variables (.env) or platform secure storage."
                                })

                        # Insecure HTTP
                        if INSECURE_HTTP.search(content):
                            findings.append({
                                "severity": "MEDIUM",
                                "category": "Network Security",
                                "title": "Insecure Cleartext HTTP Transport",
                                "file": rel_path,
                                "description": "Cleartext HTTP URL detected without TLS encryption.",
                                "recommendation": "Enforce HTTPS with valid SSL/TLS certificates."
                            })

                        # TLS Bypasses
                        for desc, pat in TLS_BYPASS_PATTERNS:
                            if pat.search(content):
                                findings.append({
                                    "severity": "CRITICAL",
                                    "category": "TLS Security",
                                    "title": desc,
                                    "file": rel_path,
                                    "description": "TLS certificate validation is disabled or bypassed in client networking.",
                                    "recommendation": "Remove badCertificateCallback and implement SPKI certificate pinning."
                                })

                        # Plaintext Token Storage
                        for desc, pat in UNSAFE_STORAGE_PATTERNS:
                            if pat.search(content):
                                findings.append({
                                    "severity": "HIGH",
                                    "category": "Data Storage",
                                    "title": desc,
                                    "file": rel_path,
                                    "description": "Sensitive tokens stored in unencrypted SharedPreferences.",
                                    "recommendation": "Use FlutterSecureStorage with platform Keystore/Keychain encryption."
                                })

                        # Dynamic SQL Injection
                        for desc, pat in DYNAMIC_SQL_PATTERNS:
                            if pat.search(content):
                                findings.append({
                                    "severity": "HIGH",
                                    "category": "Injection",
                                    "title": desc,
                                    "file": rel_path,
                                    "description": "Dynamic SQL query constructed with string concatenation or f-strings.",
                                    "recommendation": "Use SQLAlchemy parameterized queries with ORM models."
                                })

                        # Dangerous Shell Execution
                        for desc, pat in DANGEROUS_COMMAND_PATTERNS:
                            if pat.search(content):
                                findings.append({
                                    "severity": "CRITICAL",
                                    "category": "Command Injection",
                                    "title": desc,
                                    "file": rel_path,
                                    "description": "Dangerous shell execution method detected.",
                                    "recommendation": "Avoid shell execution or use parameterized subprocess arguments without shell=True."
                                })

                        # Insecure Permissive CORS
                        if INSECURE_CORS_PATTERN.search(content):
                            findings.append({
                                "severity": "HIGH",
                                "category": "CORS Security",
                                "title": "Permissive Wildcard CORS with Credentials",
                                "file": rel_path,
                                "description": "allow_origins=['*'] combined with allow_credentials=True permits unauthorized cross-origin access.",
                                "recommendation": "Specify explicit allowed origins when credentials are enabled."
                            })

                    except Exception as e:
                        logger.warning(f"Failed to scan {file_path}: {e}")

        # 2. Check Backend API configurations
        backend_config = schema.get("backend", {})
        endpoints = backend_config.get("endpoints", [])
        for ep in endpoints:
            if ep.get("path") and not ep.get("authRequired", True):
                findings.append({
                    "severity": "LOW",
                    "category": "API Authorization",
                    "title": f"Public Unauthenticated Endpoint: {ep.get('path')}",
                    "file": "backend/app/api/v1",
                    "description": f"Endpoint '{ep.get('path')}' allows unauthenticated requests.",
                    "recommendation": "Ensure sensitive CRUD endpoints require Bearer JWT authentication."
                })

        # 3. Check Python Dependency Vulnerabilities with pip-audit
        backend_dir = project_dir / "backend"
        if backend_dir.exists():
            audit_res = await run_async_process(
                [settings.python_path, "-m", "pip_audit", "--format", "json"],
                cwd=str(backend_dir),
                timeout=30.0
            )
            if audit_res.success and audit_res.stdout:
                try:
                    audit_data = json.loads(audit_res.stdout)
                    vulns = audit_data.get("dependencies", [])
                    for dep in vulns:
                        for vuln in dep.get("vulns", []):
                            findings.append({
                                "severity": "HIGH",
                                "category": "Vulnerable Dependency",
                                "title": f"Vulnerability in {dep.get('name')}: {vuln.get('id')}",
                                "file": "backend/pyproject.toml",
                                "description": vuln.get("description", "Known security vulnerability."),
                                "recommendation": f"Upgrade {dep.get('name')} to a patched version."
                            })
                except Exception as e:
                    logger.info(f"Pip-audit parsed output: {e}")

        # 4. Summary & Score
        critical_count = sum(1 for f in findings if f["severity"] == "CRITICAL")
        high_count = sum(1 for f in findings if f["severity"] == "HIGH")
        medium_count = sum(1 for f in findings if f["severity"] == "MEDIUM")
        low_count = sum(1 for f in findings if f["severity"] == "LOW")

        security_score = max(0, 100 - (critical_count * 30 + high_count * 15 + medium_count * 5 + low_count * 2))

        return {
            "score": security_score,
            "status": "PASS" if security_score >= 80 else ("WARNING" if security_score >= 50 else "FAIL"),
            "totalFindings": len(findings),
            "summary": {
                "critical": critical_count,
                "high": high_count,
                "medium": medium_count,
                "low": low_count
            },
            "findings": findings
        }

security_service = SecurityAuditService()

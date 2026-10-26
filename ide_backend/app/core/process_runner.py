import asyncio
import re
from typing import AsyncGenerator, List, Optional, Tuple

SECRET_PATTERNS = [
    re.compile(r'(?i)(?:key|token|secret|password|auth|bearer)\s*[:=]\s*["\']?([^"\'\s]+)["\']?'),
    re.compile(r'(?i)(AIza[0-9A-Za-z-_]{35})'),
]

def redact_secrets(text: str) -> str:
    redacted = text
    for pattern in SECRET_PATTERNS:
        redacted = pattern.sub(r'***REDACTED***', redacted)
    return redacted

class ProcessResult:
    def __init__(self, returncode: int, stdout: str, stderr: str):
        self.returncode = returncode
        self.stdout = stdout
        self.stderr = stderr
        self.success = returncode == 0

async def run_async_process(
    cmd: List[str],
    cwd: Optional[str] = None,
    timeout: Optional[float] = 300.0,
    env: Optional[dict] = None
) -> ProcessResult:
    """
    Executes a process asynchronously with safety timeout and secret redaction.
    """
    process = await asyncio.create_subprocess_exec(
        *cmd,
        cwd=cwd,
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE,
        env=env
    )

    try:
        stdout_bytes, stderr_bytes = await asyncio.wait_for(
            process.communicate(),
            timeout=timeout
        )
    except asyncio.TimeoutError:
        try:
            process.kill()
        except ProcessLookupError:
            pass
        return ProcessResult(-1, "", f"Process timed out after {timeout} seconds.")

    stdout = stdout_bytes.decode("utf-8", errors="replace")
    stderr = stderr_bytes.decode("utf-8", errors="replace")

    return ProcessResult(
        process.returncode or 0,
        redact_secrets(stdout),
        redact_secrets(stderr)
    )

async def stream_async_process(
    cmd: List[str],
    cwd: Optional[str] = None,
    env: Optional[dict] = None
) -> AsyncGenerator[str, None]:
    """
    Streams stdout and stderr line-by-line as the process runs.
    """
    process = await asyncio.create_subprocess_exec(
        *cmd,
        cwd=cwd,
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.STDOUT,
        env=env
    )

    if process.stdout:
        while True:
            line = await process.stdout.readline()
            if not line:
                break
            yield redact_secrets(line.decode("utf-8", errors="replace"))

    await process.wait()

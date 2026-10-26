import os
import sys
import shutil
from pathlib import Path
from pydantic import BaseModel

BASE_DIR = Path(os.getenv("BASE_DIR", str(Path(__file__).resolve().parents[3])))
WORKSPACE_DIR = BASE_DIR / "workspace"
PROJECTS_DIR = WORKSPACE_DIR / "generated_projects"
ARTIFACTS_DIR = WORKSPACE_DIR / "build_artifacts"
LOGS_DIR = WORKSPACE_DIR / "logs"

class Settings(BaseModel):
    app_name: str = "Suryaa IDE Engine"
    owner: str = "Surya Prakash T (B.Tech AIML)"
    version: str = "2.0.0"
    base_dir: Path = BASE_DIR
    workspace_dir: Path = WORKSPACE_DIR
    projects_dir: Path = PROJECTS_DIR
    artifacts_dir: Path = ARTIFACTS_DIR
    logs_dir: Path = LOGS_DIR
    
    # Tool paths
    flutter_path: str = os.getenv("FLUTTER_PATH", shutil.which("flutter") or "flutter")
    dart_path: str = os.getenv(
        "DART_PATH",
        shutil.which("dart") or (
            r"C:\Users\ELCOT\AppData\Local\Microsoft\WinGet\Packages\Google.DartSDK_Microsoft.Winget.Source_8wekyb3d8bbwe\dart-sdk\bin\dart.exe"
            if Path(r"C:\Users\ELCOT\AppData\Local\Microsoft\WinGet\Packages\Google.DartSDK_Microsoft.Winget.Source_8wekyb3d8bbwe\dart-sdk\bin\dart.exe").exists()
            else "dart"
        )
    )
    adb_path: str = os.getenv("ADB_PATH", shutil.which("adb") or "adb")
    python_path: str = os.getenv("PYTHON_PATH", sys.executable)

    def ensure_directories(self):
        for directory in [self.workspace_dir, self.projects_dir, self.artifacts_dir, self.logs_dir]:
            directory.mkdir(parents=True, exist_ok=True)

settings = Settings()
settings.ensure_directories()

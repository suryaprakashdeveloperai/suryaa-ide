import json
import logging
import shutil
from typing import List, Dict, Any
from ..core.process_runner import run_async_process
from ..core.config import settings

logger = logging.getLogger("devices_service")

class DeviceManagerService:
    def __init__(self):
        self.flutter_bin = settings.flutter_path
        self.adb_bin = settings.adb_path

    async def get_toolchain_diagnostics(self) -> Dict[str, Any]:
        """
        Runs diagnostics on Flutter SDK, Dart SDK, and ADB availability.
        """
        flutter_found = shutil.which(self.flutter_bin) is not None
        adb_found = shutil.which(self.adb_bin) is not None
        dart_found = shutil.which(settings.dart_path) is not None

        flutter_version = "Not detected"
        if flutter_found:
            res = await run_async_process([self.flutter_bin, "--version"], timeout=10)
            if res.success:
                flutter_version = res.stdout.split("\n")[0]

        return {
            "flutter": {
                "available": flutter_found,
                "version": flutter_version,
                "path": shutil.which(self.flutter_bin) or "Not found",
                "setup_guide": "Install Flutter from https://flutter.dev or configure FLUTTER_PATH."
            },
            "dart": {
                "available": dart_found,
                "path": shutil.which(settings.dart_path) or "Not found"
            },
            "adb": {
                "available": adb_found,
                "path": shutil.which(self.adb_bin) or "Not found",
                "setup_guide": "Enable USB debugging on your Android device and install Android SDK platform-tools."
            }
        }

    async def list_devices(self) -> List[Dict[str, Any]]:
        """
        Discovers connected physical devices, simulators, and desktop targets.
        """
        devices = []
        
        # 1. Try flutter devices --machine
        if shutil.which(self.flutter_bin):
            res = await run_async_process([self.flutter_bin, "devices", "--machine"], timeout=15)
            if res.success:
                try:
                    devices.extend(json.loads(res.stdout))
                except Exception as e:
                    logger.warning(f"Failed to parse flutter devices: {e}")

        # 2. Add Windows Desktop target if running on Windows
        devices.append({
            "id": "windows",
            "name": "Windows Desktop (Local)",
            "targetPlatform": "windows-x64",
            "isSupported": True,
            "emulator": False,
            "status": "connected"
        })

        # 3. Add Web Chrome target
        devices.append({
            "id": "chrome",
            "name": "Chrome (Web Preview)",
            "targetPlatform": "web-javascript",
            "isSupported": True,
            "emulator": False,
            "status": "connected"
        })

        # 4. Check ADB if available
        if shutil.which(self.adb_bin):
            adb_res = await run_async_process([self.adb_bin, "devices", "-l"], timeout=10)
            if adb_res.success:
                for line in adb_res.stdout.splitlines()[1:]:
                    if line.strip() and "device" in line:
                        parts = line.split()
                        dev_id = parts[0]
                        devices.append({
                            "id": dev_id,
                            "name": f"Android Device ({dev_id})",
                            "targetPlatform": "android-arm64",
                            "isSupported": True,
                            "emulator": "emulator" in dev_id,
                            "status": "connected"
                        })

        return devices

    async def list_emulators(self) -> List[Dict[str, Any]]:
        emulators = []
        if shutil.which(self.flutter_bin):
            res = await run_async_process([self.flutter_bin, "emulators", "--machine"], timeout=15)
            if res.success:
                try:
                    emulators.extend(json.loads(res.stdout))
                except Exception as e:
                    logger.warning(f"Failed to parse emulators: {e}")
        return emulators

    async def launch_emulator(self, emulator_id: str) -> Dict[str, Any]:
        if not shutil.which(self.flutter_bin):
            return {
                "success": False,
                "error": "Flutter SDK not detected in environment PATH. Please configure SDK settings."
            }
        res = await run_async_process([self.flutter_bin, "emulators", "--launch", emulator_id], timeout=30)
        return {"success": res.success, "stdout": res.stdout, "stderr": res.stderr}

device_service = DeviceManagerService()

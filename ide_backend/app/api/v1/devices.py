from fastapi import APIRouter
from typing import Dict, Any, List
from ...services.devices_service import device_service

router = APIRouter(prefix="/devices", tags=["Devices & Emulators"])

@router.get("/")
async def get_devices() -> List[Dict[str, Any]]:
    return await device_service.list_devices()

@router.get("/emulators")
async def get_emulators() -> List[Dict[str, Any]]:
    return await device_service.list_emulators()

@router.post("/emulators/{emulator_id}/launch")
async def launch_emulator(emulator_id: str) -> Dict[str, Any]:
    return await device_service.launch_emulator(emulator_id)

@router.get("/diagnostics")
async def get_toolchain_diagnostics() -> Dict[str, Any]:
    return await device_service.get_toolchain_diagnostics()

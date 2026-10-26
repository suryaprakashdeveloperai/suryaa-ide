import os
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from typing import List

from .core.config import settings
from .api.v1.projects import router as projects_router
from .api.v1.devices import router as devices_router
from .api.v1.builds import router as builds_router
from .api.v1.artifacts import router as artifacts_router
from .api.v1.security import router as security_router
from .api.v1.ai import router as ai_router
from .api.v1.billing import router as billing_router

app = FastAPI(
    title=settings.app_name,
    version=settings.version,
    description="Suryaa IDE — Production-grade Visual Flutter Full-Stack Engine. Creator & Owner: Surya Prakash T (B.Tech AIML)."
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API v1 routes
app.include_router(projects_router, prefix="/api/v1")
app.include_router(devices_router, prefix="/api/v1")
app.include_router(builds_router, prefix="/api/v1")
app.include_router(artifacts_router, prefix="/api/v1")
app.include_router(security_router, prefix="/api/v1")
app.include_router(ai_router, prefix="/api/v1")
app.include_router(billing_router, prefix="/api/v1")

@app.get("/")
def root():
    return {
        "status": "online",
        "service": settings.app_name,
        "version": settings.version,
        "workspace": str(settings.workspace_dir)
    }

@app.get("/health")
def health():
    return {"status": "healthy"}

# Real-time WebSocket connection manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except Exception:
                pass

manager = ConnectionManager()

@app.websocket("/ws/logs")
async def websocket_logs(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            # Echo or process incoming commands
            await websocket.send_text(f"ACK: {data}")
    except WebSocketDisconnect:
        manager.disconnect(websocket)

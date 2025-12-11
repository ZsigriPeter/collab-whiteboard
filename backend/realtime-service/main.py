from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Query
from fastapi.middleware.cors import CORSMiddleware
from jose import JWTError, jwt
import os
import json
from websocket_manager import ConnectionManager
from decouple import config

app = FastAPI(title="Realtime Collaboration Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

manager = ConnectionManager()

JWT_SECRET = config("JWT_SECRET")
ALGORITHM = "HS256"

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "realtime-service"}

@app.websocket("/ws/{whiteboard_id}")
async def websocket_endpoint(
    websocket: WebSocket,
    whiteboard_id: int,
    token: str = Query(None)
):
    if not token:
        await websocket.close(code=1008, reason="Missing token")
        return

    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[ALGORITHM])
        user_id = payload.get("user_id")
        if not user_id:
            raise JWTError()
    except JWTError as e:
        await websocket.close(code=1008, reason="Invalid token")
        return

    await manager.connect(websocket, whiteboard_id, user_id)

    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            await manager.broadcast(whiteboard_id, message, exclude_user=user_id)
    except WebSocketDisconnect:
        manager.disconnect(websocket, whiteboard_id, user_id)
        await manager.broadcast(
            whiteboard_id,
            {"type": "user_left", "user_id": user_id}
        )
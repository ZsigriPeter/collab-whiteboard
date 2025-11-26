from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import redis
import json
from typing import Dict, List
from websocket_manager import ConnectionManager

app = FastAPI(title="Realtime Collaboration Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

manager = ConnectionManager()

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "realtime-service"}

@app.websocket("/ws/{whiteboard_id}/{user_id}")
async def websocket_endpoint(websocket: WebSocket, whiteboard_id: int, user_id: int):
    await manager.connect(websocket, whiteboard_id, user_id)
    
    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            
            # Broadcast to all users in the same whiteboard
            await manager.broadcast(whiteboard_id, message, exclude_user=user_id)
            
    except WebSocketDisconnect:
        manager.disconnect(websocket, whiteboard_id, user_id)
        await manager.broadcast(
            whiteboard_id,
            {"type": "user_left", "user_id": user_id}
        )
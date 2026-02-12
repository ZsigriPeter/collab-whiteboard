from fastapi import WebSocket
from typing import Dict, List
import json

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[int, List[tuple]] = {}
    
    async def connect(self, websocket: WebSocket, whiteboard_id: int, user_id: int):
        await websocket.accept()

        if whiteboard_id not in self.active_connections:
            self.active_connections[whiteboard_id] = []

        self.active_connections[whiteboard_id].append((websocket, user_id))

        await self.broadcast(
            whiteboard_id,
            {
                "type": "online_users",
                "users": self.get_online_users(whiteboard_id)
            }
        )

    
    def disconnect(self, websocket: WebSocket, whiteboard_id: int, user_id: int):
        if whiteboard_id in self.active_connections:
            self.active_connections[whiteboard_id] = [
                (ws, uid) for ws, uid in self.active_connections[whiteboard_id]
                if ws != websocket
            ]
    
    async def broadcast(self, whiteboard_id: int, message: dict, exclude_user: int = None):
        if whiteboard_id in self.active_connections:
            for websocket, user_id in self.active_connections[whiteboard_id]:
                if exclude_user is None or user_id != exclude_user:
                    await websocket.send_text(json.dumps(message))
                    
    def get_online_users(self, whiteboard_id: int) -> List[int]:
        if whiteboard_id not in self.active_connections:
            return []

        return [user_id for _, user_id in self.active_connections[whiteboard_id]]

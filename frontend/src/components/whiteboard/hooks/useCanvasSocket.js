import { useEffect } from 'react';
import { useRealtimeStore } from '../../../store/realtimeStore';
import { useCanvasStore } from '../../../store/canvasStore';

export function useCanvasSocket(whiteboardId, token) {
  const { connect, send, setMessageHandler, isConnected, disconnect } = useRealtimeStore();
  const { addObject, updateObject, deleteObject } = useCanvasStore();

  useEffect(() => {
    if (!token || !whiteboardId) return;

    connect(whiteboardId, token);

    setMessageHandler((msg) => {
      console.log('📨 Received:', msg);

      if (msg.type === 'object_created') {
        addObject(whiteboardId, msg.payload);
      }
      if (msg.type === 'object_updated') {
        updateObject(msg.payload.id, msg.payload);
      }
      if (msg.type === 'object_deleted') {
        deleteObject(msg.id);
      }
    });

    return () => disconnect();
  }, [whiteboardId, token, connect, disconnect, setMessageHandler, addObject, updateObject, deleteObject]);

  const broadcastCreate = (obj) => send({ type: 'object_created', payload: obj });
  const broadcastUpdate = (id, updates) => send({ type: 'object_updated', payload: { id, ...updates } });
  const broadcastDelete = (id) => send({ type: 'object_deleted', id });

  return {
    isConnected,
    broadcastCreate,
    broadcastUpdate,
    broadcastDelete,
  };
}

import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useCanvasStore } from '../../../store/canvasStore';
import { useAuthStore } from '../../../store/authStore';
import { useCanvasSocket } from '../hooks/useCanvasSocket';
import { useCanvasDrawing } from '../hooks/useCanvasDrawing';
import { useEraserTool } from '../hooks/useEraserTool';
import CanvasStage from './CanvasStage';

export default function Canvas() {
  const { id: whiteboardId } = useParams();
  const token = localStorage.getItem('access_token');
  const { user } = useAuthStore();

  const {
    objects,
    isLoading,
    error,
    loadObjects,
    addObject,
    updateObject,
    deleteObject,
    selectObject,
  } = useCanvasStore();

  // WebSocket connection
  const { isConnected, broadcastCreate, broadcastUpdate, broadcastDelete } = 
    useCanvasSocket(whiteboardId, token);

  // Drawing logic
  const handleDrawingComplete = (newObject) => {
    addObject(whiteboardId, newObject).then((obj) => {
      broadcastCreate(obj);
    });
  };

  const {
    previewShape,
    currentDrawing,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
  } = useCanvasDrawing(whiteboardId, handleDrawingComplete);

  // Eraser logic
  const handleDelete = (objectId) => {
    deleteObject(objectId).then(() => {
      broadcastDelete(objectId);
    });
  };

  const { handleObjectClick } = useEraserTool(handleDelete);

  // Load objects on mount
  useEffect(() => {
    console.log('Canvas mounted, whiteboard ID:', whiteboardId);
    if (whiteboardId) {
      loadObjects(whiteboardId);
    }
  }, [whiteboardId, loadObjects]);

  // Handle drag end
  const handleDragEnd = (e, obj) => {
    const node = e.target;
    const updates = { x: node.x(), y: node.y() };

    updateObject(obj.id, updates).then(() => {
      broadcastUpdate(obj.id, updates);
    });
  };

  // Handle transform end
  const handleTransformEnd = (e, obj) => {
    const node = e.target;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    node.scaleX(1);
    node.scaleY(1);

    const updates = {
      x: node.x(),
      y: node.y(),
      width: Math.max(5, node.width() * scaleX),
      height: Math.max(5, node.height() * scaleY),
    };

    updateObject(obj.id, updates).then(() => {
      broadcastUpdate(obj.id, updates);
    });
  };

  // Handle object click (select or erase)
  const handleCanvasObjectClick = (obj) => {
    const eraserHandled = handleObjectClick(obj.id);
    if (!eraserHandled) {
      selectObject(obj.id);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading canvas...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error loading canvas: {error}</p>
          <button
            onClick={() => loadObjects(whiteboardId)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 overflow-hidden relative">
      <CanvasStage
        objects={objects}
        previewShape={previewShape}
        currentDrawing={currentDrawing}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onDragEnd={handleDragEnd}
        onTransformEnd={handleTransformEnd}
        onObjectClick={handleCanvasObjectClick}
      />

      {/* Connection status indicator */}
      <div className="absolute top-4 right-4 z-50">
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
          isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {isConnected ? '🟢 Live' : '🔴 Connecting...'}
        </div>
      </div>
    </div>
  );
}
import { useEffect, useRef, useState } from 'react';
import { Stage, Layer, Rect, Circle, Line, Text, Transformer, Ellipse } from 'react-konva';
import { useCanvasStore } from '../../store/canvasStore';
import { useRealtimeStore } from '../../store/realtimeStore';
import { useParams } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

export default function Canvas() {
  const { id: whiteboardId } = useParams();
  const stageRef = useRef(null);
  const transformerRef = useRef(null);
  const token = localStorage.getItem('access_token')

  const { user } = useAuthStore();
  const userId = user?.id || 'guest';
  const username = user?.username || 'Guest';

  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight - 64,
  });

  const [shapeStart, setShapeStart] = useState(null);
  const [previewShape, setPreviewShape] = useState(null);


  const {
    objects,
    selectedTool,
    selectedColor,
    strokeWidth,
    selectedObjectId,
    isDrawing,
    currentDrawing,
    isLoading,
    error,
    loadObjects,
    addObject: addObjectLocal,
    updateObject: updateObjectLocal,
    deleteObject: deleteObjectLocal,
    selectObject,
    deselectObject,
    startDrawing,
    continueDrawing,
    endDrawing,
  } = useCanvasStore();

  const { connect, send, setMessageHandler, isConnected } = useRealtimeStore();

  useEffect(() => {
    if (token) {
      connect(whiteboardId, token);

      setMessageHandler((msg) => {
        console.log('Received:', msg);

        if (msg.type === 'object_created') {
          addObjectLocal(whiteboardId, msg.payload);
        }
        if (msg.type === 'object_updated') {
          updateObjectLocal(msg.payload.id, msg.payload);
        }
        if (msg.type === 'object_deleted') {
          deleteObjectLocal(msg.id);
        }
      });

      return () => useRealtimeStore.getState().disconnect();
    }
  }, [whiteboardId, token]);

  useEffect(() => {
    console.log('🎨 Canvas mounted, whiteboard ID:', whiteboardId);
    if (whiteboardId) {
      loadObjects(whiteboardId);
    }
  }, [whiteboardId, loadObjects]);

  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight - 64,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (selectedObjectId && transformerRef.current && stageRef.current) {
      const selectedNode = stageRef.current.findOne(`#object-${selectedObjectId}`);
      if (selectedNode) {
        transformerRef.current.nodes([selectedNode]);
        transformerRef.current.getLayer().batchDraw();
      }
    }
  }, [selectedObjectId]);

  const broadcastCreate = (obj) => send({ type: 'object_created', payload: obj });
  const broadcastUpdate = (id, updates) => send({ type: 'object_updated', payload: { id, ...updates } });
  const broadcastDelete = (id) => send({ type: 'object_deleted', id });

  const handleMouseDown = (e) => {
    if (e.target === e.target.getStage()) {
      deselectObject();
      if (transformerRef.current) {
        transformerRef.current.nodes([]);
      }
    }

    const stage = e.target.getStage();
    const point = stage.getPointerPosition();

    if (selectedTool === 'pen') {
      startDrawing(point);
    } else if (selectedTool === 'rectangle' || selectedTool === 'circle') {
      setShapeStart(point);
      setPreviewShape({
        type: selectedTool,
        x: point.x,
        y: point.y,
        width: 0,
        height: 0,
      });
    } else if (selectedTool === 'text') {
      const text = prompt('Enter text:');
      if (text) {
        const newText = {
          object_type: 'text',
          x: point.x,
          y: point.y,
          color: selectedColor,
          data: {
            content: text,
            fontSize: 20,
            fontFamily: 'Arial',
          },
        };
        addObjectLocal(whiteboardId, newText).then((obj) => {
          broadcastCreate(obj);
        });
      }
    }
  };

  const handleMouseMove = (e) => {
    const stage = e.target.getStage();
    const point = stage.getPointerPosition();

    if (isDrawing && selectedTool === 'pen') {
      continueDrawing(point);
    }

    if (shapeStart && previewShape) {
      const width = point.x - shapeStart.x;
      const height = point.y - shapeStart.y;

      setPreviewShape(prev => ({
        ...prev,
        width,
        height,
      }));
    }
  };


  const handleMouseUp = () => {
    if (previewShape && shapeStart) {
      const { x, y, width, height, type } = previewShape;

      const normalizedX = width < 0 ? x + width : x;
      const normalizedY = height < 0 ? y + height : y;
      const normalizedWidth = Math.abs(width);
      const normalizedHeight = Math.abs(height);

      let newShape;

      if (type === 'circle') {
        newShape = {
          object_type: 'circle',
          // ✅ STORE CENTER
          x: normalizedX + normalizedWidth / 2,
          y: normalizedY + normalizedHeight / 2,
          width: normalizedWidth,
          height: normalizedHeight,
          color: selectedColor,
          stroke_width: strokeWidth,
          data: {},
        };
      } else {
        newShape = {
          object_type: 'rectangle',
          x: normalizedX,
          y: normalizedY,
          width: normalizedWidth,
          height: normalizedHeight,
          color: selectedColor,
          stroke_width: strokeWidth,
          data: {},
        };
      }

      addObjectLocal(whiteboardId, newShape).then((obj) => {
        broadcastCreate(obj);
      });

      setPreviewShape(null);
      setShapeStart(null);
      return;
    }

    if (isDrawing && selectedTool === 'pen' && currentDrawing?.length > 1) {

      const startX = currentDrawing[0].x;
      const startY = currentDrawing[0].y;

      const relativePoints = currentDrawing.flatMap(p => [
        p.x - startX,
        p.y - startY
      ]);

      const newLine = {
        object_type: 'freehand',
        x: startX,
        y: startY,
        color: selectedColor,
        stroke_width: strokeWidth,
        data: {
          points: relativePoints,
        },
      };

      addObjectLocal(whiteboardId, newLine).then((obj) => {
        broadcastCreate(obj);
        endDrawing();
      });
    }
  };


  const handleDragEnd = (e, obj) => {
    const node = e.target;
    const updates = { x: node.x(), y: node.y() };

    updateObjectLocal(obj.id, updates).then(() => {
      broadcastUpdate(obj.id, updates);
    });
  };

  const handleTransformEnd = (e, obj) => {
    const node = e.target;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    node.scaleX(1); node.scaleY(1);

    const updates = {
      x: node.x(),
      y: node.y(),
      width: Math.max(5, node.width() * scaleX),
      height: Math.max(5, node.height() * scaleY),
    };

    updateObjectLocal(obj.id, updates).then(() => {
      broadcastUpdate(obj.id, updates);
    });
  };

  const renderObject = (obj) => {
    const commonProps = {
      id: `object-${obj.id}`,
      key: obj.id,
      x: obj.x,
      y: obj.y,
      draggable: selectedTool === 'select',
      stroke: obj.color,
      strokeWidth: obj.stroke_width,
      onClick: () => {
        if (selectedTool === 'select') {
          selectObject(obj.id);
        } else if (selectedTool === 'eraser') {
          deleteObjectLocal(obj.id);
        }
      },
      onDragEnd: (e) => handleDragEnd(e, obj),
      onTransformEnd: (e) => handleTransformEnd(e, obj),
    };

    switch (obj.object_type) {
      case 'rectangle':
        return (
          <Rect
            {...commonProps}
            width={obj.width || 100}
            height={obj.height || 100}
            fill="transparent"
          />
        );

      case 'circle':
        return (
          <Ellipse
            {...commonProps}
            radiusX={obj.width / 2}
            radiusY={obj.height / 2}
            fill="transparent"
          />
        );

      case 'text':
        return (
          <Text
            {...commonProps}
            text={obj.data?.content || ''}
            fontSize={obj.data?.fontSize || 16}
            fontFamily={obj.data?.fontFamily || 'Arial'}
            fill={obj.color}
          />
        );

      case 'freehand':
        return (
          <Line
            {...commonProps}
            points={obj.data?.points || []}
            stroke={obj.color}
            strokeWidth={obj.stroke_width}
            tension={0.5}
            lineCap="round"
            lineJoin="round"
          />
        );

      default:
        return null;
    }
  };

  const renderCurrentDrawing = () => {
    if (!isDrawing || !currentDrawing || currentDrawing.length === 0) return null;

    return (
      <Line
        points={currentDrawing.flatMap((p) => [p.x, p.y])}
        stroke={selectedColor}
        strokeWidth={strokeWidth}
        tension={0.5}
        lineCap="round"
        lineJoin="round"
        dash={[5, 5]}
      />
    );
  };

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
    <div className="bg-gray-50 overflow-hidden">
      <Stage
        ref={stageRef}
        width={dimensions.width}
        height={dimensions.height}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        <Layer>
          {previewShape && (
            previewShape.type === 'rectangle' ? (
              <Rect
                x={previewShape.x}
                y={previewShape.y}
                width={previewShape.width}
                height={previewShape.height}
                stroke={selectedColor}
                strokeWidth={strokeWidth}
                dash={[4, 4]}
              />
            ) : (
              <Ellipse
                x={
                  (previewShape.width < 0
                    ? previewShape.x + previewShape.width
                    : previewShape.x) + Math.abs(previewShape.width) / 2
                }
                y={
                  (previewShape.height < 0
                    ? previewShape.y + previewShape.height
                    : previewShape.y) + Math.abs(previewShape.height) / 2
                }
                radiusX={Math.abs(previewShape.width) / 2}
                radiusY={Math.abs(previewShape.height) / 2}
                stroke={selectedColor}
                strokeWidth={strokeWidth}
                dash={[4, 4]}
              />
            )
          )}
          {objects.map(renderObject)}
          {renderCurrentDrawing()}
          {selectedTool === 'select' && <Transformer ref={transformerRef} />}
        </Layer>
      </Stage>
      {/* Connection status */}
      <div className="absolute top-4 right-4 z-50">
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {isConnected ? 'Live' : 'Connecting...'}
        </div>
      </div>
    </div>
  );
}

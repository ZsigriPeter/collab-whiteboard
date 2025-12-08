// components/whiteboard/Whiteboard.jsx
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBoardStore } from '../../store/boardStore';
import Canvas from './Canvas';
import {
  Pencil,
  MousePointer,
  Square,
  Circle,
  Type,
  Eraser,
  Undo2,
  Redo2,
  Palette,
  Download,
  Share2,
  Trash2,
  Save,
} from 'lucide-react';

const TOOLS = {
  SELECT: 'select',
  PEN: 'pen',
  RECTANGLE: 'rectangle',
  CIRCLE: 'circle',
  TEXT: 'text',
  ERASER: 'eraser',
};

const COLORS = [
  '#000000',
  '#ef4444',
  '#f59e0b',
  '#10b981',
  '#3b82f6',
  '#8b5cf6',
  '#ec4899',
  '#6b7280',
];

export default function Whiteboard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = id === 'new';

  const {
    currentBoard,
    objects,
    fetchBoard,
    createBoard,
    updateBoard,
    saveObjects,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useBoardStore();

  const [tool, setTool] = useState(TOOLS.SELECT);
  const [color, setColor] = useState('#000000');
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [selectedId, setSelectedId] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState([]);

  const currentPathRef = useRef([]);

  useEffect(() => {
    if (isNew) {
      createBoard('Untitled Whiteboard');
    } else if (id) {
      fetchBoard(id);
    }
  }, [id, isNew]);

  // Auto-save every 3 seconds when objects change
  useEffect(() => {
    if (!currentBoard?.id || isNew) return;
    const timer = setTimeout(() => {
      saveObjects(currentBoard.id, objects);
    }, 3000);
    return () => clearTimeout(timer);
  }, [objects, currentBoard?.id]);

  const startDrawing = (e) => {
    if (tool !== TOOLS.PEN && tool !== TOOLS.ERASER) return;
    setIsDrawing(true);
    const stage = e.target.getStage();
    const point = stage.getPointerPosition();
    currentPathRef.current = [point.x, point.y];
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const stage = e.target.getStage();
    const point = stage.getPointerPosition();
    currentPathRef.current = [...currentPathRef.current, point.x, point.y];
    setCurrentPath([...currentPathRef.current]);
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);

    if (tool === TOOLS.PEN && currentPathRef.current.length > 4) {
      const newObj = {
        id: `obj_${Date.now()}`,
        object_type: 'freehand',
        points: currentPathRef.current,
        color,
        stroke_width: strokeWidth,
        x: 0,
        y: 0,
      };
      // Add via store to trigger undo/redo
      useBoardStore.getState().addObject(newObj);
    }

    setCurrentPath([]);
    currentPathRef.current = [];
  };

  const handleObjectChange = (id, attrs) => {
    useBoardStore.getState().updateObject(id, attrs);
  };

  const handleCanvasClick = (e) => {
    if (tool === TOOLS.SELECT) {
      const clickedOnEmpty = e.target === e.target.getStage();
      if (clickedOnEmpty) setSelectedId(null);
      return;
    }

    if (tool === TOOLS.RECTANGLE || tool === TOOLS.CIRCLE) {
      const stage = e.target.getStage();
      const point = stage.getPointerPosition();

      const newObj = {
        id: `obj_${Date.now()}`,
        object_type: tool === TOOLS.RECTANGLE ? 'rectangle' : 'circle',
        x: point.x - 75,
        y: point.y - 75,
        width: 150,
        height: 150,
        radius: 75,
        color,
        stroke_width: strokeWidth,
      };

      useBoardStore.getState().addObject(newObj);
      setTool(TOOLS.SELECT);
    }

    if (tool === TOOLS.TEXT) {
      const text = prompt('Enter text:');
      if (text) {
        const stage = e.target.getStage();
        const point = stage.getPointerPosition();

        useBoardStore.getState().addObject({
          id: `obj_${Date.now()}`,
          object_type: 'text',
          x: point.x,
          y: point.y,
          text,
          font_size: 24,
          color: '#1f2937',
        });
      }
      setTool(TOOLS.SELECT);
    }
  };

  if (!currentBoard) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-xl text-gray-600">Loading whiteboard...</div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex flex-col bg-gray-900">
      {/* Top Toolbar */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/dashboard')} className="text-gray-600 hover:text-gray-900">
            ← Back
          </button>
          <h1 className="text-xl font-semibold text-gray-900">
            {currentBoard.name || 'Untitled'}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={undo}
            disabled={!canUndo}
            className="p-2 rounded hover:bg-gray-100 disabled:opacity-50"
          >
            <Undo2 className="w-5 h-5" />
          </button>
          <button
            onClick={redo}
            disabled={!canRedo}
            className="p-2 rounded hover:bg-gray-100 disabled:opacity-50"
          >
            <Redo2 className="w-5 h-5" />
          </button>
          <button className="p-2 rounded hover:bg-gray-100">
            <Save className="w-5 h-5" />
          </button>
          <button className="p-2 rounded hover:bg-gray-100">
            <Download className="w-5 h-5" />
          </button>
          <button className="p-2 rounded hover:bg-gray-100">
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex flex-1">
        {/* Left Toolbar */}
        <div className="w-20 bg-white border-r border-gray-200 flex flex-col items-center py-6 gap-3">
          {[
            { tool: TOOLS.SELECT, icon: MousePointer },
            { tool: TOOLS.PEN, icon: Pencil },
            { tool: TOOLS.RECTANGLE, icon: Square },
            { tool: TOOLS.CIRCLE, icon: Circle },
            { tool: TOOLS.TEXT, icon: Type },
            { tool: TOOLS.ERASER, icon: Eraser },
          ].map(({ tool: t, icon: Icon }) => (
            <button
              key={t}
              onClick={() => setTool(t)}
              className={`p-3 rounded-lg transition ${
                tool === t
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              <Icon className="w-6 h-6" />
            </button>
          ))}

          <div className="h-px w-12 bg-gray-300 my-4" />

          {/* Color Picker */}
          <div className="flex flex-col gap-2">
            {COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`w-10 h-10 rounded-lg border-4 transition ${
                  color === c ? 'border-indigo-600 scale-110' : 'border-white'
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>

          {/* Stroke Width */}
          <div className="flex flex-col items-center gap-2 mt-4">
            {[2, 4, 8, 12].map((w) => (
              <button
                key={w}
                onClick={() => setStrokeWidth(w)}
                className={`w-10 h-10 rounded-full border-2 border-gray-400 flex items-center justify-center transition ${
                  strokeWidth === w ? 'ring-4 ring-indigo-300' : ''
                }`}
              >
                <div className="bg-black rounded-full" style={{ width: w * 2, height: w * 2 }} />
              </button>
            ))}
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 relative">
          <Canvas
            objects={[...objects, ...(currentPath.length > 0 ? [{
              id: 'temp-path',
              object_type: 'freehand',
              points: currentPath,
              color,
              stroke_width: strokeWidth,
              x: 0,
              y: 0,
            }] : [])]}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onChange={handleObjectChange}
            onMouseDown={(e) => {
              handleCanvasClick(e);
              startDrawing(e);
            }}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
          />
        </div>
      </div>
    </div>
  );
}
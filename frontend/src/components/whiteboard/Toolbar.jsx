import { useCanvasStore } from '../../store/canvasStore';
import {
  MousePointer2,
  Pen,
  Square,
  Circle,
  Type,
  Eraser,
  Trash2,
  Download,
} from 'lucide-react';

export default function Toolbar() {
  const { selectedTool, setTool, selectedColor, setColor, strokeWidth, setStrokeWidth } =
    useCanvasStore();

  const tools = [
    { name: 'select', icon: MousePointer2, label: 'Select' },
    { name: 'pen', icon: Pen, label: 'Pen' },
    { name: 'rectangle', icon: Square, label: 'Rectangle' },
    { name: 'circle', icon: Circle, label: 'Circle' },
    { name: 'text', icon: Type, label: 'Text' },
    { name: 'eraser', icon: Eraser, label: 'Eraser' },
  ];

  return (
    <div className="fixed top-0 left-0 right-0 bg-white shadow-md border-b border-gray-200 z-50">
      <div className="flex items-center justify-between px-6 py-3">
        {/* Left: Tools */}
        <div className="flex items-center gap-2">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <button
                key={tool.name}
                onClick={() => setTool(tool.name)}
                className={`p-3 rounded-lg transition ${
                  selectedTool === tool.name
                    ? 'bg-indigo-100 text-indigo-600'
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
                title={tool.label}
              >
                <Icon size={20} />
              </button>
            );
          })}

          <div className="w-px h-8 bg-gray-300 mx-2" />

          {/* Color Picker */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Color:</span>
            <input
              type="color"
              value={selectedColor}
              onChange={(e) => setColor(e.target.value)}
              className="w-10 h-10 rounded border border-gray-300 cursor-pointer"
            />
          </div>

          {/* Stroke Width */}
          <div className="flex items-center gap-2 ml-4">
            <span className="text-sm text-gray-600">Width:</span>
            <input
              type="range"
              min="1"
              max="10"
              value={strokeWidth}
              onChange={(e) => setStrokeWidth(Number(e.target.value))}
              className="w-24"
            />
            <span className="text-sm text-gray-700 w-6">{strokeWidth}</span>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <button className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition flex items-center gap-2">
            <Trash2 size={18} />
            Clear
          </button>
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center gap-2">
            <Download size={18} />
            Export
          </button>
        </div>
      </div>
    </div>
  );
}
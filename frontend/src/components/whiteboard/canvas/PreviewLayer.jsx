
import { Line, Rect, Ellipse } from 'react-konva';
import { useCanvasStore } from '../../../store/canvasStore';

export default function PreviewLayer({ previewShape, currentDrawing }) {
  const { selectedColor, strokeWidth } = useCanvasStore();

  return (
    <>
      {/* Preview shape while drawing */}
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

      {/* Current freehand drawing preview */}
      {currentDrawing && currentDrawing.length > 0 && (
        <Line
          points={currentDrawing.flatMap((p) => [p.x, p.y])}
          stroke={selectedColor}
          strokeWidth={strokeWidth}
          tension={0.5}
          lineCap="round"
          lineJoin="round"
          dash={[5, 5]}
        />
      )}
    </>
  );
}
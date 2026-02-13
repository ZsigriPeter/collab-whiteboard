import { useRef, useState, useEffect } from 'react';
import { Stage, Layer } from 'react-konva';
import { useCanvasStore } from '../../../store/canvasStore';
import CanvasObjects from './CanvasObjects';
import PreviewLayer from './PreviewLayer';
import TransformerLayer from './TransformerLayer';

export default function CanvasStage({
  objects,
  previewShape,
  currentDrawing,
  onMouseDown,
  onMouseMove,
  onMouseUp,
  onDragEnd,
  onTransformEnd,
  onObjectClick,
}) {
  const stageRef = useRef(null);
  const { deselectObject } = useCanvasStore();

  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight - 64,
  });

  // Handle window resize
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

  const handleStageClick = (e) => {
    // Deselect if clicking on empty space
    if (e.target === e.target.getStage()) {
      deselectObject();
    }
  };

  return (
    <Stage
      ref={stageRef}
      width={dimensions.width}
      height={dimensions.height}
      onMouseDown={(e) => {
        handleStageClick(e);
        const point = e.target.getStage().getPointerPosition();
        onMouseDown(point);
      }}
      onMouseMove={(e) => {
        const point = e.target.getStage().getPointerPosition();
        onMouseMove(point);
      }}
      onMouseUp={onMouseUp}
    >
      <Layer>
        {/* Preview shapes */}
        <PreviewLayer 
          previewShape={previewShape} 
          currentDrawing={currentDrawing} 
        />

        {/* Actual objects */}
        <CanvasObjects
          objects={objects}
          onDragEnd={onDragEnd}
          onTransformEnd={onTransformEnd}
          onObjectClick={onObjectClick}
        />

        {/* Transformer for resizing */}
        <TransformerLayer stageRef={stageRef} />
      </Layer>
    </Stage>
  );
}
import { useState } from 'react';
import { useCanvasStore } from '../../../store/canvasStore';

export function useCanvasDrawing(whiteboardId, onComplete) {
  const [shapeStart, setShapeStart] = useState(null);
  const [previewShape, setPreviewShape] = useState(null);

  const {
    selectedTool,
    selectedColor,
    strokeWidth,
    isDrawing,
    currentDrawing,
    startDrawing,
    continueDrawing,
    endDrawing,
  } = useCanvasStore();

  const handleMouseDown = (point) => {
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
        onComplete(newText);
      }
    }
  };

  const handleMouseMove = (point) => {
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
    // Handle shape completion
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

      onComplete(newShape);
      setPreviewShape(null);
      setShapeStart(null);
      return;
    }

    // Handle freehand drawing completion
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

      onComplete(newLine);
      endDrawing();
    }
  };

  return {
    previewShape,
    currentDrawing,
    isDrawing,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
  };
}
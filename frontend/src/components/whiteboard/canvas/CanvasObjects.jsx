import { Rect, Circle, Ellipse, Line, Text } from 'react-konva';
import { useCanvasStore } from '../../../store/canvasStore';

export default function CanvasObjects({ 
  objects, 
  onDragEnd, 
  onTransformEnd, 
  onObjectClick 
}) {
  const { selectedTool } = useCanvasStore();

  const renderObject = (obj) => {
    const commonProps = {
      id: `object-${obj.id}`,
      key: obj.id,
      x: obj.x,
      y: obj.y,
      draggable: selectedTool === 'select',
      stroke: obj.color,
      strokeWidth: obj.stroke_width,
      onClick: () => onObjectClick(obj),
      onDragEnd: (e) => onDragEnd(e, obj),
      onTransformEnd: (e) => onTransformEnd(e, obj),
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

  return <>{objects.map(renderObject)}</>;
}
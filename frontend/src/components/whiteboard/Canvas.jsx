import { useEffect, useRef, useState } from 'react';
import { Stage, Layer, Rect, Circle, Line, Text, Transformer } from 'react-konva';

export default function Canvas({ objects = [], selectedId, onSelect, onChange }) {
  const [dimensions, setDimensions] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 800,
    height: typeof window !== 'undefined' ? window.innerHeight - 64 : 600,
  });

  const stageRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight - 64, // Adjust for your toolbar height
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle selection + transformer
  const handleSelect = (e, obj) => {
    e.cancelBubble = true;
    onSelect?.(obj.id);
  };

  const handleDragEnd = (e, obj) => {
    onChange?.(obj.id, {
      x: e.target.x(),
      y: e.target.y(),
    });
  };

  const renderObject = (obj) => {
    const isSelected = selectedId === obj.id;

    const commonProps = {
      id: obj.id,
      x: obj.x || 0,
      y: obj.y || 0,
      draggable: true,
      stroke: obj.color || '#4f46e5',
      strokeWidth: obj.stroke_width || 3,
      strokeScaleEnabled: false, // Prevent stroke scaling on zoom
      perfectDrawEnabled: false,
      shadowBlur: isSelected ? 12 : 0,
      shadowColor: 'rgba(79, 70, 229, 0.4)',
      shadowOffset: { x: 0, y: 4 },
      shadowOpacity: 0.6,
      onClick: (e) => handleSelect(e, obj),
      onTap: (e) => handleSelect(e, obj),
      onDragEnd: (e) => handleDragEnd(e, obj),
    };

    switch (obj.object_type) {
      case 'rectangle':
        return (
          <Rect
            {...commonProps}
            key={obj.id}
            width={obj.width || 200}
            height={obj.height || 120}
            fill="transparent"
            cornerRadius={6}
          />
        );

      case 'circle':
        return (
          <Circle
            {...commonProps}
            key={obj.id}
            radius={obj.radius || Math.min(obj.width || 100, obj.height || 100) / 2}
            fill="transparent"
          />
        );

      case 'text':
        return (
          <Text
            {...commonProps}
            key={obj.id}
            text={obj.text || 'Click to edit'}
            fontSize={obj.font_size || 24}
            fontFamily={obj.font_family || 'Inter, sans-serif'}
            fill={obj.color || '#1f2937'}
            align="center"
            verticalAlign="middle"
            width={obj.width || 300}
            padding={10}
            draggable={true}
          />
        );

      case 'freehand':
      case 'pen':
        return (
          <Line
            {...commonProps}
            key={obj.id}
            points={obj.points || []}
            lineCap="round"
            lineJoin="round"
            tension={0.3}
            fill="transparent"
            closed={false}
            globalCompositeOperation="source-over"
          />
        );

      default:
        return null;
    }
  };

  // Find selected object for Transformer
  const selectedObject = objects.find((obj) => obj.id === selectedId);

  return (
    <div className="fixed inset-0 top-16 bg-gray-50 overflow-hidden"> {/* top-16 = toolbar height */}
      <Stage
        ref={stageRef}
        width={dimensions.width}
        height={dimensions.height}
        className="bg-white shadow-inner"
      >
        <Layer>
          {/* Render all objects */}
          {objects.map(renderObject)}

          {/* Transformer for selected object */}
          {selectedObject && (
            <Transformer
              nodes={stageRef.current?.findOne(`#${selectedId}`) ? [stageRef.current.findOne(`#${selectedId}`)] : []}
              anchorStroke="#4f46e5"
              anchorFill="#ffffff"
              anchorSize={10}
              borderStroke="#4f46e5"
              borderStrokeWidth={2}
              padding={10}
              rotateEnabled={selectedObject.object_type !== 'pen' && selectedObject.object_type !== 'freehand'}
              keepRatio={selectedObject.object_type === 'circle'}
              enabledAnchors={
                selectedObject.object_type === 'text'
                  ? ['top-left', 'top-right', 'bottom-left', 'bottom-right']
                  : undefined
              }
            />
          )}
        </Layer>
      </Stage>
    </div>
  );
}
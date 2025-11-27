import { useEffect, useRef, useState } from 'react';
import { Stage, Layer, Rect, Circle, Line, Text, Transformer } from 'react-konva';

export default function Canvas({ objects = [], selectedId, onSelect, onChange }) {
  const [dimensions, setDimensions] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 800,
    height: typeof window !== 'undefined' ? window.innerHeight - 64 : 600,
  });

  const stageRef = useRef(null);
  const transformerRef = useRef(null);

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

  // This is the key: Update Transformer ONLY after render
  useEffect(() => {
    if (!selectedId || !stageRef.current || !transformerRef.current) {
      // If nothing selected, clear transformer
      transformerRef.current?.nodes([]);
      transformerRef.current?.getLayer()?.batchDraw();
      return;
    }

    const stage = stageRef.current;
    const selectedNode = stage.findOne(`#${selectedId}`);

    if (selectedNode) {
      transformerRef.current.nodes([selectedNode]);
      transformerRef.current.getLayer()?.batchDraw();
    }
  }, [selectedId, objects]); // Re-run when selection or objects change

  const handleSelect = (e) => {
    e.cancelBubble = true;
    const clickedOnTransformer = e.target.getParent()?.className === 'Transformer';
    if (clickedOnTransformer) return;

    const id = e.target.id();
    if (id) {
      onSelect?.(id);
    } else if (e.target === stageRef.current) {
      onSelect?.(null); // Clicked on empty space
    }
  };

  const handleDragEnd = (e) => {
    const node = e.target;
    onChange?.(node.id(), {
      x: node.x(),
      y: node.y(),
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
      strokeScaleEnabled: false,
      shadowBlur: isSelected ? 12 : 0,
      shadowColor: 'rgba(79, 70, 229, 0.4)',
      shadowOffset: { x: 0, y: 4 },
      shadowOpacity: 0.6,
      onClick: handleSelect,
      onTap: handleSelect,
      onDragEnd: handleDragEnd,
    };

    switch (obj.object_type) {
      case 'rectangle':
        return (
          <Rect
            {...commonProps}
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
            radius={obj.radius || 80}
            fill="transparent"
          />
        );

      case 'text':
        return (
          <Text
            {...commonProps}
            text={obj.text || 'Double-click to edit'}
            fontSize={obj.font_size || 24}
            fill={obj.color || '#1f2937'}
            width={obj.width || 300}
            padding={10}
          />
        );

      case 'freehand':
      case 'pen':
        return (
          <Line
            {...commonProps}
            points={obj.points || []}
            lineCap="round"
            lineJoin="round"
            tension={0.3}
            fill="transparent"
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 top-16 bg-gray-50 overflow-hidden">
      <Stage
        ref={stageRef}
        width={dimensions.width}
        height={dimensions.height}
        onMouseDown={handleSelect}
        onTouchStart={handleSelect}
      >
        <Layer>
          {objects.map(renderObject)}

          {/* Transformer — never access stageRef here! */}
          <Transformer
            ref={transformerRef}
            boundBoxFunc={(oldBox, newBox) => {
              // Optional: prevent too-small shapes
              if (newBox.width < 20 || newBox.height < 20) {
                return oldBox;
              }
              return newBox;
            }}
            anchorStroke="#4f46e5"
            anchorFill="#ffffff"
            anchorSize={10}
            borderStroke="#4f46e5"
            borderStrokeWidth={2}
            padding={10}
            rotateEnabled={true}
            keepRatio={false}
          />
        </Layer>
      </Stage>
    </div>
  );
}
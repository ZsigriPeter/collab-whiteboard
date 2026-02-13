import { useEffect, useRef } from 'react';
import { Transformer } from 'react-konva';
import { useCanvasStore } from '../../../store/canvasStore';

export default function TransformerLayer({ stageRef }) {
  const transformerRef = useRef(null);
  const { selectedObjectId, selectedTool } = useCanvasStore();

  useEffect(() => {
    if (selectedObjectId && transformerRef.current && stageRef.current) {
      const selectedNode = stageRef.current.findOne(`#object-${selectedObjectId}`);
      if (selectedNode) {
        transformerRef.current.nodes([selectedNode]);
        transformerRef.current.getLayer().batchDraw();
      }
    }
  }, [selectedObjectId, stageRef]);

  if (selectedTool !== 'select') return null;

  return <Transformer ref={transformerRef} />;
}
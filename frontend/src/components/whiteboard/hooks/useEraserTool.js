
import { useCanvasStore } from '../../../store/canvasStore';

export function useEraserTool(onDelete) {
  const { selectedTool } = useCanvasStore();

  const handleObjectClick = (objectId) => {
    if (selectedTool === 'eraser') {
      onDelete(objectId);
      return true; 
    }
    return false;
  };

  return {
    isEraserActive: selectedTool === 'eraser',
    handleObjectClick,
  };
}
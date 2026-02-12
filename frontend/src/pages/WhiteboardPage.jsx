import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBoardStore } from '../store/boardStore';
import { useRealtimeStore } from '../store/realtimeStore';
import { useAuthStore } from '../store/authStore';
import Toolbar from '../components/whiteboard/Toolbar';
import Canvas from '../components/whiteboard/Canvas';
import { ArrowLeft, Users } from 'lucide-react';

export default function WhiteboardPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentBoard, fetchBoard, isLoading } = useBoardStore();
  const { user } = useAuthStore();
  const { connect, disconnect, onlineUsers } = useRealtimeStore();

  useEffect(() => {
    console.log('📋 WhiteboardPage mounted, ID:', id);
    if (id) {
      fetchBoard(id);
    }
  }, [id, fetchBoard]);

  useEffect(() => {
    if (!id || !user) return;

    connect(id, user);

    return () => {
      disconnect();
    };
  }, [id, user]);


  if (isLoading || !currentBoard) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading whiteboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between z-50">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-800">{currentBoard.name}</h1>
            <p className="text-sm text-gray-500">
              {currentBoard.is_public ? 'Public' : 'Private'} whiteboard
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-gray-600">
            <Users size={18} />
            <span className="text-sm">
              {onlineUsers.length} user{onlineUsers.length !== 1 && "s"} online
            </span>

          </div>
          {user && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-medium">
                {user.username?.[0]?.toUpperCase()}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Toolbar */}
      <Toolbar />

      {/* Canvas */}
      <div className="flex-1 mt-16">
        <Canvas />
      </div>
    </div>
  );
}
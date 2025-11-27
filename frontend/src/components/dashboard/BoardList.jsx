import { useEffect } from 'react';
import { useBoardStore } from '../../store/boardStore';
import { useNavigate } from 'react-router-dom';
import { Plus, Users, Lock, Globe, Calendar, Loader2 } from 'lucide-react';

export default function BoardList() {
  const { boards, fetchBoards, isLoading } = useBoardStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchBoards();
  }, [fetchBoards]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">My Whiteboards</h1>
            <button
              onClick={() => navigate('/whiteboard/new')}
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-5 rounded-lg transition shadow-sm hover:shadow-md"
            >
              <Plus className="w-5 h-5" />
              New Whiteboard
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
            <p className="mt-4 text-gray-600 text-lg">Loading your whiteboards...</p>
          </div>
        ) : boards.length === 0 ? (
          /* Empty State */
          <div className="text-center py-24">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gray-100 rounded-full mb-8">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">No whiteboards yet</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Get started by creating your first whiteboard. Collaborate in real-time with your team!
            </p>
            <button
              onClick={() => navigate('/whiteboard/new')}
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-6 rounded-lg transition"
            >
              <Plus className="w-5 h-5" />
              Create Your First Whiteboard
            </button>
          </div>
        ) : (
          /* Board Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {boards.map((board) => (
              <div
                key={board.id}
                onClick={() => navigate(`/whiteboard/${board.id}`)}
                className="group bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden border border-gray-200 hover:border-indigo-300"
              >
                {/* Thumbnail / Avatar */}
                <div className="aspect-w-16 aspect-h-9 bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg text-3xl font-bold text-indigo-600 group-hover:scale-110 transition-transform">
                    {board.name.charAt(0).toUpperCase()}
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-5">
                  <h3 className="font-semibold text-lg text-gray-900 truncate">
                    {board.name}
                  </h3>

                  <div className="mt-3 flex items-center gap-4 text-sm text-gray-500">
                    {/* Visibility */}
                    <div className="flex items-center gap-1.5">
                      {board.is_public ? (
                        <>
                          <Globe className="w-4 h-4 text-green-600" />
                          <span className="text-green-700 font-medium">Public</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-600">Private</span>
                        </>
                      )}
                    </div>

                    {/* Created Date */}
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(board.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}</span>
                    </div>
                  </div>

                  {/* Optional: Owner or collaborators */}
                  {board.owner && (
                    <p className="mt-3 text-xs text-gray-500">
                      Owned by <span className="font-medium">{board.owner}</span>
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
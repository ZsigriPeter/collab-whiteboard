import { useEffect } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';

import { useAuthStore } from './store/authStore';

import Login from './components/auth/Login';
import BoardList from './components/dashboard/BoardList';
import Whiteboard from './components/whiteboard/Whiteboard'; // We'll create this next!
import Layout from './components/layout/Layout';

// Optional: A simple loading spinner
const Loader = () => (
  <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
    <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
  </div>
);

// Protected Route — only allows access if authenticated
function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return <Loader />;
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

// Public Route — redirect to dashboard if already logged in
function PublicRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return <Loader />;
  }

  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
}

// Optional: Layout wrapper (header, sidebar, etc.)
// You can create this later — for now it's just a placeholder
function DefaultLayout({ children }) {
  return <Layout>{children}</Layout>;
}

function App() {
  const { loadUser } = useAuthStore();

  // Try to load user from token/localStorage on app start
  useEffect(() => {
    loadUser();
  }, [loadUser]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DefaultLayout>
                <BoardList />
              </DefaultLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/whiteboard/:id"
          element={
            <ProtectedRoute>
              <DefaultLayout>
                <Whiteboard />
              </DefaultLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/whiteboard/new"
          element={
            <ProtectedRoute>
              <DefaultLayout>
                <Whiteboard /> {/* Same component — detects "new" and creates */}
              </DefaultLayout>
            </ProtectedRoute>
          }
        />

        {/* Root redirect */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
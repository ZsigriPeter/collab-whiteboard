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
import Layout from './components/layout/Layout';
import WhiteboardPage from './pages/WhiteboardPage';

const Loader = () => (
  <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
    <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
  </div>
);

function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading, user } = useAuthStore();

  if (isLoading) {
    return <Loader />;
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return <Loader />;
  }

  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
}

function DefaultLayout({ children }) {
  return <Layout>{children}</Layout>;
}

function App() {
  const { loadUser } = useAuthStore();

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
                <WhiteboardPage />
              </DefaultLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/whiteboard/new"
          element={
            <ProtectedRoute>
              <DefaultLayout>
                <WhiteboardPage />
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
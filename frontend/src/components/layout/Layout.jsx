import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="pt-16"> {/* Matches Canvas top-16 offset */}
        {children || <Outlet />}
      </main>
    </div>
  );
}
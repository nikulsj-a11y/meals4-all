import { ReactNode } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import {
  LayoutDashboard,
  Store,
  BarChart3,
  LogOut,
  User
} from 'lucide-react';
import Button from './Button';

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const sidebarItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Vendors', path: '/admin/vendors', icon: Store },
    { name: 'Analytics', path: '/admin/analytics', icon: BarChart3 },
    { name: 'Profile', path: '/admin/profile', icon: User },
  ];

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="flex h-screen bg-macos-mesh">
      <Sidebar items={sidebarItems} title="Admin Portal" />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="glass z-10 border-b border-white/20">
          <div className="px-6 lg:px-8 py-4 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">Super Admin Dashboard</h2>
              <p className="text-sm text-gray-500">{user?.email}</p>
            </div>
            <Button onClick={handleLogout} variant="secondary" className="flex items-center gap-2">
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="px-6 lg:px-8 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;

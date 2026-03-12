import { ReactNode, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  BarChart3,
  FileText,
  Users,
  LogOut,
  User,
  Menu,
  UtensilsCrossed
} from 'lucide-react';

interface VendorLayoutProps {
  children: ReactNode;
}

const VendorLayout = ({ children }: VendorLayoutProps) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const sidebarItems = [
    { name: 'Dashboard', path: '/vendor/dashboard', icon: LayoutDashboard },
    { name: 'Categories', path: '/vendor/categories', icon: Package },
    { name: 'Products', path: '/vendor/products', icon: ShoppingBag },
    { name: 'Orders', path: '/vendor/orders', icon: FileText },
    { name: 'Customers', path: '/vendor/customers', icon: Users },
    { name: 'Analytics', path: '/vendor/analytics', icon: BarChart3 },
    { name: 'Profile', path: '/vendor/profile', icon: User },
  ];

  const handleLogout = () => {
    logout();
    navigate('/vendor/login');
  };

  return (
    <div className="flex h-screen bg-macos-mesh">
      <Sidebar items={sidebarItems} title="Vendor Portal" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="glass z-10 border-b border-white/20">
          <div className="px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
            <div className="flex items-center gap-3">
              {/* Mobile hamburger */}
              <button onClick={() => setSidebarOpen(true)} className="md:hidden w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-all">
                <Menu className="w-5 h-5" />
              </button>
              {/* Mobile logo */}
              <div className="md:hidden w-8 h-8 rounded-xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center">
                <UtensilsCrossed className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="text-sm sm:text-lg font-semibold text-gray-800">Welcome back, {user?.name || 'Vendor'}</h2>
                <p className="text-xs sm:text-sm text-gray-500">{user?.email}</p>
              </div>
            </div>
            <button onClick={handleLogout} className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 active:scale-[0.97] transition-all">
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default VendorLayout;

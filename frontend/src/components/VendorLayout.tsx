import { ReactNode } from 'react';
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
  User
} from 'lucide-react';
import Button from './Button';

interface VendorLayoutProps {
  children: ReactNode;
}

const VendorLayout = ({ children }: VendorLayoutProps) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

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
    <div className="flex h-screen bg-gray-100">
      <Sidebar items={sidebarItems} title="Vendor Portal" />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-white shadow-sm z-10">
          <div className="px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Welcome back, {user?.name || 'Vendor'}</h2>
              <p className="text-sm text-gray-600">{user?.email}</p>
            </div>
            <Button onClick={handleLogout} variant="secondary" className="flex items-center gap-2">
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default VendorLayout;


import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { Vendor, Analytics } from '../../types';
import AdminLayout from '../../components/AdminLayout';
import StatCard from '../../components/StatCard';
import Card from '../../components/Card';
import { TrendingUp, Users, DollarSign } from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'daily' | 'monthly'>('daily');

  useEffect(() => {
    fetchDashboardData();
  }, [period]);

  const fetchDashboardData = async () => {
    try {
      const [vendorsRes, analyticsRes] = await Promise.all([
        api.get('/admin/vendors'),
        api.get(`/admin/analytics?period=${period}`),
      ]);
      setVendors(vendorsRes.data.vendors);
      setAnalytics(analyticsRes.data.analytics);
    } catch (error: any) {
      toast.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      {/* Welcome Section */}
      <Card className="mb-8 bg-gradient-to-r from-primary-50 to-primary-100 border-primary-200">
        <div className="text-center py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome, {user?.name || 'Admin'}! 👋
          </h1>
          <p className="text-gray-600">
            Here's a quick overview of your platform
          </p>
        </div>
      </Card>

      {/* Period Selector */}
      <div className="mb-6 flex justify-end">
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value as 'daily' | 'monthly')}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
        >
          <option value="daily">Today</option>
          <option value="monthly">This Month</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <p className="mt-2 text-sm text-gray-600">Loading dashboard...</p>
        </div>
      ) : (
        <>
          {/* Minimal Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              title="Total Orders"
              value={analytics?.salesSummary.totalOrders || 0}
              icon={TrendingUp}
              iconColor="text-primary-600"
              subtitle={period === 'daily' ? 'Today' : 'This month'}
            />
            <StatCard
              title="Total Sales"
              value={`₹${analytics?.salesSummary.totalSales || 0}`}
              icon={DollarSign}
              iconColor="text-green-600"
              subtitle={period === 'daily' ? 'Today' : 'This month'}
            />
            <StatCard
              title="Active Vendors"
              value={vendors.filter(v => v.isActive).length}
              icon={Users}
              iconColor="text-blue-600"
              subtitle={`${vendors.length} total`}
            />
          </div>
        </>
      )}
    </AdminLayout>
  );
};

export default AdminDashboard;

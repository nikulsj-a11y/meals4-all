import { useState, useEffect } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import VendorLayout from '../../components/VendorLayout';
import PageHeader from '../../components/PageHeader';
import StatCard from '../../components/StatCard';
import Card from '../../components/Card';
import { ShoppingBag, DollarSign, TrendingUp, Package } from 'lucide-react';

interface Analytics {
  salesSummary: {
    totalOrders: number;
    totalSales: number;
    avgOrderValue: number;
  };
  ordersByStatus: Array<{
    _id: string;
    count: number;
  }>;
  topItems: Array<{
    _id: string;
    totalQuantity: number;
    totalRevenue: number;
  }>;
}

const VendorAnalytics = () => {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/vendor/analytics?period=${period}`);
      setAnalytics(response.data.analytics);
    } catch (error: any) {
      toast.error('Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-blue-100 text-blue-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <VendorLayout>
      <PageHeader
        title="Analytics"
        subtitle="Track your business performance"
        action={
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as 'daily' | 'weekly' | 'monthly')}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="daily">Today</option>
            <option value="weekly">This Week</option>
            <option value="monthly">This Month</option>
          </select>
        }
      />

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <p className="mt-2 text-sm text-gray-600">Loading analytics...</p>
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Total Orders"
              value={analytics?.salesSummary.totalOrders || 0}
              icon={ShoppingBag}
              iconColor="text-blue-600"
              subtitle={`${period === 'daily' ? 'Today' : period === 'weekly' ? 'This week' : 'This month'}`}
            />
            <StatCard
              title="Total Sales"
              value={`₹${analytics?.salesSummary.totalSales.toFixed(2) || 0}`}
              icon={DollarSign}
              iconColor="text-green-600"
              subtitle={`${period === 'daily' ? 'Today' : period === 'weekly' ? 'This week' : 'This month'}`}
            />
            <StatCard
              title="Avg Order Value"
              value={`₹${analytics?.salesSummary.avgOrderValue.toFixed(2) || 0}`}
              icon={TrendingUp}
              iconColor="text-purple-600"
              subtitle="Per order"
            />
            <StatCard
              title="Top Items"
              value={analytics?.topItems.length || 0}
              icon={Package}
              iconColor="text-orange-600"
              subtitle="Best sellers"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Order Status Breakdown */}
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Orders by Status</h3>
              <div className="space-y-3">
                {analytics?.ordersByStatus.map((status) => (
                  <div key={status._id} className="flex items-center justify-between">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(status._id)}`}>
                      {status._id.charAt(0).toUpperCase() + status._id.slice(1)}
                    </span>
                    <span className="text-lg font-semibold text-gray-900">{status.count}</span>
                  </div>
                ))}
                {(!analytics?.ordersByStatus || analytics.ordersByStatus.length === 0) && (
                  <p className="text-sm text-gray-500 text-center py-4">No orders yet</p>
                )}
              </div>
            </Card>

            {/* Top Selling Items */}
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Selling Items</h3>
              <div className="space-y-3">
                {analytics?.topItems.map((item, index) => (
                  <div key={item._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-100 text-primary-600 font-semibold text-sm">
                        {index + 1}
                      </span>
                      <div>
                        <p className="font-medium text-gray-900">{item._id}</p>
                        <p className="text-sm text-gray-500">{item.totalQuantity} sold</p>
                      </div>
                    </div>
                    <span className="font-semibold text-green-600">₹{item.totalRevenue.toFixed(2)}</span>
                  </div>
                ))}
                {(!analytics?.topItems || analytics.topItems.length === 0) && (
                  <p className="text-sm text-gray-500 text-center py-4">No sales data yet</p>
                )}
              </div>
            </Card>
          </div>
        </>
      )}
    </VendorLayout>
  );
};

export default VendorAnalytics;


import { useState, useEffect } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import AdminLayout from '../../components/AdminLayout';
import Card from '../../components/Card';
import StatCard from '../../components/StatCard';
import { TrendingUp, DollarSign, Store, ShoppingBag } from 'lucide-react';

interface VendorStat {
  vendorId: string;
  vendorName: string;
  totalOrders: number;
  totalSales: number;
}

interface Analytics {
  vendorStats: VendorStat[];
  salesSummary: {
    totalOrders: number;
    totalSales: number;
  };
  period: string;
}

const AdminAnalytics = () => {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [period, setPeriod] = useState<'daily' | 'monthly'>('daily');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/admin/analytics?period=${period}`);
      setAnalytics(response.data.analytics);
    } catch (error: any) {
      toast.error('Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Platform Analytics</h2>
        <p className="text-sm text-gray-600">View comprehensive platform performance metrics</p>
      </div>

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
          <p className="mt-2 text-sm text-gray-600">Loading analytics...</p>
        </div>
      ) : (
        <>
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatCard
              title="Total Orders"
              value={analytics?.salesSummary.totalOrders || 0}
              icon={ShoppingBag}
              iconColor="text-blue-600"
              subtitle={period === 'daily' ? 'Today' : 'This month'}
            />
            <StatCard
              title="Total Revenue"
              value={`₹${analytics?.salesSummary.totalSales.toFixed(2) || 0}`}
              icon={DollarSign}
              iconColor="text-green-600"
              subtitle={period === 'daily' ? 'Today' : 'This month'}
            />
            <StatCard
              title="Active Vendors"
              value={analytics?.vendorStats.length || 0}
              icon={Store}
              iconColor="text-purple-600"
              subtitle="With orders"
            />
          </div>

          {/* Vendor Performance Table */}
          <Card>
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Vendor Performance</h3>
              <p className="text-sm text-gray-600">Sales breakdown by vendor</p>
            </div>

            {analytics?.vendorStats && analytics.vendorStats.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-white/20">
                  <thead className="bg-white/30">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Vendor Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Orders
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Sales
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Avg Order Value
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/20">
                    {analytics.vendorStats.map((vendor) => (
                      <tr key={vendor.vendorId} className="hover:bg-white/30">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{vendor.vendorName}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600">{vendor.totalOrders}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-green-600">
                            ₹{vendor.totalSales.toFixed(2)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600">
                            ₹{(vendor.totalSales / vendor.totalOrders).toFixed(2)}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">No sales data available for this period</p>
              </div>
            )}
          </Card>
        </>
      )}
    </AdminLayout>
  );
};

export default AdminAnalytics;


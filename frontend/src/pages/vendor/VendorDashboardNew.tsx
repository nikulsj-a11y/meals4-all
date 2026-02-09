import { useState, useEffect } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import VendorLayout from '../../components/VendorLayout';
import PageHeader from '../../components/PageHeader';
import StatCard from '../../components/StatCard';
import Card from '../../components/Card';
import Table from '../../components/Table';
import { ShoppingBag, DollarSign, Package, Users, Clock } from 'lucide-react';
import { Order } from '../../types';

const VendorDashboardNew = () => {
  const [salesSummary, setSalesSummary] = useState({ totalOrders: 0, totalSales: 0 });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState({
    totalCategories: 0,
    totalProducts: 0,
    totalCustomers: 0,
    pendingOrders: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [salesRes, ordersRes, categoriesRes, itemsRes, customersRes] = await Promise.all([
        api.get('/vendor/sales-summary?period=daily'),
        api.get('/vendor/orders'),
        api.get('/vendor/categories'),
        api.get('/vendor/food-items'),
        api.get('/vendor/customers'),
      ]);

      setSalesSummary(salesRes.data.summary);
      setRecentOrders(ordersRes.data.orders.slice(0, 5));
      setStats({
        totalCategories: categoriesRes.data.count,
        totalProducts: itemsRes.data.count,
        totalCustomers: customersRes.data.count,
        pendingOrders: ordersRes.data.orders.filter((o: Order) => o.status === 'pending').length,
      });
    } catch (error: any) {
      toast.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      accepted: 'bg-blue-100 text-blue-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const orderColumns = [
    {
      header: 'Order #',
      accessor: 'orderNumber',
      cell: (row: Order) => (
        <span className="font-medium text-primary-600">{row.orderNumber}</span>
      ),
    },
    {
      header: 'Customer',
      accessor: 'userMobile',
    },
    {
      header: 'Items',
      accessor: 'items',
      cell: (row: Order) => (
        <span className="text-gray-600">{row.items.length} items</span>
      ),
    },
    {
      header: 'Amount',
      accessor: 'totalAmount',
      cell: (row: Order) => (
        <span className="font-semibold text-gray-900">₹{row.totalAmount}</span>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      cell: (row: Order) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(row.status)}`}>
          {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
        </span>
      ),
    },
  ];

  return (
    <VendorLayout>
      <PageHeader
        title="Dashboard"
        subtitle="Welcome to your vendor dashboard"
      />

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <p className="mt-2 text-sm text-gray-600">Loading dashboard...</p>
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Today's Orders"
              value={salesSummary.totalOrders}
              icon={ShoppingBag}
              iconColor="text-blue-600"
              subtitle="Total orders today"
            />
            <StatCard
              title="Today's Sales"
              value={`₹${salesSummary.totalSales.toFixed(2)}`}
              icon={DollarSign}
              iconColor="text-green-600"
              subtitle="Revenue today"
            />
            <StatCard
              title="Total Products"
              value={stats.totalProducts}
              icon={Package}
              iconColor="text-purple-600"
              subtitle={`${stats.totalCategories} categories`}
            />
            <StatCard
              title="Total Customers"
              value={stats.totalCustomers}
              icon={Users}
              iconColor="text-orange-600"
              subtitle="All time"
            />
          </div>

          {/* Pending Orders Alert */}
          {stats.pendingOrders > 0 && (
            <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
              <div className="flex items-center">
                <Clock className="w-5 h-5 text-yellow-400 mr-3" />
                <p className="text-sm font-medium text-yellow-800">
                  You have {stats.pendingOrders} pending order{stats.pendingOrders > 1 ? 's' : ''} waiting for acceptance
                </p>
              </div>
            </div>
          )}

          {/* Recent Orders */}
          <Card>
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
              <p className="text-sm text-gray-600">Latest orders from your customers</p>
            </div>
            <Table columns={orderColumns} data={recentOrders} emptyMessage="No orders yet" />
          </Card>
        </>
      )}
    </VendorLayout>
  );
};

export default VendorDashboardNew;


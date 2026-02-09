import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { Order } from '../../types';
import VendorLayout from '../../components/VendorLayout';
import Card from '../../components/Card';
import Table from '../../components/Table';
import { Clock } from 'lucide-react';

const VendorDashboard = () => {
  const { user } = useAuth();
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentOrders();
  }, []);

  const fetchRecentOrders = async () => {
    try {
      const response = await api.get('/vendor/orders');
      setRecentOrders(response.data.orders.slice(0, 10));
    } catch (error: any) {
      toast.error('Failed to fetch recent orders');
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

  const pendingOrders = recentOrders.filter(o => o.status === 'pending').length;

  return (
    <VendorLayout>
      {/* Welcome Section */}
      <Card className="mb-8 bg-gradient-to-r from-primary-50 to-primary-100 border-primary-200">
        <div className="text-center py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome, {user?.name || 'Vendor'}! 👋
          </h1>
          <p className="text-gray-600">
            Manage your orders and grow your business
          </p>
        </div>
      </Card>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <p className="mt-2 text-sm text-gray-600">Loading orders...</p>
        </div>
      ) : (
        <>
          {/* Pending Orders Alert */}
          {pendingOrders > 0 && (
            <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
              <div className="flex items-center">
                <Clock className="w-5 h-5 text-yellow-400 mr-3" />
                <p className="text-sm font-medium text-yellow-800">
                  You have {pendingOrders} pending order{pendingOrders > 1 ? 's' : ''} waiting for acceptance
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
            {recentOrders.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No orders yet</p>
              </div>
            ) : (
              <Table columns={orderColumns} data={recentOrders} emptyMessage="No orders yet" />
            )}
          </Card>
        </>
      )}
    </VendorLayout>
  );
};

export default VendorDashboard;



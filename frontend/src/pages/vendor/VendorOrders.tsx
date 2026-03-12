import { useState, useEffect } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { Order } from '../../types';
import VendorLayout from '../../components/VendorLayout';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { Clock, CheckCircle, XCircle, Package } from 'lucide-react';

const VendorOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await api.get('/vendor/orders');
      setOrders(response.data.orders);
    } catch (error: any) {
      toast.error('Failed to fetch orders');
    }
  };

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    setLoading(true);
    try {
      await api.patch(`/vendor/orders/${orderId}/status`, { status: newStatus });
      toast.success('Order status updated successfully');
      fetchOrders();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update order status');
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'accepted':
        return <Package className="w-4 h-4" />;
      case 'delivered':
        return <CheckCircle className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const filteredOrders = selectedStatus === 'all'
    ? orders
    : orders.filter(order => order.status === selectedStatus);

  return (
    <VendorLayout>
      <Card>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Orders</h2>
          <p className="text-sm text-gray-600 mt-1">Manage incoming orders</p>
        </div>

        {/* Status Filter */}
        <div className="flex gap-1.5 mb-6 overflow-x-auto pb-2">
          {['all', 'pending', 'accepted', 'delivered', 'cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                selectedStatus === status
                  ? 'bg-gray-900 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div key={order._id} className="glass rounded-xl border border-white/30 p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-lg">Order #{order._id.slice(-6)}</h3>
                  <p className="text-sm text-gray-600">
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Customer: {typeof order.customer === 'object' ? order.customer.name : 'Unknown'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(order.status)}`}>
                    {getStatusIcon(order.status)}
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </div>
              </div>

              {/* Order Items */}
              <div className="bg-white/30 rounded-md p-3 mb-3">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Items:</h4>
                {order.items.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm mb-1">
                    <span>
                      {item.quantity}x {typeof item.foodItem === 'object' ? item.foodItem.name : 'Unknown Item'}
                    </span>
                    <span className="font-medium">₹{item.price.toFixed(2)}</span>
                  </div>
                ))}
                <div className="border-t border-gray-300 mt-2 pt-2 flex justify-between font-semibold">
                  <span>Total:</span>
                  <span>₹{order.totalAmount.toFixed(2)}</span>
                </div>
              </div>

              {/* Delivery Info */}
              {order.deliveryAddress && (
                <div className="text-sm text-gray-600 mb-3">
                  <p className="font-medium">Delivery Address:</p>
                  <p>{order.deliveryAddress}</p>
                </div>
              )}

              {/* Action Buttons */}
              {order.status !== 'delivered' && order.status !== 'cancelled' && (
                <div className="flex gap-2 flex-wrap">
                  {order.status === 'pending' && (
                    <>
                      <Button
                        onClick={() => handleUpdateStatus(order._id, 'accepted')}
                        disabled={loading}
                        className="text-sm"
                      >
                        Accept Order
                      </Button>
                      <Button
                        onClick={() => handleUpdateStatus(order._id, 'cancelled')}
                        disabled={loading}
                        variant="danger"
                        className="text-sm"
                      >
                        Cancel
                      </Button>
                    </>
                  )}
                  {order.status === 'accepted' && (
                    <Button
                      onClick={() => handleUpdateStatus(order._id, 'delivered')}
                      disabled={loading}
                      className="text-sm"
                    >
                      Mark as Delivered
                    </Button>
                  )}
                </div>
              )}
            </div>
          ))}

          {filteredOrders.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">
                {selectedStatus === 'all'
                  ? 'No orders yet'
                  : `No ${selectedStatus} orders`}
              </p>
            </div>
          )}
        </div>
      </Card>
    </VendorLayout>
  );
};

export default VendorOrders;


import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { Order } from '../../types';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { User, MapPin, Phone, Package, ArrowLeft, Edit2, Save, X } from 'lucide-react';

const UserProfile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    mobileNumber: '',
    address: '',
    latitude: 0,
    longitude: 0
  });

  useEffect(() => {
    fetchUserProfile();
    fetchOrders();
  }, []);

  const fetchUserProfile = async () => {
    try {
      // User data is already in context, but we can fetch fresh data if needed
      if (user) {
        setProfileData({
          name: user.name || '',
          mobileNumber: user.mobileNumber || '',
          address: '',
          latitude: 0,
          longitude: 0
        });
      }
    } catch (error: any) {
      toast.error('Failed to fetch profile');
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await api.get('/user/orders');
      setOrders(response.data.orders);
    } catch (error: any) {
      if (error.response?.status !== 401) {
        toast.error('Failed to fetch orders');
      }
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.put('/user/profile', {
        name: profileData.name,
        latitude: profileData.latitude || undefined,
        longitude: profileData.longitude || undefined,
        address: profileData.address || undefined
      });
      toast.success('Profile updated successfully');
      setIsEditing(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
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

  const totalSpent = orders
    .filter(order => order.status === 'delivered')
    .reduce((sum, order) => sum + order.totalAmount, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/user/dashboard')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
                <p className="text-sm text-gray-600">Manage your account and view order history</p>
              </div>
            </div>
            <Button onClick={logout} variant="secondary">
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Information */}
          <div className="lg:col-span-1">
            <Card>
              <div className="text-center mb-6">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-12 h-12 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">
                  {profileData.name || 'User'}
                </h2>
                <p className="text-sm text-gray-600 mt-1">Customer</p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <Package className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
                  <p className="text-xs text-gray-600">Total Orders</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <span className="text-2xl font-bold text-gray-900">₹{totalSpent.toFixed(2)}</span>
                  <p className="text-xs text-gray-600 mt-1">Total Spent</p>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900 mb-3">Contact Information</h3>
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-700">{profileData.mobileNumber || 'Not provided'}</span>
                </div>
                <div className="flex items-start gap-3 text-sm">
                  <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                  <span className="text-gray-700">{profileData.address || 'No address saved'}</span>
                </div>
              </div>

              <div className="mt-6">
                <Button
                  onClick={() => setIsEditing(!isEditing)}
                  variant={isEditing ? 'secondary' : 'primary'}
                  fullWidth
                >
                  {isEditing ? (
                    <>
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </>
                  ) : (
                    <>
                      <Edit2 className="w-4 h-4 mr-2" />
                      Edit Profile
                    </>
                  )}
                </Button>
              </div>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Edit Profile Form */}
            {isEditing && (
              <Card>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit Profile</h3>
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <Input
                    label="Full Name"
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    placeholder="Enter your name"
                  />
                  <Input
                    label="Mobile Number"
                    value={profileData.mobileNumber}
                    disabled
                    className="bg-gray-50"
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Delivery Address
                    </label>
                    <textarea
                      value={profileData.address}
                      onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter your delivery address"
                    />
                  </div>
                  <div className="flex gap-3">
                    <Button type="submit" disabled={loading}>
                      <Save className="w-4 h-4 mr-2" />
                      {loading ? 'Saving...' : 'Save Changes'}
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => setIsEditing(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </Card>
            )}

            {/* Order History */}
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Order History</h3>
              <div className="space-y-4">
                {orders.map((order) => (
                  <div
                    key={order._id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          Order #{order._id.slice(-6)}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {new Date(order.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          Vendor: {typeof order.vendor === 'object' ? order.vendor.name : 'Unknown'}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </div>

                    <div className="bg-gray-50 rounded-md p-3 mb-3">
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Items:</h5>
                      {order.items.map((item, index) => {
                        const itemName = typeof item.foodItem === 'object'
                          ? item.foodItem.name
                          : (item.name || 'Unknown Item');
                        return (
                          <div key={index} className="flex justify-between text-sm mb-1">
                            <span>
                              {item.quantity}x {itemName}
                            </span>
                            <span className="font-medium">₹{item.price.toFixed(2)}</span>
                          </div>
                        );
                      })}
                      <div className="border-t border-gray-300 mt-2 pt-2 flex justify-between font-semibold">
                        <span>Total:</span>
                        <span className="text-blue-600">₹{order.totalAmount.toFixed(2)}</span>
                      </div>
                    </div>

                    {order.deliveryAddress && (
                      <div className="text-sm text-gray-600">
                        <p className="font-medium">Delivery Address:</p>
                        <p>{order.deliveryAddress}</p>
                      </div>
                    )}
                  </div>
                ))}

                {orders.length === 0 && (
                  <div className="text-center py-12">
                    <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">No orders yet</p>
                    <p className="text-sm text-gray-400 mt-1">Start ordering from nearby vendors!</p>
                    <Button
                      onClick={() => navigate('/user/dashboard')}
                      className="mt-4"
                    >
                      Browse Vendors
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserProfile;


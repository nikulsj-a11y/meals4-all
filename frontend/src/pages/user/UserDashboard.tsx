import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { Vendor, FoodItem, Order, CartItem } from '../../types';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { LogOut, MapPin, ShoppingCart, History, Plus, Minus, User, Loader2 } from 'lucide-react';

const UserDashboard = () => {
  const { logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'vendors' | 'cart' | 'orders'>('vendors');
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [menu, setMenu] = useState<any[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [location, setLocation] = useState({ latitude: 0, longitude: 0, address: '' });
  const [showCheckout, setShowCheckout] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(true);

  useEffect(() => {
    // Only fetch data if authenticated
    if (isAuthenticated) {
      getUserLocation();
      fetchOrders();
    }
  }, [isAuthenticated]);

  // Auto-fill delivery address when location is detected
  useEffect(() => {
    if (location.address && !deliveryAddress) {
      setDeliveryAddress(location.address);
    }
  }, [location.address]);

  const getUserLocation = () => {
    setLocationLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;

          // Get address from coordinates using reverse geocoding
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
            );
            const data = await response.json();
            const address = data.display_name || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;

            setLocation({ latitude, longitude, address });
            fetchNearbyVendors(latitude, longitude);
          } catch (error) {
            console.error('Reverse geocoding error:', error);
            setLocation({
              latitude,
              longitude,
              address: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
            });
            fetchNearbyVendors(latitude, longitude);
          } finally {
            setLocationLoading(false);
          }
        },
        () => {
          toast.error('Please enable location access');
          // Default location for testing
          setLocation({ latitude: 28.6139, longitude: 77.2090, address: 'Delhi, India' });
          fetchNearbyVendors(28.6139, 77.2090);
          setLocationLoading(false);
        }
      );
    } else {
      setLocationLoading(false);
    }
  };

  const fetchNearbyVendors = async (lat: number, lng: number) => {
    try {
      const response = await api.get(`/user/vendors/nearby?latitude=${lat}&longitude=${lng}`);
      setVendors(response.data.vendors);
    } catch (error: any) {
      // Don't show error toast on 401 (handled by interceptor)
      if (error.response?.status !== 401) {
        toast.error('Failed to fetch vendors');
      }
    }
  };

  const fetchVendorMenu = async (vendorId: string) => {
    try {
      const response = await api.get(`/user/vendors/${vendorId}/menu`);
      setMenu(response.data.menu);
      setSelectedVendor(response.data.vendor);
    } catch (error: any) {
      // Don't show error toast on 401 (handled by interceptor)
      if (error.response?.status !== 401) {
        toast.error('Failed to fetch menu');
      }
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await api.get('/user/orders');
      setOrders(response.data.orders);
    } catch (error: any) {
      // Don't show error toast on 401 (handled by interceptor)
      if (error.response?.status !== 401) {
        toast.error('Failed to fetch orders');
      }
    }
  };

  const addToCart = (foodItem: FoodItem) => {
    const existingItem = cart.find((item) => item.foodItem._id === foodItem._id);
    
    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.foodItem._id === foodItem._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCart([...cart, { foodItem, quantity: 1 }]);
    }
    toast.success('Added to cart');
  };

  const updateCartQuantity = (foodItemId: string, delta: number) => {
    setCart(
      cart
        .map((item) =>
          item.foodItem._id === foodItemId
            ? { ...item, quantity: item.quantity + delta }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const getTotalAmount = () => {
    return cart.reduce((total, item) => total + item.foodItem.price * item.quantity, 0);
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (cart.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    // Get vendor ID from the first cart item (all items should be from same vendor)
    const vendorId = cart[0].foodItem.vendor;

    if (!vendorId) {
      toast.error('Unable to identify vendor. Please try again.');
      return;
    }

    if (!deliveryAddress.trim()) {
      toast.error('Please confirm your delivery address');
      return;
    }

    if (deliveryAddress.trim().length < 10) {
      toast.error('Please enter a complete delivery address');
      return;
    }

    // Validate location coordinates
    if (!location.latitude || !location.longitude ||
        (location.latitude === 0 && location.longitude === 0)) {
      toast.error('Unable to detect your location. Please enable location access and refresh the page.');
      return;
    }

    setLoading(true);

    try {
      const orderData = {
        vendorId: vendorId,
        items: cart.map((item) => ({
          foodItemId: item.foodItem._id,
          quantity: item.quantity,
        })),
        deliveryAddress: deliveryAddress.trim(),
        latitude: location.latitude,
        longitude: location.longitude,
      };

      console.log('Placing order:', orderData); // Debug log

      const response = await api.post('/user/orders', orderData);
      console.log('Order response:', response.data); // Debug log

      toast.success('Order placed successfully!');
      setCart([]);
      setShowCheckout(false);
      setDeliveryAddress('');
      setSelectedVendor(null);
      setActiveTab('orders');
      fetchOrders();
    } catch (error: any) {
      console.error('Order error:', error.response?.data || error); // Debug log
      toast.error(error.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/user/login');
  };

  const handleBackToVendors = () => {
    if (cart.length > 0) {
      const confirmed = window.confirm(
        'Going back will clear your cart. Are you sure?'
      );
      if (!confirmed) return;
      setCart([]);
    }
    setSelectedVendor(null);
    setMenu([]);
  };

  // Format address to show a shorter version
  const getShortAddress = (fullAddress: string) => {
    if (locationLoading) return 'Detecting location...';
    if (!fullAddress) return 'Location not available';

    // Split by comma and take relevant parts
    const parts = fullAddress.split(',');
    if (parts.length >= 3) {
      // Show first 2-3 parts (e.g., "Street, Area, City")
      return parts.slice(0, 3).join(',').trim();
    }
    return fullAddress;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Meals4All</h1>
              <button
                onClick={getUserLocation}
                disabled={locationLoading}
                className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Click to refresh location"
              >
                {locationLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <MapPin className="w-4 h-4" />
                )}
                <span className="max-w-xs truncate">{getShortAddress(location.address)}</span>
              </button>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setActiveTab('cart')}
                className="relative p-2 text-gray-600 hover:text-gray-900"
              >
                <ShoppingCart className="w-6 h-6" />
                {cart.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cart.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => navigate('/user/profile')}
                className="p-2 text-gray-600 hover:text-gray-900"
                title="My Profile"
              >
                <User className="w-6 h-6" />
              </button>
              <Button onClick={handleLogout} variant="secondary">
                <LogOut className="w-4 h-4 inline mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('vendors')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'vendors'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Browse Vendors
            </button>
            <button
              onClick={() => setActiveTab('cart')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'cart'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Cart ({cart.length})
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'orders'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <History className="w-4 h-4 inline mr-1" />
              Order History
            </button>
          </nav>
        </div>

        {/* Vendors Tab */}
        {activeTab === 'vendors' && (
          <div>
            {!selectedVendor ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {vendors.map((vendor) => (
                  <Card key={vendor._id} className="cursor-pointer hover:shadow-lg transition-shadow flex flex-col">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-2">{vendor.name}</h3>
                      <p className="text-sm text-gray-600 mb-4">
                        <MapPin className="w-4 h-4 inline mr-1" />
                        {vendor.address || 'Location available'}
                      </p>
                    </div>
                    <Button onClick={() => fetchVendorMenu(vendor._id)} fullWidth>
                      View Menu
                    </Button>
                  </Card>
                ))}
                {vendors.length === 0 && (
                  <div className="col-span-full text-center py-12">
                    <p className="text-gray-500">No vendors found within 20km radius</p>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">{selectedVendor.name}</h2>
                    <p className="text-gray-600">{selectedVendor.address}</p>
                  </div>
                  <Button onClick={handleBackToVendors} variant="secondary">
                    Back to Vendors
                  </Button>
                </div>

                {menu.map((categoryGroup) => (
                  <Card key={categoryGroup.category._id} className="mb-6">
                    <h3 className="text-xl font-semibold mb-4">{categoryGroup.category.name}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {categoryGroup.items.map((item: FoodItem) => {
                        const cartItem = cart.find((c) => c.foodItem._id === item._id);
                        const quantity = cartItem?.quantity || 0;

                        return (
                          <div
                            key={item._id}
                            className="flex justify-between items-center p-4 border border-gray-200 rounded-lg"
                          >
                            <div className="flex-1">
                              <h4 className="font-medium">{item.name}</h4>
                              <p className="text-sm text-gray-600">{item.description}</p>
                              <p className="text-lg font-semibold text-primary-600 mt-2">
                                ₹{item.price}
                              </p>
                            </div>
                            {quantity === 0 ? (
                              <Button onClick={() => addToCart(item)}>
                                <Plus className="w-4 h-4" />
                              </Button>
                            ) : (
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => updateCartQuantity(item._id, -1)}
                                  className="p-2 rounded-full hover:bg-gray-100 text-red-600"
                                >
                                  <Minus className="w-4 h-4" />
                                </button>
                                <span className="font-semibold w-8 text-center">{quantity}</span>
                                <button
                                  onClick={() => updateCartQuantity(item._id, 1)}
                                  className="p-2 rounded-full hover:bg-gray-100 text-green-600"
                                >
                                  <Plus className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Cart Tab */}
        {activeTab === 'cart' && (
          <Card title="Shopping Cart">
            {cart.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingCart className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">Your cart is empty</p>
              </div>
            ) : (
              <div>
                <div className="space-y-4 mb-6">
                  {cart.map((item) => (
                    <div
                      key={item.foodItem._id}
                      className="flex justify-between items-center p-4 border border-gray-200 rounded-lg"
                    >
                      <div className="flex-1">
                        <h4 className="font-medium">{item.foodItem.name}</h4>
                        <p className="text-sm text-gray-600">₹{item.foodItem.price} each</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => updateCartQuantity(item.foodItem._id, -1)}
                          className="p-1 rounded-full hover:bg-gray-100"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="font-medium w-8 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateCartQuantity(item.foodItem._id, 1)}
                          className="p-1 rounded-full hover:bg-gray-100"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                        <span className="font-semibold ml-4 w-20 text-right">
                          ₹{item.foodItem.price * item.quantity}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-semibold">Total:</span>
                    <span className="text-2xl font-bold text-primary-600">
                      ₹{getTotalAmount()}
                    </span>
                  </div>
                  <Button onClick={() => setShowCheckout(true)} fullWidth>
                    Proceed to Checkout
                  </Button>
                </div>
              </div>
            )}
          </Card>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <Card title="Order History">
            {orders.length === 0 ? (
              <div className="text-center py-12">
                <History className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">No orders yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order._id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-semibold">Order #{order.orderNumber}</p>
                        <p className="text-sm text-gray-600">
                          {typeof order.vendor === 'object' ? order.vendor.name : ''}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(order.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 text-sm rounded-full ${
                          order.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : order.status === 'accepted'
                            ? 'bg-blue-100 text-blue-800'
                            : order.status === 'delivered'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>
                    <div className="border-t pt-3">
                      <p className="text-sm text-gray-600 mb-2">
                        {order.items.length} items • ₹{order.totalAmount}
                      </p>
                      <p className="text-sm text-gray-600">
                        Delivery: {order.deliveryAddress}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}
      </main>

      {/* Checkout Modal */}
      {showCheckout && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Checkout</h2>

              <form onSubmit={handlePlaceOrder} className="space-y-6">
                {/* Order Summary */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Order Summary</h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    {cart.map((item) => (
                      <div key={item.foodItem._id} className="flex justify-between items-center text-sm">
                        <span className="text-gray-700">
                          {item.foodItem.name} <span className="text-gray-500">x {item.quantity}</span>
                        </span>
                        <span className="font-medium text-gray-900">₹{item.foodItem.price * item.quantity}</span>
                      </div>
                    ))}
                    <div className="border-t border-gray-200 pt-2 mt-2 flex justify-between items-center">
                      <span className="font-semibold text-gray-900">Total</span>
                      <span className="text-xl font-bold text-primary-600">₹{getTotalAmount()}</span>
                    </div>
                  </div>
                </div>

                {/* Delivery Address */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Delivery Address
                    </label>
                    <button
                      type="button"
                      onClick={() => setDeliveryAddress(location.address)}
                      className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                    >
                      Use Current Location
                    </button>
                  </div>
                  <textarea
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="Enter your complete delivery address"
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                    required
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    💡 Your current location has been auto-filled. You can edit it if needed.
                  </p>
                  {/* Debug info - remove in production */}
                  <p className="mt-1 text-xs text-gray-400">
                    📍 Coordinates: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                  </p>
                </div>

                {/* Payment Method */}
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-700">Payment Method</p>
                      <p className="text-base font-medium text-gray-900 mt-1">Cash on Delivery (COD)</p>
                    </div>
                    <div className="bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full">
                      Available
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                  <Button type="submit" fullWidth disabled={loading}>
                    {loading ? 'Placing Order...' : 'Place Order'}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    fullWidth
                    onClick={() => setShowCheckout(false)}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;



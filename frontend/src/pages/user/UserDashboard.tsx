import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api, { API_BASE_URL } from '../../utils/api';
import toast from 'react-hot-toast';
import { Vendor, FoodItem, Order, CartItem } from '../../types';
import Button from '../../components/Button';
import {
  LogOut, MapPin, ShoppingCart, History, Plus, Minus, User,
  Loader2, Search, ArrowLeft, ChevronRight, Package, Star,
  UtensilsCrossed, Flame, Heart, X
} from 'lucide-react';

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
  const [vendorSearch, setVendorSearch] = useState('');
  const [menuSearch, setMenuSearch] = useState('');
  const [ratingOrderId, setRatingOrderId] = useState<string | null>(null);
  const [ratingValue, setRatingValue] = useState(0);
  const [ratingReview, setRatingReview] = useState('');

  useEffect(() => {
    if (isAuthenticated) { getUserLocation(); fetchOrders(); }
  }, [isAuthenticated]);

  useEffect(() => {
    if (location.address && !deliveryAddress) setDeliveryAddress(location.address);
  }, [location.address]);

  const getUserLocation = () => {
    setLocationLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
            const data = await response.json();
            const address = data.display_name || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
            setLocation({ latitude, longitude, address });
            fetchNearbyVendors(latitude, longitude);
          } catch {
            setLocation({ latitude, longitude, address: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}` });
            fetchNearbyVendors(latitude, longitude);
          } finally { setLocationLoading(false); }
        },
        () => {
          toast.error('Please enable location access');
          setLocation({ latitude: 28.6139, longitude: 77.2090, address: 'Delhi, India' });
          fetchNearbyVendors(28.6139, 77.2090);
          setLocationLoading(false);
        }
      );
    } else { setLocationLoading(false); }
  };

  const fetchNearbyVendors = async (lat: number, lng: number) => {
    try { const r = await api.get(`/user/vendors/nearby?latitude=${lat}&longitude=${lng}`); setVendors(r.data.vendors); }
    catch (e: any) { if (e.response?.status !== 401) toast.error('Failed to fetch vendors'); }
  };
  const fetchVendorMenu = async (vendorId: string) => {
    try { const r = await api.get(`/user/vendors/${vendorId}/menu`); setMenu(r.data.menu); setSelectedVendor(r.data.vendor); }
    catch (e: any) { if (e.response?.status !== 401) toast.error('Failed to fetch menu'); }
  };
  const fetchOrders = async () => {
    try { const r = await api.get('/user/orders'); setOrders(r.data.orders); }
    catch (e: any) { if (e.response?.status !== 401) toast.error('Failed to fetch orders'); }
  };
  const addToCart = (foodItem: FoodItem) => {
    const existing = cart.find((item) => item.foodItem._id === foodItem._id);
    if (existing) { setCart(cart.map((i) => i.foodItem._id === foodItem._id ? { ...i, quantity: i.quantity + 1 } : i)); }
    else { setCart([...cart, { foodItem, quantity: 1 }]); }
    toast.success('Added to cart');
  };
  const updateCartQuantity = (foodItemId: string, delta: number) => {
    setCart(cart.map((i) => i.foodItem._id === foodItemId ? { ...i, quantity: i.quantity + delta } : i).filter((i) => i.quantity > 0));
  };
  const getTotalAmount = () => cart.reduce((t, i) => t + i.foodItem.price * i.quantity, 0);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) { toast.error('Your cart is empty'); return; }
    const vendorId = cart[0].foodItem.vendor;
    if (!vendorId) { toast.error('Unable to identify vendor.'); return; }
    if (!deliveryAddress.trim() || deliveryAddress.trim().length < 10) { toast.error('Please enter a complete delivery address'); return; }
    if (!location.latitude || !location.longitude || (location.latitude === 0 && location.longitude === 0)) {
      toast.error('Unable to detect your location.'); return;
    }
    setLoading(true);
    try {
      await api.post('/user/orders', {
        vendorId, items: cart.map((i) => ({ foodItemId: i.foodItem._id, quantity: i.quantity })),
        deliveryAddress: deliveryAddress.trim(), latitude: location.latitude, longitude: location.longitude,
      });
      toast.success('Order placed successfully!');
      setCart([]); setShowCheckout(false); setDeliveryAddress(''); setSelectedVendor(null);
      setActiveTab('orders'); fetchOrders();
    } catch (e: any) { toast.error(e.response?.data?.message || 'Failed to place order'); }
    finally { setLoading(false); }
  };

  const handleRateOrder = async (orderId: string) => {
    if (ratingValue === 0) { toast.error('Please select a rating'); return; }
    try {
      await api.post(`/user/orders/${orderId}/rate`, { rating: ratingValue, review: ratingReview });
      toast.success('Rating submitted!');
      setRatingOrderId(null); setRatingValue(0); setRatingReview('');
      fetchOrders();
      if (location.latitude && location.longitude) fetchNearbyVendors(location.latitude, location.longitude);
    } catch (e: any) { toast.error(e.response?.data?.message || 'Failed to submit rating'); }
  };

  const handleLogout = () => { logout(); navigate('/user/login'); };
  const handleBackToVendors = () => {
    if (cart.length > 0 && !window.confirm('Going back will clear your cart. Are you sure?')) return;
    if (cart.length > 0) setCart([]);
    setSelectedVendor(null); setMenu([]); setMenuSearch('');
  };

  const filteredVendors = vendors.filter((v) =>
    v.name.toLowerCase().includes(vendorSearch.toLowerCase()) || (v.address || '').toLowerCase().includes(vendorSearch.toLowerCase())
  );
  const filteredMenu = menu.map((cg) => ({
    ...cg, items: cg.items.filter((i: FoodItem) =>
      i.name.toLowerCase().includes(menuSearch.toLowerCase()) || i.description.toLowerCase().includes(menuSearch.toLowerCase())
    )
  })).filter((cg) => cg.items.length > 0);

  const getShortAddress = (a: string) => {
    if (locationLoading) return 'Detecting...';
    if (!a) return 'Location N/A';
    const p = a.split(',');
    return p.length >= 3 ? p.slice(0, 3).join(',').trim() : a;
  };

  const getStatusColor = (s: string) => {
    switch (s) {
      case 'pending': return 'bg-amber-500';
      case 'accepted': return 'bg-blue-500';
      case 'preparing': return 'bg-purple-500';
      case 'delivered': return 'bg-emerald-500';
      default: return 'bg-red-500';
    }
  };

  const greetingEmoji = new Date().getHours() < 12 ? '🌅' : new Date().getHours() < 17 ? '☀️' : '🌙';
  const greeting = new Date().getHours() < 12 ? 'Good Morning' : new Date().getHours() < 17 ? 'Good Afternoon' : 'Good Evening';


  return (
    <div className="min-h-screen bg-[#f8f8fc]">
      {/* ─── HEADER ─── */}
      <header className="bg-white/80 backdrop-blur-xl sticky top-0 z-30 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center h-14">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => { setActiveTab('vendors'); setSelectedVendor(null); setMenu([]); setMenuSearch(''); }}>
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center">
                <UtensilsCrossed className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-sm font-bold text-gray-900 leading-tight">Meals4All</h1>
                <button
                  onClick={getUserLocation}
                  disabled={locationLoading}
                  className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-orange-500 transition-colors leading-tight"
                >
                  {locationLoading ? <Loader2 className="w-2.5 h-2.5 animate-spin" /> : <MapPin className="w-2.5 h-2.5" />}
                  <span className="max-w-[180px] truncate">{getShortAddress(location.address)}</span>
                </button>
              </div>
            </div>
            <div className="flex items-center gap-0.5">
              <button onClick={() => setActiveTab('cart')} className="relative p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all" title="Cart">
                <ShoppingCart className="w-[18px] h-[18px]" />
                {cart.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-orange-500 text-white text-[9px] rounded-full min-w-[16px] h-4 flex items-center justify-center font-bold px-1">
                    {cart.reduce((t, i) => t + i.quantity, 0)}
                  </span>
                )}
              </button>
              <button onClick={() => setActiveTab('orders')} className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all" title="Orders">
                <History className="w-[18px] h-[18px]" />
              </button>
              <button onClick={() => navigate('/user/profile')} className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all" title="Profile">
                <User className="w-[18px] h-[18px]" />
              </button>
              <button onClick={handleLogout} className="p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all" title="Logout">
                <LogOut className="w-[18px] h-[18px]" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 pb-28">

        {/* ═══════════ VENDORS HOME ═══════════ */}
        {activeTab === 'vendors' && !selectedVendor && (
          <>
            {/* Hero Banner */}
            <div className="mt-5 rounded-2xl overflow-hidden relative bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 p-6 sm:p-8">
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3" />
              <div className="absolute bottom-0 left-1/2 w-32 h-32 bg-white/10 rounded-full translate-y-1/2" />
              <div className="relative z-10">
                <p className="text-white/80 text-sm">{greetingEmoji} {greeting}</p>
                <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1">
                  Craving something<br />delicious?
                </h2>
                <p className="text-white/70 text-sm mt-2 max-w-md">
                  Order from the best restaurants near you with fast delivery
                </p>
                {/* Search inside hero */}
                <div className="relative mt-5 max-w-lg">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={vendorSearch}
                    onChange={(e) => setVendorSearch(e.target.value)}
                    placeholder="Search for restaurants or cuisines..."
                    className="w-full pl-10 pr-4 py-3 bg-white rounded-xl shadow-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50"
                  />
                </div>
              </div>
            </div>

            {/* Restaurants Section */}
            <div className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Nearby Restaurants</h3>
                  <p className="text-xs text-gray-400 mt-0.5">{filteredVendors.length} restaurants near you</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredVendors.map((vendor) => (
                  <div
                    key={vendor._id}
                    onClick={() => fetchVendorMenu(vendor._id)}
                    className="cursor-pointer group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-orange-200 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
                  >
                    <div className="relative h-40 bg-gray-100 overflow-hidden">
                      {vendor.image ? (
                        <img src={`${API_BASE_URL}${vendor.image}`} alt={vendor.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50">
                          <UtensilsCrossed className="w-10 h-10 text-orange-200" />
                        </div>
                      )}
                      {/* Top badges */}
                      <div className="absolute top-3 left-3 flex gap-1.5">
                        <span className="bg-white/90 backdrop-blur-sm text-[10px] font-bold text-orange-600 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                          <Flame className="w-2.5 h-2.5" /> Popular
                        </span>
                      </div>
                      <div className="absolute top-3 right-3">
                        <button className="w-7 h-7 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors" onClick={(e) => e.stopPropagation()}>
                          <Heart className="w-3.5 h-3.5 text-gray-400" />
                        </button>
                      </div>
                    </div>
                    <div className="p-3.5">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-gray-900 text-sm leading-tight">{vendor.name}</h3>
                        {(vendor.avgRating ?? 0) > 0 && (
                          <div className="flex items-center gap-0.5 bg-green-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded flex-shrink-0">
                            <Star className="w-2.5 h-2.5 fill-current" /> {vendor.avgRating}
                          </div>
                        )}
                      </div>
                      <p className="text-[11px] text-gray-400 mt-1 flex items-center gap-1 truncate">
                        <MapPin className="w-3 h-3 flex-shrink-0" />
                        {vendor.address || 'Location available'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {filteredVendors.length === 0 && (
                <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-gray-50 flex items-center justify-center mb-4">
                    <Search className="w-7 h-7 text-gray-300" />
                  </div>
                  <p className="text-gray-500 font-medium">{vendorSearch ? 'No restaurants match your search' : 'No restaurants found nearby'}</p>
                  <p className="text-sm text-gray-400 mt-1">Try a different search or check your location</p>
                  {vendorSearch && (
                    <button onClick={() => setVendorSearch('')} className="mt-4 text-sm text-orange-500 font-medium hover:text-orange-600">Clear search</button>
                  )}
                </div>
              )}
            </div>
          </>
        )}

        {/* ═══════════ VENDOR MENU ═══════════ */}
        {activeTab === 'vendors' && selectedVendor && (
          <div>
            {/* Banner */}
            <div className="relative -mx-4 sm:-mx-6">
              <div className="h-52 overflow-hidden">
                {selectedVendor.image ? (
                  <img src={`${API_BASE_URL}${selectedVendor.image}`} alt={selectedVendor.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-orange-400 to-red-500" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10" />
              </div>
              <div className="absolute top-4 left-4 sm:left-6">
                <button onClick={handleBackToVendors}
                  className="w-9 h-9 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/50 transition-colors">
                  <ArrowLeft className="w-4 h-4" />
                </button>
              </div>
              <div className="absolute bottom-0 left-0 right-0 px-4 sm:px-6 pb-5">
                <div className="flex items-end justify-between">
                  <div className="text-white">
                    <h2 className="text-xl sm:text-2xl font-bold">{selectedVendor.name}</h2>
                    <p className="text-white/70 text-sm flex items-center gap-1 mt-1">
                      <MapPin className="w-3.5 h-3.5" /> {selectedVendor.address || 'Location not available'}
                    </p>
                  </div>
                  {(selectedVendor as any).avgRating > 0 && (
                    <span className="bg-white/20 backdrop-blur-md text-white text-xs px-2.5 py-1 rounded-lg flex items-center gap-1">
                      <Star className="w-3 h-3 fill-yellow-300 text-yellow-300" /> {(selectedVendor as any).avgRating}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Search */}
            <div className="relative mt-5 mb-6">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" value={menuSearch} onChange={(e) => setMenuSearch(e.target.value)}
                placeholder="Search in menu..."
                className="w-full pl-10 pr-4 py-2.5 bg-white rounded-xl border border-gray-100 shadow-sm text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400/30 focus:border-orange-200 transition-all"
              />
            </div>

            {/* Menu */}
            {filteredMenu.map((cg) => (
              <div key={cg.category._id} className="mb-7">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1 h-5 rounded-full bg-gradient-to-b from-orange-400 to-red-500" />
                  <h3 className="font-bold text-gray-900">{cg.category.name}</h3>
                  <span className="text-xs text-gray-400 ml-1">{cg.items.length} items</span>
                </div>
                <div className="space-y-3">
                  {cg.items.map((item: FoodItem) => {
                    const qty = cart.find((c) => c.foodItem._id === item._id)?.quantity || 0;
                    return (
                      <div key={item._id} className="flex gap-3 p-3 bg-white rounded-xl border border-gray-100 hover:border-orange-100 hover:shadow-sm transition-all">
                        {item.image && (
                          <img src={`${API_BASE_URL}${item.image}`} alt={item.name}
                            className="w-[90px] h-[90px] rounded-xl object-cover flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                          <div>
                            <h4 className="font-semibold text-gray-900 text-sm">{item.name}</h4>
                            <p className="text-[11px] text-gray-400 mt-0.5 line-clamp-2 leading-relaxed">{item.description}</p>
                          </div>
                          <div className="flex items-center justify-between mt-1">
                            <span className="font-bold text-gray-900">₹{item.price}</span>
                            {qty === 0 ? (
                              <button onClick={() => addToCart(item)}
                                className="text-xs font-bold text-orange-500 border-2 border-orange-500 px-4 py-1.5 rounded-lg hover:bg-orange-500 hover:text-white transition-all active:scale-95">
                                ADD
                              </button>
                            ) : (
                              <div className="flex items-center border-2 border-orange-500 rounded-lg overflow-hidden">
                                <button onClick={() => updateCartQuantity(item._id, -1)} className="px-2 py-1 text-orange-500 hover:bg-orange-50 transition-colors">
                                  <Minus className="w-3.5 h-3.5" />
                                </button>
                                <span className="px-2 text-sm font-bold text-orange-500 min-w-[24px] text-center">{qty}</span>
                                <button onClick={() => updateCartQuantity(item._id, 1)} className="px-2 py-1 text-orange-500 hover:bg-orange-50 transition-colors">
                                  <Plus className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
            {filteredMenu.length === 0 && (
              <div className="text-center py-16">
                <Search className="w-8 h-8 mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500 text-sm">No items found</p>
              </div>
            )}
          </div>
        )}

        {/* ═══════════ CART ═══════════ */}
        {activeTab === 'cart' && (
          <div className="pt-6">
            <h2 className="text-xl font-bold text-gray-900 mb-5">Your Cart</h2>
            {cart.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
                <div className="w-20 h-20 mx-auto rounded-full bg-orange-50 flex items-center justify-center mb-4">
                  <ShoppingCart className="w-9 h-9 text-orange-300" />
                </div>
                <p className="text-gray-700 font-semibold">Your cart is empty</p>
                <p className="text-sm text-gray-400 mt-1 mb-6">Add items from a restaurant to get started</p>
                <Button onClick={() => setActiveTab('vendors')}>Browse Restaurants</Button>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="divide-y divide-gray-50">
                  {cart.map((item) => (
                    <div key={item.foodItem._id} className="flex items-center gap-3 p-4">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 text-sm">{item.foodItem.name}</h4>
                        <p className="text-xs text-gray-400 mt-0.5">₹{item.foodItem.price} each</p>
                      </div>
                      <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                        <button onClick={() => updateCartQuantity(item.foodItem._id, -1)} className="px-2 py-1.5 hover:bg-gray-50 transition-colors text-gray-500">
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-sm font-bold text-gray-800 min-w-[24px] text-center">{item.quantity}</span>
                        <button onClick={() => updateCartQuantity(item.foodItem._id, 1)} className="px-2 py-1.5 hover:bg-gray-50 transition-colors text-gray-500">
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <span className="font-semibold text-gray-900 text-sm w-16 text-right">₹{item.foodItem.price * item.quantity}</span>
                    </div>
                  ))}
                </div>
                <div className="p-4 bg-gray-50/50 border-t border-gray-100">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm text-gray-500">Total</span>
                    <span className="text-xl font-bold text-gray-900">₹{getTotalAmount()}</span>
                  </div>
                  <button onClick={() => setShowCheckout(true)}
                    className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-red-600 transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20">
                    Proceed to Checkout <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═══════════ ORDERS ═══════════ */}
        {activeTab === 'orders' && (
          <div className="pt-6">
            <h2 className="text-xl font-bold text-gray-900 mb-5">Order History</h2>
            {orders.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
                <div className="w-20 h-20 mx-auto rounded-full bg-blue-50 flex items-center justify-center mb-4">
                  <Package className="w-9 h-9 text-blue-300" />
                </div>
                <p className="text-gray-700 font-semibold">No orders yet</p>
                <p className="text-sm text-gray-400 mt-1 mb-6">Your order history will appear here</p>
                <Button onClick={() => setActiveTab('vendors')}>Browse Restaurants</Button>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map((order) => (
                  <div key={order._id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-sm transition-all">
                    <div className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${getStatusColor(order.status)}`} />
                          <div>
                            <p className="font-semibold text-gray-900 text-sm">Order #{order.orderNumber}</p>
                            <p className="text-xs text-gray-400 mt-0.5">
                              {typeof order.vendor === 'object' ? order.vendor.name : ''}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900 text-sm">₹{order.totalAmount}</p>
                          <p className="text-[10px] text-gray-400 mt-0.5 capitalize">{order.status}</p>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-gray-50 flex items-center justify-between text-[11px] text-gray-400">
                        <span>{order.items.length} item{order.items.length > 1 ? 's' : ''} · {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                        <span className="truncate max-w-[50%] text-right flex items-center gap-0.5">
                          <MapPin className="w-2.5 h-2.5 flex-shrink-0" /> {order.deliveryAddress}
                        </span>
                      </div>

                      {/* Rating Section */}
                      {order.status === 'delivered' && !order.rating && ratingOrderId !== order._id && (
                        <button onClick={() => { setRatingOrderId(order._id); setRatingValue(0); setRatingReview(''); }}
                          className="mt-3 w-full py-2 text-xs font-semibold text-orange-500 bg-orange-50 rounded-xl hover:bg-orange-100 transition-colors flex items-center justify-center gap-1">
                          <Star className="w-3.5 h-3.5" /> Rate this order
                        </button>
                      )}
                      {order.status === 'delivered' && order.rating && (
                        <div className="mt-3 pt-3 border-t border-gray-50 flex items-center gap-1">
                          <span className="text-[11px] text-gray-400">Your rating:</span>
                          {[1,2,3,4,5].map((s) => (
                            <Star key={s} className={`w-3.5 h-3.5 ${s <= (order.rating || 0) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`} />
                          ))}
                        </div>
                      )}
                      {ratingOrderId === order._id && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <div className="flex items-center justify-center gap-1.5 mb-3">
                            {[1,2,3,4,5].map((s) => (
                              <button key={s} onClick={() => setRatingValue(s)}
                                className="transition-transform hover:scale-110 active:scale-95">
                                <Star className={`w-7 h-7 ${s <= ratingValue ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 hover:text-yellow-200'} transition-colors`} />
                              </button>
                            ))}
                          </div>
                          <textarea value={ratingReview} onChange={(e) => setRatingReview(e.target.value)}
                            placeholder="Write a review (optional)" rows={2}
                            className="w-full px-3 py-2 bg-gray-50 rounded-xl border border-gray-200 text-xs text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400/30 resize-none mb-2"
                          />
                          <div className="flex gap-2">
                            <button onClick={() => setRatingOrderId(null)}
                              className="flex-1 py-2 text-xs font-medium text-gray-500 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">Cancel</button>
                            <button onClick={() => handleRateOrder(order._id)}
                              className="flex-1 py-2 text-xs font-semibold text-white bg-gradient-to-r from-orange-500 to-red-500 rounded-lg hover:from-orange-600 hover:to-red-600 transition-all">Submit</button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* ─── FLOATING CART BAR ─── */}
      {cart.length > 0 && activeTab === 'vendors' && (
        <div className="fixed bottom-20 sm:bottom-6 left-1/2 -translate-x-1/2 z-30 w-[calc(100%-2rem)] max-w-lg animate-slide-up">
          <button onClick={() => setActiveTab('cart')}
            className="w-full flex items-center justify-between bg-gradient-to-r from-orange-500 to-red-500 text-white px-5 py-3.5 rounded-2xl shadow-xl shadow-orange-500/30 hover:shadow-orange-500/40 transition-all active:scale-[0.98]">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 rounded-xl p-1.5"><ShoppingCart className="w-4 h-4" /></div>
              <span className="font-semibold text-sm">{cart.reduce((t, i) => t + i.quantity, 0)} items</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold">₹{getTotalAmount()}</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </button>
        </div>
      )}

      {/* ─── BOTTOM NAV ─── */}
      <nav className="fixed bottom-0 left-0 right-0 z-20 bg-white/90 backdrop-blur-xl border-t border-gray-100 sm:hidden">
        <div className="flex items-center justify-around py-1.5 max-w-md mx-auto">
          {[
            { key: 'vendors' as const, icon: UtensilsCrossed, label: 'Home' },
            { key: 'cart' as const, icon: ShoppingCart, label: 'Cart', badge: cart.reduce((t, i) => t + i.quantity, 0) },
            { key: 'orders' as const, icon: History, label: 'Orders' },
          ].map((tab) => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`relative flex flex-col items-center gap-0.5 px-5 py-1.5 rounded-xl transition-all ${
                activeTab === tab.key ? 'text-orange-500' : 'text-gray-400'
              }`}>
              <tab.icon className={`w-5 h-5 ${activeTab === tab.key ? 'stroke-[2.5]' : ''}`} />
              <span className="text-[10px] font-medium">{tab.label}</span>
              {tab.badge ? (
                <span className="absolute -top-0.5 right-2 bg-orange-500 text-white text-[9px] rounded-full min-w-[16px] h-4 flex items-center justify-center font-bold px-1">
                  {tab.badge}
                </span>
              ) : null}
            </button>
          ))}
        </div>
      </nav>

      {/* ─── CHECKOUT MODAL ─── */}
      {showCheckout && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center z-50">
          <div className="bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-5">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-gray-900">Checkout</h2>
                <button onClick={() => setShowCheckout(false)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>

              <form onSubmit={handlePlaceOrder} className="space-y-4">
                <div>
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Order Summary</h3>
                  <div className="bg-gray-50 rounded-xl p-3.5 space-y-2">
                    {cart.map((item) => (
                      <div key={item.foodItem._id} className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">{item.foodItem.name} <span className="text-gray-400">x{item.quantity}</span></span>
                        <span className="font-medium text-gray-900">₹{item.foodItem.price * item.quantity}</span>
                      </div>
                    ))}
                    <div className="border-t border-gray-200 pt-2 mt-2 flex justify-between items-center">
                      <span className="font-semibold text-gray-900">Total</span>
                      <span className="text-lg font-bold text-orange-500">₹{getTotalAmount()}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Delivery Address</h3>
                    <button type="button" onClick={() => setDeliveryAddress(location.address)}
                      className="text-[11px] text-orange-500 font-medium">Use current location</button>
                  </div>
                  <textarea value={deliveryAddress} onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="Enter delivery address" rows={2} required
                    className="w-full px-3.5 py-2.5 bg-gray-50 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400/30 focus:border-orange-200 resize-none transition-all"
                  />
                </div>

                <div className="bg-emerald-50 rounded-xl p-3.5 border border-emerald-100 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-400 font-medium">Payment</p>
                    <p className="text-sm font-semibold text-gray-900 mt-0.5">Cash on Delivery</p>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">COD</span>
                </div>

                <button type="submit" disabled={loading}
                  className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-red-600 transition-all active:scale-[0.98] shadow-lg shadow-orange-500/20 disabled:opacity-50">
                  {loading ? 'Placing Order...' : 'Place Order'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;

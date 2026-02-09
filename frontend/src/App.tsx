import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminVendors from './pages/admin/AdminVendors';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminProfile from './pages/admin/AdminProfile';

// Vendor Pages
import VendorLogin from './pages/vendor/VendorLogin';
import VendorDashboard from './pages/vendor/VendorDashboard';
import VendorCategories from './pages/vendor/VendorCategories';
import VendorProducts from './pages/vendor/VendorProducts';
import VendorOrders from './pages/vendor/VendorOrders';
import VendorCustomers from './pages/vendor/VendorCustomers';
import VendorAnalytics from './pages/vendor/VendorAnalytics';
import VendorProfile from './pages/vendor/VendorProfile';
import ChangePassword from './pages/vendor/ChangePassword';

// User Pages
import UserLogin from './pages/user/UserLogin';
import UserDashboard from './pages/user/UserDashboard';
import UserProfile from './pages/user/UserProfile';

// Components
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            {/* Home */}
            <Route path="/" element={<Navigate to="/user/login" replace />} />

            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={['superadmin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/vendors"
              element={
                <ProtectedRoute allowedRoles={['superadmin']}>
                  <AdminVendors />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/analytics"
              element={
                <ProtectedRoute allowedRoles={['superadmin']}>
                  <AdminAnalytics />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/profile"
              element={
                <ProtectedRoute allowedRoles={['superadmin']}>
                  <AdminProfile />
                </ProtectedRoute>
              }
            />

            {/* Vendor Routes */}
            <Route path="/vendor/login" element={<VendorLogin />} />
            <Route
              path="/vendor/dashboard"
              element={
                <ProtectedRoute allowedRoles={['vendor']}>
                  <VendorDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/vendor/categories"
              element={
                <ProtectedRoute allowedRoles={['vendor']}>
                  <VendorCategories />
                </ProtectedRoute>
              }
            />
            <Route
              path="/vendor/products"
              element={
                <ProtectedRoute allowedRoles={['vendor']}>
                  <VendorProducts />
                </ProtectedRoute>
              }
            />
            <Route
              path="/vendor/orders"
              element={
                <ProtectedRoute allowedRoles={['vendor']}>
                  <VendorOrders />
                </ProtectedRoute>
              }
            />
            <Route
              path="/vendor/customers"
              element={
                <ProtectedRoute allowedRoles={['vendor']}>
                  <VendorCustomers />
                </ProtectedRoute>
              }
            />
            <Route
              path="/vendor/analytics"
              element={
                <ProtectedRoute allowedRoles={['vendor']}>
                  <VendorAnalytics />
                </ProtectedRoute>
              }
            />
            <Route
              path="/vendor/profile"
              element={
                <ProtectedRoute allowedRoles={['vendor']}>
                  <VendorProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/vendor/change-password"
              element={
                <ProtectedRoute allowedRoles={['vendor']}>
                  <ChangePassword />
                </ProtectedRoute>
              }
            />

            {/* User Routes */}
            <Route path="/user/login" element={<UserLogin />} />
            <Route
              path="/user/dashboard"
              element={
                <ProtectedRoute allowedRoles={['user']}>
                  <UserDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/user/profile"
              element={
                <ProtectedRoute allowedRoles={['user']}>
                  <UserProfile />
                </ProtectedRoute>
              }
            />

            {/* 404 */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <Toaster position="top-right" />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;


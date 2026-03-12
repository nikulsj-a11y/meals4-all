import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api, { API_BASE_URL } from '../../utils/api';
import toast from 'react-hot-toast';
import VendorLayout from '../../components/VendorLayout';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import MapPicker from '../../components/MapPicker';
import { User, Lock, Mail, Phone, MapPin, Store } from 'lucide-react';

const VendorProfile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showEditModal, setShowEditModal] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || user?.location?.address || '',
    latitude: user?.location?.coordinates?.[1] || 28.6139,
    longitude: user?.location?.coordinates?.[0] || 77.209
  });
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('name', profileData.name);
      formData.append('latitude', String(profileData.latitude));
      formData.append('longitude', String(profileData.longitude));
      formData.append('address', profileData.address);
      if (imageFile) formData.append('image', imageFile);

      await api.put('/vendor/profile', formData);
      toast.success('Profile updated successfully');
      setShowEditModal(false);
      // Refresh the page to show updated data
      window.location.reload();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <VendorLayout>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Profile Settings</h2>
        <p className="text-sm text-gray-600">Manage your vendor account information</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Information */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              {user?.image ? (
                <img src={`${API_BASE_URL}${user?.image}`} alt={user?.name} className="w-16 h-16 rounded-full object-cover" />
              ) : (
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                  <Store className="w-8 h-8 text-primary-600" />
                </div>
              )}
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">{user?.name}</h3>
                <p className="text-sm text-gray-600">Vendor Account</p>
              </div>
            </div>
            <Button onClick={() => setShowEditModal(true)} variant="secondary">
              Edit Profile
            </Button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <User className="w-4 h-4 inline mr-2" />
                Vendor Name
              </label>
              <div className="px-4 py-2 glass rounded-xl border border-white/30 text-gray-700">
                {user?.name}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Mail className="w-4 h-4 inline mr-2" />
                Email Address
              </label>
              <div className="px-4 py-2 glass rounded-xl border border-white/30 text-gray-700">
                {user?.email}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Phone className="w-4 h-4 inline mr-2" />
                Phone Number
              </label>
              <div className="px-4 py-2 glass rounded-xl border border-white/30 text-gray-700">
                {user?.phone || 'Not provided'}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <MapPin className="w-4 h-4 inline mr-2" />
                Address
              </label>
              <div className="px-4 py-2 glass rounded-xl border border-white/30 text-gray-700">
                {user?.address || user?.location?.address || 'Not provided'}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Account Status
              </label>
              <div className={`px-4 py-2 rounded-lg ${
                user?.isActive
                  ? 'bg-green-50 border border-green-200'
                  : 'bg-red-50 border border-red-200'
              }`}>
                <span className={`font-medium ${
                  user?.isActive ? 'text-green-700' : 'text-red-700'
                }`}>
                  {user?.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Security Settings */}
        <Card>
          <div className="flex items-center mb-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <Lock className="w-8 h-8 text-red-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">Security</h3>
              <p className="text-sm text-gray-600">Manage your password</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <p className="text-sm text-gray-600 mb-4">
                Keep your account secure by using a strong password
              </p>
              <Button onClick={() => navigate('/vendor/change-password')}>
                Change Password
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
            <h3 className="text-xl font-bold mb-4">Edit Profile</h3>
            <form onSubmit={handleUpdateProfile}>
              <div className="space-y-4">
                <Input
                  label="Vendor Name"
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  required
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vendor Image
                  </label>
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setImageFile(file);
                        setImagePreview(URL.createObjectURL(file));
                      }
                    }}
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary-50 file:text-primary-600 hover:file:bg-primary-100 file:rounded-xl"
                  />
                  {(imagePreview || user?.image) && (
                    <img
                      src={imagePreview || `${API_BASE_URL}${user?.image}`}
                      alt="Preview"
                      className="mt-2 w-32 h-32 rounded-lg object-cover"
                    />
                  )}
                </div>
                <Input
                  label="Address"
                  value={profileData.address}
                  onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                  required
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <MapPicker
                    initialLocation={{
                      latitude: profileData.latitude,
                      longitude: profileData.longitude,
                      address: profileData.address
                    }}
                    onLocationSelect={(loc: { address: string; latitude: number; longitude: number }) =>
                      setProfileData({ ...profileData, latitude: loc.latitude, longitude: loc.longitude, address: loc.address })
                    }
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <Button type="submit" disabled={loading}>
                  {loading ? 'Updating...' : 'Update Profile'}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </VendorLayout>
  );
};

export default VendorProfile;


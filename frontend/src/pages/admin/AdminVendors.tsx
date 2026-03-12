import { useState, useEffect } from 'react';
import api, { API_BASE_URL } from '../../utils/api';
import toast from 'react-hot-toast';
import { Vendor } from '../../types';
import AdminLayout from '../../components/AdminLayout';
import Card from '../../components/Card';
import Input from '../../components/Input';
import MapPicker from '../../components/MapPicker';
import { Plus, Edit2, Trash2, Key, ImagePlus } from 'lucide-react';

const AdminVendors = () => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [passwordVendor, setPasswordVendor] = useState<Vendor | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [currentLocation, setCurrentLocation] = useState({ latitude: 28.6139, longitude: 77.209 });
  const [newVendor, setNewVendor] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    latitude: 28.6139,
    longitude: 77.209
  });
  const [editVendor, setEditVendor] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    latitude: 28.6139,
    longitude: 77.209
  });
  const [loading, setLoading] = useState(false);
  const [createImageFile, setCreateImageFile] = useState<File | null>(null);
  const [createImagePreview, setCreateImagePreview] = useState<string | null>(null);
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null);

  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setFile: (f: File | null) => void,
    setPreview: (p: string | null) => void
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      setFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  useEffect(() => {
    fetchVendors();
    // Get admin's current location as default for new vendors
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentLocation({ latitude, longitude });
          setNewVendor(prev => ({ ...prev, latitude, longitude }));
        },
        () => {} // Keep fallback Delhi coords on error
      );
    }
  }, []);

  const fetchVendors = async () => {
    try {
      const response = await api.get('/admin/vendors');
      setVendors(response.data.vendors);
    } catch (error: any) {
      toast.error('Failed to fetch vendors');
    }
  };

  const handleCreateVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('name', newVendor.name);
      formData.append('email', newVendor.email);
      if (newVendor.password) formData.append('password', newVendor.password);
      formData.append('phone', newVendor.phone);
      formData.append('address', newVendor.address);
      formData.append('latitude', String(newVendor.latitude));
      formData.append('longitude', String(newVendor.longitude));
      if (createImageFile) formData.append('image', createImageFile);

      await api.post('/admin/vendors', formData);
      toast.success('Vendor created successfully!');
      setShowCreateModal(false);
      setNewVendor({
        name: '',
        email: '',
        password: '',
        phone: '',
        address: '',
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude
      });
      setCreateImageFile(null);
      setCreateImagePreview(null);
      fetchVendors();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create vendor');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (vendorId: string) => {
    try {
      await api.patch(`/admin/vendors/${vendorId}/toggle-status`);
      toast.success('Vendor status updated');
      fetchVendors();
    } catch (error: any) {
      toast.error('Failed to update vendor status');
    }
  };

  const handleEditVendor = (vendor: Vendor) => {
    setEditingVendor(vendor);
    setEditVendor({
      name: vendor.name,
      email: vendor.email,
      phone: vendor.phone || '',
      address: vendor.address || vendor.location?.address || '',
      latitude: vendor.location?.coordinates?.[1] || 28.6139,
      longitude: vendor.location?.coordinates?.[0] || 77.209,
    });
    setEditImageFile(null);
    setEditImagePreview(vendor.image ? `${API_BASE_URL}${vendor.image}` : null);
    setShowEditModal(true);
  };

  const handleUpdateVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVendor) return;
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('name', editVendor.name);
      formData.append('email', editVendor.email);
      formData.append('phone', editVendor.phone);
      formData.append('address', editVendor.address);
      formData.append('latitude', String(editVendor.latitude));
      formData.append('longitude', String(editVendor.longitude));
      if (editImageFile) formData.append('image', editImageFile);

      await api.put(`/admin/vendors/${editingVendor._id}`, formData);
      toast.success('Vendor updated successfully');
      setShowEditModal(false);
      setEditingVendor(null);
      setEditImageFile(null);
      setEditImagePreview(null);
      fetchVendors();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update vendor');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordVendor) return;

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await api.put(`/admin/vendors/${passwordVendor._id}/reset-password`, { newPassword });
      toast.success('Vendor password updated successfully');
      setShowPasswordModal(false);
      setPasswordVendor(null);
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteVendor = async (vendorId: string, vendorName: string) => {
    if (!window.confirm(`Are you sure you want to delete vendor "${vendorName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await api.delete(`/admin/vendors/${vendorId}`);
      toast.success('Vendor deleted successfully');
      fetchVendors();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete vendor');
    }
  };

  return (
    <AdminLayout>
      <Card>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Vendor Management</h2>
            <p className="text-sm text-gray-500 mt-1">Create and manage all vendors</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-800 active:scale-[0.97] transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Create Vendor
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200/60">
                <th className="px-6 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Image</th>
                <th className="px-6 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Phone</th>
                <th className="px-6 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {vendors.map((vendor) => (
                <tr key={vendor._id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {vendor.image ? (
                      <img src={`${API_BASE_URL}${vendor.image}`} alt={vendor.name} className="w-10 h-10 rounded-xl object-cover ring-1 ring-gray-100" />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center ring-1 ring-gray-100">
                        <ImagePlus className="w-4 h-4 text-gray-300" />
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{vendor.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600">{vendor.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600">{vendor.phone || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${vendor.isActive ? 'bg-emerald-400' : 'bg-gray-300'}`} />
                      <span className={`text-xs font-medium ${vendor.isActive ? 'text-emerald-600' : 'text-gray-400'}`}>
                        {vendor.isActive ? 'Active' : 'Disabled'}
                      </span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleEditVendor(vendor)}
                        className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-blue-50 flex items-center justify-center text-gray-500 hover:text-blue-600 transition-all"
                        title="Edit"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          setPasswordVendor(vendor);
                          setNewPassword('');
                          setConfirmPassword('');
                          setShowPasswordModal(true);
                        }}
                        className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-purple-50 flex items-center justify-center text-gray-500 hover:text-purple-600 transition-all"
                        title="Change Password"
                      >
                        <Key className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(vendor._id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          vendor.isActive
                            ? 'bg-amber-50 text-amber-600 hover:bg-amber-100'
                            : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                        }`}
                      >
                        {vendor.isActive ? 'Disable' : 'Enable'}
                      </button>
                      <button
                        onClick={() => handleDeleteVendor(vendor._id, vendor.name)}
                        className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-red-50 flex items-center justify-center text-gray-400 hover:text-red-500 transition-all"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {vendors.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No vendors yet. Create your first vendor!</p>
            </div>
          )}
        </div>
      </Card>

      {/* Create Vendor Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6">
              <h3 className="text-xl font-bold mb-4">Create New Vendor</h3>
              <form onSubmit={handleCreateVendor}>
                <div className="space-y-4">
                  <Input
                    label="Vendor Name"
                    value={newVendor.name}
                    onChange={(e) => setNewVendor({ ...newVendor, name: e.target.value })}
                    required
                  />
                  <Input
                    label="Email"
                    type="email"
                    value={newVendor.email}
                    onChange={(e) => setNewVendor({ ...newVendor, email: e.target.value })}
                    required
                  />
                  <Input
                    label="Password"
                    type="password"
                    value={newVendor.password}
                    onChange={(e) => setNewVendor({ ...newVendor, password: e.target.value })}
                    placeholder="Leave empty to auto-generate"
                  />
                  <Input
                    label="Phone"
                    value={newVendor.phone}
                    onChange={(e) => setNewVendor({ ...newVendor, phone: e.target.value })}
                    required
                  />
                  <Input
                    label="Address"
                    value={newVendor.address}
                    onChange={(e) => setNewVendor({ ...newVendor, address: e.target.value })}
                    required
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Vendor Image
                    </label>
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                      onChange={(e) => handleImageChange(e, setCreateImageFile, setCreateImagePreview)}
                      className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:font-medium file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 file:rounded-xl file:cursor-pointer transition-all"
                    />
                    {createImagePreview && (
                      <img src={createImagePreview} alt="Preview" className="mt-2 w-32 h-32 rounded-lg object-cover" />
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location
                    </label>
                    <MapPicker
                      initialLocation={{
                        latitude: newVendor.latitude,
                        longitude: newVendor.longitude,
                        address: newVendor.address
                      }}
                      onLocationSelect={(loc: { address: string; latitude: number; longitude: number }) =>
                        setNewVendor({ ...newVendor, latitude: loc.latitude, longitude: loc.longitude, address: loc.address })
                      }
                    />
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button type="submit" disabled={loading}
                    className="px-5 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-800 active:scale-[0.97] transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                    {loading ? 'Creating...' : 'Create Vendor'}
                  </button>
                  <button type="button" onClick={() => setShowCreateModal(false)}
                    className="px-5 py-2.5 bg-gray-100 text-gray-600 text-sm font-medium rounded-xl hover:bg-gray-200 active:scale-[0.97] transition-all">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Vendor Modal */}
      {showEditModal && editingVendor && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6">
              <h3 className="text-xl font-bold mb-4">Edit Vendor</h3>
              <form onSubmit={handleUpdateVendor}>
                <div className="space-y-4">
                  <Input
                    label="Vendor Name"
                    value={editVendor.name}
                    onChange={(e) => setEditVendor({ ...editVendor, name: e.target.value })}
                    required
                  />
                  <Input
                    label="Email"
                    type="email"
                    value={editVendor.email}
                    onChange={(e) => setEditVendor({ ...editVendor, email: e.target.value })}
                    required
                  />
                  <Input
                    label="Phone"
                    value={editVendor.phone}
                    onChange={(e) => setEditVendor({ ...editVendor, phone: e.target.value })}
                    required
                  />
                  <Input
                    label="Address"
                    value={editVendor.address}
                    onChange={(e) => setEditVendor({ ...editVendor, address: e.target.value })}
                    required
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Vendor Image
                    </label>
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                      onChange={(e) => handleImageChange(e, setEditImageFile, setEditImagePreview)}
                      className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:font-medium file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 file:rounded-xl file:cursor-pointer transition-all"
                    />
                    {editImagePreview && (
                      <img src={editImagePreview} alt="Preview" className="mt-2 w-32 h-32 rounded-lg object-cover" />
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location
                    </label>
                    <MapPicker
                      initialLocation={{
                        latitude: editVendor.latitude,
                        longitude: editVendor.longitude,
                        address: editVendor.address
                      }}
                      onLocationSelect={(loc: { address: string; latitude: number; longitude: number }) =>
                        setEditVendor({ ...editVendor, latitude: loc.latitude, longitude: loc.longitude, address: loc.address })
                      }
                    />
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button type="submit" disabled={loading}
                    className="px-5 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-800 active:scale-[0.97] transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                    {loading ? 'Updating...' : 'Update Vendor'}
                  </button>
                  <button type="button" onClick={() => { setShowEditModal(false); setEditingVendor(null); }}
                    className="px-5 py-2.5 bg-gray-100 text-gray-600 text-sm font-medium rounded-xl hover:bg-gray-200 active:scale-[0.97] transition-all">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      {/* Reset Password Modal */}
      {showPasswordModal && passwordVendor && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
            <div className="p-6">
              <h3 className="text-xl font-bold mb-2">Change Password</h3>
              <p className="text-sm text-gray-600 mb-4">
                Reset password for <span className="font-medium">{passwordVendor.name}</span>
              </p>
              <form onSubmit={handleResetPassword}>
                <div className="space-y-4">
                  <Input
                    label="New Password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    required
                  />
                  <Input
                    label="Confirm Password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="flex gap-3 mt-6">
                  <button type="submit" disabled={loading}
                    className="px-5 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-800 active:scale-[0.97] transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                    {loading ? 'Updating...' : 'Update Password'}
                  </button>
                  <button type="button" onClick={() => { setShowPasswordModal(false); setPasswordVendor(null); }}
                    className="px-5 py-2.5 bg-gray-100 text-gray-600 text-sm font-medium rounded-xl hover:bg-gray-200 active:scale-[0.97] transition-all">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminVendors;


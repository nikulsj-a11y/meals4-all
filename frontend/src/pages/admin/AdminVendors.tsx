import { useState, useEffect } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { Vendor } from '../../types';
import AdminLayout from '../../components/AdminLayout';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import MapPicker from '../../components/MapPicker';
import { Plus, Edit2, Trash2 } from 'lucide-react';

const AdminVendors = () => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
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

  useEffect(() => {
    fetchVendors();
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
      await api.post('/admin/vendors', newVendor);
      toast.success('Vendor created successfully!');
      setShowCreateModal(false);
      setNewVendor({
        name: '',
        email: '',
        password: '',
        phone: '',
        address: '',
        latitude: 28.6139,
        longitude: 77.209
      });
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
    setShowEditModal(true);
  };

  const handleUpdateVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVendor) return;
    setLoading(true);

    try {
      await api.put(`/admin/vendors/${editingVendor._id}`, editVendor);
      toast.success('Vendor updated successfully');
      setShowEditModal(false);
      setEditingVendor(null);
      fetchVendors();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update vendor');
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
            <p className="text-sm text-gray-600 mt-1">Create and manage all vendors</p>
          </div>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4 inline mr-2" />
            Create Vendor
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {vendors.map((vendor) => (
                <tr key={vendor._id} className="hover:bg-gray-50">
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
                    <span
                      className={`px-2 py-1 text-xs rounded-full font-medium ${
                        vendor.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {vendor.isActive ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleEditVendor(vendor)}
                        variant="secondary"
                        className="text-sm px-3 py-1"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => handleToggleStatus(vendor._id)}
                        variant={vendor.isActive ? 'danger' : 'primary'}
                        className="text-sm px-3 py-1"
                      >
                        {vendor.isActive ? 'Disable' : 'Enable'}
                      </Button>
                      <Button
                        onClick={() => handleDeleteVendor(vendor._id, vendor.name)}
                        variant="danger"
                        className="text-sm px-3 py-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location
                    </label>
                    <MapPicker
                      latitude={newVendor.latitude}
                      longitude={newVendor.longitude}
                      onLocationChange={(lat, lng) =>
                        setNewVendor({ ...newVendor, latitude: lat, longitude: lng })
                      }
                    />
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Creating...' : 'Create Vendor'}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setShowCreateModal(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Vendor Modal */}
      {showEditModal && editingVendor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location
                    </label>
                    <MapPicker
                      latitude={editVendor.latitude}
                      longitude={editVendor.longitude}
                      onLocationChange={(lat, lng) =>
                        setEditVendor({ ...editVendor, latitude: lat, longitude: lng })
                      }
                    />
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Updating...' : 'Update Vendor'}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingVendor(null);
                    }}
                  >
                    Cancel
                  </Button>
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


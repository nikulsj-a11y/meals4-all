import { useState, useEffect } from 'react';
import api, { API_BASE_URL } from '../../utils/api';
import toast from 'react-hot-toast';
import { FoodItem, Category } from '../../types';
import VendorLayout from '../../components/VendorLayout';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { Plus, Edit2, Trash2, Eye, EyeOff, ImagePlus } from 'lucide-react';

const VendorProducts = () => {
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState<FoodItem | null>(null);
  const [newItem, setNewItem] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    isAvailable: true,
    quantityAvailable: ''
  });
  const [editItem, setEditItem] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    isAvailable: true,
    quantityAvailable: ''
  });
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const [newImagePreview, setNewImagePreview] = useState<string | null>(null);
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchFoodItems();
    fetchCategories();
  }, []);

  const fetchFoodItems = async () => {
    try {
      const response = await api.get('/vendor/food-items');
      setFoodItems(response.data.foodItems);
    } catch (error: any) {
      toast.error('Failed to fetch food items');
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/vendor/categories');
      setCategories(response.data.categories);
    } catch (error: any) {
      toast.error('Failed to fetch categories');
    }
  };

  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setFile: (f: File | null) => void,
    setPreview: (p: string | null) => void
  ) => {
    const file = e.target.files?.[0] || null;
    setFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('name', newItem.name);
      formData.append('description', newItem.description);
      formData.append('price', newItem.price);
      formData.append('category', newItem.category);
      formData.append('isAvailable', String(newItem.isAvailable));
      if (newItem.quantityAvailable) {
        formData.append('quantityAvailable', newItem.quantityAvailable);
      }
      if (newImageFile) {
        formData.append('image', newImageFile);
      }

      await api.post('/vendor/food-items', formData);
      toast.success('Food item created successfully!');
      setShowCreateModal(false);
      setNewItem({ name: '', description: '', price: '', category: '', isAvailable: true, quantityAvailable: '' });
      setNewImageFile(null);
      setNewImagePreview(null);
      fetchFoodItems();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create food item');
    } finally {
      setLoading(false);
    }
  };

  const handleEditItem = (item: FoodItem) => {
    setEditingItem(item);
    setEditItem({
      name: item.name,
      description: item.description,
      price: item.price.toString(),
      category: typeof item.category === 'object' ? item.category._id : item.category,
      isAvailable: item.isAvailable,
      quantityAvailable: item.quantityAvailable ? item.quantityAvailable.toString() : ''
    });
    setEditImageFile(null);
    setEditImagePreview(item.image ? `${API_BASE_URL}${item.image}` : null);
    setShowEditModal(true);
  };

  const handleUpdateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('name', editItem.name);
      formData.append('description', editItem.description);
      formData.append('price', editItem.price);
      formData.append('category', editItem.category);
      formData.append('isAvailable', String(editItem.isAvailable));
      if (editItem.quantityAvailable) {
        formData.append('quantityAvailable', editItem.quantityAvailable);
      }
      if (editImageFile) {
        formData.append('image', editImageFile);
      }

      await api.put(`/vendor/food-items/${editingItem._id}`, formData);
      toast.success('Food item updated successfully');
      setShowEditModal(false);
      setEditingItem(null);
      setEditImageFile(null);
      setEditImagePreview(null);
      fetchFoodItems();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update food item');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAvailability = async (itemId: string, currentStatus: boolean) => {
    try {
      await api.put(`/vendor/food-items/${itemId}`, { isAvailable: !currentStatus });
      toast.success('Availability updated');
      fetchFoodItems();
    } catch (error: any) {
      toast.error('Failed to update availability');
    }
  };

  const handleDeleteItem = async (itemId: string, itemName: string) => {
    if (!window.confirm(`Are you sure you want to delete "${itemName}"?`)) {
      return;
    }

    try {
      await api.delete(`/vendor/food-items/${itemId}`);
      toast.success('Food item deleted successfully');
      fetchFoodItems();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete food item');
    }
  };

  const getCategoryName = (category: Category | string): string => {
    if (typeof category === 'object') {
      return category.name;
    }
    const cat = categories.find(c => c._id === category);
    return cat?.name || 'Unknown';
  };

  return (
    <VendorLayout>
      <Card>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Food Items</h2>
            <p className="text-sm text-gray-600 mt-1">Manage your menu items</p>
          </div>
          <button onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-800 active:scale-[0.97] transition-all shadow-sm">
            <Plus className="w-4 h-4" />
            Add Food Item
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200/60">
                <th className="px-6 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Image</th>
                <th className="px-6 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Quantity</th>
                <th className="px-6 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {foodItems.map((item) => (
                <tr key={item._id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {item.image ? (
                      <img src={`${API_BASE_URL}${item.image}`} alt={item.name}
                        className="w-10 h-10 rounded-xl object-cover ring-1 ring-gray-100" />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center ring-1 ring-gray-100">
                        <ImagePlus className="w-4 h-4 text-gray-300" />
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{item.name}</div>
                    <div className="text-sm text-gray-500">{item.description}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{getCategoryName(item.category)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">₹{item.price.toFixed(2)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {item.quantityAvailable !== null && item.quantityAvailable !== undefined
                        ? `${item.quantityAvailable} left`
                        : 'Unlimited'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${item.isAvailable ? 'bg-emerald-400' : 'bg-gray-300'}`} />
                      <span className={`text-xs font-medium ${item.isAvailable ? 'text-emerald-600' : 'text-gray-400'}`}>
                        {item.isAvailable ? 'Available' : 'Unavailable'}
                      </span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => handleToggleAvailability(item._id, item.isAvailable)}
                        className={`w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center transition-all ${
                          item.isAvailable ? 'hover:bg-amber-50 text-gray-500 hover:text-amber-600' : 'hover:bg-emerald-50 text-gray-500 hover:text-emerald-600'
                        }`}
                        title={item.isAvailable ? "Mark Unavailable" : "Mark Available"}>
                        {item.isAvailable ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                      <button onClick={() => handleEditItem(item)}
                        className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-blue-50 flex items-center justify-center text-gray-500 hover:text-blue-600 transition-all" title="Edit">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDeleteItem(item._id, item.name)}
                        className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-red-50 flex items-center justify-center text-gray-400 hover:text-red-500 transition-all" title="Delete">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {foodItems.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No food items yet. Create your first item!</p>
            </div>
          )}
        </div>
      </Card>

      {/* Create Food Item Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto shadow-2xl">
            <h3 className="text-xl font-bold mb-4">Create New Food Item</h3>
            <form onSubmit={handleCreateItem}>
              <Input
                label="Name"
                value={newItem.name}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                required
                placeholder="e.g., Margherita Pizza"
              />
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newItem.description}
                  onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                  required
                  rows={3}
                  className="w-full px-3.5 py-2.5 glass-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-400/50 focus:border-primary-300 transition-all duration-200 text-gray-800"
                  placeholder="Describe your food item..."
                />
              </div>
              <Input
                label="Price"
                type="number"
                step="0.01"
                value={newItem.price}
                onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                required
                placeholder="0.00"
                className="mt-4"
              />
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={newItem.category}
                  onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                  required
                  className="w-full px-3.5 py-2.5 glass-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-400/50 focus:border-primary-300 transition-all duration-200 text-gray-800"
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Image
                </label>
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                  onChange={(e) => handleImageChange(e, setNewImageFile, setNewImagePreview)}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary-50 file:text-primary-600 hover:file:bg-primary-100 file:rounded-xl"
                />
                {newImagePreview && (
                  <img src={newImagePreview} alt="Preview" className="mt-2 w-32 h-32 rounded-lg object-cover" />
                )}
              </div>
              <Input
                label="Quantity Available (Optional)"
                type="number"
                min="0"
                value={newItem.quantityAvailable}
                onChange={(e) => setNewItem({ ...newItem, quantityAvailable: e.target.value })}
                placeholder="Leave empty for unlimited"
                className="mt-4"
                helperText="Set a specific quantity or leave empty for unlimited availability"
              />
              <div className="mt-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={newItem.isAvailable}
                    onChange={(e) => setNewItem({ ...newItem, isAvailable: e.target.checked })}
                    className="mr-2 h-4 w-4 text-primary-500 focus:ring-primary-400 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">Available for orders</span>
                </label>
              </div>
              <div className="flex gap-3 mt-6">
                <Button type="submit" disabled={loading}>
                  {loading ? 'Creating...' : 'Create Item'}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewItem({ name: '', description: '', price: '', category: '', isAvailable: true, quantityAvailable: '' });
                    setNewImageFile(null);
                    setNewImagePreview(null);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Food Item Modal */}
      {showEditModal && editingItem && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto shadow-2xl">
            <h3 className="text-xl font-bold mb-4">Edit Food Item</h3>
            <form onSubmit={handleUpdateItem}>
              <Input
                label="Name"
                value={editItem.name}
                onChange={(e) => setEditItem({ ...editItem, name: e.target.value })}
                required
              />
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={editItem.description}
                  onChange={(e) => setEditItem({ ...editItem, description: e.target.value })}
                  required
                  rows={3}
                  className="w-full px-3.5 py-2.5 glass-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-400/50 focus:border-primary-300 transition-all duration-200 text-gray-800"
                />
              </div>
              <Input
                label="Price"
                type="number"
                step="0.01"
                value={editItem.price}
                onChange={(e) => setEditItem({ ...editItem, price: e.target.value })}
                required
                className="mt-4"
              />
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={editItem.category}
                  onChange={(e) => setEditItem({ ...editItem, category: e.target.value })}
                  required
                  className="w-full px-3.5 py-2.5 glass-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-400/50 focus:border-primary-300 transition-all duration-200 text-gray-800"
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Image
                </label>
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                  onChange={(e) => handleImageChange(e, setEditImageFile, setEditImagePreview)}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary-50 file:text-primary-600 hover:file:bg-primary-100 file:rounded-xl"
                />
                {editImagePreview && (
                  <img src={editImagePreview} alt="Preview" className="mt-2 w-32 h-32 rounded-lg object-cover" />
                )}
              </div>
              <Input
                label="Quantity Available (Optional)"
                type="number"
                min="0"
                value={editItem.quantityAvailable}
                onChange={(e) => setEditItem({ ...editItem, quantityAvailable: e.target.value })}
                placeholder="Leave empty for unlimited"
                className="mt-4"
                helperText="Set a specific quantity or leave empty for unlimited availability"
              />
              <div className="mt-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={editItem.isAvailable}
                    onChange={(e) => setEditItem({ ...editItem, isAvailable: e.target.checked })}
                    className="mr-2 h-4 w-4 text-primary-500 focus:ring-primary-400 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">Available for orders</span>
                </label>
              </div>
              <div className="flex gap-3 mt-6">
                <Button type="submit" disabled={loading}>
                  {loading ? 'Updating...' : 'Update Item'}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingItem(null);
                    setEditImageFile(null);
                    setEditImagePreview(null);
                  }}
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

export default VendorProducts;


import { useState, useEffect } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { FoodItem, Category } from '../../types';
import VendorLayout from '../../components/VendorLayout';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { Plus, Edit2, Trash2, Eye, EyeOff } from 'lucide-react';

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

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload: any = {
        ...newItem,
        price: parseFloat(newItem.price)
      };

      // Only include quantityAvailable if it's provided
      if (newItem.quantityAvailable) {
        payload.quantityAvailable = parseInt(newItem.quantityAvailable);
      }

      await api.post('/vendor/food-items', payload);
      toast.success('Food item created successfully!');
      setShowCreateModal(false);
      setNewItem({ name: '', description: '', price: '', category: '', isAvailable: true, quantityAvailable: '' });
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
    setShowEditModal(true);
  };

  const handleUpdateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    setLoading(true);

    try {
      const payload: any = {
        ...editItem,
        price: parseFloat(editItem.price)
      };

      // Only include quantityAvailable if it's provided
      if (editItem.quantityAvailable) {
        payload.quantityAvailable = parseInt(editItem.quantityAvailable);
      } else {
        payload.quantityAvailable = null;
      }

      await api.put(`/vendor/food-items/${editingItem._id}`, payload);
      toast.success('Food item updated successfully');
      setShowEditModal(false);
      setEditingItem(null);
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
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4 inline mr-2" />
            Add Food Item
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {foodItems.map((item) => (
                <tr key={item._id} className="hover:bg-gray-50">
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
                    <span
                      className={`px-2 py-1 text-xs rounded-full font-medium inline-flex items-center gap-1 ${
                        item.isAvailable
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {item.isAvailable ? (
                        <>
                          <Eye className="w-3 h-3" />
                          Available
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-3 h-3" />
                          Unavailable
                        </>
                      )}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleToggleAvailability(item._id, item.isAvailable)}
                        variant={item.isAvailable ? "secondary" : "primary"}
                        className="text-sm px-3 py-1"
                        title={item.isAvailable ? "Mark as Unavailable" : "Mark as Available"}
                      >
                        {item.isAvailable ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        onClick={() => handleEditItem(item)}
                        variant="secondary"
                        className="text-sm px-3 py-1"
                        title="Edit Item"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => handleDeleteItem(item._id, item.name)}
                        variant="danger"
                        className="text-sm px-3 py-1"
                        title="Delete Item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
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
                    className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
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
                    className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
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


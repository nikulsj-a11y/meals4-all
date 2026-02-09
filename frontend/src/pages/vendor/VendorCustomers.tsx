import { useState, useEffect } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import VendorLayout from '../../components/VendorLayout';
import PageHeader from '../../components/PageHeader';
import Table from '../../components/Table';
import Card from '../../components/Card';
import { Users, DollarSign, ShoppingBag } from 'lucide-react';

interface Customer {
  _id: string;
  name: string;
  mobileNumber: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: string;
}

const VendorCustomers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await api.get('/vendor/customers');
      setCustomers(response.data.customers);
    } catch (error: any) {
      toast.error('Failed to fetch customers');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      header: 'Customer Name',
      accessor: 'name',
      cell: (row: Customer) => (
        <div>
          <div className="font-medium text-gray-900">{row.name}</div>
          <div className="text-sm text-gray-500">{row.mobileNumber}</div>
        </div>
      ),
    },
    {
      header: 'Total Orders',
      accessor: 'totalOrders',
      cell: (row: Customer) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {row.totalOrders} orders
        </span>
      ),
    },
    {
      header: 'Total Spent',
      accessor: 'totalSpent',
      cell: (row: Customer) => (
        <span className="font-semibold text-green-600">₹{row.totalSpent.toFixed(2)}</span>
      ),
    },
    {
      header: 'Last Order',
      accessor: 'lastOrderDate',
      cell: (row: Customer) => (
        <span className="text-sm text-gray-600">
          {new Date(row.lastOrderDate).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })}
        </span>
      ),
    },
  ];

  const totalCustomers = customers.length;
  const totalRevenue = customers.reduce((sum, c) => sum + c.totalSpent, 0);
  const totalOrders = customers.reduce((sum, c) => sum + c.totalOrders, 0);

  return (
    <VendorLayout>
      <PageHeader
        title="Customers"
        subtitle="Manage and view your customer base"
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Customers</p>
              <p className="text-3xl font-bold text-gray-900">{totalCustomers}</p>
            </div>
            <div className="p-3 rounded-full bg-blue-100">
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Orders</p>
              <p className="text-3xl font-bold text-gray-900">{totalOrders}</p>
            </div>
            <div className="p-3 rounded-full bg-purple-100">
              <ShoppingBag className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-3xl font-bold text-gray-900">₹{totalRevenue.toFixed(2)}</p>
            </div>
            <div className="p-3 rounded-full bg-green-100">
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Customers Table */}
      <Card>
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Customer List</h3>
          <p className="text-sm text-gray-600">All customers who have ordered from your restaurant</p>
        </div>
        
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <p className="mt-2 text-sm text-gray-600">Loading customers...</p>
          </div>
        ) : (
          <Table columns={columns} data={customers} emptyMessage="No customers yet" />
        )}
      </Card>
    </VendorLayout>
  );
};

export default VendorCustomers;


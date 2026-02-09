import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Card from '../../components/Card';

const VendorLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post('/auth/vendor/login', { email, password });
      const { token, user, isFirstLogin } = response.data;
      
      login(token, user);
      toast.success('Login successful!');
      
      if (isFirstLogin) {
        navigate('/vendor/change-password');
      } else {
        navigate('/vendor/dashboard');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-700 px-4">
      <Card className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Meals4All</h1>
          <p className="text-gray-600 mt-2">Vendor Portal</p>
        </div>

        <form onSubmit={handleSubmit}>
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="vendor@example.com"
            required
          />

          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
          />

          <Button type="submit" fullWidth disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          <a href="/admin/login" className="text-primary-600 hover:underline">
            Admin Login
          </a>
          {' | '}
          <a href="/user/login" className="text-primary-600 hover:underline">
            User Login
          </a>
        </div>
      </Card>
    </div>
  );
};

export default VendorLogin;


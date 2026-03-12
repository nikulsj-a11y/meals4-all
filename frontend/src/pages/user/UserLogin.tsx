import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Card from '../../components/Card';

const UserLogin = () => {
  const [step, setStep] = useState<'mobile' | 'otp'>('mobile');
  const [mobileNumber, setMobileNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSendOTP = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post('/auth/user/send-otp', { mobileNumber });
      toast.success('OTP sent successfully!');
      
      // In development, show OTP in console
      if (response.data.otp) {
        console.log('OTP:', response.data.otp);
        toast.success(`OTP: ${response.data.otp} (Dev Mode)`);
      }
      
      setStep('otp');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post('/auth/user/verify-otp', { mobileNumber, otp });
      const { token, user } = response.data;
      
      login(token, user);
      toast.success('Login successful!');
      navigate('/user/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-macos-mesh px-4">
      <Card className="w-full max-w-md backdrop-blur-xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">Meals4All</h1>
          <p className="text-gray-500 mt-2">User Portal</p>
        </div>

        {step === 'mobile' ? (
          <form onSubmit={handleSendOTP}>
            <Input
              label="Mobile Number"
              type="tel"
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value)}
              placeholder="Enter 10-digit mobile number"
              maxLength={10}
              pattern="[0-9]{10}"
              required
            />

            <Button type="submit" fullWidth disabled={loading}>
              {loading ? 'Sending OTP...' : 'Send OTP'}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP}>
            <div className="mb-4 p-3 glass rounded-xl">
              <p className="text-sm text-gray-500">OTP sent to</p>
              <p className="font-semibold text-gray-800">{mobileNumber}</p>
              <button
                type="button"
                onClick={() => setStep('mobile')}
                className="text-sm text-primary-500 hover:text-primary-600 mt-1 transition-colors"
              >
                Change number
              </button>
            </div>

            <Input
              label="Enter OTP"
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter 6-digit OTP"
              maxLength={6}
              pattern="[0-9]{6}"
              required
            />

            <Button type="submit" fullWidth disabled={loading}>
              {loading ? 'Verifying...' : 'Verify OTP'}
            </Button>

            <button
              type="button"
              onClick={handleSendOTP}
              className="w-full mt-3 text-sm text-primary-600 hover:underline"
            >
              Resend OTP
            </button>
          </form>
        )}

        {/* <div className="mt-6 text-center text-sm text-gray-600">
          <a href="/admin/login" className="text-primary-600 hover:underline">
            Admin Login
          </a>
          {' | '}
          <a href="/vendor/login" className="text-primary-600 hover:underline">
            Vendor Login
          </a>
        </div> */}
      </Card>
    </div>
  );
};

export default UserLogin;


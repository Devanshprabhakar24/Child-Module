import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [step, setStep] = useState<'credentials' | 'otp'>('credentials');
  const [form, setForm] = useState({ registrationId: '', email: '', otp: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authApi.sendOtp({ email: form.email });
      setStep('otp');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await authApi.login({
        registrationId: form.registrationId,
        email: form.email,
        otp: form.otp,
      });
      login(res.data.token, res.data.user);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">W18</div>
          <h1>Login</h1>
          <p>Sign in with your registration ID</p>
        </div>

        {step === 'credentials' ? (
          <form onSubmit={handleSendOtp}>
            <div className="form-group">
              <label htmlFor="registrationId">Registration ID</label>
              <input
                id="registrationId"
                type="text"
                required
                placeholder="CHD-UP-20260101-000001"
                value={form.registrationId}
                onChange={(e) => setForm({ ...form, registrationId: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                required
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>

            {error && <div className="form-error">{error}</div>}
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Sending OTP...' : 'Send OTP'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label htmlFor="otp">Enter OTP</label>
              <input
                id="otp"
                type="text"
                required
                maxLength={6}
                placeholder="123456"
                value={form.otp}
                onChange={(e) => setForm({ ...form, otp: e.target.value })}
              />
            </div>
            {error && <div className="form-error">{error}</div>}
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
            <button type="button" className="btn-link" onClick={() => setStep('credentials')}>
              Back
            </button>
          </form>
        )}

        <div className="auth-footer">
          <span>New here? <Link to="/register">Create Account</Link></span>
          <br />
          <span>First time? <Link to="/first-login">First-Time Login</Link></span>
        </div>
      </div>
    </div>
  );
}

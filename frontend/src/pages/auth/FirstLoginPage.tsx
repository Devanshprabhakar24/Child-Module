import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function FirstLoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [step, setStep] = useState<'info' | 'otp'>('info');
  const [form, setForm] = useState({ registrationId: '', email: '', phone: '', otp: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authApi.sendOtp({ email: form.email, phone: form.phone || undefined });
      setStep('otp');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleFirstLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await authApi.firstLogin({
        registrationId: form.registrationId,
        email: form.email,
        phone: form.phone,
        otp: form.otp,
      });
      login(res.data.token, res.data.user);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'First login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">W18</div>
          <h1>First-Time Login</h1>
          <p>Link your child registration to your account</p>
        </div>

        {step === 'info' ? (
          <form onSubmit={handleSendOtp}>
            <div className="form-group">
              <label htmlFor="registrationId">Child Registration ID</label>
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
            <div className="form-group">
              <label htmlFor="phone">Phone</label>
              <input
                id="phone"
                type="tel"
                required
                placeholder="+91XXXXXXXXXX"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
            {error && <div className="form-error">{error}</div>}
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Sending OTP...' : 'Send OTP'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleFirstLogin}>
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
              {loading ? 'Verifying...' : 'Verify & Login'}
            </button>
            <button type="button" className="btn-link" onClick={() => setStep('info')}>
              Back
            </button>
          </form>
        )}

        <div className="auth-footer">
          <Link to="/login">Already logged in before? Login</Link>
        </div>
      </div>
    </div>
  );
}

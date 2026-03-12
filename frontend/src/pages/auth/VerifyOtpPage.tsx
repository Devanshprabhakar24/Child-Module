import { useState, type FormEvent } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { authApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function VerifyOtpPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const email = (location.state as any)?.email || '';
  const flow = (location.state as any)?.flow || 'register';

  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  const handleSendOtp = async () => {
    setSendingOtp(true);
    setError('');
    try {
      await authApi.sendOtp({ email });
      setOtpSent(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerify = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await authApi.verifyOtp({ email, otp });
      login(res.data.token, res.data.user);
      if (flow === 'register') {
        navigate('/register-child');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">W18</div>
          <h1>Verify Email</h1>
          <p>We'll send an OTP to <strong>{email}</strong></p>
        </div>

        {!otpSent ? (
          <div>
            <button className="btn-primary" onClick={handleSendOtp} disabled={sendingOtp}>
              {sendingOtp ? 'Sending...' : 'Send OTP'}
            </button>
          </div>
        ) : (
          <form onSubmit={handleVerify}>
            <div className="form-group">
              <label htmlFor="otp">Enter OTP</label>
              <input
                id="otp"
                type="text"
                required
                maxLength={6}
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
            </div>
            {error && <div className="form-error">{error}</div>}
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
            <button type="button" className="btn-link" onClick={handleSendOtp} disabled={sendingOtp}>
              Resend OTP
            </button>
          </form>
        )}

        {error && !otpSent && <div className="form-error">{error}</div>}

        <div className="auth-footer">
          <Link to="/register">Back to Register</Link>
        </div>
      </div>
    </div>
  );
}

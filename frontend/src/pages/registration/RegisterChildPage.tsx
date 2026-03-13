import { useState, useEffect, useMemo, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { registrationApi, paymentsApi } from '../../services/api';
import { INDIAN_STATES, GENDER_OPTIONS } from '../../utils/constants';
import { useAuth } from '../../context/AuthContext';

declare global {
  interface Window {
    Razorpay: any;
  }
}

function calculateAge(dob: string): number | null {
  if (!dob) return null;
  const birth = new Date(dob);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
  return age;
}

export default function RegisterChildPage() {
  const navigate = useNavigate();
  const { user, refreshProfile } = useAuth();

  const [form, setForm] = useState({
    childName: '',
    childGender: '',
    dateOfBirth: '',
    state: '',
    motherName: user?.fullName || '',
    fatherName: '',
    email: user?.email || '',
    phone: user?.phone || '',
    phone2: '',
    address: '',
  });

  // State auto-fill: filter states as user types first 3+ letters
  const [stateSearch, setStateSearch] = useState('');
  const filteredStates = useMemo(() => {
    if (!stateSearch || stateSearch.length < 1) return Object.entries(INDIAN_STATES);
    const q = stateSearch.toLowerCase();
    return Object.entries(INDIAN_STATES).filter(
      ([code, name]) => name.toLowerCase().startsWith(q) || code.toLowerCase().startsWith(q),
    );
  }, [stateSearch]);

  const age = calculateAge(form.dateOfBirth);
  const ageError = age !== null && (age > 18 ? 'Child must be 18 years or younger.' : age < 0 ? 'Date of birth cannot be in the future.' : '');

  useEffect(() => {
    if (user) {
      setForm(prev => ({
        ...prev,
        motherName: prev.motherName || user.fullName || '',
        email: prev.email || user.email || '',
        phone: prev.phone || user.phone || '',
      }));
    }
  }, [user]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [pendingPayment, setPendingPayment] = useState<any>(null);
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  const set = (field: string, value: string) => setForm({ ...form, [field]: value });

  const initiatePayment = async (regData: any) => {
    if (regData.testMode) {
      // Test mode: show simulated payment, then confirm
      setPendingPayment(regData);
    } else {
      // Production: open Razorpay checkout
      setPendingPayment(regData);
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: regData.subscriptionAmount * 100,
        currency: 'INR',
        name: 'WombTo18',
        description: `Registration: ${regData.registrationId}`,
        order_id: regData.razorpayOrderId,
        handler: async (response: any) => {
          setPaymentProcessing(true);
          try {
            await paymentsApi.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            setResult({ ...regData, paymentStatus: 'COMPLETED' });
            setPendingPayment(null);
            if (user?._id && regData.registrationId) {
              try {
                await registrationApi.linkParent(regData.registrationId, user._id);
                await refreshProfile();
              } catch { /* linking might fail if already linked */ }
            }
          } catch (err: any) {
            setError(err.response?.data?.message || 'Payment verification failed');
          } finally {
            setPaymentProcessing(false);
          }
        },
        prefill: {
          email: form.email,
          contact: form.phone,
        },
        theme: { color: '#4F6BFF' },
        modal: {
          ondismiss: () => {
            setError('Payment was cancelled. You can retry from the dashboard.');
          },
        },
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    }
  };

  const handleTestPayment = async () => {
    if (!pendingPayment) return;
    setPaymentProcessing(true);
    setError('');
    try {
      await paymentsApi.confirmTestPayment(pendingPayment.registrationId);
      setResult({ ...pendingPayment, paymentStatus: 'COMPLETED' });
      setPendingPayment(null);
      if (user?._id && pendingPayment.registrationId) {
        try {
          await registrationApi.linkParent(pendingPayment.registrationId, user._id);
          await refreshProfile();
        } catch { /* linking might fail if already linked */ }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Payment confirmation failed');
    } finally {
      setPaymentProcessing(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload: any = {
        childName: form.childName,
        childGender: form.childGender,
        dateOfBirth: form.dateOfBirth,
        state: form.state,
        motherName: form.motherName,
        email: form.email,
        phone: form.phone,
      };
      if (form.fatherName) payload.fatherName = form.fatherName;
      if (form.phone2) payload.phone2 = form.phone2;
      if (form.address) payload.address = form.address;

      const res = await registrationApi.registerChild(payload);
      const regData = res.data.data || res.data;

      await initiatePayment(regData);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  if (pendingPayment) {
    return (
      <div className="auth-page">
        <div className="auth-card" style={{ maxWidth: 540 }}>
          <div className="auth-header">
            <div className="auth-logo" style={{ background: '#F59E0B' }}>₹</div>
            <h1>Complete Payment</h1>
            <p>Pay the subscription fee to complete registration</p>
          </div>
          <div className="result-card">
            <div className="result-row">
              <span className="result-label">Registration ID</span>
              <span className="result-value highlight">{pendingPayment.registrationId}</span>
            </div>
            <div className="result-row">
              <span className="result-label">Child's Name</span>
              <span className="result-value">{pendingPayment.childName}</span>
            </div>
            <div className="result-row">
              <span className="result-label">Amount</span>
              <span className="result-value">₹{pendingPayment.subscriptionAmount}</span>
            </div>
            <div className="result-row">
              <span className="result-label">Order ID</span>
              <span className="result-value" style={{ fontSize: 12, fontFamily: 'monospace' }}>{pendingPayment.razorpayOrderId}</span>
            </div>
            {pendingPayment.testMode && (
              <div style={{ background: '#FEF3C7', borderRadius: 8, padding: '10px 14px', marginTop: 12, fontSize: 13, color: '#92400E' }}>
                <strong>Test Mode:</strong> No real payment will be charged. Click below to simulate payment.
              </div>
            )}
          </div>
          {error && <div className="form-error">{error}</div>}
          {pendingPayment.testMode ? (
            <button className="btn-primary" onClick={handleTestPayment} disabled={paymentProcessing}>
              {paymentProcessing ? 'Processing Payment...' : 'Pay ₹999 (Test Mode)'}
            </button>
          ) : (
            <button className="btn-primary" onClick={() => initiatePayment(pendingPayment)} disabled={paymentProcessing}>
              {paymentProcessing ? 'Verifying Payment...' : 'Pay with Razorpay'}
            </button>
          )}
        </div>
      </div>
    );
  }

  if (result) {
    return (
      <div className="auth-page">
        <div className="auth-card" style={{ maxWidth: 540 }}>
          <div className="auth-header">
            <div className="auth-logo" style={{ background: '#10B981' }}>✓</div>
            <h1>Thank You for Registering!</h1>
            <p>Thank you for registering your child with WombTo18</p>
          </div>
          <div className="result-card">
            <div className="result-row">
              <span className="result-label">Registration ID</span>
              <span className="result-value highlight">{result.registrationId}</span>
            </div>
            <div className="result-row">
              <span className="result-label">Child's Name</span>
              <span className="result-value">{result.childName}</span>
            </div>
            <div className="result-row">
              <span className="result-label">Gender</span>
              <span className="result-value">{result.childGender}</span>
            </div>
            <div className="result-row">
              <span className="result-label">Age Group</span>
              <span className="result-value">{result.ageGroup}</span>
            </div>
            <div className="result-row">
              <span className="result-label">Subscription Amount</span>
              <span className="result-value">₹{result.subscriptionAmount}</span>
            </div>
            <div className="result-row">
              <span className="result-label">Payment Status</span>
              <span className={`badge ${result.paymentStatus === 'COMPLETED' ? 'badge-success' : 'badge-warning'}`}>
                {result.paymentStatus}
              </span>
            </div>
            {result.greenCohort && (
              <div className="result-row">
                <span className="result-label">Green Cohort</span>
                <span className="badge badge-success">Enrolled ✓</span>
              </div>
            )}
          </div>
          <div style={{ background: '#F0FDF4', borderRadius: 8, padding: '12px 16px', marginBottom: 16, fontSize: 14, color: '#166534' }}>
            A confirmation with your dashboard link, invoice, and Go Green Participation Certificate has been sent via <strong>SMS</strong>, <strong>WhatsApp</strong>, and <strong>Email</strong>.
          </div>
          <button className="btn-primary" onClick={() => navigate('/dashboard')}>
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: 560 }}>
        <div className="auth-header">
          <div className="auth-logo">W18</div>
          <h1>Register Child</h1>
          <p>Enter your child's details to register</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="childName">Child's Name *</label>
              <input id="childName" required value={form.childName} onChange={(e) => set('childName', e.target.value)} />
            </div>
            <div className="form-group">
              <label htmlFor="childGender">Gender *</label>
              <select id="childGender" required value={form.childGender} onChange={(e) => set('childGender', e.target.value)}>
                <option value="">Select</option>
                {GENDER_OPTIONS.map((g) => (
                  <option key={g} value={g}>{g.charAt(0) + g.slice(1).toLowerCase()}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="dateOfBirth">Date of Birth *</label>
              <input id="dateOfBirth" type="date" required value={form.dateOfBirth} onChange={(e) => set('dateOfBirth', e.target.value)} />
              {age !== null && !ageError && (
                <span style={{ fontSize: 12, color: '#64748B', marginTop: 4 }}>Age: {age < 1 ? 'Under 1 year' : `${age} years`}</span>
              )}
              {ageError && <span style={{ fontSize: 12, color: '#EF4444', marginTop: 4 }}>{ageError}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="stateSearch">State * <span style={{ fontSize: 11, color: '#94A3B8' }}>(type to search)</span></label>
              <input
                id="stateSearch"
                placeholder="Type state name or code..."
                value={stateSearch}
                onChange={(e) => {
                  setStateSearch(e.target.value);
                  // Auto-select if exactly one match
                  const q = e.target.value.toLowerCase();
                  const matches = Object.entries(INDIAN_STATES).filter(
                    ([code, name]) => name.toLowerCase().startsWith(q) || code.toLowerCase().startsWith(q),
                  );
                  if (matches.length === 1) {
                    set('state', matches[0][0]);
                  }
                }}
                autoComplete="off"
              />
              <select id="state" required value={form.state} onChange={(e) => { set('state', e.target.value); setStateSearch(INDIAN_STATES[e.target.value] || ''); }} style={{ marginTop: 4 }}>
                <option value="">Select State</option>
                {filteredStates.map(([code, name]) => (
                  <option key={code} value={code}>{name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="motherName">Mother's Name *</label>
              <input id="motherName" required value={form.motherName} onChange={(e) => set('motherName', e.target.value)} />
            </div>
            <div className="form-group">
              <label htmlFor="fatherName">Father's Name</label>
              <input id="fatherName" value={form.fatherName} onChange={(e) => set('fatherName', e.target.value)} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="email">Email *</label>
              <input id="email" type="email" required value={form.email} onChange={(e) => set('email', e.target.value)} />
            </div>
            <div className="form-group">
              <label htmlFor="phone">Phone *</label>
              <input id="phone" type="tel" required placeholder="+91XXXXXXXXXX" value={form.phone} onChange={(e) => set('phone', e.target.value)} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="phone2">Alternate Phone</label>
              <input id="phone2" type="tel" placeholder="+91XXXXXXXXXX" value={form.phone2} onChange={(e) => set('phone2', e.target.value)} />
            </div>
            <div className="form-group">
              <label htmlFor="address">Address</label>
              <input id="address" value={form.address} onChange={(e) => set('address', e.target.value)} />
            </div>
          </div>
          {error && <div className="form-error">{error}</div>}
          <button type="submit" className="btn-primary" disabled={loading || !!ageError}>
            {loading ? 'Registering...' : 'Register Child (₹999)'}
          </button>
        </form>
      </div>
    </div>
  );
}

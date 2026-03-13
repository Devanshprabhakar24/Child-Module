import { useState, useEffect } from 'react';
import { paymentsApi, dashboardApi } from '../../services/api';
import { IndianRupee, CheckCircle, XCircle, Clock, CreditCard, Receipt, FileDown } from 'lucide-react';

interface ChildOption {
  registrationId: string;
  childName: string;
}

interface PaymentRecord {
  _id: string;
  registrationId: string;
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  amount: number;
  currency: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  method?: string;
  receipt?: string;
  createdAt: string;
}

interface RegistrationPayment {
  registrationId: string;
  childName: string;
  paymentStatus: string;
  subscriptionAmount: number;
  razorpayOrderId?: string;
}

const STATUS_CONFIG = {
  COMPLETED: { icon: CheckCircle, color: '#22c55e', label: 'Completed', bg: '#f0fdf4' },
  PENDING: { icon: Clock, color: '#f59e0b', label: 'Pending', bg: '#fffbeb' },
  FAILED: { icon: XCircle, color: '#ef4444', label: 'Failed', bg: '#fef2f2' },
  REFUNDED: { icon: IndianRupee, color: '#6366f1', label: 'Refunded', bg: '#eef2ff' },
} as const;

export default function PaymentsPage() {
  const [children, setChildren] = useState<ChildOption[]>([]);
  const [selectedChild, setSelectedChild] = useState('');
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [regPayment, setRegPayment] = useState<RegistrationPayment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadChildren();
  }, []);

  useEffect(() => {
    if (selectedChild) {
      loadPayments(selectedChild);
    }
  }, [selectedChild]);

  const loadChildren = async () => {
    try {
      const res = await dashboardApi.getFamily();
      const list = res.data.data.children || [];
      setChildren(list.map((c: any) => ({ registrationId: c.registrationId, childName: c.childName })));
      if (list.length > 0) {
        setSelectedChild(list[0].registrationId);
      }
    } catch {
      setError('Failed to load children');
    } finally {
      setLoading(false);
    }
  };

  const loadPayments = async (regId: string) => {
    setLoading(true);
    setError('');
    try {
      const [payRes, regRes] = await Promise.all([
        paymentsApi.getByRegistration(regId),
        dashboardApi.getChildDashboard(regId),
      ]);
      setPayments(payRes.data.data || []);
      const profile = regRes.data.data?.profile;
      if (profile) {
        setRegPayment({
          registrationId: profile.registrationId,
          childName: profile.childName,
          paymentStatus: profile.paymentStatus || 'COMPLETED',
          subscriptionAmount: profile.subscriptionAmount || 999,
          razorpayOrderId: profile.razorpayOrderId,
        });
      }
    } catch {
      setError('Failed to load payment details');
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status: string) => {
    return STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.PENDING;
  };

  const handleDownloadInvoice = async () => {
    if (!selectedChild) return;
    try {
      const res = await paymentsApi.downloadInvoice(selectedChild);
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `WombTo18_Invoice_${selectedChild}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch {
      setError('Failed to download invoice. No completed payment found.');
    }
  };

  if (loading && children.length === 0) {
    return <div className="page-loading">Loading payments...</div>;
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1><CreditCard size={28} /> Payment History</h1>
        {children.length > 1 && (
          <select
            className="child-selector"
            value={selectedChild}
            onChange={(e) => setSelectedChild(e.target.value)}
          >
            {children.map((c) => (
              <option key={c.registrationId} value={c.registrationId}>
                {c.childName} ({c.registrationId})
              </option>
            ))}
          </select>
        )}
      </div>

      {error && <div className="form-error">{error}</div>}

      {/* Registration Payment Summary */}
      {regPayment && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div className="card-header">
            <h3><Receipt size={20} /> Subscription Payment</h3>
          </div>
          <div className="card-body">
            <div className="payment-summary">
              <div className="payment-summary-row">
                <span className="payment-label">Child</span>
                <span className="payment-value">{regPayment.childName}</span>
              </div>
              <div className="payment-summary-row">
                <span className="payment-label">Registration ID</span>
                <span className="payment-value" style={{ fontFamily: 'monospace' }}>{regPayment.registrationId}</span>
              </div>
              <div className="payment-summary-row">
                <span className="payment-label">Plan</span>
                <span className="payment-value">WombTo18 Full Subscription</span>
              </div>
              <div className="payment-summary-row">
                <span className="payment-label">Base Price</span>
                <span className="payment-value">₹846.61</span>
              </div>
              <div className="payment-summary-row">
                <span className="payment-label">GST (18%)</span>
                <span className="payment-value">₹152.39</span>
              </div>
              <div className="payment-summary-row payment-total">
                <span className="payment-label">Total Amount</span>
                <span className="payment-value">₹{regPayment.subscriptionAmount}</span>
              </div>
              <div className="payment-summary-row">
                <span className="payment-label">Status</span>
                {(() => {
                  const cfg = getStatusConfig(regPayment.paymentStatus);
                  const Icon = cfg.icon;
                  return (
                    <span className="payment-status-badge" style={{ background: cfg.bg, color: cfg.color }}>
                      <Icon size={16} /> {cfg.label}
                    </span>
                  );
                })()}
              </div>
              {regPayment.razorpayOrderId && (
                <div className="payment-summary-row">
                  <span className="payment-label">Order ID</span>
                  <span className="payment-value" style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{regPayment.razorpayOrderId}</span>
                </div>
              )}
            </div>

            {/* Download Invoice Button */}
            {regPayment.paymentStatus === 'COMPLETED' && (
              <div style={{ marginTop: '1.25rem', display: 'flex', gap: '0.75rem' }}>
                <button
                  id="download-invoice-btn"
                  onClick={handleDownloadInvoice}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.65rem 1.25rem',
                    background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '0.5rem',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(37,99,235,0.25)',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.transform = 'translateY(-1px)')}
                  onMouseOut={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
                >
                  <FileDown size={18} /> Download Invoice
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Transaction History */}
      <div className="card">
        <div className="card-header">
          <h3><IndianRupee size={20} /> Transaction History</h3>
        </div>
        <div className="card-body">
          {loading ? (
            <p>Loading transactions...</p>
          ) : payments.length === 0 ? (
            <div className="empty-state">
              <CreditCard size={48} strokeWidth={1} />
              <p>No separate transaction records found.</p>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Payment was processed during registration.
              </p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="payments-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Order ID</th>
                    <th>Payment ID</th>
                    <th>Amount</th>
                    <th>Method</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p) => {
                    const cfg = getStatusConfig(p.status);
                    const Icon = cfg.icon;
                    return (
                      <tr key={p._id}>
                        <td>{new Date(p.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                        <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{p.razorpayOrderId}</td>
                        <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{p.razorpayPaymentId || '—'}</td>
                        <td>₹{p.amount}</td>
                        <td>{p.method || '—'}</td>
                        <td>
                          <span className="payment-status-badge" style={{ background: cfg.bg, color: cfg.color }}>
                            <Icon size={14} /> {cfg.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

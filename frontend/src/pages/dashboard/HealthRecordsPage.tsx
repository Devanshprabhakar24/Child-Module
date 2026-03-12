import { useEffect, useState } from 'react';
import { dashboardApi } from '../../services/api';
import { FileHeart, Check, Clock, AlertTriangle, X } from 'lucide-react';

interface Milestone {
  _id: string;
  title: string;
  description?: string;
  vaccineName?: string;
  category: string;
  status: string;
  dueDate: string;
  completedDate?: string;
  notes?: string;
}

export default function HealthRecordsPage() {
  const [children, setChildren] = useState<any[]>([]);
  const [registrationId, setRegistrationId] = useState('');
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [filter, setFilter] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadFamily(); }, []);
  useEffect(() => { if (registrationId) loadMilestones(); }, [registrationId]);

  const loadFamily = async () => {
    try {
      const res = await dashboardApi.getFamily();
      const family = res.data.data || res.data;
      const kids = family.children || family;
      const list = Array.isArray(kids) ? kids : [];
      setChildren(list);
      if (list.length > 0) setRegistrationId(list[0].registrationId);
    } catch { /* */ } finally { setLoading(false); }
  };

  const loadMilestones = async () => {
    try {
      const res = await dashboardApi.getMilestones(registrationId);
      const data = res.data.data || res.data;
      setMilestones(Array.isArray(data) ? data : []);
    } catch { /* */ }
  };

  const filtered = filter === 'ALL' ? milestones : milestones.filter((m) => m.category === filter);

  const statusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED': return <Check size={16} className="icon-success" />;
      case 'MISSED': return <X size={16} className="icon-danger" />;
      case 'DUE': return <AlertTriangle size={16} className="icon-warning" />;
      default: return <Clock size={16} className="icon-muted" />;
    }
  };

  if (loading) return <div className="loading-state">Loading...</div>;

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1><FileHeart size={28} /> Health Records</h1>
          <p>View all milestones and health records</p>
        </div>
        <div className="page-actions">
          {children.length > 1 && (
            <select className="child-selector" value={registrationId} onChange={(e) => setRegistrationId(e.target.value)}>
              {children.map((c: any) => <option key={c.registrationId} value={c.registrationId}>{c.childName}</option>)}
            </select>
          )}
          <select className="filter-select" value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="ALL">All Categories</option>
            <option value="VACCINATION">Vaccination</option>
            <option value="DEVELOPMENTAL">Developmental</option>
            <option value="HEALTH_CHECKUP">Health Checkup</option>
          </select>
        </div>
      </div>

      <div className="card">
        {filtered.length === 0 ? (
          <div className="empty-state small">
            <p>No health records found.</p>
          </div>
        ) : (
          <div className="records-grid">
            {filtered.map((m) => (
              <div key={m._id} className={`record-card status-${m.status.toLowerCase()}`}>
                <div className="record-header">
                  {statusIcon(m.status)}
                  <span className={`badge badge-${m.status.toLowerCase()}`}>{m.status}</span>
                </div>
                <h3>{m.vaccineName || m.title}</h3>
                {m.description && <p className="record-desc">{m.description}</p>}
                <div className="record-meta">
                  <span className="category-tag">{m.category.replace('_', ' ')}</span>
                  <span className="date-text">Due: {new Date(m.dueDate).toLocaleDateString('en-IN')}</span>
                </div>
                {m.completedDate && (
                  <span className="completed-text">Completed: {new Date(m.completedDate).toLocaleDateString('en-IN')}</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

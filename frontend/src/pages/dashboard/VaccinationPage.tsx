import { useEffect, useState } from 'react';
import { dashboardApi } from '../../services/api';
import { Check, X, Clock, AlertTriangle, Syringe } from 'lucide-react';

interface Milestone {
  _id: string;
  title: string;
  vaccineName?: string;
  category: string;
  status: string;
  dueDate: string;
  completedDate?: string;
  notes?: string;
}

export default function VaccinationPage() {
  const [registrationId, setRegistrationId] = useState('');
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [children, setChildren] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);

  useEffect(() => {
    loadFamily();
  }, []);

  useEffect(() => {
    if (registrationId) loadVaccinations();
  }, [registrationId]);

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

  const loadVaccinations = async () => {
    try {
      const res = await dashboardApi.getMilestones(registrationId);
      const data = res.data.data || res.data;
      const all = Array.isArray(data) ? data : [];
      const vax = all.filter((m: Milestone) => m.category === 'VACCINATION');
      setMilestones(vax);
    } catch { /* */ }
  };

  const handleSeed = async () => {
    setSeeding(true);
    try {
      const child = children.find((c: any) => c.registrationId === registrationId);
      await dashboardApi.seedVaccinations({
        registrationId,
        dateOfBirth: child?.dateOfBirth || new Date().toISOString(),
      });
      await loadVaccinations();
    } catch { /* */ } finally { setSeeding(false); }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await dashboardApi.updateMilestone(id, {
        status,
        completedDate: status === 'COMPLETED' ? new Date().toISOString() : undefined,
      });
      await loadVaccinations();
    } catch { /* */ }
  };

  const completed = milestones.filter((m) => m.status === 'COMPLETED').length;
  const total = milestones.length;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  const statusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED': return <Check size={18} className="icon-success" />;
      case 'MISSED': return <X size={18} className="icon-danger" />;
      case 'DUE': return <AlertTriangle size={18} className="icon-warning" />;
      default: return <Clock size={18} className="icon-muted" />;
    }
  };

  if (loading) return <div className="loading-state">Loading...</div>;

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1><Syringe size={28} /> Vaccination Tracker</h1>
          <p>Track and manage your child's vaccinations</p>
        </div>
        <div className="page-actions">
          {children.length > 1 && (
            <select className="child-selector" value={registrationId} onChange={(e) => setRegistrationId(e.target.value)}>
              {children.map((c: any) => <option key={c.registrationId} value={c.registrationId}>{c.childName}</option>)}
            </select>
          )}
          <button className="btn-secondary" onClick={handleSeed} disabled={seeding}>
            {seeding ? 'Seeding...' : 'Auto-Seed Vaccines'}
          </button>
        </div>
      </div>

      {/* Progress */}
      <div className="card">
        <div className="progress-section large">
          <div className="progress-info">
            <h3>Overall Progress</h3>
            <span>{completed} of {total} vaccinations completed</span>
          </div>
          <div className="progress-bar-container large">
            <div className="progress-bar" style={{ width: `${percent}%` }} />
          </div>
          <span className="progress-text">{percent}%</span>
        </div>
      </div>

      {/* Vaccination List */}
      <div className="card">
        <div className="card-header">
          <h2>All Vaccinations</h2>
        </div>
        {milestones.length === 0 ? (
          <div className="empty-state small">
            <p>No vaccinations found. Click "Auto-Seed Vaccines" to populate the schedule.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Vaccine</th>
                  <th>Due Date</th>
                  <th>Completed</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {milestones.map((m) => (
                  <tr key={m._id} className={`row-${m.status.toLowerCase()}`}>
                    <td>{statusIcon(m.status)}</td>
                    <td><strong>{m.vaccineName || m.title}</strong></td>
                    <td>{new Date(m.dueDate).toLocaleDateString('en-IN')}</td>
                    <td>{m.completedDate ? new Date(m.completedDate).toLocaleDateString('en-IN') : '—'}</td>
                    <td>
                      {m.status !== 'COMPLETED' && (
                        <button className="btn-sm btn-success" onClick={() => handleUpdateStatus(m._id, 'COMPLETED')}>
                          Mark Done
                        </button>
                      )}
                      {m.status === 'COMPLETED' && (
                        <button className="btn-sm btn-outline" onClick={() => handleUpdateStatus(m._id, 'UPCOMING')}>
                          Undo
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

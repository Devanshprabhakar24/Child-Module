import { useEffect, useState } from 'react';
import { remindersApi, dashboardApi } from '../../services/api';
import { Bell, Check, Clock, Send, AlertTriangle } from 'lucide-react';

interface Reminder {
  _id: string;
  registrationId: string;
  milestoneId: string;
  channels: string[];
  offset: number;
  scheduledDate: string;
  status: string;
  customMessage?: string;
  milestoneName?: string;
}

export default function RemindersPage() {
  const [children, setChildren] = useState<any[]>([]);
  const [registrationId, setRegistrationId] = useState('');
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [seedingReminders, setSeedingReminders] = useState(false);

  useEffect(() => { loadFamily(); }, []);
  useEffect(() => { if (registrationId) loadReminders(); }, [registrationId]);

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

  const loadReminders = async () => {
    try {
      const res = await remindersApi.getByRegistration(registrationId);
      const data = res.data.data || res.data;
      setReminders(Array.isArray(data) ? data : []);
    } catch { /* */ }
  };

  const handleSeed = async () => {
    setSeedingReminders(true);
    try {
      await remindersApi.seed(registrationId);
      await loadReminders();
    } catch { /* */ } finally { setSeedingReminders(false); }
  };

  const statusIcon = (status: string) => {
    switch (status) {
      case 'SENT': return <Check size={16} className="icon-success" />;
      case 'FAILED': return <AlertTriangle size={16} className="icon-danger" />;
      case 'ACKNOWLEDGED': return <Check size={16} className="icon-primary" />;
      default: return <Clock size={16} className="icon-muted" />;
    }
  };

  const offsetLabel = (offset: number) => {
    if (offset === -2) return 'D-2';
    if (offset === 0) return 'D-Day';
    if (offset === 2) return 'D+2';
    return `D${offset > 0 ? '+' : ''}${offset}`;
  };

  if (loading) return <div className="loading-state">Loading...</div>;

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1><Bell size={28} /> Reminders</h1>
          <p>Manage vaccination and health reminders</p>
        </div>
        <div className="page-actions">
          {children.length > 1 && (
            <select className="child-selector" value={registrationId} onChange={(e) => setRegistrationId(e.target.value)}>
              {children.map((c: any) => <option key={c.registrationId} value={c.registrationId}>{c.childName}</option>)}
            </select>
          )}
          <button className="btn-secondary" onClick={handleSeed} disabled={seedingReminders}>
            <Send size={16} />
            {seedingReminders ? 'Seeding...' : 'Auto-Seed Reminders'}
          </button>
        </div>
      </div>

      <div className="card">
        {reminders.length === 0 ? (
          <div className="empty-state small">
            <p>No reminders set up yet. Click "Auto-Seed Reminders" to create reminders for all milestones.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Scheduled Date</th>
                  <th>Offset</th>
                  <th>Channels</th>
                  <th>Message</th>
                </tr>
              </thead>
              <tbody>
                {reminders.map((r) => (
                  <tr key={r._id}>
                    <td>{statusIcon(r.status)} {r.status}</td>
                    <td>{new Date(r.scheduledDate).toLocaleDateString('en-IN')}</td>
                    <td><span className="badge badge-info">{offsetLabel(r.offset)}</span></td>
                    <td>
                      <div className="channel-tags">
                        {r.channels.map((ch) => (
                          <span key={ch} className="channel-tag">{ch}</span>
                        ))}
                      </div>
                    </td>
                    <td className="text-muted">{r.customMessage || '—'}</td>
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

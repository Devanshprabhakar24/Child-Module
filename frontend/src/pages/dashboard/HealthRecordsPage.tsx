import { useEffect, useState } from 'react';
import { dashboardApi } from '../../services/api';
import { FileHeart, Check, Clock, AlertTriangle, X, Download } from 'lucide-react';
import { jsPDF } from 'jspdf';

interface Milestone {
  _id: string;
  registrationId?: string;
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
    } catch {
      /* ignore */
    }
  };

  const filtered =
    filter === 'ALL' ? milestones : milestones.filter((m) => m.category === filter);

  const selectedChild = children.find((c) => c.registrationId === registrationId);

  const statusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <Check size={16} className="icon-success" />;
      case 'MISSED':
        return <X size={16} className="icon-danger" />;
      case 'DUE':
        return <AlertTriangle size={16} className="icon-warning" />;
      default:
        return <Clock size={16} className="icon-muted" />;
    }
  };

  const downloadVaccineCard = (m: Milestone) => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'A4' });
    const W = doc.internal.pageSize.getWidth();

    const vaccineName = m.vaccineName || m.title;
    const givenDate = m.completedDate
      ? new Date(m.completedDate).toLocaleDateString('en-IN')
      : 'Not recorded';
    const dueDate = new Date(m.dueDate).toLocaleDateString('en-IN');
    const doctor = m.notes || 'Not recorded';
    const childName = selectedChild?.childName || 'Child';
    const regId = m.registrationId || registrationId || 'N/A';

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.text('Digital Vaccine Card', W / 2, 60, { align: 'center' });

    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.text(`Child Name: ${childName}`, 60, 110);
    doc.text(`Registration ID: ${regId}`, 60, 135);

    doc.setFont('helvetica', 'bold');
    doc.text('Vaccine Details', 60, 180);
    doc.setFont('helvetica', 'normal');

    const lines = [
      `Vaccine: ${vaccineName}`,
      `Status: ${m.status}`,
      `Date Given: ${givenDate}`,
      `Next Due Date: ${dueDate}`,
      `Doctor: ${doctor}`,
    ];

    let y = 210;
    lines.forEach((line) => {
      doc.text(line, 80, y);
      y += 24;
    });

    doc.setFontSize(10);
    doc.setTextColor(120);
    doc.text(
      'This is a digital record generated from your WombTo18 health records.',
      60,
      500,
    );

    const safeVaccineName = vaccineName.replace(/[^a-z0-9]+/gi, '_');
    doc.save(`VaccineCard_${regId}_${safeVaccineName}.pdf`);
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
                  <span className="date-text">
                    Due: {new Date(m.dueDate).toLocaleDateString('en-IN')}
                  </span>
                </div>
                {m.completedDate && (
                  <span className="completed-text">
                    Completed: {new Date(m.completedDate).toLocaleDateString('en-IN')}
                  </span>
                )}
                {m.category === 'VACCINATION' && (
                  <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                    <div style={{ fontSize: 12, color: '#64748B' }}>
                      <div>
                        <strong>Doctor:</strong> {m.notes || 'Not recorded'}
                      </div>
                      <div>
                        <strong>Next Due:</strong>{' '}
                        {new Date(m.dueDate).toLocaleDateString('en-IN')}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => downloadVaccineCard(m)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '6px 10px',
                        fontSize: 12,
                        borderRadius: 999,
                        border: '1px solid #2563EB',
                        color: '#2563EB',
                        background: '#EFF6FF',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      <Download size={14} />
                      Digital Vaccine Card
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

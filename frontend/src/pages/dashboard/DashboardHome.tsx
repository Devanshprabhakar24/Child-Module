import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { dashboardApi } from '../../services/api';
import { Check, X, Clock, AlertTriangle, ChevronRight, Lightbulb, Calendar, Phone } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import GoGreenCertificateDownload from '../../components/GoGreenCertificateDownload';

interface Child {
  registrationId: string;
  childName: string;
  childGender: string;
  dateOfBirth: string;
  ageGroup: string;
  ageInYears: number;
  state: string;
  profilePictureUrl?: string;
}

interface Milestone {
  _id: string;
  title: string;
  vaccineName?: string;
  category: string;
  status: string;
  dueDate: string;
}

interface ChildProfile {
  registrationId: string;
  childName: string;
  childGender: string;
  dateOfBirth: string;
  ageGroup: string;
  ageInYears: number;
  motherName: string;
  fatherName?: string;
  phone: string;
  phone2?: string;
  address?: string;
  state: string;
  greenCohort: boolean;
  linkedSchoolId?: string;
  profilePictureUrl?: string;
}

export default function DashboardHome() {
  const navigate = useNavigate();
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChild, setSelectedChild] = useState<string>('');
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [profile, setProfile] = useState<ChildProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFamily();
  }, []);

  useEffect(() => {
    if (selectedChild) loadDashboard(selectedChild);
  }, [selectedChild]);

  const loadFamily = async () => {
    try {
      const res = await dashboardApi.getFamily();
      const family = res.data.data || res.data;
      const kids = family.children || family;
      setChildren(Array.isArray(kids) ? kids : []);
      if (Array.isArray(kids) && kids.length > 0) {
        setSelectedChild(kids[0].registrationId);
      }
    } catch {
      /* no children yet */
    } finally {
      setLoading(false);
    }
  };

  const loadDashboard = async (regId: string) => {
    try {
      const [milestonesRes, dashboardRes] = await Promise.all([
        dashboardApi.getMilestones(regId),
        dashboardApi.getChildDashboard(regId).catch(() => null),
      ]);
      const data = milestonesRes.data.data || milestonesRes.data;
      setMilestones(Array.isArray(data) ? data : []);
      if (dashboardRes?.data?.data?.profile) {
        setProfile(dashboardRes.data.data.profile);
      }
    } catch { /* ignore */ }
  };

  const child = children.find((c) => c.registrationId === selectedChild);
  const vaccinations = milestones.filter((m) => m.category === 'VACCINATION');
  const completedVax = vaccinations.filter((m) => m.status === 'COMPLETED').length;
  const totalVax = vaccinations.length || 27;
  const vaxPercent = totalVax > 0 ? Math.round((completedVax / totalVax) * 100) : 0;

  const upcoming = milestones
    .filter((m) => m.status === 'UPCOMING' || m.status === 'DUE')
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  const nextAppt = upcoming[0];

  // Build chart data from milestones by month
  const chartData = buildChartData(milestones);

  const healthTips = [
    'Ensure your child gets adequate sleep for healthy growth.',
    'Balanced nutrition with fruits, vegetables, and proteins is essential.',
    'Regular physical activity helps in overall development.',
    'Keep vaccination records up to date.',
    'Schedule health checkups at recommended intervals.',
  ];

  if (loading) {
    return <div className="loading-state">Loading dashboard...</div>;
  }

  if (children.length === 0) {
    return (
      <div className="empty-state">
        <h2>No Children Registered</h2>
        <p>Register your child to get started with the health dashboard.</p>
        <button className="btn-primary" onClick={() => navigate('/register-child')}>Register Child</button>
      </div>
    );
  }

  return (
    <div className="dashboard-content">
      {/* Child Selector & Profile Header */}
      <div className="dashboard-header">
        <div className="child-profile">
          <div className="child-avatar" style={{ overflow: 'hidden' }}>
            {child?.profilePictureUrl ? (
              <img
                src={child.profilePictureUrl}
                alt={child.childName || 'Child'}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
            ) : (
              child?.childName?.charAt(0) || 'C'
            )}
          </div>
          <div>
            <h1>{child?.childName}</h1>
            <p className="child-meta">
              {child?.ageInYears !== undefined
                ? child.ageInYears < 1
                  ? 'Under 1 year'
                  : `${child.ageInYears} years old`
                : ''}{' '}
              · {child?.childGender} · {child?.registrationId}
            </p>
          </div>
        </div>
        {children.length > 1 && (
          <select
            className="child-selector"
            value={selectedChild}
            onChange={(e) => setSelectedChild(e.target.value)}
          >
            {children.map((c) => (
              <option key={c.registrationId} value={c.registrationId}>
                {c.childName}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Main Grid */}
      <div className="dashboard-grid">
        {/* Vaccination Tracker Card */}
        <div className="card vaccination-card">
          <div className="card-header">
            <h2>Vaccination Tracker</h2>
            <button className="btn-link" onClick={() => navigate('/dashboard/vaccination')}>
              View All <ChevronRight size={16} />
            </button>
          </div>
          <div className="progress-section">
            <div className="progress-bar-container">
              <div className="progress-bar" style={{ width: `${vaxPercent}%` }} />
            </div>
            <span className="progress-text">{vaxPercent}% Complete ({completedVax}/{totalVax})</span>
          </div>
          <ul className="vax-list">
            {vaccinations.slice(0, 5).map((v) => (
              <li key={v._id} className="vax-item">
                {v.status === 'COMPLETED' ? (
                  <Check size={18} className="icon-success" />
                ) : v.status === 'MISSED' ? (
                  <X size={18} className="icon-danger" />
                ) : v.status === 'DUE' ? (
                  <AlertTriangle size={18} className="icon-warning" />
                ) : (
                  <Clock size={18} className="icon-muted" />
                )}
                <span className="vax-name">{v.vaccineName || v.title}</span>
                <span className={`badge badge-${v.status.toLowerCase()}`}>{v.status}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Annual Health Report Chart */}
        <div className="card chart-card">
          <div className="card-header">
            <h2>Annual Health Report</h2>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#94A3B8" />
                <YAxis tick={{ fontSize: 12 }} stroke="#94A3B8" />
                <Tooltip />
                <Line type="monotone" dataKey="completed" stroke="#3B82F6" strokeWidth={2} dot={{ r: 4 }} name="Completed" />
                <Line type="monotone" dataKey="due" stroke="#F59E0B" strokeWidth={2} dot={{ r: 4 }} name="Due" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Next Appointment */}
        <div className="card appointment-card">
          <div className="card-header">
            <h2>Next Appointment</h2>
          </div>
          {nextAppt ? (
            <div className="appointment-info">
              <Calendar size={40} className="icon-primary" />
              <div>
                <h3>{nextAppt.vaccineName || nextAppt.title}</h3>
                <p className="appointment-date">
                  {new Date(nextAppt.dueDate).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
                <span className={`badge badge-${nextAppt.status.toLowerCase()}`}>{nextAppt.status}</span>
              </div>
            </div>
          ) : (
            <p className="text-muted">No upcoming appointments</p>
          )}
        </div>

        {/* Health Tips */}
        <div className="card tips-card">
          <div className="card-header">
            <h2>Health Tips</h2>
          </div>
          <ul className="tips-list">
            {healthTips.map((tip, i) => (
              <li key={i} className="tip-item">
                <Lightbulb size={16} className="icon-warning" />
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Parent Details */}
        {profile && (
          <div className="card">
            <div className="card-header">
              <h2>Parent Details</h2>
            </div>
            <div className="details-grid">
              <div className="detail-row"><span className="detail-label">Mother Name</span><span>{profile.motherName}</span></div>
              {profile.fatherName && <div className="detail-row"><span className="detail-label">Father Name</span><span>{profile.fatherName}</span></div>}
              <div className="detail-row"><span className="detail-label">Mobile 1</span><span>{profile.phone}</span></div>
              {profile.phone2 && <div className="detail-row"><span className="detail-label">Mobile 2</span><span>{profile.phone2}</span></div>}
              {profile.address && <div className="detail-row"><span className="detail-label">Address</span><span>{profile.address}</span></div>}
              <div className="detail-row"><span className="detail-label">State</span><span>{profile.state}</span></div>
            </div>
          </div>
        )}

        {/* Region */}
        {profile && (
          <div className="card">
            <div className="card-header">
              <h2>Region</h2>
            </div>
            <div className="details-grid">
              <div className="detail-row"><span className="detail-label">State</span><span>{profile.state}</span></div>
              <div className="detail-row"><span className="detail-label">Green Cohort</span><span className={`badge ${profile.greenCohort ? 'badge-success' : 'badge-info'}`}>{profile.greenCohort ? 'Enrolled' : 'Not Enrolled'}</span></div>
              {profile.linkedSchoolId && <div className="detail-row"><span className="detail-label">Linked School</span><span>{profile.linkedSchoolId}</span></div>}
            </div>
          </div>
        )}

        {/* Emergency Connect */}
        <div className="card" style={{ border: '2px solid #EF4444' }}>
          <div className="card-header">
            <h2 style={{ color: '#EF4444' }}><Phone size={20} /> Emergency Connect</h2>
          </div>
          <p style={{ color: '#64748B', fontSize: 14, marginBottom: 12 }}>
            Instantly connect with a nearby hospital or your school's health ambassador in case of emergency.
          </p>
          <div style={{ display: 'flex', gap: 12 }}>
            <button className="btn-primary" style={{ background: '#EF4444', flex: 1 }} onClick={() => {
              if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                  (pos) => {
                    const { latitude, longitude } = pos.coords;
                    window.open(`https://www.google.com/maps/search/hospital+near+me/@${latitude},${longitude},14z`, '_blank', 'noopener,noreferrer');
                  },
                  () => { window.open('https://www.google.com/maps/search/hospital+near+me', '_blank', 'noopener,noreferrer'); },
                );
              } else {
                window.open('https://www.google.com/maps/search/hospital+near+me', '_blank', 'noopener,noreferrer');
              }
            }}>
              Nearest Hospital
            </button>
            <button className="btn-secondary" style={{ flex: 1 }} onClick={() => alert('School health ambassador contact will be available once your school is linked.')}>Health Ambassador</button>
          </div>
        </div>

        {/* Go Green Certificate Download */}
        <div className="card" style={{ border: '2px solid #10B981' }}>
          <div className="card-header">
            <h2 style={{ color: '#10B981' }}>🌿 Go Green Certificate</h2>
          </div>
          <p style={{ color: '#64748B', fontSize: 14, marginBottom: 16 }}>
            Download your child's Go Green certificate recognizing their commitment to environmental well-being.
          </p>
          <GoGreenCertificateDownload recipientName={child?.childName || 'Recipient'} date={new Date().toLocaleDateString('en-IN')} />
        </div>
      </div>
    </div>
  );
}

function buildChartData(milestones: Milestone[]) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const data = months.map((month, idx) => {
    const mils = milestones.filter((m) => new Date(m.dueDate).getMonth() === idx);
    return {
      month,
      completed: mils.filter((m) => m.status === 'COMPLETED').length,
      due: mils.filter((m) => m.status === 'DUE' || m.status === 'UPCOMING').length,
    };
  });
  return data;
}

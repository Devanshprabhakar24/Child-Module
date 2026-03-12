import { useEffect, useState } from 'react';
import { dashboardApi } from '../../services/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp } from 'lucide-react';

export default function GrowthChartPage() {
  const [children, setChildren] = useState<any[]>([]);
  const [registrationId, setRegistrationId] = useState('');
  const [milestones, setMilestones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFamily();
  }, []);

  useEffect(() => {
    if (registrationId) loadData();
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

  const loadData = async () => {
    try {
      const res = await dashboardApi.getMilestones(registrationId);
      const data = res.data.data || res.data;
      setMilestones(Array.isArray(data) ? data : []);
    } catch { /* */ }
  };

  // Build developmental milestone chart data
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const chartData = months.map((month, idx) => {
    const mils = milestones.filter((m: any) => new Date(m.dueDate).getMonth() === idx);
    return {
      month,
      vaccinations: mils.filter((m: any) => m.category === 'VACCINATION' && m.status === 'COMPLETED').length,
      checkups: mils.filter((m: any) => m.category === 'HEALTH_CHECKUP' && m.status === 'COMPLETED').length,
      developmental: mils.filter((m: any) => m.category === 'DEVELOPMENTAL' && m.status === 'COMPLETED').length,
    };
  });

  const totalCompleted = milestones.filter((m: any) => m.status === 'COMPLETED').length;
  const totalMilestones = milestones.length;

  if (loading) return <div className="loading-state">Loading...</div>;

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1><TrendingUp size={28} /> Growth Chart</h1>
          <p>Track your child's health milestones over time</p>
        </div>
        {children.length > 1 && (
          <select className="child-selector" value={registrationId} onChange={(e) => setRegistrationId(e.target.value)}>
            {children.map((c: any) => <option key={c.registrationId} value={c.registrationId}>{c.childName}</option>)}
          </select>
        )}
      </div>

      {/* Summary Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Milestones</h3>
          <span className="stat-number">{totalMilestones}</span>
        </div>
        <div className="stat-card">
          <h3>Completed</h3>
          <span className="stat-number text-success">{totalCompleted}</span>
        </div>
        <div className="stat-card">
          <h3>Pending</h3>
          <span className="stat-number text-warning">{totalMilestones - totalCompleted}</span>
        </div>
        <div className="stat-card">
          <h3>Completion Rate</h3>
          <span className="stat-number text-primary">
            {totalMilestones > 0 ? Math.round((totalCompleted / totalMilestones) * 100) : 0}%
          </span>
        </div>
      </div>

      {/* Chart */}
      <div className="card">
        <div className="card-header">
          <h2>Milestone Completion by Month</h2>
        </div>
        <div className="chart-container" style={{ height: 350 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="month" stroke="#94A3B8" />
              <YAxis stroke="#94A3B8" />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="vaccinations" stroke="#3B82F6" strokeWidth={2} name="Vaccinations" />
              <Line type="monotone" dataKey="checkups" stroke="#10B981" strokeWidth={2} name="Health Checkups" />
              <Line type="monotone" dataKey="developmental" stroke="#8B5CF6" strokeWidth={2} name="Developmental" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

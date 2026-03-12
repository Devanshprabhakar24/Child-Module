import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Syringe, TrendingUp, FileHeart, LogOut, Baby, Bell, CreditCard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showEdit, setShowEdit] = useState(false);
  const [profilePic, setProfilePic] = useState(user?.profilePictureUrl || '');
  const [name, setName] = useState(user?.fullName || '');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">W18</div>
          <span className="sidebar-title">WombTo18</span>
        </div>
        <nav className="sidebar-nav">
          <NavLink to="/dashboard" end className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </NavLink>
          <NavLink to="/dashboard/vaccination" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Syringe size={20} />
            <span>Vaccination Tracker</span>
          </NavLink>
          <NavLink to="/dashboard/growth" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <TrendingUp size={20} />
            <span>Growth Chart</span>
          </NavLink>
          <NavLink to="/dashboard/health-records" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <FileHeart size={20} />
            <span>Health Records</span>
          </NavLink>
          <NavLink to="/dashboard/reminders" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Bell size={20} />
            <span>Reminders</span>
          </NavLink>
          <NavLink to="/dashboard/payments" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <CreditCard size={20} />
            <span>Payments</span>
          </NavLink>
          <NavLink to="/register-child" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Baby size={20} />
            <span>Add Child</span>
          </NavLink>
        </nav>
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="avatar" onClick={() => navigate('/dashboard/edit-profile')} style={{ cursor: 'pointer' }}>
              {profilePic ? <img src={profilePic} alt="Profile" style={{ width: 36, height: 36, borderRadius: '50%' }} /> : (name?.charAt(0) || 'U')}
            </div>
            <div className="user-info">
              <span className="user-name">{name}</span>
              <span className="user-role">{user?.role}</span>
            </div>
          </div>
          <button className="nav-item logout-btn" onClick={handleLogout}>
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
      <main className="dashboard-main">
        <Outlet />
      </main>
    </div>
  );
}

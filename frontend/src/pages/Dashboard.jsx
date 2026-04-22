import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import api from '../utils/api';
import './Dashboard.css';

// FIX: use submitted_at (the actual Mongoose field name)
const timeAgo = (date) => {
  if (!date) return 'Unknown';
  const d = Math.floor((Date.now() - new Date(date)) / 86400000);
  return d === 0 ? 'Today' : d === 1 ? 'Yesterday' : `${d} days ago`;
};

export default function Dashboard() {
  const navigate = useNavigate();
  const userName = localStorage.getItem('userName') || 'Citizen';

  const [grievances, setGrievances] = useState([]);
  const [stats, setStats] = useState({ total: 0, inProgress: 0, resolved: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      navigate('/auth');
      return;
    }

    const fetchData = async () => {
      try {
        // FIX: correct route is /recent, not /my
        const res = await api.get('/api/grievance/recent');
        const data = res.data.grievances || [];
        setGrievances(data);

        const total = data.length;
        const inProgress = data.filter(g =>
          g.status === 'in_progress' || g.status === 'open' || g.status === 'pending'
        ).length;
        const resolved = data.filter(g =>
          g.status === 'resolved' || g.status === 'closed'
        ).length;

        setStats({ total, inProgress, resolved });
      } catch (err) {
        console.error('Failed to fetch grievances', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const statCards = [
    { label: 'Total Grievances', value: stats.total,      icon: 'description',  color: 'primary'   },
    { label: 'In Progress',      value: stats.inProgress, icon: 'pending',      color: 'secondary' },
    { label: 'Resolved',         value: stats.resolved,   icon: 'check_circle', color: 'success'   },
  ];

  return (
    <DashboardLayout>
      {/* Hero Greeting */}
      <section className="dash-hero">
        <div>
          <h1 className="dash-welcome">
            Welcome back, <span className="name-highlight">{userName}.</span>
          </h1>
          <p className="dash-sub">Your voice matters. Monitoring your civic contributions and concerns.</p>
        </div>
        <Link to="/submit" className="btn btn-primary">
          <span className="material-symbols-outlined">add</span>
          File New Grievance
        </Link>
      </section>

      {/* Stat Cards */}
      <section className="dash-stats">
        {statCards.map(s => (
          <div
            key={s.label}
            className={`stat-card card stat-${s.color} ${loading ? 'pulse' : ''}`}
            style={{ opacity: loading ? 0.5 : 1 }}
          >
            <div className="stat-icon-wrap">
              <span className="material-symbols-outlined filled">{s.icon}</span>
            </div>
            <span className="stat-label">{s.label}</span>
            <span className="stat-value">{loading ? '-' : s.value}</span>
          </div>
        ))}
      </section>

      {/* Main Grid */}
      <div className="dash-grid">
        {/* Left: Recent Grievances */}
        <section className="dash-section">
          <div className="section-header">
            <h2>My Recent Grievances</h2>
            {!loading && grievances.length > 0 && (
              <Link to="#" className="btn btn-tertiary">View All</Link>
            )}
          </div>

          <div className="grievance-list" style={{ opacity: loading ? 0.5 : 1 }}>
            {loading ? (
              <div className="pulse" style={{ padding: '24px', background: 'var(--surface-container-low)', borderRadius: '12px' }}>
                Loading...
              </div>
            ) : grievances.length === 0 ? (
              <div className="card surface-low" style={{ textAlign: 'center', padding: '40px' }}>
                <p style={{ color: 'var(--on-surface-variant)', marginBottom: '16px' }}>
                  You have not filed any grievances yet.
                </p>
                <Link to="/submit" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                  Submit Now
                </Link>
              </div>
            ) : (
              grievances.map(g => (
                <Link
                  to={`/grievance/${g._id}`}
                  key={g._id}
                  className="grievance-card card"
                >
                  <div className="grievance-card-top">
                    {/* FIX: title is the actual Grievance field set by backend */}
                    <h3 className="grievance-title">
                      {g.title || g.original_text?.substring(0, 80) || 'Untitled Grievance'}
                    </h3>
                    <span className={`chip ${
                      (g.status === 'resolved' || g.status === 'closed')
                        ? 'chip-success'
                        : 'chip-warning'
                    }`}>
                      {g.status ? g.status.replace('_', ' ').toUpperCase() : 'PENDING'}
                    </span>
                  </div>
                  <div className="grievance-card-bottom">
                    <span className="grievance-dept" style={{ textTransform: 'capitalize' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 16 }}>account_balance</span>
                      Category: {g.category || 'General'}
                    </span>
                    {/* FIX: correct field is submitted_at */}
                    <span className="grievance-date">{timeAgo(g.submitted_at)}</span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </section>

        {/* Right: Insights & Guidance */}
        <aside className="dash-aside">
          <div className="insight-card card surface-low">
            <div className="insight-header">
              <span className="material-symbols-outlined filled" style={{ color: 'var(--saffron)' }}>psychology</span>
              <h3>AI Powered Insights</h3>
            </div>
            <p>
              Based on your history, the system is actively monitoring your reports.
              We estimate high priority tracking for civic anomalies.
            </p>
          </div>

          <div className="guidance-card card surface-low">
            <div className="insight-header">
              <span className="material-symbols-outlined filled" style={{ color: 'var(--emerald)' }}>menu_book</span>
              <h3>Need Guidance?</h3>
            </div>
            <p>Access the official BhashaFlow handbook for step-by-step grievance filing.</p>
            <button className="btn btn-outline" style={{ marginTop: 'var(--space-4)' }}>
              <span className="material-symbols-outlined">open_in_new</span>
              View Handbook
            </button>
          </div>
        </aside>
      </div>

      {/* Footer */}
      <footer className="page-footer">
        <div className="footer-brand">BhashaFlow</div>
        <p className="footer-tagline">Empowering citizens through transparent governance.</p>
        <div className="footer-links">
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
          <a href="#">Contact Support</a>
        </div>
      </footer>
    </DashboardLayout>
  );
}
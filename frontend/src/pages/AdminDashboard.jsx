import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import api from '../utils/api';
import './AdminDashboard.css';

const timeAgo = (date) => {
  if (!date) return '';
  const d = Math.floor((Date.now() - new Date(date)) / 86400000);
  return d === 0 ? 'Today' : d === 1 ? 'Yesterday' : `${d} days ago`;
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ total: 0, by_status: {}, by_category: {}, avg_resolution_hours: 0 });
  const [grievances, setGrievances] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingList, setLoadingList] = useState(true);

  // Filters
  const [filterStatus, setFilterStatus] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const role = localStorage.getItem('userRole');
    if (role !== 'admin' && role !== 'authority') {
       navigate('/dashboard');
    }
  }, [navigate]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/api/admin/stats');
        setStats(res.data || { total: 0, by_status: {}, by_category: {}, avg_resolution_hours: 0 });
      } catch (err) {
        console.error('Failed to load stats', err);
      } finally {
        setLoadingStats(false);
      }
    };
    fetchStats();
  }, []);

  useEffect(() => {
    const fetchList = async () => {
      setLoadingList(true);
      try {
        const res = await api.get('/api/admin/grievances', {
          params: { status: filterStatus, category: filterCategory, page }
        });
        setGrievances(res.data.grievances || []);
      } catch (err) {
        console.error('Failed to load list', err);
      } finally {
        setLoadingList(false);
      }
    };
    fetchList();
  }, [filterStatus, filterCategory, page]);

  const statCards = [
    { label: 'Total Tracked', value: stats.total || 0, desc: 'Overall platform interactions', icon: 'pending_actions', color: 'primary' },
    { label: 'Pending Review', value: stats.by_status?.pending || 0, desc: 'Awaiting triage or assignment', icon: 'warning', color: 'error' },
    { label: 'Avg. Resolution Time', value: stats.avg_resolution_hours ? `${stats.avg_resolution_hours}h` : 'N/A', desc: 'Calculated across all language flows', icon: 'schedule', color: 'secondary' },
  ];

  const categoryColors = ['var(--primary-container)', 'var(--saffron)', 'var(--emerald)', '#c084fc', 'var(--outline)'];
  const categoriesList = Object.entries(stats.by_category || {}).map(([name, count], index) => {
    return {
      name,
      count,
      pct: stats.total ? Math.round((count / stats.total) * 100) : 0,
      color: categoryColors[index % categoryColors.length]
    };
  });

  return (
    <DashboardLayout isAdmin>
      <div className="admin-page">
        {/* Header */}
        <section className="admin-header">
          <div>
            <h1>Administrative Dashboard</h1>
            <p className="admin-sub">Status Overview</p>
          </div>
          <div className="admin-header-badge">
            <span className="material-symbols-outlined">shield</span>
            <span>System Sovereignty</span>
          </div>
        </section>

        {/* Stats */}
        <section className="admin-stats">
          {statCards.map(s => (
            <div key={s.label} className={`admin-stat-card card stat-${s.color} ${loadingStats ? 'pulse' : ''}`} style={{ opacity: loadingStats ? 0.5 : 1 }}>
              <div className="admin-stat-top">
                <div className="admin-stat-icon-wrap">
                  <span className="material-symbols-outlined filled">{s.icon}</span>
                </div>
                <span className="admin-stat-label">{s.label}</span>
              </div>
              <span className="admin-stat-value">{loadingStats ? '-' : s.value}</span>
              <p className="admin-stat-desc">{s.desc}</p>
            </div>
          ))}
        </section>

        <div className="admin-grid">
          {/* Categories */}
          <section className="categories-section card">
            <h2>
              <span className="material-symbols-outlined">pie_chart</span>
              Categories Breakdown
            </h2>
            <div className="category-list" style={{ opacity: loadingStats ? 0.5 : 1 }}>
              {categoriesList.length > 0 ? categoriesList.map(c => (
                <div key={c.name} className="category-item">
                  <div className="category-info">
                    <div className="category-dot" style={{ background: c.color }}></div>
                    <span className="category-name" style={{ textTransform: 'capitalize' }}>{c.name} ({c.count})</span>
                  </div>
                  <div className="category-bar-wrap">
                    <div className="category-bar-bg">
                      <div className="category-bar-fill" style={{ width: `${c.pct}%`, background: c.color }}></div>
                    </div>
                    <span className="category-pct">{c.pct}%</span>
                  </div>
                </div>
              )) : (
                <p>No category data available.</p>
              )}
            </div>
          </section>

          {/* Recent Urgent */}
          <section className="urgent-section card">
            <h2 style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                 <span className="material-symbols-outlined">notification_important</span>
                 Grievance Inbox
              </div>
              
               <div style={{ display: 'flex', gap: '8px' }}>
                 <button className="btn btn-outline" onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} style={{ padding: '4px 8px' }}>&lt;</button>
                 <span style={{ display: 'flex', alignItems: 'center', fontSize: '14px', background: 'var(--surface-container-high)', padding: '0 8px', borderRadius: '4px' }}>Page {page}</span>
                 <button className="btn btn-outline" onClick={() => setPage(page + 1)} disabled={grievances.length === 0} style={{ padding: '4px 8px' }}>&gt;</button>
               </div>
            </h2>
            <div className="urgent-table" style={{ opacity: loadingList ? 0.5 : 1 }}>
              <div className="urgent-header-row">
                <span>View</span>
                <span>Title</span>
                <span>Category</span>
                <span>Status</span>
                <span>Language</span>
                <span>Time</span>
              </div>
              {grievances.length > 0 ? grievances.map(g => (
                <div key={g._id || g.grievance_id} className="urgent-row">
                  <span className="urgent-id text-center">
                    <Link to={`/grievance/${g._id || g.grievance_id}`} className="btn btn-tertiary" style={{ padding: '4px' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>open_in_new</span>
                    </Link>
                  </span>
                  <span className="urgent-title truncate" title={g.english_summary}>{g.english_summary || g.original_text || 'No title'}</span>
                  <span className="urgent-dept capitalize">{g.category || 'General'}</span>
                  <span className={`chip ${(g.status === 'resolved' || g.status === 'closed') ? 'chip-success' : 'chip-warning'}`}>
                    {g.status ? g.status.toUpperCase() : 'PENDING'}
                  </span>
                  <span className="chip chip-primary capitalize">{g.detected_language || 'Hindi'}</span>
                  <span className="urgent-time">{timeAgo(g.created_at)}</span>
                </div>
              )) : (
                <p style={{ padding: '16px', textAlign: 'center', color: 'var(--outline)' }}>No grievances match criteria.</p>
              )}
            </div>
          </section>
        </div>

        {/* Operational Filters */}
        <section className="filters-section card">
          <h2>
            <span className="material-symbols-outlined">tune</span>
            Operational Filters
          </h2>
          <div className="filters-grid">
            <div className="field-group">
              <label className="input-label">Category</label>
              <select className="input-field" value={filterCategory} onChange={(e) => { setFilterCategory(e.target.value); setPage(1); }}>
                <option value="">All Categories</option>
                <option value="Roads & Infrastructure">Roads & Infrastructure</option>
                <option value="Water Supply">Water Supply</option>
                <option value="Electricity">Electricity</option>
                <option value="Sanitation">Sanitation</option>
                <option value="Education">Education</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="field-group">
              <label className="input-label">Status</label>
              <select className="input-field" value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}>
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="page-footer" style={{ marginTop: '40px' }}>
          <p className="footer-tagline">© 2024 BhashaFlow Governance Initiative. All rights reserved.</p>
          <div className="footer-links">
            <a href="#">Policy & Ethics</a>
            <a href="#">API Documentation</a>
            <a href="#">Contact Support</a>
          </div>
        </footer>
      </div>
    </DashboardLayout>
  );
}

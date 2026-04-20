import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import api from '../utils/api';
import './GrievanceDetail.css';

const timeAgo = (date) => {
  if (!date) return '';
  const d = Math.floor((Date.now() - new Date(date)) / 86400000);
  return d === 0 ? 'Today' : d === 1 ? 'Yesterday' : `${d} days ago`;
};

export default function GrievanceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const role = localStorage.getItem('userRole') || 'citizen';
  const isAdmin = role === 'admin' || role === 'authority';

  const [grievance, setGrievance] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Admin reply states
  const [remark, setRemark] = useState('');
  const [replyStatus, setReplyStatus] = useState('resolved');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await api.get(`/api/grievance/${id}`);
        setGrievance(res.data.grievance);
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to fetch grievance');
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  const handleAdminReply = async () => {
    if (!remark.trim()) return alert('Please enter a response.');
    setUpdating(true);
    try {
      const res = await api.put(`/api/admin/grievance/${id}/status`, {
        status: replyStatus,
        remark
      });
      alert('Status updated successfully');
      setGrievance(res.data.grievance);
      setRemark('');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout isAdmin={isAdmin}>
        <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>
      </DashboardLayout>
    );
  }

  if (!grievance) {
    return (
      <DashboardLayout isAdmin={isAdmin}>
        <div style={{ padding: '40px', textAlign: 'center' }}>Grievance not found.</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout isAdmin={isAdmin}>
      <div className="detail-page">
        {/* Header */}
        <section className="detail-header">
          <div className="detail-header-top">
            <h1>{grievance.english_summary || 'Grievance Detail'}</h1>
            <div className="detail-badges">
              <span className={`chip ${(grievance.status === 'resolved' || grievance.status === 'closed') ? 'chip-success' : 'chip-warning'}`}>
                {grievance.status ? grievance.status.replace('_', ' ').toUpperCase() : 'PENDING'}
              </span>
              <span className={`chip ${grievance.priority === 'critical' ? 'chip-error' : 'chip-primary'}`}>
                {grievance.priority || 'Normal'} Priority
              </span>
            </div>
          </div>
        </section>

        <div className="detail-grid">
          {/* Left Column — Content */}
          <div className="detail-main">
            {/* Original Submission */}
            <section className="detail-section card">
              <div className="detail-section-header">
                <span className="material-symbols-outlined">description</span>
                <h2>Original Submission</h2>
              </div>
              <div className="lang-badge">
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>translate</span>
                Language: {grievance.detected_language || 'Native'}
              </div>
              <blockquote className="original-text" style={{ whiteSpace: 'pre-wrap' }}>
                "{grievance.original_text || grievance.english_summary}"
              </blockquote>
              
              {grievance.original_text && grievance.english_summary && grievance.original_text !== grievance.english_summary && (
                <div className="translation-section">
                  <h4>English Translation</h4>
                  <p>"{grievance.english_summary}"</p>
                </div>
              )}
              
              {grievance.attachment_url && (
                <div className="attachment-row" style={{ marginTop: '16px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 18, color: 'var(--outline)' }}>attachment</span>
                  <a href={grievance.attachment_url} target="_blank" rel="noreferrer" className="attachment-name">Attached File</a>
                </div>
              )}
            </section>

            {/* Official Response (Admin only) */}
            {isAdmin && grievance.status !== 'resolved' && grievance.status !== 'closed' && (
              <section className="detail-section card">
                <div className="detail-section-header">
                  <span className="material-symbols-outlined">reply_all</span>
                  <h2>Official Response</h2>
                </div>
                <p className="response-hint">Reply to the citizen and update the status.</p>
                
                <div style={{ marginBottom: '16px' }}>
                   <label className="input-label" style={{ display: 'block', marginBottom: '8px' }}>Action to take</label>
                   <select className="input-field" value={replyStatus} onChange={e => setReplyStatus(e.target.value)}>
                     <option value="in_progress">Mark as In Progress</option>
                     <option value="resolved">Mark as Resolved</option>
                   </select>
                </div>
                
                <textarea
                  className="input-field response-textarea"
                  placeholder="Type your official response here. This will be automatically translated back to the citizen's native language."
                  rows={5}
                  value={remark}
                  onChange={e => setRemark(e.target.value)}
                />
                <button 
                  className="btn btn-primary" 
                  onClick={handleAdminReply}
                  disabled={updating}
                  style={{ alignSelf: 'flex-start', marginTop: 'var(--space-4)' }}
                >
                  {updating ? 'Updating...' : 'Send Response'}
                  {!updating && <span className="material-symbols-outlined">send</span>}
                </button>
              </section>
            )}

            {/* Admin Response Visible to Citizen */}
            {!isAdmin && grievance.updates && grievance.updates.length > 0 && (
              <section className="detail-section card" style={{ background: 'var(--surface-container-highest)' }}>
                <div className="detail-section-header">
                  <span className="material-symbols-outlined">reply_all</span>
                  <h2>Official Responses</h2>
                </div>
                {grievance.updates.map((update, idx) => (
                  <div key={idx} style={{ marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid var(--outline-variant)' }}>
                    <p style={{ fontStyle: 'italic' }}>"{update.remark || update.message}"</p>
                    <span style={{ fontSize: '12px', color: 'var(--outline)' }}>{new Date(update.timestamp || Date.now()).toLocaleString()}</span>
                  </div>
                ))}
              </section>
            )}

            {/* AI Analysis */}
            <section className="detail-section card ai-analysis-card">
              <div className="detail-section-header">
                <span className="material-symbols-outlined filled" style={{ color: 'var(--saffron)' }}>psychology</span>
                <h2>AI Analysis</h2>
              </div>
              <p className="ai-insight-text">
                <strong>Insight:</strong> Natural language processing categorised this under <strong>{grievance.category || 'General'}</strong>.
                Entity extraction highlighted related keyword concepts.
              </p>
              
              {grievance.keywords && grievance.keywords.length > 0 && (
                <div style={{ marginTop: '16px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {grievance.keywords.map(kw => (
                    <span key={kw} className="chip" style={{ background: 'white' }}>{kw}</span>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* Right Column — Timeline & Meta */}
          <aside className="detail-aside">
            {/* Audit Trail */}
            <div className="timeline-card card">
              <h3>Audit Trail</h3>
              <div className="timeline">
                
                {grievance.updates && grievance.updates.length > 0 ? grievance.updates.map((t, i) => (
                  <div key={i} className="timeline-item">
                    <div className="timeline-dot-line">
                      <div className={`timeline-dot ${i === 0 ? 'active' : ''}`}></div>
                      {i < grievance.updates.length - 1 && <div className="timeline-line"></div>}
                    </div>
                    <div className="timeline-content">
                      <p className="timeline-event">Status set: {t.status}</p>
                      <span className="timeline-date">{new Date(t.timestamp).toLocaleString()}</span>
                      {t.remark && <p className="timeline-detail">"{t.remark}"</p>}
                    </div>
                  </div>
                )) : (
                  <div className="timeline-item">
                     <div className="timeline-dot-line">
                       <div className="timeline-dot active"></div>
                     </div>
                     <div className="timeline-content">
                        <p className="timeline-event">Submission Received</p>
                        <span className="timeline-date">{new Date(grievance.created_at || Date.now()).toLocaleString()}</span>
                     </div>
                  </div>
                )}
              </div>
            </div>

            {/* Geolocation */}
            <div className="geo-card card surface-low">
              <div className="detail-section-header">
                <span className="material-symbols-outlined" style={{ color: 'var(--emerald)' }}>location_on</span>
                <h3>Location</h3>
              </div>
              <p className="geo-text">
                {grievance.location ? `${grievance.location.address || ''}, ${grievance.location.district || ''}, ${grievance.location.state || ''} ${grievance.location.pincode || ''}` : 'Location offline'}
              </p>
              <div className="geo-map-placeholder">
                <span className="material-symbols-outlined">map</span>
                <span>Map View</span>
              </div>
            </div>
            
             {/* Contact Details */}
             {isAdmin && grievance.user && (
              <div className="geo-card card surface-low" style={{ marginTop: '16px' }}>
                <div className="detail-section-header">
                  <span className="material-symbols-outlined" style={{ color: 'var(--primary)' }}>person</span>
                  <h3>Citizen Details</h3>
                </div>
                <p><strong>Name:</strong> {grievance.user.name || 'Anonymous'}</p>
                <p><strong>Phone:</strong> {grievance.user.phone || 'N/A'}</p>
              </div>
             )}
          </aside>
        </div>
      </div>
    </DashboardLayout>
  );
}

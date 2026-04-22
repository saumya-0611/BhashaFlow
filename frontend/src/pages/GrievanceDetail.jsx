import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import api from '../utils/api';
import './GrievanceDetail.css';

export default function GrievanceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const role = localStorage.getItem('userRole') || 'citizen';
  const isAdmin = role === 'admin' || role === 'authority';

  const [grievance, setGrievance]       = useState(null);
  // FIX: backend returns ai_analysis and status_timeline as separate top-level keys
  const [aiAnalysis, setAiAnalysis]     = useState(null);
  const [statusTimeline, setTimeline]   = useState([]);
  const [loading, setLoading]           = useState(true);

  const [remark, setRemark]             = useState('');
  const [replyStatus, setReplyStatus]   = useState('resolved');
  const [updating, setUpdating]         = useState(false);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        // FIX: use correct route based on role
        const route = isAdmin ? `/api/admin/grievance/${id}` : `/api/grievance/${id}`;
        const res = await api.get(route);
        // FIX: backend wraps everything: { grievance, ai_analysis, status_timeline }
        setGrievance(res.data.grievance);
        setAiAnalysis(res.data.ai_analysis || null);
        setTimeline(res.data.status_timeline || []);
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to fetch grievance');
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id, isAdmin, navigate]);

  const handleAdminReply = async () => {
    if (!remark.trim()) return alert('Please enter a response.');
    setUpdating(true);
    try {
      await api.put(`/api/admin/grievance/${id}/status`, {
        status: replyStatus,
        remark,
      });
      alert('Status updated successfully');
      // Refresh detail
      const res = await api.get(`/api/admin/grievance/${id}`);
      setGrievance(res.data.grievance);
      setTimeline(res.data.status_timeline || []);
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

  // FIX: category, priority, title live on Grievance; language + keywords on AiAnalysis
  const detectedLanguage = aiAnalysis?.detected_language || grievance.original_language || 'Native';
  const keywords         = aiAnalysis?.keywords          || [];
  const englishSummary   = aiAnalysis?.english_summary   || grievance.title || '';

  return (
    <DashboardLayout isAdmin={isAdmin}>
      <div className="detail-page">
        {/* Header */}
        <section className="detail-header">
          <div className="detail-header-top">
            <h1>{grievance.title || englishSummary || 'Grievance Detail'}</h1>
            <div className="detail-badges">
              <span className={`chip ${
                (grievance.status === 'resolved' || grievance.status === 'closed')
                  ? 'chip-success'
                  : 'chip-warning'
              }`}>
                {grievance.status ? grievance.status.replace('_', ' ').toUpperCase() : 'PENDING'}
              </span>
            </div>
          </div>
        </section>

        <div className="detail-grid">
          {/* Left Column */}
          <div className="detail-main">

            {/* Original Submission */}
            <section className="detail-section card">
              <div className="detail-section-header">
                <span className="material-symbols-outlined">description</span>
                <h2>Original Submission</h2>
              </div>
              <div className="lang-badge">
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>translate</span>
                Language: {detectedLanguage}
              </div>
              <blockquote className="original-text" style={{ whiteSpace: 'pre-wrap' }}>
                "{grievance.original_text || englishSummary}"
              </blockquote>

              {grievance.original_text && englishSummary && grievance.original_text !== englishSummary && (
                <div className="translation-section">
                  <h4>English Translation / Summary</h4>
                  <p>"{englishSummary}"</p>
                </div>
              )}

              {/* FIX: image_url / audio_url are the actual Grievance fields */}
              {grievance.image_url && (
                <div className="attachment-row" style={{ marginTop: '16px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 18, color: 'var(--outline)' }}>image</span>
                  <a href={`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'}/${grievance.image_url}`}
                     target="_blank" rel="noreferrer" className="attachment-name">
                    View Attached Image
                  </a>
                </div>
              )}
              {grievance.audio_url && (
                <div className="attachment-row" style={{ marginTop: '8px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 18, color: 'var(--outline)' }}>audio_file</span>
                  <a href={`/api/grievance/${grievance._id}/audio`}
                     target="_blank" rel="noreferrer" className="attachment-name">
                    Play Audio Recording
                  </a>
                </div>
              )}
            </section>

            {/* Admin Response Panel */}
            {isAdmin && grievance.status !== 'resolved' && grievance.status !== 'closed' && (
              <section className="detail-section card">
                <div className="detail-section-header">
                  <span className="material-symbols-outlined">reply_all</span>
                  <h2>Official Response</h2>
                </div>
                <p className="response-hint">Reply to the citizen and update the status.</p>

                <div style={{ marginBottom: '16px' }}>
                  <label className="input-label" style={{ display: 'block', marginBottom: '8px' }}>
                    Action to take
                  </label>
                  <select className="input-field" value={replyStatus} onChange={e => setReplyStatus(e.target.value)}>
                    <option value="in_progress">Mark as In Progress</option>
                    <option value="resolved">Mark as Resolved</option>
                    <option value="closed">Mark as Closed</option>
                  </select>
                </div>

                <textarea
                  className="input-field response-textarea"
                  placeholder="Type your official response / remark here."
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

            {/* AI Analysis */}
            <section className="detail-section card ai-analysis-card">
              <div className="detail-section-header">
                <span className="material-symbols-outlined filled" style={{ color: 'var(--saffron)' }}>psychology</span>
                <h2>AI Analysis</h2>
              </div>
              <p className="ai-insight-text">
                <strong>Category:</strong> {grievance.category || 'General'} &nbsp;|&nbsp;
                {/* FIX: confidence_score lives on AiAnalysis */}
                <strong>Confidence:</strong> {aiAnalysis?.confidence_score
                  ? `${Math.round(aiAnalysis.confidence_score * 100)}%`
                  : 'N/A'
                }
              </p>
              {/* FIX: keywords from aiAnalysis, not grievance */}
              {keywords.length > 0 && (
                <div style={{ marginTop: '16px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {keywords.map(kw => (
                    <span key={kw} className="chip chip-primary">{kw}</span>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* Right Column — Timeline & Meta */}
          <aside className="detail-aside">

            {/* FIX: use statusTimeline state (from status_timeline key in response) */}
            <div className="timeline-card card">
              <h3>Audit Trail</h3>
              <div className="timeline">
                {statusTimeline.length > 0 ? statusTimeline.map((t, i) => (
                  <div key={t._id || i} className="timeline-item">
                    <div className="timeline-dot-line">
                      <div className={`timeline-dot ${i === statusTimeline.length - 1 ? 'active' : ''}`}></div>
                      {i < statusTimeline.length - 1 && <div className="timeline-line"></div>}
                    </div>
                    <div className="timeline-content">
                      {/* FIX: StatusUpdate fields are old_status, new_status, changed_by, updated_at */}
                      <p className="timeline-event">
                        {t.old_status} → {t.new_status}
                      </p>
                      <span className="timeline-date">
                        {new Date(t.updated_at).toLocaleString()}
                      </span>
                      {t.remark && <p className="timeline-detail">"{t.remark}"</p>}
                      <p style={{ fontSize: 'var(--label-sm)', color: 'var(--outline)' }}>
                        by {t.changed_by}
                      </p>
                    </div>
                  </div>
                )) : (
                  <div className="timeline-item">
                    <div className="timeline-dot-line">
                      <div className="timeline-dot active"></div>
                    </div>
                    <div className="timeline-content">
                      <p className="timeline-event">Submission Received</p>
                      {/* FIX: correct field is submitted_at */}
                      <span className="timeline-date">
                        {new Date(grievance.submitted_at || Date.now()).toLocaleString()}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Location */}
            <div className="geo-card card surface-low">
              <div className="detail-section-header">
                <span className="material-symbols-outlined" style={{ color: 'var(--emerald)' }}>location_on</span>
                <h3>Location</h3>
              </div>
              {/* FIX: location fields are flat on Grievance: state, district, pincode, address */}
              <p className="geo-text">
                {grievance.address
                  ? `${grievance.address}, ${grievance.district || ''}, ${grievance.state || ''} ${grievance.pincode || ''}`
                  : 'Location not provided'
                }
              </p>
              <div className="geo-map-placeholder">
                <span className="material-symbols-outlined">map</span>
                <span>Map View</span>
              </div>
            </div>

            {/* Citizen details (admin only) */}
            {isAdmin && (
              <div className="geo-card card surface-low" style={{ marginTop: '16px' }}>
                <div className="detail-section-header">
                  <span className="material-symbols-outlined" style={{ color: 'var(--primary)' }}>person</span>
                  <h3>Citizen Details</h3>
                </div>
                {/* FIX: citizen contact stored directly on Grievance as user_name, user_phone */}
                <p><strong>Name:</strong> {grievance.user_name || 'Anonymous'}</p>
                <p><strong>Phone:</strong> {grievance.user_phone || 'N/A'}</p>
              </div>
            )}
          </aside>
        </div>
      </div>
    </DashboardLayout>
  );
}

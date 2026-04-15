import { useParams } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import './GrievanceDetail.css';

export default function GrievanceDetail() {
  const { id } = useParams();

  // Demo data matching the Stitch "Manage Grievance" screen
  const grievance = {
    title: 'Street Lighting Failure in Ward 12 (Hindi Submission)',
    status: 'In Progress',
    severity: 'High',
    lang: 'Hindi (Native)',
    originalText: 'हमारे मोहल्ले वार्ड 12 में पिछले 10 दिनों से स्ट्रीट लाइट काम नहीं कर रही है। रात में बहुत अंधेरा रहता है और बुजुर्गों को चलने में दिक्कत हो रही है। कृपया इसे जल्द ठीक करें।',
    translatedText: 'Street lights in our neighborhood Ward 12 have not been working for the last 10 days. It is very dark at night and the elderly are having difficulty walking. Please fix it soon.',
    attachment: 'IMG_7721_W12.jpg • 2.4 MB',
    aiInsight: 'Similar reports detected in Ward 11. Potential grid-level issue in the North-East zone.',
    timeline: [
      { event: "Status changed to 'In Progress'", date: 'Oct 25, 2023 • 10:45 AM', detail: 'Assigned to Electrical Maintenance Team B' },
      { event: 'Case Assigned', date: 'Oct 24, 2023 • 04:12 PM', detail: 'Assigned to Official: Rajesh Kumar' },
      { event: 'Submission Received', date: 'Oct 24, 2023 • 02:30 PM', detail: null },
    ],
    geolocation: 'Ward 12, Northern Sector (23.2599° N, 77.4126° E)',
  };

  return (
    <DashboardLayout>
      <div className="detail-page">
        {/* Header */}
        <section className="detail-header">
          <div className="detail-header-top">
            <h1>{grievance.title}</h1>
            <div className="detail-badges">
              <span className="chip chip-warning">{grievance.status}</span>
              <span className="chip chip-error">{grievance.severity}</span>
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
                Language: {grievance.lang}
              </div>
              <blockquote className="original-text">
                "{grievance.originalText}"
              </blockquote>
              <div className="translation-section">
                <h4>English Translation</h4>
                <p>"{grievance.translatedText}"</p>
              </div>
              <div className="attachment-row">
                <span className="material-symbols-outlined" style={{ fontSize: 18, color: 'var(--outline)' }}>image</span>
                <span className="attachment-name">{grievance.attachment}</span>
              </div>
            </section>

            {/* Official Response */}
            <section className="detail-section card">
              <div className="detail-section-header">
                <span className="material-symbols-outlined">reply_all</span>
                <h2>Official Response</h2>
              </div>
              <p className="response-hint">Your reply will be automatically translated back to Hindi for the citizen.</p>
              <textarea
                className="input-field response-textarea"
                placeholder="Type your official response here..."
                rows={5}
              />
              <button className="btn btn-primary" style={{ alignSelf: 'flex-start', marginTop: 'var(--space-4)' }}>
                <span className="material-symbols-outlined">send</span>
                Send Response
              </button>
            </section>

            {/* AI Analysis */}
            <section className="detail-section card ai-analysis-card">
              <div className="detail-section-header">
                <span className="material-symbols-outlined filled" style={{ color: 'var(--saffron)' }}>psychology</span>
                <h2>AI Analysis</h2>
              </div>
              <p className="ai-insight-text">
                <strong>Insight:</strong> {grievance.aiInsight}
              </p>
            </section>
          </div>

          {/* Right Column — Timeline & Meta */}
          <aside className="detail-aside">
            {/* Audit Trail */}
            <div className="timeline-card card">
              <h3>Audit Trail</h3>
              <div className="timeline">
                {grievance.timeline.map((t, i) => (
                  <div key={i} className="timeline-item">
                    <div className="timeline-dot-line">
                      <div className={`timeline-dot ${i === 0 ? 'active' : ''}`}></div>
                      {i < grievance.timeline.length - 1 && <div className="timeline-line"></div>}
                    </div>
                    <div className="timeline-content">
                      <p className="timeline-event">{t.event}</p>
                      <span className="timeline-date">{t.date}</span>
                      {t.detail && <p className="timeline-detail">"{t.detail}"</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Geolocation */}
            <div className="geo-card card surface-low">
              <div className="detail-section-header">
                <span className="material-symbols-outlined" style={{ color: 'var(--emerald)' }}>location_on</span>
                <h3>Geolocation</h3>
              </div>
              <p className="geo-text">{grievance.geolocation}</p>
              <div className="geo-map-placeholder">
                <span className="material-symbols-outlined">map</span>
                <span>Map View</span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </DashboardLayout>
  );
}

import DashboardLayout from '../components/DashboardLayout';
import './AIAnalysis.css';

export default function AIAnalysis() {
  const result = {
    quote: '...large potholes reported near the arterial junction of MG Road and 4th Cross. Surface integrity compromised over a 50-meter stretch, causing significant traffic bottlenecks and safety hazards for two-wheelers during evening peak hours. Language identified: English/Hindi Mix (Hinglish).',
    classification: {
      department: 'Public Works Department (PWD)',
      category: 'Roads & Infrastructure',
      severity: 'High',
      confidence: '94.2%',
      language: 'Hinglish (English/Hindi)',
      sentiment: 'Urgent / Frustrated',
    },
    actions: [
      { title: 'File on CPGRAMS', desc: 'Central Public Grievance Portal', icon: 'account_balance' },
      { title: 'State Municipal Portal', desc: 'Local civic body system', icon: 'domain' },
      { title: 'NHAI Helpline', desc: 'National highway authority', icon: 'call' },
    ],
    contact: {
      phone: '+91 1800-425-0011',
      email: 'grievance@pwd.state.gov.in',
    },
    ecoImpact: 'Digital filing saved approx. 120g of paper carbon.',
  };

  return (
    <DashboardLayout>
      <div className="ai-page">
        {/* Header */}
        <section className="ai-header">
          <div className="ai-header-badge">
            <span className="material-symbols-outlined filled">psychology</span>
            <h1>AI Analysis Result</h1>
          </div>
          <p>Your grievance has been processed by our neural engine. Below is the semantic classification and recommended routing for swift resolution.</p>
        </section>

        {/* Quoted Text */}
        <blockquote className="ai-quote card">
          <span className="material-symbols-outlined quote-icon">format_quote</span>
          <p>{result.quote}</p>
        </blockquote>

        <div className="ai-grid">
          {/* Left Column */}
          <div className="ai-main">
            {/* Classification Grid */}
            <section className="classification-section card">
              <h2>
                <span className="material-symbols-outlined">analytics</span>
                Semantic Classification
              </h2>
              <div className="class-grid">
                {Object.entries(result.classification).map(([key, val]) => (
                  <div key={key} className="class-item">
                    <span className="class-label">{key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}</span>
                    <span className={`class-value ${key === 'severity' ? 'severity-high' : ''}`}>{val}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Recommended Actions */}
            <section className="actions-section card">
              <h2>
                <span className="material-symbols-outlined">account_balance</span>
                Recommended Actions
              </h2>
              <div className="action-list">
                {result.actions.map((a) => (
                  <button key={a.title} className="action-card surface-low">
                    <div className="action-info">
                      <span className="material-symbols-outlined action-icon">{a.icon}</span>
                      <div>
                        <strong>{a.title}</strong>
                        <p>{a.desc}</p>
                      </div>
                    </div>
                    <span className="material-symbols-outlined">arrow_forward</span>
                  </button>
                ))}
              </div>
            </section>

            {/* CTA */}
            <div className="ai-cta">
              <p>Move forward with your application or keep a record for your files.</p>
              <div className="ai-cta-btns">
                <button className="btn btn-primary">
                  <span className="material-symbols-outlined">download</span>
                  Download Report
                </button>
                <button className="btn btn-outline">
                  <span className="material-symbols-outlined">share</span>
                  Share
                </button>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <aside className="ai-aside">
            {/* Contact */}
            <div className="contact-card card surface-low">
              <h3>
                <span className="material-symbols-outlined">contact_phone</span>
                Contact Details
              </h3>
              <div className="contact-item">
                <span className="contact-label">Department Helpline</span>
                <a href={`tel:${result.contact.phone}`} className="contact-value">{result.contact.phone}</a>
              </div>
              <div className="contact-item">
                <span className="contact-label">Official Email</span>
                <a href={`mailto:${result.contact.email}`} className="contact-value">{result.contact.email}</a>
              </div>
            </div>

            {/* Case Metadata */}
            <div className="meta-card card surface-low">
              <h3>Case Metadata</h3>
              <div className="eco-badge">
                <span className="material-symbols-outlined" style={{ color: 'var(--emerald)', fontSize: 20 }}>eco</span>
                <div>
                  <span className="eco-label">Eco Impact</span>
                  <p>{result.ecoImpact}</p>
                </div>
              </div>
            </div>

            {/* Map Placeholder */}
            <div className="map-card card surface-low">
              <h3>Department Coverage Map</h3>
              <div className="map-placeholder">
                <span className="material-symbols-outlined">map</span>
                <span>Interactive Map</span>
              </div>
            </div>
          </aside>
        </div>

        {/* Footer */}
        <footer className="page-footer">
          <div className="footer-brand">BhashaFlow</div>
          <p className="footer-tagline">An initiative by the Ministry of Electronics and Information Technology to bridge the linguistic gap in civic grievance redressal through cutting-edge AI.</p>
          <div className="footer-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">AI Ethics Code</a>
          </div>
        </footer>
      </div>
    </DashboardLayout>
  );
}

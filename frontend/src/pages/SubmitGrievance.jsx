import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import './SubmitGrievance.css';

export default function SubmitGrievance() {
  const navigate = useNavigate();
  const [text, setText] = useState('');
  const [category, setCategory] = useState('');
  const [files, setFiles] = useState([]);
  const [dragging, setDragging] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef(null);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const dropped = Array.from(e.dataTransfer.files);
    setFiles(prev => [...prev, ...dropped]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) { alert('Please describe your grievance.'); return; }
    setSubmitting(true);
    // Simulated submission
    setTimeout(() => {
      setSubmitting(false);
      alert('Grievance submitted successfully!');
      navigate('/dashboard');
    }, 2000);
  };

  return (
    <DashboardLayout>
      <div className="submit-page">
        {/* Header */}
        <section className="submit-header">
          <h1>Submit Your Grievance</h1>
          <p>Use our AI-powered portal to file your concern. We support all Indian regional languages and process your request with high institutional priority.</p>
        </section>

        <form onSubmit={handleSubmit} className="submit-form">
          <div className="submit-grid">
            {/* Left Column — Form */}
            <div className="submit-main">
              {/* Text Area */}
              <div className="field-group">
                <label className="input-label" htmlFor="grievance-text">Describe Your Grievance</label>
                <textarea
                  id="grievance-text"
                  className="input-field grievance-textarea"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Type your grievance in any Indian language. Our AI will handle translation and categorization automatically..."
                  rows={8}
                />
              </div>

              {/* Category */}
              <div className="field-group">
                <label className="input-label" htmlFor="category">Category (Optional)</label>
                <select
                  id="category"
                  className="input-field"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="">AI will auto-detect category</option>
                  <option value="roads">Roads & Infrastructure</option>
                  <option value="water">Water Supply</option>
                  <option value="electricity">Electricity</option>
                  <option value="sanitation">Sanitation</option>
                  <option value="education">Education</option>
                  <option value="healthcare">Healthcare</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* File Upload */}
              <div
                className={`upload-zone ${dragging ? 'dragging' : ''} ${files.length > 0 ? 'has-files' : ''}`}
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileRef.current?.click()}
              >
                <input
                  type="file" ref={fileRef} style={{ display: 'none' }}
                  multiple accept="image/*,.pdf"
                  onChange={(e) => setFiles(prev => [...prev, ...Array.from(e.target.files)])}
                />
                <span className="material-symbols-outlined upload-icon">cloud_upload</span>
                <p className="upload-text">
                  {files.length > 0
                    ? `${files.length} file(s) attached`
                    : 'Drag and drop images or PDFs here'
                  }
                </p>
                <p className="upload-hint">Max size 10MB. Formats: JPG, PNG, PDF</p>
                {files.length > 0 && (
                  <div className="file-list">
                    {files.map((f, i) => (
                      <span key={i} className="chip chip-primary">
                        <span className="material-symbols-outlined" style={{ fontSize: 14 }}>attach_file</span>
                        {f.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button type="submit" className="btn btn-primary submit-btn" disabled={submitting}>
                {submitting ? 'Processing…' : 'Submit Grievance'}
                <span className="material-symbols-outlined">send</span>
              </button>

              {/* Security Badge */}
              <div className="security-badge">
                <span className="material-symbols-outlined" style={{ fontSize: 16, color: 'var(--emerald)' }}>lock</span>
                <span>Digital Sovereignty at Work — Secure submission via official government protocol.</span>
              </div>
            </div>

            {/* Right Column — Info Cards */}
            <aside className="submit-aside">
              <div className="info-card card surface-low">
                <div className="info-card-header">
                  <span className="material-symbols-outlined filled" style={{ color: 'var(--primary-container)' }}>translate</span>
                  <h3>Multilingual Analysis</h3>
                </div>
                <p>Our neural engine supports 22+ official languages. Type as you speak; the AI handles formal translation and summary automatically.</p>
              </div>

              <div className="info-card card surface-low">
                <div className="info-card-header">
                  <span className="material-symbols-outlined filled" style={{ color: 'var(--saffron)' }}>category</span>
                  <h3>Auto-Categorization</h3>
                </div>
                <p>Based on your description, the system predicts the correct department, reducing dispatch time by up to 70%.</p>
              </div>

              <div className="info-card card surface-low">
                <div className="info-card-header">
                  <span className="material-symbols-outlined filled" style={{ color: 'var(--emerald)' }}>speed</span>
                  <h3>Priority Detection</h3>
                </div>
                <p>The AI assesses urgency from your text and attached evidence, escalating critical cases automatically.</p>
              </div>
            </aside>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}

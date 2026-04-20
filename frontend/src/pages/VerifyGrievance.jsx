import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useState } from 'react';
import api from '../utils/api';

export default function VerifyGrievance() {
  const { sessionId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  // If there's no state (user refreshed the page directly), redirect back to submit.
  if (!location.state) {
    navigate('/submit', { replace: true });
    return null;
  }

  const { verification_sentence, category, keywords, detected_language } = location.state;

  const handleResponse = async (confirmed) => {
    setSubmitting(true);
    try {
      const res = await api.post('/api/grievance/confirm', { 
        grievance_id: sessionId, 
        confirmed 
      });
      
      if (confirmed) {
        navigate(`/grievance-form/${sessionId}`);
      } else {
        navigate('/submit');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Verification step failed');
      setSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', background: 'var(--surface-container-low)' }}>
      {/* Title */}
      <h1 style={{ fontSize: '28px', color: 'var(--primary)', marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span className="material-symbols-outlined" style={{ fontSize: '32px' }}>interpreter_mode</span>
        BhashaFlow Verification
      </h1>

      {/* Verification Card */}
      <div className="card shadow" style={{ maxWidth: '600px', width: '100%', padding: '40px', background: 'white', borderRadius: '16px', textAlign: 'center' }}>
        
        <div style={{ marginBottom: '24px' }}>
          <span className="chip" style={{ background: 'var(--surface-container-low)', color: 'var(--on-surface-variant)', border: '1px solid var(--outline-variant)' }}>
            Detected: {detected_language || 'Hindi'}
          </span>
          {category && (
            <span className="chip chip-primary ml-2">
              Category: {category}
            </span>
          )}
        </div>

        <h2 style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--on-surface)', lineHeight: '1.4', marginBottom: '32px' }}>
          "{verification_sentence}"
        </h2>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginTop: '32px' }}>
          <button 
            onClick={() => handleResponse(true)} 
            disabled={submitting}
            style={{ flex: 1, padding: '16px 24px', fontSize: '18px', fontWeight: 'bold', borderRadius: '12px', border: 'none', background: 'var(--emerald)', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            <span className="material-symbols-outlined">check_circle</span>
            Haan / Yes
          </button>
          
          <button 
            onClick={() => handleResponse(false)} 
            disabled={submitting}
            style={{ flex: 1, padding: '16px 24px', fontSize: '18px', fontWeight: 'bold', borderRadius: '12px', border: 'none', background: '#d32f2f', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            <span className="material-symbols-outlined">cancel</span>
            Nahi / No
          </button>
        </div>

        {/* Meta keywords */}
        {keywords && keywords.length > 0 && (
          <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid var(--outline-variant)' }}>
            <p style={{ fontSize: '12px', color: 'var(--outline)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>Extracted Keywords</p>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
              {keywords.map((kw, i) => (
                <span key={i} className="chip" style={{ fontSize: '12px', background: 'var(--surface-container-lowest)' }}>{kw}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

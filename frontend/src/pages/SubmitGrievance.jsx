import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import DashboardLayout from '../components/DashboardLayout';
import api from '../utils/api';
import './SubmitGrievance.css';

export default function SubmitGrievance() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const [activeTab, setActiveTab] = useState('text');
  
  // text tab
  const [text, setText] = useState(state?.prefillText || '');
  
  // voice tab
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState('');
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef(null);
  const timerRef = useRef(null);

  // image tab
  const [files, setFiles] = useState([]);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef(null);

  const [submitting, setSubmitting] = useState(false);

  // Voice recording handlers
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      
      const chunks = [];
      recorder.ondataavailable = e => chunks.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
      };

      recorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (err) {
      alert('Could not access microphone: ' + err.message);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      clearInterval(timerRef.current);
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (mediaRecorderRef.current?.stream) {
        mediaRecorderRef.current.stream.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Image handlers
  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const dropped = Array.from(e.dataTransfer.files);
    setFiles(prev => [...prev, ...dropped]);
  };

  const validateInput = () => {
    if (activeTab === 'text' && !text.trim()) return false;
    if (activeTab === 'voice' && !audioBlob) return false;
    if (activeTab === 'image' && files.length === 0) return false;
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateInput()) { 
      alert('Please provide input for the selected mode.'); 
      return; 
    }
    
    const formData = new FormData();
    if (activeTab === 'text') formData.append('text', text);
    if (activeTab === 'voice') formData.append('audio', audioBlob, 'recording.webm');
    if (activeTab === 'image') formData.append('image', files[0]);

    setSubmitting(true);
    try {
      const res = await api.post('/api/grievance/ingest', formData);
      navigate(`/verify/${res.data.grievance_id}`, { state: res.data });
    } catch (err) {
      alert(err.response?.data?.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="submit-page">
        {/* Header */}
        <section className="submit-header">
          <h1>Submit Your Grievance</h1>
          <p>Choose how you want to describe your grievance. Our AI handles text, voice, and images securely.</p>
        </section>

        <form onSubmit={handleSubmit} className="submit-form">
          <div className="submit-grid">
            {/* Left Column — Form */}
            <div className="submit-main">
              
              {/* Tab Selector */}
              <div className="flex bg-surface-low rounded-lg p-1 mb-6" style={{ display: 'flex', gap: '8px', background: 'var(--surface-container-low)', padding: '6px', borderRadius: '8px', marginBottom: '24px' }}>
                {['text', 'voice', 'image'].map(tab => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    style={{ flex: 1, padding: '10px', borderRadius: '6px', border: 'none', 
                             background: activeTab === tab ? 'white' : 'transparent',
                             color: activeTab === tab ? 'var(--primary)' : 'var(--on-surface-variant)',
                             fontWeight: activeTab === tab ? '600' : '400',
                             boxShadow: activeTab === tab ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                             cursor: 'pointer', textTransform: 'capitalize' }}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Text Area Tab */}
              {activeTab === 'text' && (
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
              )}

              {/* Voice Tab */}
              {activeTab === 'voice' && (
                <div className="field-group voice-recording-zone" style={{ padding: '24px', background: 'var(--surface-container-low)', borderRadius: '12px', textAlign: 'center' }}>
                  <div style={{ marginBottom: '16px', fontSize: '24px', fontWeight: 'bold', color: isRecording ? 'var(--error)' : 'var(--on-surface)' }}>
                    {formatTime(recordingTime)}
                  </div>
                  
                  {!isRecording ? (
                    <button type="button" onClick={startRecording} className="btn btn-primary" style={{ borderRadius: '50px', padding: '12px 24px' }}>
                      <span className="material-symbols-outlined mr-2">mic</span> Start Recording
                    </button>
                  ) : (
                    <button type="button" onClick={stopRecording} className="btn" style={{ background: 'var(--error)', color: 'white', borderRadius: '50px', padding: '12px 24px' }}>
                      <span className="material-symbols-outlined mr-2">stop</span> Stop Recording
                    </button>
                  )}

                  {audioUrl && !isRecording && (
                    <div style={{ marginTop: '24px' }}>
                      <audio src={audioUrl} controls style={{ width: '100%' }} />
                    </div>
                  )}
                </div>
              )}

              {/* File Upload Tab */}
              {activeTab === 'image' && (
                <div
                  className={`upload-zone ${dragging ? 'dragging' : ''} ${files.length > 0 ? 'has-files' : ''}`}
                  onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => fileRef.current?.click()}
                >
                  <input
                    type="file" ref={fileRef} style={{ display: 'none' }}
                    accept="image/jpeg,image/png,image/webp,.pdf"
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
              )}

              {/* Submit Button */}
              <button type="submit" className="btn btn-primary submit-btn mt-6" disabled={submitting} style={{ width: '100%', marginTop: '24px' }}>
                {submitting ? 'Our AI is reading your grievance...' : 'Submit Grievance'}
                {submitting && (
                  <motion.div
                    style={{ width: 18, height: 18, border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', marginLeft: 8 }}
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                  />
                )}
                {!submitting && <span className="material-symbols-outlined ml-2">send</span>}
              </button>

              {/* Security Badge */}
              <div className="security-badge" style={{ marginTop: '16px' }}>
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

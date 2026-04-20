import { useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import api from '../utils/api';

const STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", 
  "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", 
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", 
  "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu", 
  "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
];

export default function GrievanceForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    user_name: localStorage.getItem('userName') || '',
    user_phone: '',
    state: '',
    district: '',
    pincode: '',
    address: '',
    landmark: ''
  });
  
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const res = await api.post('/api/grievance/submit', {
        grievance_id: id,
        ...formData
      });
      // Navigate to AI Analysis with backend response payload
      navigate(`/ai-result/${id}`, { state: res.data });
    } catch (err) {
      alert(err.response?.data?.message || 'Form submission failed');
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="submit-page">
        <section className="submit-header">
          <h1>Tell us where you are</h1>
          <p>Fill in your details below. You can type in your language — we will translate.</p>
        </section>

        <form onSubmit={handleSubmit} className="submit-form">
          <div className="card surface-low" style={{ padding: '32px', display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '24px' }}>
            
            {/* Left Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="field-group">
                <label className="input-label" htmlFor="user_name">Full Name</label>
                <input required type="text" id="user_name" name="user_name" className="input-field" value={formData.user_name} onChange={handleChange} />
              </div>
              
              <div className="field-group">
                <label className="input-label" htmlFor="user_phone">Phone Number</label>
                <input required type="text" id="user_phone" name="user_phone" className="input-field" value={formData.user_phone} onChange={handleChange} />
              </div>

              <div className="field-group">
                <label className="input-label" htmlFor="state">State</label>
                <select required id="state" name="state" className="input-field" value={formData.state} onChange={handleChange}>
                  <option value="">Select State</option>
                  {STATES.map(st => <option key={st} value={st}>{st}</option>)}
                </select>
              </div>

              <div className="field-group">
                <label className="input-label" htmlFor="district">District</label>
                <input required type="text" id="district" name="district" className="input-field" value={formData.district} onChange={handleChange} />
              </div>
            </div>

            {/* Right Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="field-group">
                <label className="input-label" htmlFor="pincode">Pincode</label>
                <input required type="text" id="pincode" name="pincode" className="input-field" value={formData.pincode} onChange={handleChange} />
              </div>

              <div className="field-group">
                <label className="input-label" htmlFor="address">Address</label>
                <textarea required id="address" name="address" className="input-field" rows={3} value={formData.address} onChange={handleChange} 
                  placeholder="You can type in your regional language here." />
              </div>

              <div className="field-group">
                <label className="input-label" htmlFor="landmark">Landmark (Optional)</label>
                <input type="text" id="landmark" name="landmark" className="input-field" value={formData.landmark} onChange={handleChange} />
              </div>
            </div>

            {/* Submit full width */}
            <div style={{ gridColumn: 'span 2', marginTop: '16px' }}>
              <button type="submit" className="btn btn-primary" disabled={submitting} style={{ width: '100%' }}>
                {submitting ? 'Translating & Fetching Data...' : 'Find Nearby Help'}
                {!submitting && <span className="material-symbols-outlined ml-2">search</span>}
              </button>
            </div>
            
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}

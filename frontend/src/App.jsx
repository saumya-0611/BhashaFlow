import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// ─── CHANGE THESE TWO LINES ───
import CitizenAuth from './components/CitizenAuth.jsx'; 
import Dashboard from './components/Dashboard.jsx';
// ──────────────────────────────

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/auth" element={<CitizenAuth />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/" element={<Navigate to="/auth" />} />
      </Routes>
    </Router>
  );
}

export default App;
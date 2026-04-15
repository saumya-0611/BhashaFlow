import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import CitizenAuth from './pages/CitizenAuth';
import Dashboard from './pages/Dashboard';
import SubmitGrievance from './pages/SubmitGrievance';
import GrievanceDetail from './pages/GrievanceDetail';
import AIAnalysis from './pages/AIAnalysis';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <Router>
      <Routes>
        {/* Auth */}
        <Route path="/auth" element={<CitizenAuth />} />

        {/* Citizen Portal */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/submit" element={<SubmitGrievance />} />
        <Route path="/grievance/:id" element={<GrievanceDetail />} />
        <Route path="/ai-result/:id" element={<AIAnalysis />} />

        {/* Admin Portal */}
        <Route path="/admin" element={<AdminDashboard />} />

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/auth" />} />
        <Route path="*" element={<Navigate to="/auth" />} />
      </Routes>
    </Router>
  );
}

export default App;
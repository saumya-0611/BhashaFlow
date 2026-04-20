import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import CitizenAuth from './pages/CitizenAuth';
import Dashboard from './pages/Dashboard';
import SubmitGrievance from './pages/SubmitGrievance';
import VerifyGrievance from './pages/VerifyGrievance';
import GrievanceForm from './pages/GrievanceForm';
import GrievanceDetail from './pages/GrievanceDetail';
import AIAnalysis from './pages/AIAnalysis';
import AdminDashboard from './pages/AdminDashboard';
import { ProtectedRoute, AdminRoute } from './utils/auth';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Route */}
        <Route path="/auth" element={<CitizenAuth />} />

        {/* Citizen Portal (Protected) */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/submit" element={<ProtectedRoute><SubmitGrievance /></ProtectedRoute>} />
        <Route path="/verify/:sessionId" element={<ProtectedRoute><VerifyGrievance /></ProtectedRoute>} />
        <Route path="/grievance-form/:id" element={<ProtectedRoute><GrievanceForm /></ProtectedRoute>} />
        <Route path="/grievance/:id" element={<ProtectedRoute><GrievanceDetail /></ProtectedRoute>} />
        <Route path="/ai-result/:id" element={<ProtectedRoute><AIAnalysis /></ProtectedRoute>} />

        {/* Admin Portal (Protected Role) */}
        <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/auth" replace />} />
        <Route path="*" element={<Navigate to="/auth" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
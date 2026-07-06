import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/layout/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import SnapCategorize from './pages/SnapCategorize';
import GrievanceDetails from './pages/GrievanceDetails';
import AdminDashboard from './pages/AdminDashboard';
import './styles/globals.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/report" element={<SnapCategorize />} />
          <Route path="/issue/:id" element={<GrievanceDetails />} />

          {/* Admin Routes - Public now */}
          <Route path="/admin" element={<AdminDashboard />} />

          {/* Protected Routes (Registered Users) */}
          <Route element={<ProtectedRoute />}>
            {/* Empty for now as report is public */}
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

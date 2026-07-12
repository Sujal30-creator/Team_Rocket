import { Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Fleet from './pages/Fleet';
import Drivers from './pages/Drivers';
import Trips from './pages/Trips';
import Maintenance from './pages/Maintenance';
import Fuel from './pages/Fuel';
import Analytics from './pages/Analytics';
import Compliance from './pages/Compliance';
import TripDetail from './pages/TripDetail';
import Chatbot from './components/Chatbot';

function Layout({ children }) {
  const { pathname } = useLocation();
  return (
    <div className="app">
      <Sidebar />
      <main key={pathname}>{children}</main>
      <Chatbot />
    </div>
  );
}

// Role Groups
const ALL_ROLES = ['Fleet Manager', 'Dispatcher', 'Safety Officer', 'Financial Analyst'];
const MGR_ONLY = ['Fleet Manager'];
const MGR_DISPATCH = ['Fleet Manager', 'Dispatcher'];
const MGR_SAFETY = ['Fleet Manager', 'Safety Officer'];
const MGR_FINANCE = ['Fleet Manager', 'Financial Analyst'];

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        
        {/* Dashboard is available to all logged-in users */}
        <Route path="/" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
        
        {/* Role-Specific Routes */}
        <Route path="/fleet"       element={<ProtectedRoute allowedRoles={MGR_ONLY}><Layout><Fleet /></Layout></ProtectedRoute>} />
        <Route path="/maintenance" element={<ProtectedRoute allowedRoles={MGR_ONLY}><Layout><Maintenance /></Layout></ProtectedRoute>} />
        
        <Route path="/trips" element={<ProtectedRoute allowedRoles={['Fleet Manager', 'Dispatcher']}><Layout><Trips /></Layout></ProtectedRoute>} />
        <Route path="/trips/:id" element={<ProtectedRoute allowedRoles={['Fleet Manager', 'Dispatcher']}><Layout><TripDetail /></Layout></ProtectedRoute>} />
        <Route path="/drivers" element={<ProtectedRoute allowedRoles={['Fleet Manager', 'Safety Officer']}><Layout><Drivers /></Layout></ProtectedRoute>} />
        <Route path="/compliance"  element={<ProtectedRoute allowedRoles={MGR_SAFETY}><Layout><Compliance /></Layout></ProtectedRoute>} />
        
        <Route path="/fuel"        element={<ProtectedRoute allowedRoles={MGR_FINANCE}><Layout><Fuel /></Layout></ProtectedRoute>} />
        <Route path="/analytics"   element={<ProtectedRoute allowedRoles={MGR_FINANCE}><Layout><Analytics /></Layout></ProtectedRoute>} />
      </Routes>
    </AuthProvider>
  );
}

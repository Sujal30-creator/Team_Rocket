import { Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Vehicles from './pages/Vehicles';
import Drivers from './pages/Drivers';
import Trips from './pages/Trips';
import Maintenance from './pages/Maintenance';
import Fuel from './pages/Fuel';
import Reports from './pages/Reports';

function Layout({ children }) {
  const { pathname } = useLocation();
  return (
    <div className="app">
      <Sidebar />
      <main key={pathname}>{children}</main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/"            element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
        <Route path="/vehicles"    element={<ProtectedRoute><Layout><Vehicles /></Layout></ProtectedRoute>} />
        <Route path="/drivers"     element={<ProtectedRoute><Layout><Drivers /></Layout></ProtectedRoute>} />
        <Route path="/trips"       element={<ProtectedRoute><Layout><Trips /></Layout></ProtectedRoute>} />
        <Route path="/maintenance" element={<ProtectedRoute><Layout><Maintenance /></Layout></ProtectedRoute>} />
        <Route path="/fuel"        element={<ProtectedRoute><Layout><Fuel /></Layout></ProtectedRoute>} />
        <Route path="/reports"     element={<ProtectedRoute><Layout><Reports /></Layout></ProtectedRoute>} />
      </Routes>
    </AuthProvider>
  );
}

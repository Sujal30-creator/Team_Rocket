import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LINKS = [
  { to: '/', label: 'Dashboard', icon: 'ti-layout-dashboard', end: true },
  { to: '/vehicles', label: 'Vehicles', icon: 'ti-truck' },
  { to: '/drivers', label: 'Drivers', icon: 'ti-id-badge-2' },
  { to: '/trips', label: 'Trips', icon: 'ti-route' },
  { to: '/maintenance', label: 'Maintenance', icon: 'ti-tool' },
  { to: '/fuel', label: 'Fuel & Expenses', icon: 'ti-receipt' },
  { to: '/reports', label: 'Reports', icon: 'ti-chart-bar' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();

  return (
    <div className="sidebar">
      <div className="brand">
        <div className="brand-mark">T</div>
        <div>
          <div className="brand-name">TransitOps</div>
          <div className="brand-sub">Fleet control</div>
        </div>
      </div>
      <nav>
        {LINKS.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.end}
            className={({ isActive }) => 'nav-item' + (isActive ? ' active' : '')}
          >
            <i className={`ti ${l.icon}`} aria-hidden="true"></i>
            {l.label}
          </NavLink>
        ))}
      </nav>
      {user && (
        <div className="user-box">
          <div className="name">{user.name}</div>
          <div className="role">{user.role}</div>
          <button className="btn btn-sm" onClick={logout}>
            <i className="ti ti-logout"></i>Sign out
          </button>
        </div>
      )}
    </div>
  );
}

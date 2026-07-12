import { useState, useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ProfileModal from './ProfileModal';

const ALL_LINKS = [
  { to: '/',            label: 'Dashboard',       icon: 'ti-layout-dashboard', end: true },
  { to: '/fleet',       label: 'Fleet',           icon: 'ti-truck',            roles: ['Fleet Manager'] },
  { to: '/drivers',     label: 'Drivers',         icon: 'ti-id-badge-2',       roles: ['Fleet Manager', 'Safety Officer'] },
  { to: '/trips',       label: 'Trips',           icon: 'ti-route',            roles: ['Fleet Manager', 'Dispatcher'] },
  { to: '/maintenance', label: 'Maintenance',     icon: 'ti-tool',             roles: ['Fleet Manager'] },
  { to: '/fuel',        label: 'Fuel & Expenses', icon: 'ti-receipt',          roles: ['Fleet Manager', 'Financial Analyst'] },
  { to: '/analytics',   label: 'Analytics',       icon: 'ti-chart-bar',        roles: ['Fleet Manager', 'Financial Analyst'] },
  { to: '/compliance',  label: 'Compliance',      icon: 'ti-shield-check',     roles: ['Fleet Manager', 'Safety Officer'] },
];

function getInitials(name = '') {
  return name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
}

export default function Sidebar() {
  const { user } = useAuth();
  const [showProfile, setShowProfile] = useState(false);

  // Filter links based on user role
  const visibleLinks = useMemo(() => {
    if (!user) return [];
    return ALL_LINKS.filter((link) => {
      if (!link.roles) return true; // Available to all (e.g., Dashboard)
      return link.roles.includes(user.role);
    });
  }, [user]);

  return (
    <>
      <div className="sidebar">
        {/* Brand */}
        <div className="sidebar-brand">
          <div className="brand-logo">F</div>
          <div>
            <div className="brand-name">FleetForge</div>
            <div className="brand-sub">Fleet OS</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="sidebar-nav">
          <div className="nav-section-label">Navigation</div>
          {visibleLinks.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) => 'nav-item' + (isActive ? ' active' : '')}
            >
              <i className={`ti ${l.icon}`} aria-hidden="true" />
              {l.label}
            </NavLink>
          ))}
          
          <button className="nav-item" onClick={() => setShowProfile(true)} style={{ marginTop: 'auto', border: 'none', background: 'transparent', textAlign: 'left', width: '100%', cursor: 'pointer' }}>
            <i className="ti ti-settings" aria-hidden="true" />
            Settings
          </button>
        </nav>

        {/* User footer — click to open profile */}
        {user && (
          <div className="sidebar-footer">
            <div
              className="user-card"
              onClick={() => setShowProfile(true)}
              id="open-profile-btn"
              title="Account settings"
            >
              <div className="user-avatar">{getInitials(user.name)}</div>
              <div className="user-info">
                <div className="user-name">{user.name}</div>
                <div className="user-role">{user.role}</div>
              </div>
              <i className="ti ti-settings user-settings-icon" />
            </div>
          </div>
        )}
      </div>

      {/* Profile modal */}
      {showProfile && <ProfileModal onClose={() => setShowProfile(false)} />}
    </>
  );
}

import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ProfileModal from './ProfileModal';

const LINKS = [
  { to: '/',            label: 'Dashboard',      icon: 'ti-layout-dashboard', end: true },
  { to: '/vehicles',    label: 'Vehicles',        icon: 'ti-truck'            },
  { to: '/drivers',     label: 'Drivers',         icon: 'ti-id-badge-2'       },
  { to: '/trips',       label: 'Trips',           icon: 'ti-route'            },
  { to: '/maintenance', label: 'Maintenance',     icon: 'ti-tool'             },
  { to: '/fuel',        label: 'Fuel & Expenses', icon: 'ti-receipt'          },
  { to: '/reports',     label: 'Reports',         icon: 'ti-chart-bar'        },
];

function getInitials(name = '') {
  return name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
}

export default function Sidebar() {
  const { user } = useAuth();
  const [showProfile, setShowProfile] = useState(false);

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
          {LINKS.map((l) => (
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

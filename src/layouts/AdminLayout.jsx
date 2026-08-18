import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Microscope,
  CalendarCheck,
  Home,
  Settings,
  User,
  LogOut,
  ShieldCheck,
  Menu,
  X,
  Bell,
  Star,
} from 'lucide-react';
import '../styles/admin-theme.css';

export default function AdminLayout() {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const storedUserRaw = localStorage.getItem('alzain_admin_user');
  let adminEmail = 'alzaindiagnostics@gmail.com';
  if (storedUserRaw) {
    try {
      const parsed = JSON.parse(storedUserRaw);
      adminEmail = parsed.email || parsed.username || adminEmail;
    } catch (e) {
      // fallback
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('alzain_admin_token');
    localStorage.removeItem('alzain_admin_user');
    navigate('/login');
  };

  const closeMobileNav = () => setMobileOpen(false);

  return (
    <div className="admin-app-layout">
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={closeMobileNav}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            zIndex: 95,
          }}
        />
      )}

      {/* 250px Sidebar */}
      <aside className={`admin-sidebar ${mobileOpen ? 'open' : ''}`}>
        <div className="admin-sidebar-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <img
              src="/assets/logo.png"
              alt="AL-ZAIN DIAGNOSTICS"
              style={{ height: '40px', width: 'auto', objectFit: 'contain', backgroundColor: '#ffffff', padding: '4px 8px', borderRadius: '6px' }}
            />
          </div>

          <button
            onClick={closeMobileNav}
            style={{
              border: 'none',
              background: 'none',
              color: '#ffffff',
              display: mobileOpen ? 'block' : 'none',
              cursor: 'pointer',
            }}
          >
            <X size={20} />
          </button>
        </div>

        <nav className="admin-nav">
          <NavLink to="/dashboard" onClick={closeMobileNav} className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </NavLink>

          <NavLink to="/packages" onClick={closeMobileNav} className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            <Package size={18} />
            <span>Packages</span>
          </NavLink>

          <NavLink to="/tests" onClick={closeMobileNav} className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            <Microscope size={18} />
            <span>Tests</span>
          </NavLink>

          <NavLink to="/bookings" onClick={closeMobileNav} className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            <CalendarCheck size={18} />
            <span>Bookings</span>
          </NavLink>

          <NavLink to="/home-collections" onClick={closeMobileNav} className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            <Home size={18} />
            <span>Home Collections</span>
          </NavLink>

          <NavLink to="/reviews" onClick={closeMobileNav} className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            <Star size={18} />
            <span>Reviews</span>
          </NavLink>

          <NavLink to="/settings" onClick={closeMobileNav} className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            <Settings size={18} />
            <span>Settings</span>
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <NavLink to="/profile" onClick={closeMobileNav} className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            <User size={18} />
            <span style={{ fontSize: '0.8rem', overflow: 'hidden', textOverflow: 'ellipsis' }}>{adminEmail}</span>
          </NavLink>

          <button
            onClick={handleLogout}
            className="btn btn-outline"
            style={{ width: '100%', justifyContent: 'flex-start', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)' }}
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* Main View Area */}
      <div className="admin-main">
        <header className="admin-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button className="hamburger-toggle" onClick={() => setMobileOpen(!mobileOpen)}>
              <Menu size={22} />
            </button>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--navy-dark)' }}>Healthcare Control Portal</h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{ position: 'relative', cursor: 'pointer', color: 'var(--text-muted)' }}>
              <Bell size={20} />
              <span
                style={{
                  position: 'absolute',
                  top: '-2px',
                  right: '-2px',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--emerald-green)',
                }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#f1f5f9', padding: '0.35rem 0.75rem', borderRadius: 'var(--radius-full)' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'var(--accent-blue)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700 }}>
                A
              </div>
              <span style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-primary)' }}>{adminEmail}</span>
            </div>
          </div>
        </header>

        <main className="admin-page-container">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

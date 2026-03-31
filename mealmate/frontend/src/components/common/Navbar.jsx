import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
  FiSun, FiMoon, FiBell, FiMenu, FiX,
  FiHome, FiList, FiCalendar, FiUser,
  FiLogOut, FiSettings, FiChevronDown
} from 'react-icons/fi';
import { MdRestaurant } from 'react-icons/md';

const Navbar = () => {
  const { user, logout, isAdmin, isOwner, isStudent, unreadNotifications } = useAuth();
  const { toggleTheme, isDark } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const getDashboardLink = () => {
    if (isAdmin) return '/admin';
    if (isOwner) return '/owner';
    if (isStudent) return '/student';
    return '/';
  };

  const navLinks = [
    { to: '/', label: 'Home', icon: <FiHome /> },
    { to: '/messes', label: 'Messes', icon: <MdRestaurant /> },
    { to: '/weekly-menu', label: 'Weekly Menu', icon: <FiCalendar /> },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="navbar-inner container">
        {/* Logo */}
        <Link to="/" className="navbar-logo">
          <span className="logo-icon">🍽️</span>
          <span className="logo-text">MealMate</span>
        </Link>

        {/* Desktop Nav */}
        <div className="navbar-links hide-mobile">
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`nav-link ${isActive(link.to) ? 'active' : ''}`}
            >
              {link.icon} {link.label}
            </Link>
          ))}
        </div>

        {/* Right Actions */}
        <div className="navbar-actions">
          <button className="btn btn-ghost btn-icon" onClick={toggleTheme} title="Toggle theme">
            {isDark ? <FiSun size={18} /> : <FiMoon size={18} />}
          </button>

          {user ? (
            <>
              <div className="notif-btn" onClick={() => navigate(getDashboardLink())}>
                <FiBell size={18} />
                {unreadNotifications > 0 && (
                  <span className="notif-badge">{unreadNotifications}</span>
                )}
              </div>

              <div className="user-menu" onMouseLeave={() => setDropdownOpen(false)}>
                <button
                  className="user-trigger"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                  <div className="user-avatar">
                    {user.avatar
                      ? <img src={user.avatar} alt={user.name} />
                      : <span>{user.name[0].toUpperCase()}</span>
                    }
                  </div>
                  <span className="hide-mobile">{user.name.split(' ')[0]}</span>
                  <FiChevronDown size={14} />
                </button>

                {dropdownOpen && (
                  <div className="user-dropdown animate-scale">
                    <div className="dropdown-header">
                      <div className="dropdown-name">{user.name}</div>
                      <div className="dropdown-role badge badge-primary">{user.role}</div>
                    </div>
                    <div className="dropdown-divider" />
                    <Link to={getDashboardLink()} className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                      <FiSettings size={15} /> Dashboard
                    </Link>
                    <Link to="/student/profile" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                      <FiUser size={15} /> Profile
                    </Link>
                    {isStudent && (
                      <Link to="/student/subscriptions" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                        <FiList size={15} /> My Subscriptions
                      </Link>
                    )}
                    <div className="dropdown-divider" />
                    <button className="dropdown-item danger" onClick={() => { setDropdownOpen(false); logout(); navigate('/'); }}>
                      <FiLogOut size={15} /> Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="auth-buttons hide-mobile">
              <Link to="/login" className="btn btn-ghost btn-sm">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Sign Up</Link>
            </div>
          )}

          {/* Mobile hamburger */}
          <button className="btn btn-ghost btn-icon mobile-menu-btn" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <FiX size={20} /> : <FiMenu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="mobile-menu animate-fade">
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`mobile-nav-link ${isActive(link.to) ? 'active' : ''}`}
              onClick={() => setMobileOpen(false)}
            >
              {link.icon} {link.label}
            </Link>
          ))}
          {user ? (
            <>
              <Link to={getDashboardLink()} className="mobile-nav-link" onClick={() => setMobileOpen(false)}>
                <FiSettings size={16} /> Dashboard
              </Link>
              <button className="mobile-nav-link danger" onClick={() => { logout(); setMobileOpen(false); navigate('/'); }}>
                <FiLogOut size={16} /> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="mobile-nav-link" onClick={() => setMobileOpen(false)}>Login</Link>
              <Link to="/register" className="mobile-nav-link primary" onClick={() => setMobileOpen(false)}>Sign Up</Link>
            </>
          )}
        </div>
      )}

      <style>{`
        .navbar {
          position: fixed; top: 0; left: 0; right: 0; z-index: 1000;
          background: rgba(255,255,255,0.92);
          backdrop-filter: blur(16px);
          border-bottom: 1px solid var(--gray-200);
          height: 64px;
        }
        [data-theme="dark"] .navbar { background: rgba(26,26,26,0.92); }
        .navbar-inner { display: flex; align-items: center; justify-content: space-between; height: 64px; }
        .navbar-logo { display: flex; align-items: center; gap: 8px; text-decoration: none; }
        .logo-icon { font-size: 22px; }
        .logo-text { font-family: 'Sora', sans-serif; font-weight: 800; font-size: 18px; color: var(--primary); }
        .navbar-links { display: flex; align-items: center; gap: 4px; }
        .nav-link {
          display: flex; align-items: center; gap: 6px;
          padding: 8px 14px; border-radius: var(--radius-md);
          font-size: 14px; font-weight: 500; color: var(--gray-600);
          transition: var(--transition);
        }
        .nav-link:hover { background: var(--gray-100); color: var(--gray-900); }
        .nav-link.active { background: var(--primary-bg); color: var(--primary); font-weight: 600; }
        .navbar-actions { display: flex; align-items: center; gap: 8px; }
        .auth-buttons { display: flex; gap: 8px; }
        .notif-btn {
          position: relative; width: 38px; height: 38px;
          display: flex; align-items: center; justify-content: center;
          border-radius: var(--radius-md); cursor: pointer; color: var(--gray-600);
          transition: var(--transition);
        }
        .notif-btn:hover { background: var(--gray-100); }
        .notif-badge {
          position: absolute; top: 4px; right: 4px;
          background: var(--primary); color: white;
          font-size: 10px; font-weight: 700;
          min-width: 16px; height: 16px; border-radius: 8px;
          display: flex; align-items: center; justify-content: center; padding: 0 3px;
        }
        .user-menu { position: relative; }
        .user-trigger {
          display: flex; align-items: center; gap: 8px;
          padding: 6px 10px; border-radius: var(--radius-md);
          background: none; border: 1px solid var(--gray-200); color: var(--gray-700);
          font-size: 14px; font-weight: 500; transition: var(--transition);
        }
        .user-trigger:hover { background: var(--gray-100); }
        .user-avatar {
          width: 28px; height: 28px; border-radius: 50%;
          background: linear-gradient(135deg, var(--primary), var(--accent));
          display: flex; align-items: center; justify-content: center;
          color: white; font-weight: 700; font-size: 13px; overflow: hidden;
        }
        .user-avatar img { width: 100%; height: 100%; object-fit: cover; }
        .user-dropdown {
          position: absolute; top: calc(100% + 8px); right: 0;
          background: white; border: 1px solid var(--gray-200);
          border-radius: var(--radius-lg); box-shadow: var(--shadow-xl);
          min-width: 200px; overflow: hidden; z-index: 100;
        }
        [data-theme="dark"] .user-dropdown { background: var(--gray-100); }
        .dropdown-header { padding: 14px 16px; }
        .dropdown-name { font-weight: 700; font-size: 14px; margin-bottom: 4px; }
        .dropdown-role { font-size: 11px; }
        .dropdown-divider { height: 1px; background: var(--gray-200); }
        .dropdown-item {
          display: flex; align-items: center; gap: 10px;
          padding: 10px 16px; font-size: 14px; color: var(--gray-700);
          transition: var(--transition); width: 100%; background: none; border: none; text-align: left;
        }
        .dropdown-item:hover { background: var(--gray-100); color: var(--gray-900); }
        .dropdown-item.danger { color: var(--error); }
        .dropdown-item.danger:hover { background: #fff0f0; }
        .mobile-menu-btn { display: none !important; }
        .mobile-menu {
          position: absolute; top: 64px; left: 0; right: 0;
          background: white; border-bottom: 1px solid var(--gray-200);
          padding: 12px 16px; display: flex; flex-direction: column; gap: 4px;
        }
        [data-theme="dark"] .mobile-menu { background: var(--gray-100); }
        .mobile-nav-link {
          display: flex; align-items: center; gap: 10px;
          padding: 12px 14px; border-radius: var(--radius-md);
          font-size: 15px; font-weight: 500; color: var(--gray-700);
          transition: var(--transition); border: none; background: none; text-align: left; width: 100%;
        }
        .mobile-nav-link:hover { background: var(--gray-100); }
        .mobile-nav-link.active { color: var(--primary); background: var(--primary-bg); }
        .mobile-nav-link.primary { color: white; background: var(--primary); }
        .mobile-nav-link.danger { color: var(--error); }
        @media (max-width: 768px) {
          .mobile-menu-btn { display: flex !important; }
          .navbar { position: fixed; }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;

import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import BrandLogo from './BrandLogo';
import { useCitizenAuth } from '../context/CitizenAuthContext';

function NavigationLinks({ onNavigate, authenticated }) {
  return (
    <>
      <NavLink to="/" end onClick={onNavigate}>Home</NavLink>
      {authenticated && <NavLink to="/request" onClick={onNavigate}>Request certificate</NavLink>}
      <NavLink to="/track" onClick={onNavigate}>Track application</NavLink>
      <NavLink to="/verify" onClick={onNavigate}>Verify certificate</NavLink>
      {authenticated && <NavLink to="/account/certificates" onClick={onNavigate}>My certificates</NavLink>}
      <Link className="header-admin-link" to="/admin/login" onClick={onNavigate}>Admin portal</Link>
    </>
  );
}

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, signOut } = useCitizenAuth();
  const navigate = useNavigate();

  function closeMenu() {
    setIsMenuOpen(false);
  }

  function logout() {
    signOut();
    closeMenu();
    navigate('/');
  }

  return (
    <header className="site-header">
      <div className="header-inner">
        <Link className="brand" to="/" aria-label="CredVault home" onClick={closeMenu}>
          <span className="brand-logo-roundel"><BrandLogo /></span>
        </Link>
        <nav className="main-nav" aria-label="Main navigation">
          <NavigationLinks onNavigate={closeMenu} authenticated={Boolean(user)} />
        </nav>
        <div className="header-account">
          {user ? (
            <button
              className="profile-trigger"
              type="button"
              aria-label={`Account menu for ${user.email}`}
              aria-expanded={isMenuOpen}
              aria-controls="profile-menu"
              onClick={() => setIsMenuOpen((open) => !open)}
            >
              <span>{user.email.charAt(0).toUpperCase()}</span>
            </button>
          ) : (
            <div className="guest-actions">
              <Link to="/login">Sign in</Link>
              <Link className="register-link" to="/register">Register</Link>
            </div>
          )}
          {!user && (
            <button
              className="mobile-menu-toggle"
              type="button"
              aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={isMenuOpen}
              aria-controls="profile-menu"
              onClick={() => setIsMenuOpen((open) => !open)}
            >
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          )}
          {isMenuOpen && (
            <div className="profile-dropdown" id="profile-menu">
              {user && <div className="profile-email">{user.email}</div>}
              <nav aria-label="Account and site navigation">
                <NavigationLinks onNavigate={closeMenu} authenticated={Boolean(user)} />
                {!user && <>
                  <Link to="/login" onClick={closeMenu}>Sign in</Link>
                  <Link to="/register" onClick={closeMenu}>Register</Link>
                </>}
              </nav>
              {user && <button className="profile-logout" type="button" onClick={logout}>Sign out</button>}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

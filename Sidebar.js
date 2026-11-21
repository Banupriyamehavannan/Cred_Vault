import { NavLink, useNavigate } from 'react-router-dom';
import { FileCheck2, Files, LogOut } from 'lucide-react';
import { clearAdminToken } from '../utils/api';
import BrandLogo from './BrandLogo';

export default function Sidebar() {
  const navigate = useNavigate();

  function logout() {
    clearAdminToken();
    navigate('/admin/login', { replace: true });
  }

  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar-brand"><BrandLogo /></div>
      <p className="sidebar-caption">ADMIN CONSOLE</p>
      <nav className="sidebar-nav" aria-label="Admin navigation">
        <NavLink to="/admin/applications"><FileCheck2 size={18} /> Applications</NavLink>
        <NavLink to="/admin/certificates"><Files size={18} /> Certificates</NavLink>
      </nav>
      <div className="sidebar-bottom">
        <div className="admin-profile"><span className="admin-avatar">A</span><span><strong>Administrator</strong><small>System admin</small></span></div>
        <button className="logout-button" onClick={logout}><LogOut size={17} /> Sign out</button>
      </div>
    </aside>
  );
}

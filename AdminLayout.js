import { Link } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';
import Sidebar from './Sidebar';

export default function AdminLayout({ title, eyebrow = 'WORKSPACE', children }) {
  return (
    <div className="admin-layout">
      <Sidebar />
      <main className="admin-main">
        <header className="admin-topbar"><span>CredVault <span className="crumb-separator">/</span> Admin</span><Link to="/" target="_blank" rel="noreferrer">Public portal <ExternalLink size={14} /></Link></header>
        <div className="admin-content">
          <div className="admin-page-heading"><div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1></div></div>
          {children}
        </div>
      </main>
    </div>
  );
}

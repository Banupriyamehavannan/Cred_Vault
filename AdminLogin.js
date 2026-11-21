import { useState } from 'react';
import { ArrowLeft, ArrowRight, LockKeyhole } from 'lucide-react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { getAdminToken, loginAdmin, setAdminToken } from '../utils/api';
import BrandLogo from '../components/BrandLogo';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  if (getAdminToken()) {
    return <Navigate to="/admin/applications" replace />;
  }

  async function submit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const response = await loginAdmin({ username, password });
      setAdminToken(response.token);
      navigate('/admin/applications', { replace: true });
    } catch (loginError) {
      setError(loginError.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="login-page">
      <div className="login-left">
        <Link className="brand login-brand" to="/" aria-label="CredVault home"><BrandLogo /></Link>
        <div className="login-message"><p className="eyebrow">CREDENTIALS WITH CONFIDENCE</p><h1>Good governance starts with trust.</h1><p>Manage applications and protect the integrity of every certificate issued through CredVault.</p></div>
        <span className="login-copyright">© {new Date().getFullYear()} CredVault · Secure administration</span>
      </div>
      <div className="login-right">
        <Link to="/" className="back-home"><ArrowLeft size={16} /> Back to public portal</Link>
        <form className="login-card" onSubmit={submit}>
          <span className="login-icon"><LockKeyhole size={21} /></span>
          <p className="eyebrow">ADMINISTRATOR ACCESS</p>
          <h2>Welcome back</h2>
          <p className="login-card-intro">Sign in to manage certificate requests and records.</p>
          {error && <div className="inline-error login-error" role="alert">{error}</div>}
          <label className="field">Username
            <input value={username} onChange={(event) => { setUsername(event.target.value); setError(''); }} autoComplete="username" placeholder="Enter your username" required />
          </label>
          <label className="field">Password
            <input type="password" value={password} onChange={(event) => { setPassword(event.target.value); setError(''); }} autoComplete="current-password" placeholder="Enter your password" required />
          </label>
          <button type="submit" className="button button-primary login-submit" disabled={submitting}>{submitting ? 'Signing in…' : 'Sign in to dashboard'} {!submitting && <ArrowRight size={16} />}</button>
          <div className="login-security"><LockKeyhole size={14} /> Your admin session is secured to this browser tab.</div>
        </form>
      </div>
    </main>
  );
}

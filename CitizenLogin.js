import { useState } from 'react';
import { ArrowRight, LockKeyhole } from 'lucide-react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useCitizenAuth } from '../context/CitizenAuthContext';

export default function CitizenLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { user, signIn } = useCitizenAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (user) return <Navigate to="/" replace />;

  async function submit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await signIn({ email, password });
      const destination = location.state && location.state.from
        ? location.state.from.pathname
        : '/';
      navigate(destination, { replace: true });
    } catch (loginError) {
      setError(loginError.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="form-page account-page">
      <div className="page-intro">
        <span className="page-icon"><LockKeyhole size={22} /></span>
        <p className="eyebrow">CITIZEN ACCOUNT</p>
        <h1>Sign in</h1>
        <p>Sign in to request certificates and view your certificate history.</p>
      </div>
      <form className="form-card account-form-card" onSubmit={submit}>
        {error && <div className="inline-error" role="alert">{error}</div>}
        <label className="field">Email address
          <input type="email" autoComplete="email" value={email} onChange={(event) => { setEmail(event.target.value); setError(''); }} required />
        </label>
        <label className="field">Password
          <input type="password" autoComplete="current-password" value={password} onChange={(event) => { setPassword(event.target.value); setError(''); }} required />
        </label>
        <button className="button button-primary account-submit" type="submit" disabled={submitting}>
          {submitting ? 'Signing in…' : 'Sign in'} {!submitting && <ArrowRight size={16} />}
        </button>
        <p className="account-switch">New to CredVault? <Link to="/register" state={location.state}>Create an account</Link></p>
      </form>
    </div>
  );
}

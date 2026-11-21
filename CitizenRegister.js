import { useState } from 'react';
import { ArrowRight, UserRoundPlus } from 'lucide-react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useCitizenAuth } from '../context/CitizenAuthContext';

export default function CitizenRegister() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { user, register } = useCitizenAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (user) return <Navigate to="/request" replace />;

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setError('');
  }

  async function submit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await register(form);
      const destination = location.state && location.state.from
        ? location.state.from.pathname
        : '/request';
      navigate(destination, { replace: true });
    } catch (registerError) {
      setError(registerError.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="form-page account-page">
      <div className="page-intro">
        <span className="page-icon"><UserRoundPlus size={22} /></span>
        <p className="eyebrow">CITIZEN ACCOUNT</p>
        <h1>Create an account</h1>
        <p>Register once to submit certificate requests and see certificates issued to you.</p>
      </div>
      <form className="form-card account-form-card" onSubmit={submit}>
        {error && <div className="inline-error" role="alert">{error}</div>}
        <label className="field">Full name
          <input name="name" autoComplete="name" value={form.name} onChange={updateField} maxLength="100" required />
        </label>
        <label className="field">Email address
          <input name="email" type="email" autoComplete="email" value={form.email} onChange={updateField} required />
        </label>
        <label className="field">Password
          <input name="password" type="password" autoComplete="new-password" value={form.password} onChange={updateField} minLength="8" required />
          <span className="field-hint">Use at least 8 characters.</span>
        </label>
        <button className="button button-primary account-submit" type="submit" disabled={submitting}>
          {submitting ? 'Creating account…' : 'Create account'} {!submitting && <ArrowRight size={16} />}
        </button>
        <p className="account-switch">Already registered? <Link to="/login" state={location.state}>Sign in</Link></p>
      </form>
    </div>
  );
}

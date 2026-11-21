import {
  ArrowRight,
  BadgeCheck,
  ClipboardCheck,
  FilePlus2,
  LockKeyhole,
  SearchCheck,
  ShieldCheck
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCitizenAuth } from '../context/CitizenAuthContext';
import '../styles/Home.css';

export default function Home() {
  const { user } = useCitizenAuth();
  const requestPath = user ? '/request' : '/register';

  return (
    <section className="home-simple-page">
      <div className="home-simple-inner">
        <div className="home-simple-hero">
          <div className="home-simple-copy">
            <p className="home-simple-eyebrow"><span /> CITIZEN CERTIFICATE SERVICES</p>
            <h1>{user ? <>Welcome back,<br /><span>{user.name}</span></> : <>Your certificates,<br /><span>made simple.</span></>}</h1>
            <p className="home-simple-lede">
              Request a certificate, follow its progress, and verify issued records — all in one secure place.
            </p>
            <div className="home-simple-actions">
              <Link className="button button-primary" to={requestPath}>
                {user ? 'Request a certificate' : 'Create an account'} <ArrowRight size={17} />
              </Link>
              <Link className="home-secondary-link" to={user ? '/account/certificates' : '/login'}>
                {user ? 'View my certificates' : 'Already registered? Sign in'}
              </Link>
            </div>
            <div className="home-simple-assurances">
              <span><ShieldCheck size={16} /> Secure citizen access</span>
              <i />
              <span><BadgeCheck size={16} /> Database-verified records</span>
            </div>
          </div>

          <div className="home-simple-visual" aria-label="Certificate service overview">
            <div className="home-visual-grid" />
            <div className="home-visual-glow" />
            <article className="home-journey-card">
              <div className="home-journey-brand">
                <span><BadgeCheck size={20} /></span>
                <div><strong>CredVault</strong><small>DIGITAL CERTIFICATE SERVICES</small></div>
                <LockKeyhole className="home-journey-lock" size={17} />
              </div>
              <div className="home-journey-divider" />
              <p className="home-journey-label">YOUR SERVICE JOURNEY</p>
              <h2>One platform.<br />Every step.</h2>
              <p className="home-journey-description">From your first request to trusted certificate verification.</p>
              <div className="home-journey-steps">
                <span><i>01</i> Request</span>
                <b />
                <span><i>02</i> Track</span>
                <b />
                <span><i>03</i> Verify</span>
              </div>
            </article>
            <div className="home-visual-badge"><ShieldCheck size={17} /><span>Secure by design</span></div>
            <div className="home-visual-stamp"><ClipboardCheck size={17} /><span>Simple, transparent services</span></div>
          </div>
        </div>

        <div className="home-feature-section">
          <div className="home-feature-heading">
            <div><p className="eyebrow">EXPLORE THE PORTAL</p><h2>Start with what you need</h2></div>
            <p>Choose a service to continue.</p>
          </div>
          <div className="home-feature-grid">
            <Link className="home-feature-card" to={requestPath}>
              <span className="home-feature-icon"><FilePlus2 size={20} /></span>
              <span className="home-feature-copy"><strong>Request a certificate</strong><small>{user ? 'Submit your application securely.' : 'Create an account to get started.'}</small></span>
              <ArrowRight className="home-feature-arrow" size={18} />
            </Link>
            <Link className="home-feature-card" to="/track">
              <span className="home-feature-icon"><SearchCheck size={20} /></span>
              <span className="home-feature-copy"><strong>Track an application</strong><small>Check the latest status with your Application ID.</small></span>
              <ArrowRight className="home-feature-arrow" size={18} />
            </Link>
            <Link className="home-feature-card" to="/verify">
              <span className="home-feature-icon"><BadgeCheck size={20} /></span>
              <span className="home-feature-copy"><strong>Verify a certificate</strong><small>Confirm certificate details and current status.</small></span>
              <ArrowRight className="home-feature-arrow" size={18} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

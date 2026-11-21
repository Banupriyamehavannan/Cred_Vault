import { useEffect, useState } from 'react';
import { ArrowRight, BadgeCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import StatusBadge from '../components/StatusBadge';
import { listCitizenCertificates } from '../utils/api';
import { formatDate } from '../utils/helpers';

export default function CitizenCertificates() {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    listCitizenCertificates()
      .then((records) => {
        if (active) setCertificates(records);
      })
      .catch((requestError) => {
        if (active) setError(requestError.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  return (
    <div className="form-page certificate-history-page">
      <div className="page-intro">
        <span className="page-icon"><BadgeCheck size={22} /></span>
        <p className="eyebrow">CITIZEN ACCOUNT / HISTORY</p>
        <h1>My certificates</h1>
        <p>Certificates approved and issued to your account appear here.</p>
      </div>
      {error && <div className="inline-error" role="alert">{error}</div>}
      {loading ? <p className="lookup-message" role="status">Loading your certificates…</p> : certificates.length ? (
        <div className="certificate-history-list">
          {certificates.map((certificate) => (
            <article className="certificate-history-card" key={certificate.certificateId}>
              <div>
                <p className="eyebrow">CERTIFICATE ID</p>
                <h2>{certificate.certificateId}</h2>
                <p>Application {certificate.applicationId} · Issued {formatDate(certificate.issuedOn)}</p>
              </div>
              <StatusBadge status={certificate.status} />
              <Link to={`/verify?id=${certificate.certificateId}`} aria-label={`Verify certificate ${certificate.certificateId}`}>
                Verify <ArrowRight size={15} />
              </Link>
            </article>
          ))}
        </div>
      ) : !error ? (
        <section className="certificate-history-empty">
          <h2>No issued certificates yet</h2>
          <p>Once your application is approved, your certificate will appear here.</p>
          <Link className="button button-primary" to="/request">Request a certificate</Link>
        </section>
      ) : null}
    </div>
  );
}

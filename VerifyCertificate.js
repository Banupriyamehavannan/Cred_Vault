import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { BadgeCheck, Search } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import { formatDate } from '../utils/helpers';
import { verifyCertificate } from '../utils/api';

export default function VerifyCertificate() {
  const [searchParams] = useSearchParams();
  const [certificateId, setCertificateId] = useState(searchParams.get('id') || '');
  const [result, setResult] = useState(null);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const id = searchParams.get('id');
    if (id) {
      setCertificateId(id);
      lookup(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  async function lookup(value = certificateId) {
    const cleanId = value.trim();
    setSearched(true);
    setResult(null);
    setError('');
    if (!cleanId) {
      setError('Enter a Certificate ID to verify.');
      return;
    }
    setLoading(true);
    try {
      setResult(await verifyCertificate(cleanId));
    } catch (lookupError) {
      setError(lookupError.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="form-page lookup-page">
      <div className="page-intro"><span className="page-icon"><BadgeCheck size={22} /></span><p className="eyebrow">PUBLIC SERVICE / CREDENTIAL CHECK</p><h1>Verify Certificate</h1><p>Check that a CredVault certificate is authentic and view its current status.</p></div>
      <form className="lookup-card" onSubmit={(event) => { event.preventDefault(); lookup(); }}>
        <label className="field">Certificate ID
          <div className="lookup-input"><span>CV</span><input value={certificateId} onChange={(event) => setCertificateId(event.target.value)} placeholder="e.g. CV-2026-0001" aria-label="Certificate ID" /></div>
        </label>
        <button className="button button-primary lookup-button" type="submit" disabled={loading}>{loading ? 'Verifying…' : 'Verify certificate'} {!loading && <Search size={16} />}</button>
      </form>
      {loading && <p className="lookup-message" role="status">Loading certificate record…</p>}
      {searched && result ? (
        <section className={`result-card certificate-result ${result.status === 'Revoked' ? 'revoked-result' : ''}`} aria-live="polite">
          <div className="result-heading"><div><p className="eyebrow">CERTIFICATE RECORD</p><h2>{result.status === 'Valid' ? 'This certificate is authentic' : 'This certificate has been revoked'}</h2></div><StatusBadge status={result.status} /></div>
          <div className="result-grid">
            <div><span>Certificate holder</span><strong>{result.name}</strong></div>
            <div><span>Certificate ID</span><strong>{result.certificateId}</strong></div>
            <div><span>Phone number</span><strong>{result.phone}</strong></div>
            <div><span>Issued on</span><strong>{formatDate(result.issuedOn)}</strong></div>
          </div>
          <p className="verification-note"><BadgeCheck size={16} /> This record reflects the latest status held by CredVault.</p>
        </section>
      ) : searched && error ? <div className="inline-error" role="alert">{error}</div> : null}
    </div>
  );
}

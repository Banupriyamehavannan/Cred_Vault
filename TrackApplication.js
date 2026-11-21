import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRight, FileSearch, Search } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import { formatDate } from '../utils/helpers';
import { trackApplication } from '../utils/api';

export default function TrackApplication() {
  const [searchParams] = useSearchParams();
  const [applicationId, setApplicationId] = useState(searchParams.get('id') || '');
  const [result, setResult] = useState(null);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const id = searchParams.get('id');
    if (id) {
      setApplicationId(id);
      lookup(id);
    }
    // URL changes only when navigating with a submitted application ID.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  async function lookup(value = applicationId) {
    const cleanId = value.trim();
    setSearched(true);
    setResult(null);
    setError('');
    if (!cleanId) {
      setError('Enter an Application ID to track your request.');
      return;
    }
    setLoading(true);
    try {
      setResult(await trackApplication(cleanId));
    } catch (lookupError) {
      setError(lookupError.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="form-page lookup-page">
      <div className="page-intro"><span className="page-icon"><FileSearch size={22} /></span><p className="eyebrow">CITIZEN SERVICES / APPLICATION STATUS</p><h1>Track Application</h1><p>Enter the application ID you received after submitting your request.</p></div>
      <form className="lookup-card" onSubmit={(event) => { event.preventDefault(); lookup(); }}>
        <label className="field">Application ID
          <div className="lookup-input"><span>APP</span><input value={applicationId} onChange={(event) => setApplicationId(event.target.value)} placeholder="e.g. APP-0001" aria-label="Application ID" /></div>
        </label>
        <button className="button button-primary lookup-button" type="submit" disabled={loading}>{loading ? 'Looking up…' : 'Track application'} {!loading && <Search size={16} />}</button>
      </form>
      {loading && <p className="lookup-message" role="status">Loading application status…</p>}
      {searched && result ? (
        <section className="result-card" aria-live="polite">
          <div className="result-heading"><div><p className="eyebrow">APPLICATION DETAILS</p><h2>We found your application</h2></div><StatusBadge status={result.status} /></div>
          <div className="result-grid">
            <div><span>Applicant name</span><strong>{result.name}</strong></div>
            <div><span>Application ID</span><strong>{result.applicationId}</strong></div>
            <div><span>Submission date</span><strong>{formatDate(result.submittedAt)}</strong></div>
            <div><span>Application status</span><strong><StatusBadge status={result.status} /></strong></div>
          </div>
          {result.status === 'Pending' && <p className="result-footnote">Your request is under review. Please check back for updates.</p>}
          {result.status === 'Approved' && result.certificateId && <p className="result-footnote">Your certificate has been issued. <Link to={`/verify?id=${result.certificateId}`}>Verify your certificate <ArrowRight size={14} /></Link></p>}
        </section>
      ) : searched && error ? <div className="inline-error" role="alert">{error}</div> : null}
    </div>
  );
}

import { useEffect, useMemo, useState } from 'react';
import { BadgeCheck, Check, Search, ShieldOff, X } from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import StatusBadge from '../components/StatusBadge';
import { formatDate } from '../utils/helpers';
import { listCertificates, revokeCertificate } from '../utils/api';

export default function AdminCertificates() {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState('');
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All statuses');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    let active = true;
    listCertificates()
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

  const filtered = useMemo(() => certificates.filter((certificate) => {
    const matchesStatus = statusFilter === 'All statuses' || certificate.status === statusFilter;
    const term = query.trim().toLowerCase();
    const matchesQuery = !term || [certificate.certificateId, certificate.name, certificate.phone, certificate.applicationId].some((value) => String(value).toLowerCase().includes(term));
    return matchesStatus && matchesQuery;
  }), [certificates, query, statusFilter]);

  async function revoke(certificate) {
    if (certificate.status !== 'Valid' || busyId) return;
    const confirmed = window.confirm(`Revoke certificate ${certificate.certificateId} issued to ${certificate.name}? This will update public verification immediately.`);
    if (!confirmed) return;
    setBusyId(certificate.certificateId);
    setError('');
    try {
      await revokeCertificate(certificate.certificateId);
      setCertificates((current) => current.map((item) => item.certificateId === certificate.certificateId
        ? { ...item, status: 'Revoked' }
        : item));
      setNotice(`Certificate ${certificate.certificateId} has been revoked.`);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusyId('');
    }
  }

  return (
    <AdminLayout title="Certificates Management" eyebrow="CREDENTIAL REGISTRY">
      {notice && <div className="admin-notice" role="status"><Check size={17} />{notice}<button onClick={() => setNotice('')} aria-label="Dismiss notification"><X size={16} /></button></div>}
      {error && <div className="inline-error" role="alert">{error}</div>}
      <section className="certificate-overview"><div className="overview-icon"><BadgeCheck size={22} /></div><div><strong>{certificates.length} certificates issued</strong><p>Review issued credentials and manage their verification status.</p></div><div className="overview-divider" /><div className="overview-stat"><span>Valid</span><strong>{certificates.filter((certificate) => certificate.status === 'Valid').length}</strong></div><div className="overview-stat"><span>Revoked</span><strong>{certificates.filter((certificate) => certificate.status === 'Revoked').length}</strong></div></section>
      <section className="table-panel">
        <div className="table-panel-header"><div><h2>Certificate registry</h2><p>All certificates issued through CredVault.</p></div><span className="record-count">{certificates.length} records</span></div>
        <div className="table-toolbar">
          <label className="table-search"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search name, ID, phone or application" aria-label="Search certificates" /></label>
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} aria-label="Filter by certificate status"><option>All statuses</option><option>Valid</option><option>Revoked</option></select>
        </div>
        {loading ? <div className="table-loading" role="status">Loading certificates…</div> : filtered.length ? <div className="table-scroll"><table><thead><tr><th>Certificate ID</th><th>Certificate holder</th><th>Phone</th><th>Application ID</th><th>Issued on</th><th>Status</th><th>Action</th></tr></thead>
          <tbody>{filtered.map((certificate) => <tr key={certificate.certificateId}>
            <td className="id-cell">{certificate.certificateId}</td><td className="name-cell">{certificate.name}</td><td>{certificate.phone}</td><td>{certificate.applicationId}</td><td>{formatDate(certificate.issuedOn)}</td><td><StatusBadge status={certificate.status} /></td>
            <td>{certificate.status === 'Valid' ? <button className="action-button revoke-action" disabled={Boolean(busyId)} onClick={() => revoke(certificate)}><ShieldOff size={14} /> Revoke</button> : <span className="action-complete">Revoked</span>}</td>
          </tr>)}</tbody></table></div> : <div className="table-empty"><span className="empty-icon"><BadgeCheck size={22} /></span><h3>{certificates.length ? 'No matching certificates' : 'No certificates issued'}</h3><p>{certificates.length ? 'Try another search term or status filter.' : 'Issued certificates will appear here.'}</p></div>}
        {!loading && <div className="table-footnote">Showing {filtered.length} of {certificates.length} certificates</div>}
      </section>
    </AdminLayout>
  );
}

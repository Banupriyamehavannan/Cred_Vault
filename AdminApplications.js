import { useEffect, useMemo, useState } from 'react';
import { Check, FilePlus2, Search, X } from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import StatusBadge from '../components/StatusBadge';
import { formatDate } from '../utils/helpers';
import { approveApplication, listApplications, rejectApplication } from '../utils/api';

function SummaryCard({ label, value, tone, icon }) {
  const Icon = icon;
  return <article className={`summary-card summary-${tone}`}><span className="summary-icon"><Icon size={18} /></span><span className="summary-label">{label}</span><strong>{value}</strong></article>;
}

export default function AdminApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState('');
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All statuses');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    let active = true;
    listApplications()
      .then((records) => {
        if (active) setApplications(records);
      })
      .catch((requestError) => {
        if (active) setError(requestError.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  const pendingCount = applications.filter((application) => application.status === 'Pending').length;
  const approvedCount = applications.filter((application) => application.status === 'Approved').length;
  const rejectedCount = applications.filter((application) => application.status === 'Rejected').length;
  const filtered = useMemo(() => applications.filter((application) => {
    const matchesStatus = statusFilter === 'All statuses' || application.status === statusFilter;
    const term = query.trim().toLowerCase();
    const matchesQuery = !term || [application.applicationId, application.name, application.phone, application.city, application.state].some((value) => String(value).toLowerCase().includes(term));
    return matchesStatus && matchesQuery;
  }), [applications, query, statusFilter]);

  async function review(application, action) {
    if (application.status !== 'Pending' || busyId) return;
    setBusyId(application.applicationId);
    setError('');
    try {
      if (action === 'approve') {
        const response = await approveApplication(application.applicationId);
        setApplications((current) => current.map((item) => item.applicationId === application.applicationId
          ? { ...item, status: response.status, certificateId: response.certificateId }
          : item));
        setNotice(`Certificate ${response.certificateId} issued to ${application.name}.`);
      } else {
        const response = await rejectApplication(application.applicationId);
        setApplications((current) => current.map((item) => item.applicationId === application.applicationId
          ? { ...item, status: response.status }
          : item));
        setNotice(`Application ${application.applicationId} has been rejected.`);
      }
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusyId('');
    }
  }

  return (
    <AdminLayout title="Applications Management" eyebrow="CITIZEN SERVICES">
      {notice && <div className="admin-notice" role="status"><Check size={17} />{notice}<button onClick={() => setNotice('')} aria-label="Dismiss notification"><X size={16} /></button></div>}
      {error && <div className="inline-error" role="alert">{error}</div>}
      <section className="summary-grid" aria-label="Application summary">
        <SummaryCard label="Total applications" value={applications.length} tone="navy" icon={FilePlus2} />
        <SummaryCard label="Pending review" value={pendingCount} tone="amber" icon={Search} />
        <SummaryCard label="Approved" value={approvedCount} tone="green" icon={Check} />
        <SummaryCard label="Rejected" value={rejectedCount} tone="red" icon={X} />
      </section>
      <section className="table-panel">
        <div className="table-panel-header"><div><h2>All applications</h2><p>Review and manage citizen certificate requests.</p></div><span className="record-count">{applications.length} records</span></div>
        <div className="table-toolbar">
          <label className="table-search"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search name, ID, phone or city" aria-label="Search applications" /></label>
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} aria-label="Filter by application status"><option>All statuses</option><option>Pending</option><option>Approved</option><option>Rejected</option></select>
        </div>
        {loading ? <div className="table-loading" role="status">Loading applications…</div> : filtered.length ? <div className="table-scroll"><table><thead><tr><th>Application ID</th><th>Applicant</th><th>Phone</th><th>Gender</th><th>Location</th><th>Submitted</th><th>Status</th><th>Action</th></tr></thead>
          <tbody>{filtered.map((application) => <tr key={application.applicationId}>
            <td className="id-cell">{application.applicationId}</td><td className="name-cell">{application.name}</td><td>{application.phone}</td><td>{application.gender}</td><td>{application.city}, {application.state}</td><td>{formatDate(application.submittedAt)}</td><td><StatusBadge status={application.status} /></td>
            <td><div className="row-actions">{application.status === 'Pending' ? <><button className="action-button issue-action" disabled={Boolean(busyId)} onClick={() => review(application, 'approve')}><Check size={14} /> Approve</button><button className="action-button reject-action" disabled={Boolean(busyId)} onClick={() => review(application, 'reject')}><X size={14} /> Reject</button></> : <span className="action-complete">{application.certificateId || 'Reviewed'}</span>}</div></td>
          </tr>)}</tbody></table></div> : <div className="table-empty"><span className="empty-icon"><FilePlus2 size={22} /></span><h3>{applications.length ? 'No matching applications' : 'No applications yet'}</h3><p>{applications.length ? 'Try another search term or status filter.' : 'New citizen requests will appear here.'}</p></div>}
        {!loading && <div className="table-footnote">Showing {filtered.length} of {applications.length} applications</div>}
      </section>
    </AdminLayout>
  );
}

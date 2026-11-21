import { useState } from 'react';
import { ArrowRight, CheckCircle2, FilePlus2, LockKeyhole } from 'lucide-react';
import { Link } from 'react-router-dom';
import { submitApplication } from '../utils/api';
import { INDIAN_STATES_AND_UTS } from '../utils/helpers';
import { useCitizenAuth } from '../context/CitizenAuthContext';

const initialForm = { name: '', phone: '', gender: '', city: '', state: '' };

export default function RequestCertificate() {
  const { user } = useCitizenAuth();
  const [form, setForm] = useState(() => ({ ...initialForm, name: user ? user.name : '' }));
  const [errors, setErrors] = useState({});
  const [application, setApplication] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: '' }));
  }

  async function submit(event) {
    event.preventDefault();
    const nextErrors = {};
    if (!form.name.trim()) nextErrors.name = 'Please enter your full name.';
    if (!/^\d{10}$/.test(form.phone)) nextErrors.phone = 'Enter a valid 10-digit phone number.';
    if (!form.gender) nextErrors.gender = 'Please select a gender.';
    if (!form.city.trim()) nextErrors.city = 'Please enter your city.';
    if (!form.state) nextErrors.state = 'Please select your state or union territory.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setSubmitting(true);
    setServerError('');
    try {
      const created = await submitApplication({
        name: form.name.trim(),
        phone: form.phone,
        gender: form.gender,
        city: form.city.trim(),
        state: form.state
      });
      setApplication({ applicationId: created.applicationId });
      setForm({ ...initialForm, name: user.name });
    } catch (error) {
      setServerError(error.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (application) {
    return (
      <div className="form-page">
        <div className="success-panel">
          <span className="success-icon"><CheckCircle2 size={30} /></span>
          <p className="eyebrow">REQUEST RECEIVED</p>
          <h1>Application submitted successfully!</h1>
          <p className="success-copy">Your details are safely with us. Keep this application ID to check your progress at any time.</p>
          <div className="application-id-card"><span>APPLICATION ID</span><strong>{application.applicationId}</strong></div>
          <Link className="button button-primary" to={`/track?id=${application.applicationId}`}>Track your application <ArrowRight size={17} /></Link>
          <button className="text-button" onClick={() => setApplication(null)}>Submit another request</button>
        </div>
      </div>
    );
  }

  return (
    <div className="form-page">
      <div className="page-intro"><span className="page-icon"><FilePlus2 size={22} /></span><p className="eyebrow">CITIZEN SERVICES / APPLICATION</p><h1>Request Certificate</h1><p>Share a few details to begin your certificate application. All fields are required.</p></div>
      <form className="form-card request-form" onSubmit={submit} noValidate>
        <div className="form-card-heading"><div><h2>Your details</h2><p>Please enter your information as it should appear on the certificate.</p></div><span className="required-note"><i /> Required fields</span></div>
        {serverError && <div className="inline-error" role="alert">{serverError}</div>}
        <div className="form-grid">
          <label className="field full-field">Full name
            <input name="name" value={form.name} onChange={updateField} placeholder="e.g. Aditi Sharma" autoComplete="name" aria-invalid={Boolean(errors.name)} />
            {errors.name && <span className="field-error">{errors.name}</span>}
          </label>
          <label className="field">Phone number
            <div className="phone-input"><span>+91</span><input name="phone" type="tel" inputMode="numeric" maxLength="10" value={form.phone} onChange={updateField} placeholder="10-digit mobile number" autoComplete="tel-national" aria-invalid={Boolean(errors.phone)} /></div>
            {errors.phone && <span className="field-error">{errors.phone}</span>}
          </label>
          <fieldset className={`field gender-field ${errors.gender ? 'has-error' : ''}`}><legend>Gender</legend>
            <div className="radio-options">{['Male', 'Female', 'Other'].map((gender) => <label key={gender}><input type="radio" name="gender" value={gender} checked={form.gender === gender} onChange={updateField} /><span>{gender}</span></label>)}</div>
            {errors.gender && <span className="field-error">{errors.gender}</span>}
          </fieldset>
          <label className="field">City
            <input name="city" value={form.city} onChange={updateField} placeholder="Enter your city" autoComplete="address-level2" aria-invalid={Boolean(errors.city)} />
            {errors.city && <span className="field-error">{errors.city}</span>}
          </label>
          <label className="field">State / Union Territory
            <select name="state" value={form.state} onChange={updateField} aria-invalid={Boolean(errors.state)}>
              <option value="">Select your state or UT</option>
              {INDIAN_STATES_AND_UTS.map((state) => <option key={state} value={state}>{state}</option>)}
            </select>
            {errors.state && <span className="field-error">{errors.state}</span>}
          </label>
        </div>
        <div className="form-submit-row"><span><LockKeyhole size={15} /> Your information is stored securely in the application database.</span><button className="button button-primary" type="submit" disabled={submitting}>{submitting ? 'Submitting…' : 'Submit application'} {!submitting && <ArrowRight size={16} />}</button></div>
      </form>
    </div>
  );
}

const API_BASE_URL = process.env.REACT_APP_API_URL || '';
const ADMIN_TOKEN_KEY = 'credvault_admin_token';
const CITIZEN_TOKEN_KEY = 'credvault_citizen_token';
const CITIZEN_USER_KEY = 'credvault_citizen_user';

export function getAdminToken() {
  return sessionStorage.getItem(ADMIN_TOKEN_KEY);
}

export function setAdminToken(token) {
  sessionStorage.setItem(ADMIN_TOKEN_KEY, token);
}

export function clearAdminToken() {
  sessionStorage.removeItem(ADMIN_TOKEN_KEY);
}

export function getCitizenToken() {
  return sessionStorage.getItem(CITIZEN_TOKEN_KEY);
}

export function getCitizenUser() {
  const savedUser = sessionStorage.getItem(CITIZEN_USER_KEY);
  if (!savedUser) return null;
  try {
    return JSON.parse(savedUser);
  } catch (error) {
    console.error('Unable to read CredVault account session.', error);
    clearCitizenSession();
    return null;
  }
}

export function setCitizenSession(token, user) {
  sessionStorage.setItem(CITIZEN_TOKEN_KEY, token);
  sessionStorage.setItem(CITIZEN_USER_KEY, JSON.stringify(user));
}

export function clearCitizenSession() {
  sessionStorage.removeItem(CITIZEN_TOKEN_KEY);
  sessionStorage.removeItem(CITIZEN_USER_KEY);
}

async function request(path, { authenticated = null, ...options } = {}) {
  const headers = { ...(options.headers || {}) };
  if (options.body) headers['Content-Type'] = 'application/json';
  if (authenticated) {
    const token = authenticated === 'admin' ? getAdminToken() : getCitizenToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
  const data = await response.json();

  if (!response.ok) {
    if (response.status === 401 && authenticated === 'admin') {
      clearAdminToken();
      window.dispatchEvent(new Event('credvault:admin-unauthorized'));
    } else if (response.status === 401 && authenticated === 'citizen') {
      clearCitizenSession();
      window.dispatchEvent(new Event('credvault:citizen-unauthorized'));
    }
    throw new Error(data.message || `Request failed (${response.status})`);
  }
  return data;
}

export function submitApplication(application) {
  return request('/api/applications', {
    method: 'POST',
    body: JSON.stringify(application),
    authenticated: 'citizen'
  });
}

export function trackApplication(applicationId) {
  return request(`/api/applications/track/${encodeURIComponent(applicationId)}`);
}

export function verifyCertificate(certificateId) {
  return request(`/api/certificates/verify/${encodeURIComponent(certificateId)}`);
}

export function loginAdmin(credentials) {
  return request('/api/admin/login', {
    method: 'POST',
    body: JSON.stringify(credentials)
  });
}

export function listApplications() {
  return request('/api/admin/applications', { authenticated: 'admin' });
}

export function approveApplication(applicationId) {
  return request(`/api/admin/applications/${encodeURIComponent(applicationId)}/approve`, {
    method: 'PATCH',
    authenticated: 'admin'
  });
}

export function rejectApplication(applicationId) {
  return request(`/api/admin/applications/${encodeURIComponent(applicationId)}/reject`, {
    method: 'PATCH',
    authenticated: 'admin'
  });
}

export function listCertificates() {
  return request('/api/admin/certificates', { authenticated: 'admin' });
}

export function revokeCertificate(certificateId) {
  return request(`/api/admin/certificates/${encodeURIComponent(certificateId)}/revoke`, {
    method: 'PATCH',
    authenticated: 'admin'
  });
}

export function registerCitizen(account) {
  return request('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(account)
  });
}

export function loginCitizen(credentials) {
  return request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials)
  });
}

export function listCitizenCertificates() {
  return request('/api/citizen/certificates', { authenticated: 'citizen' });
}

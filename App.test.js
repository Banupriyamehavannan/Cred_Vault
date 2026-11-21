import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import App from './App';

const jsonResponse = (body, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => body
});

beforeEach(() => {
  sessionStorage.clear();
  window.history.pushState({}, '', '/');
  global.fetch = jest.fn();
});

test('a guest is redirected to citizen sign-in before accessing the request form', async () => {
  window.history.pushState({}, '', '/request');
  render(<App />);
  expect(await screen.findByRole('heading', { name: 'Sign in' })).toBeInTheDocument();
});

test('a citizen registers, submits and tracks an application, then views certificate history and signs out', async () => {
  global.fetch
    .mockResolvedValueOnce(jsonResponse({
      token: 'citizen-test-token',
      user: { userId: 'USR-1', name: 'Kavya Rao', email: 'kavya@example.com' }
    }, 201))
    .mockResolvedValueOnce(jsonResponse({ applicationId: 'APP-abc123', status: 'Pending' }, 201))
    .mockResolvedValueOnce(jsonResponse({
      applicationId: 'APP-abc123',
      name: 'Kavya Rao',
      status: 'Pending',
      submittedAt: '2026-11-20T10:00:00.000Z'
    }))
    .mockResolvedValueOnce(jsonResponse([{
      certificateId: 'CERT-owned123',
      applicationId: 'APP-previous123',
      issuedOn: '2026-11-21T10:00:00.000Z',
      status: 'Valid'
    }]));

  render(<App />);
  fireEvent.click(screen.getByRole('link', { name: 'Create an account', exact: true }));
  fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: 'Kavya Rao' } });
  fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'kavya@example.com' } });
  fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'secure-password' } });
  fireEvent.click(screen.getByRole('button', { name: /create account/i }));

  expect(await screen.findByRole('heading', { name: 'Request Certificate' })).toBeInTheDocument();
  expect(sessionStorage.getItem('credvault_citizen_token')).toBe('citizen-test-token');
  expect(screen.getByLabelText(/full name/i)).toHaveValue('Kavya Rao');
  fireEvent.change(screen.getByLabelText(/phone number/i), { target: { value: '9123456789' } });
  fireEvent.click(screen.getByLabelText('Female'));
  fireEvent.change(screen.getByLabelText('City'), { target: { value: 'Mysuru' } });
  fireEvent.change(screen.getByLabelText(/state \/ union territory/i), { target: { value: 'Karnataka' } });
  fireEvent.click(screen.getByRole('button', { name: /submit application/i }));

  expect(await screen.findByText('APP-abc123')).toBeInTheDocument();
  expect(global.fetch).toHaveBeenNthCalledWith(1, '/api/auth/register', expect.objectContaining({
    method: 'POST'
  }));
  expect(global.fetch).toHaveBeenNthCalledWith(2, '/api/applications', expect.objectContaining({
    method: 'POST',
    headers: expect.objectContaining({ Authorization: 'Bearer citizen-test-token' }),
    body: JSON.stringify({
      name: 'Kavya Rao',
      phone: '9123456789',
      gender: 'Female',
      city: 'Mysuru',
      state: 'Karnataka'
    })
  }));
  fireEvent.click(screen.getByRole('link', { name: /track your application/i }));
  expect(await screen.findByText('Kavya Rao')).toBeInTheDocument();
  expect(screen.getByText('APP-abc123')).toBeInTheDocument();

  fireEvent.click(screen.getByRole('link', { name: 'CredVault home' }));
  fireEvent.click(screen.getByRole('button', { name: 'Account menu for kavya@example.com' }));
  const certificateLinks = screen.getAllByRole('link', { name: 'My certificates' });
  fireEvent.click(certificateLinks[certificateLinks.length - 1]);
  expect(await screen.findByText('CERT-owned123')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Account menu for kavya@example.com' }));
  fireEvent.click(screen.getByRole('button', { name: /sign out/i }));
  expect(await screen.findByRole('link', { name: 'Sign in' })).toBeInTheDocument();
  expect(sessionStorage.getItem('credvault_citizen_token')).toBeNull();
});

test('admin reviews applications and certificate revocation is reflected by public verification', async () => {
  let applicationStatus = 'Pending';
  let certificateStatus = 'Valid';
  const application = {
    applicationId: 'APP-abc123',
    name: 'Kavya Rao',
    phone: '9123456789',
    gender: 'Female',
    city: 'Mysuru',
    state: 'Karnataka',
    status: applicationStatus,
    submittedAt: '2026-11-20T10:00:00.000Z'
  };
  const certificate = {
    certificateId: 'CERT-xyz789',
    applicationId: application.applicationId,
    name: application.name,
    phone: application.phone,
    issuedOn: '2026-11-21T10:00:00.000Z',
    status: certificateStatus
  };
  global.fetch.mockImplementation(async (url, options = {}) => {
    if (url === '/api/admin/login') return jsonResponse({ token: 'test-token' });
    if (url === '/api/admin/applications' && !options.method) return jsonResponse([application]);
    if (url.endsWith('/approve')) {
      applicationStatus = 'Approved';
      return jsonResponse({ status: applicationStatus, certificateId: certificate.certificateId });
    }
    if (url === '/api/admin/certificates') return jsonResponse([{ ...certificate, status: certificateStatus }]);
    if (url.endsWith('/revoke')) {
      certificateStatus = 'Revoked';
      return jsonResponse({ status: certificateStatus });
    }
    if (url === `/api/applications/track/${application.applicationId}`) {
      return jsonResponse({
        applicationId: application.applicationId,
        name: application.name,
        status: applicationStatus,
        submittedAt: application.submittedAt,
        certificateId: certificate.certificateId
      });
    }
    if (url === `/api/certificates/verify/${certificate.certificateId}`) {
      return jsonResponse({ ...certificate, status: certificateStatus });
    }
    throw new Error(`Unexpected API request: ${url}`);
  });

  const confirm = jest.spyOn(window, 'confirm').mockReturnValue(true);
  const { unmount } = render(<App />);
  fireEvent.click(screen.getByRole('link', { name: /admin portal/i }));
  fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'admin' } });
  fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'secure-password' } });
  fireEvent.click(screen.getByRole('button', { name: /sign in to dashboard/i }));

  fireEvent.click(await screen.findByRole('button', { name: /approve/i }));
  expect(await screen.findByText(/certificate CERT-xyz789 issued/i)).toBeInTheDocument();
  expect(sessionStorage.getItem('credvault_admin_token')).toBe('test-token');

  fireEvent.click(screen.getByRole('link', { name: /certificates/i }));
  fireEvent.click(await screen.findByRole('button', { name: /revoke/i }));
  expect(await screen.findByText(/has been revoked/i)).toBeInTheDocument();
  expect(confirm).toHaveBeenCalledTimes(1);
  unmount();
  confirm.mockRestore();

  window.history.pushState({}, '', `/track?id=${application.applicationId}`);
  render(<App />);
  fireEvent.click(await screen.findByRole('link', { name: /verify your certificate/i }));
  expect(await screen.findByText('This certificate has been revoked')).toBeInTheDocument();
  expect(screen.getByText('Kavya Rao')).toBeInTheDocument();
  await waitFor(() => expect(global.fetch).toHaveBeenLastCalledWith(
    `/api/certificates/verify/${certificate.certificateId}`,
    expect.anything()
  ));
});

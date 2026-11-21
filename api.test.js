const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { describe, it } = require('node:test');
const Database = require('better-sqlite3');
const request = require('supertest');
const { createApp } = require('../src/app');
const { initializeDatabase } = require('../src/database');

const JWT_SECRET = 'test-secret-with-at-least-32-characters';

function setup() {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'elevate-api-'));
  const db = new Database(path.join(directory, 'test.sqlite'));
  initializeDatabase(db, 'test-admin', 'test-password');
  const app = createApp({ db, jwtSecret: JWT_SECRET });

  return {
    app,
    close() {
      db.close();
      fs.rmSync(directory, { recursive: true, force: true });
    }
  };
}

async function login(app) {
  const response = await request(app)
    .post('/api/admin/login')
    .send({ username: 'test-admin', password: 'test-password' });
  assert.equal(response.status, 200);
  return response.body.token;
}

async function registerCitizen(app, account = {
  name: 'Asha Rao',
  email: 'asha@example.com',
  password: 'secure-password'
}) {
  const response = await request(app).post('/api/auth/register').send(account);
  assert.equal(response.status, 201);
  return response.body;
}

const validApplication = {
  name: 'Asha Rao',
  phone: '+91 98765 43210',
  gender: 'Female',
  city: 'Pune',
  state: 'Maharashtra'
};

describe('certificate API', () => {
  it('serves the browser portal and interactive API documentation', async () => {
    const { app, close } = setup();
    try {
      const portal = await request(app).get('/');
      assert.equal(portal.status, 200);
      assert.match(portal.headers['content-type'], /text\/html/);
      assert.match(portal.text, /Citizen services/);

      const documentation = await request(app).get('/api-docs/');
      assert.equal(documentation.status, 200);
      assert.match(documentation.text, /Swagger UI/);

      const specification = await request(app).get('/api-docs.json');
      assert.equal(specification.status, 200);
      assert.ok(specification.body.paths['/api/admin/applications']);
    } finally {
      close();
    }
  });

  it('validates required fields and tracks a submitted application', async () => {
    const { app, close } = setup();
    try {
      const unauthorized = await request(app).post('/api/applications').send(validApplication);
      assert.equal(unauthorized.status, 401);

      const citizen = await registerCitizen(app);
      const invalid = await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${citizen.token}`)
        .send({ name: 'Asha' });
      assert.equal(invalid.status, 400);

      const created = await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${citizen.token}`)
        .send(validApplication);
      assert.equal(created.status, 201);
      assert.match(created.body.applicationId, /^APP-/);
      assert.equal(created.body.status, 'Pending');

      const tracked = await request(app)
        .get(`/api/applications/track/${created.body.applicationId}`);
      assert.equal(tracked.status, 200);
      assert.equal(tracked.body.name, validApplication.name);
      assert.equal(tracked.body.status, 'Pending');
    } finally {
      close();
    }
  });

  it('registers citizens, enforces role access, and returns only their own issued certificates', async () => {
    const { app, close } = setup();
    try {
      const citizen = await registerCitizen(app);
      assert.equal(citizen.user.email, 'asha@example.com');
      assert.ok(citizen.token);

      const duplicate = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Another Asha', email: 'ASHA@example.com', password: 'secure-password' });
      assert.equal(duplicate.status, 409);

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({ email: 'ASHA@example.com', password: 'secure-password' });
      assert.equal(loginResponse.status, 200);
      assert.equal(loginResponse.body.user.userId, citizen.user.userId);

      const created = await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${citizen.token}`)
        .send(validApplication);
      const adminToken = await login(app);
      const approved = await request(app)
        .patch(`/api/admin/applications/${created.body.applicationId}/approve`)
        .set('Authorization', `Bearer ${adminToken}`);
      assert.equal(approved.status, 200);

      const certificates = await request(app)
        .get('/api/citizen/certificates')
        .set('Authorization', `Bearer ${citizen.token}`);
      assert.equal(certificates.status, 200);
      assert.equal(certificates.body.length, 1);
      assert.equal(certificates.body[0].certificateId, approved.body.certificateId);

      const adminOnCitizenRoute = await request(app)
        .get('/api/citizen/certificates')
        .set('Authorization', `Bearer ${adminToken}`);
      assert.equal(adminOnCitizenRoute.status, 403);

      const citizenOnAdminRoute = await request(app)
        .get('/api/admin/applications')
        .set('Authorization', `Bearer ${citizen.token}`);
      assert.equal(citizenOnAdminRoute.status, 403);

      const otherCitizen = await registerCitizen(app, {
        name: 'Other User',
        email: 'other@example.com',
        password: 'another-password'
      });
      const otherCertificates = await request(app)
        .get('/api/citizen/certificates')
        .set('Authorization', `Bearer ${otherCitizen.token}`);
      assert.deepEqual(otherCertificates.body, []);
    } finally {
      close();
    }
  });

  it('protects admin routes, issues and verifies a certificate, then revokes only the certificate', async () => {
    const { app, close } = setup();
    try {
      const unauthorized = await request(app).get('/api/admin/applications');
      assert.equal(unauthorized.status, 401);

      const citizen = await registerCitizen(app);
      const created = await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${citizen.token}`)
        .send(validApplication);
      const applicationId = created.body.applicationId;
      const token = await login(app);
      const approved = await request(app)
        .patch(`/api/admin/applications/${applicationId}/approve`)
        .set('Authorization', `Bearer ${token}`);

      assert.equal(approved.status, 200);
      assert.equal(approved.body.status, 'Approved');
      const certificateId = approved.body.certificateId;
      const duplicateApproval = await request(app)
        .patch(`/api/admin/applications/${applicationId}/approve`)
        .set('Authorization', `Bearer ${token}`);
      assert.equal(duplicateApproval.status, 409);

      const verified = await request(app).get(`/api/certificates/verify/${certificateId}`);
      assert.equal(verified.status, 200);
      assert.equal(verified.body.status, 'Valid');

      const revoked = await request(app)
        .patch(`/api/admin/certificates/${certificateId}/revoke`)
        .set('Authorization', `Bearer ${token}`);
      assert.equal(revoked.status, 200);

      const revokedVerification = await request(app)
        .get(`/api/certificates/verify/${certificateId}`);
      assert.equal(revokedVerification.body.status, 'Revoked');

      const tracked = await request(app).get(`/api/applications/track/${applicationId}`);
      assert.equal(tracked.body.status, 'Approved');
      assert.equal(tracked.body.certificateId, certificateId);
    } finally {
      close();
    }
  });

  it('rejects a pending application and does not issue a certificate', async () => {
    const { app, close } = setup();
    try {
      const citizen = await registerCitizen(app);
      const created = await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${citizen.token}`)
        .send(validApplication);
      const token = await login(app);
      const rejected = await request(app)
        .patch(`/api/admin/applications/${created.body.applicationId}/reject`)
        .set('Authorization', `Bearer ${token}`)
        .send({ reason: 'Incomplete information' });

      assert.equal(rejected.status, 200);
      assert.equal(rejected.body.status, 'Rejected');
      const certificates = await request(app)
        .get('/api/admin/certificates')
        .set('Authorization', `Bearer ${token}`);
      assert.deepEqual(certificates.body, []);
    } finally {
      close();
    }
  });
});

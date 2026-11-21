const openApiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'ELEVATE Certificate API',
    version: '1.0.0',
    description: 'Citizen accounts, certificate applications, public verification, and admin certificate management API.'
  },
  servers: [{ url: '/' }],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    },
    schemas: {
      ApplicationRequest: {
        type: 'object',
        required: ['name', 'phone', 'gender', 'city', 'state'],
        properties: {
          name: { type: 'string', example: 'Asha Rao' },
          phone: { type: 'string', example: '+91 98765 43210' },
          gender: { type: 'string', example: 'Female' },
          city: { type: 'string', example: 'Chennai' },
          state: { type: 'string', example: 'Tamil Nadu' }
        }
      },
      LoginRequest: {
        type: 'object',
        required: ['username', 'password'],
        properties: {
          username: { type: 'string', example: 'admin' },
          password: { type: 'string', example: 'your-admin-password' }
        }
      },
      CitizenRegistrationRequest: {
        type: 'object',
        required: ['name', 'email', 'password'],
        properties: {
          name: { type: 'string', maxLength: 100, example: 'Asha Rao' },
          email: { type: 'string', format: 'email', example: 'asha@example.com' },
          password: { type: 'string', minLength: 8, example: 'your-account-password' }
        }
      },
      CitizenLoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email', example: 'asha@example.com' },
          password: { type: 'string', example: 'your-account-password' }
        }
      },
      Error: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string', example: 'Application not found' }
        }
      }
    }
  },
  paths: {
    '/api/auth/register': {
      post: {
        tags: ['Citizen'],
        summary: 'Create a citizen account',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CitizenRegistrationRequest' }
            }
          }
        },
        responses: {
          201: { description: 'Account created; returns a citizen JWT and profile' },
          400: { description: 'Invalid account details' },
          409: { description: 'Email is already registered' }
        }
      }
    },
    '/api/auth/login': {
      post: {
        tags: ['Citizen'],
        summary: 'Log in to a citizen account',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CitizenLoginRequest' }
            }
          }
        },
        responses: {
          200: { description: 'Login successful; returns a citizen JWT and profile' },
          401: { description: 'Invalid email or password' }
        }
      }
    },
    '/api/auth/me': {
      get: {
        tags: ['Citizen'],
        summary: 'Get the authenticated citizen profile',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Citizen profile' },
          401: { description: 'Citizen authentication required' }
        }
      }
    },
    '/api/applications': {
      post: {
        tags: ['Citizen'],
        summary: 'Submit a certificate application',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ApplicationRequest' }
            }
          }
        },
        responses: {
          201: { description: 'Application submitted' },
          400: { description: 'Invalid application' },
          401: { description: 'Citizen authentication required' }
        }
      }
    },
    '/api/applications/track/{applicationId}': {
      get: {
        tags: ['Public'],
        summary: 'Track an application',
        parameters: [{
          in: 'path',
          name: 'applicationId',
          required: true,
          schema: { type: 'string' }
        }],
        responses: {
          200: { description: 'Application status' },
          404: { description: 'Application not found' }
        }
      }
    },
    '/api/certificates/verify/{certificateId}': {
      get: {
        tags: ['Public'],
        summary: 'Verify a certificate',
        parameters: [{
          in: 'path',
          name: 'certificateId',
          required: true,
          schema: { type: 'string' }
        }],
        responses: {
          200: { description: 'Certificate details and status' },
          404: { description: 'Certificate not found' }
        }
      }
    },
    '/api/citizen/certificates': {
      get: {
        tags: ['Citizen'],
        summary: 'List certificates issued to the authenticated citizen',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Citizen certificate history' },
          401: { description: 'Citizen authentication required' }
        }
      }
    },
    '/api/admin/login': {
      post: {
        tags: ['Admin'],
        summary: 'Log in as admin',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LoginRequest' }
            }
          }
        },
        responses: {
          200: { description: 'Login successful; returns a JWT token' },
          401: { description: 'Invalid login' }
        }
      }
    },
    '/api/admin/applications': {
      get: {
        tags: ['Admin'],
        summary: 'List all applications',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Applications' },
          401: { description: 'Admin authentication required' }
        }
      }
    },
    '/api/admin/applications/{applicationId}/approve': {
      patch: {
        tags: ['Admin'],
        summary: 'Approve an application and issue a certificate',
        security: [{ bearerAuth: [] }],
        parameters: [{
          in: 'path',
          name: 'applicationId',
          required: true,
          schema: { type: 'string' }
        }],
        responses: {
          200: { description: 'Application approved and certificate issued' },
          404: { description: 'Application not found' },
          409: { description: 'Application is no longer pending' }
        }
      }
    },
    '/api/admin/applications/{applicationId}/reject': {
      patch: {
        tags: ['Admin'],
        summary: 'Reject a pending application',
        security: [{ bearerAuth: [] }],
        parameters: [{
          in: 'path',
          name: 'applicationId',
          required: true,
          schema: { type: 'string' }
        }],
        requestBody: {
          required: false,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: { reason: { type: 'string', maxLength: 1000 } }
              }
            }
          }
        },
        responses: {
          200: { description: 'Application rejected' },
          404: { description: 'Application not found' },
          409: { description: 'Application is no longer pending' }
        }
      }
    },
    '/api/admin/certificates': {
      get: {
        tags: ['Admin'],
        summary: 'List issued certificates',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Certificates' },
          401: { description: 'Admin authentication required' }
        }
      }
    },
    '/api/admin/certificates/{certificateId}/revoke': {
      get: {
        tags: ['Admin'],
        summary: 'Revoke a certificate (specified GET endpoint)',
        security: [{ bearerAuth: [] }],
        parameters: [{
          in: 'path',
          name: 'certificateId',
          required: true,
          schema: { type: 'string' }
        }],
        responses: {
          200: { description: 'Certificate revoked' },
          404: { description: 'Certificate not found' },
          409: { description: 'Certificate already revoked' }
        }
      },
      patch: {
        tags: ['Admin'],
        summary: 'Revoke a certificate',
        security: [{ bearerAuth: [] }],
        parameters: [{
          in: 'path',
          name: 'certificateId',
          required: true,
          schema: { type: 'string' }
        }],
        responses: {
          200: { description: 'Certificate revoked' },
          404: { description: 'Certificate not found' },
          409: { description: 'Certificate already revoked' }
        }
      }
    }
  }
};

module.exports = { openApiSpec };

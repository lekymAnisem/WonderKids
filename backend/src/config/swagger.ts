export const openApiDocument = {
  openapi: '3.0.3',
  info: {
    title: 'WonderKids API',
    version: '1.0.0',
    description:
      'Backend API for the WonderKids children\'s education and entertainment platform. Covers authentication, child profiles, coloring, stories, games, achievements, progress, parent dashboard, admin and AI coloring generation.'
  },
  servers: [{ url: '/api', description: 'Default' }],
  tags: [
    { name: 'Auth' },
    { name: 'Children' },
    { name: 'Coloring' },
    { name: 'Stories' },
    { name: 'Games' },
    { name: 'Achievements' },
    { name: 'Progress' },
    { name: 'Parent' },
    { name: 'Admin' },
    { name: 'AI' }
  ],
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }
    },
    schemas: {
      Success: {
        type: 'object',
        properties: { success: { type: 'boolean', example: true }, data: { type: 'object' } }
      },
      Error: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          error: {
            type: 'object',
            properties: {
              code: { type: 'string', example: 'VALIDATION_ERROR' },
              message: { type: 'string', example: 'Invalid request' }
            }
          }
        }
      },
      RegisterRequest: {
        type: 'object',
        required: ['email', 'name', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          name: { type: 'string' },
          password: { type: 'string', minLength: 8 }
        }
      },
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: { email: { type: 'string', format: 'email' }, password: { type: 'string' } }
      },
      ChildRequest: {
        type: 'object',
        required: ['displayName', 'ageGroup'],
        properties: {
          displayName: { type: 'string' },
          avatar: { type: 'string' },
          ageGroup: { type: 'string', enum: ['3-5', '4-6', '6-8', '8-10', '10-12'] }
        }
      },
      GameResultRequest: {
        type: 'object',
        required: ['childId', 'sessionId', 'score', 'correctAnswers', 'wrongAnswers'],
        properties: {
          childId: { type: 'string' },
          sessionId: { type: 'string' },
          score: { type: 'integer', example: 850 },
          correctAnswers: { type: 'integer', example: 9 },
          wrongAnswers: { type: 'integer', example: 1 }
        }
      },
      GenerateColoringRequest: {
        type: 'object',
        required: ['prompt', 'ageGroup'],
        properties: {
          prompt: { type: 'string', example: 'A friendly dinosaur in a jungle' },
          ageGroup: { type: 'string', enum: ['3-5', '4-6', '6-8', '8-10', '10-12'] },
          childId: { type: 'string' }
        }
      }
    }
  },
  security: [{ bearerAuth: [] }],
  paths: {
    '/auth/register': {
      post: {
        tags: ['Auth'],
        security: [],
        summary: 'Register a parent account',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/RegisterRequest' } } } },
        responses: { 201: { description: 'Created' }, 409: { description: 'Email already exists' } }
      }
    },
    '/auth/login': {
      post: {
        tags: ['Auth'],
        security: [],
        summary: 'Login and receive access/refresh tokens',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginRequest' } } } },
        responses: { 200: { description: 'OK' }, 401: { description: 'Invalid credentials' } }
      }
    },
    '/auth/refresh': {
      post: { tags: ['Auth'], security: [], summary: 'Rotate refresh token', responses: { 200: { description: 'OK' } } }
    },
    '/auth/logout': {
      post: { tags: ['Auth'], security: [], summary: 'Revoke refresh token', responses: { 200: { description: 'OK' } } }
    },
    '/auth/forgot-password': {
      post: { tags: ['Auth'], security: [], summary: 'Request a password reset', responses: { 200: { description: 'OK' } } }
    },
    '/auth/reset-password': {
      post: { tags: ['Auth'], security: [], summary: 'Reset password with token', responses: { 200: { description: 'OK' } } }
    },

    '/children': {
      get: { tags: ['Children'], summary: 'List the current parent\'s children', responses: { 200: { description: 'OK' } } },
      post: {
        tags: ['Children'],
        summary: 'Create a child profile',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/ChildRequest' } } } },
        responses: { 201: { description: 'Created' } }
      }
    },
    '/children/{id}': {
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      get: { tags: ['Children'], summary: 'Get a child', responses: { 200: { description: 'OK' } } },
      patch: { tags: ['Children'], summary: 'Update a child', responses: { 200: { description: 'OK' } } },
      delete: { tags: ['Children'], summary: 'Delete a child', responses: { 200: { description: 'OK' } } }
    },
    '/children/{childId}/progress': {
      parameters: [{ name: 'childId', in: 'path', required: true, schema: { type: 'string' } }],
      get: { tags: ['Progress'], summary: 'Aggregated progress for a child', responses: { 200: { description: 'OK' } } }
    },
    '/children/{childId}/coloring': {
      parameters: [{ name: 'childId', in: 'path', required: true, schema: { type: 'string' } }],
      get: { tags: ['Coloring'], summary: 'Coloring sessions for a child', responses: { 200: { description: 'OK' } } }
    },
    '/children/{childId}/stories/progress': {
      parameters: [{ name: 'childId', in: 'path', required: true, schema: { type: 'string' } }],
      get: { tags: ['Stories'], summary: 'Story progress for a child', responses: { 200: { description: 'OK' } } }
    },
    '/children/{childId}/achievements': {
      parameters: [{ name: 'childId', in: 'path', required: true, schema: { type: 'string' } }],
      get: { tags: ['Achievements'], summary: 'Achievements for a child', responses: { 200: { description: 'OK' } } }
    },

    '/coloring': {
      get: { tags: ['Coloring'], security: [], summary: 'List coloring pages', responses: { 200: { description: 'OK' } } },
      post: { tags: ['Coloring'], summary: 'Create a coloring page (admin)', responses: { 201: { description: 'Created' } } }
    },
    '/coloring/{id}': {
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      get: { tags: ['Coloring'], security: [], summary: 'Get a coloring page', responses: { 200: { description: 'OK' } } },
      patch: { tags: ['Coloring'], summary: 'Update a coloring page (admin)', responses: { 200: { description: 'OK' } } },
      delete: { tags: ['Coloring'], summary: 'Delete a coloring page (admin)', responses: { 200: { description: 'OK' } } }
    },
    '/coloring/{id}/session': {
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      post: { tags: ['Coloring'], summary: 'Start a coloring session', responses: { 201: { description: 'Created' } } }
    },
    '/coloring/{id}/save': {
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      post: { tags: ['Coloring'], summary: 'Throttled autosave of drawing state', responses: { 200: { description: 'OK' } } }
    },
    '/coloring/{id}/complete': {
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      post: { tags: ['Coloring'], summary: 'Complete a coloring session and award rewards', responses: { 200: { description: 'OK' } } }
    },

    '/stories': {
      get: { tags: ['Stories'], security: [], summary: 'List stories', responses: { 200: { description: 'OK' } } },
      post: { tags: ['Stories'], summary: 'Create a story (admin)', responses: { 201: { description: 'Created' } } }
    },
    '/stories/{id}': {
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      get: { tags: ['Stories'], security: [], summary: 'Get a story with pages', responses: { 200: { description: 'OK' } } },
      patch: { tags: ['Stories'], summary: 'Update a story (admin)', responses: { 200: { description: 'OK' } } },
      delete: { tags: ['Stories'], summary: 'Delete a story (admin)', responses: { 200: { description: 'OK' } } }
    },
    '/stories/{id}/pages': {
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      get: { tags: ['Stories'], security: [], summary: 'List story pages', responses: { 200: { description: 'OK' } } }
    },
    '/stories/{id}/progress': {
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      post: { tags: ['Stories'], summary: 'Record reading progress', responses: { 200: { description: 'OK' } } }
    },

    '/games': {
      get: { tags: ['Games'], security: [], summary: 'List games', responses: { 200: { description: 'OK' } } },
      post: { tags: ['Games'], summary: 'Create a game (admin)', responses: { 201: { description: 'Created' } } }
    },
    '/games/slug/{slug}': {
      parameters: [{ name: 'slug', in: 'path', required: true, schema: { type: 'string' } }],
      get: { tags: ['Games'], security: [], summary: 'Get a game by slug (Phaser loader)', responses: { 200: { description: 'OK' } } }
    },
    '/games/{id}': {
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      get: { tags: ['Games'], security: [], summary: 'Get a game', responses: { 200: { description: 'OK' } } },
      patch: { tags: ['Games'], summary: 'Update a game (admin)', responses: { 200: { description: 'OK' } } },
      delete: { tags: ['Games'], summary: 'Delete a game (admin)', responses: { 200: { description: 'OK' } } }
    },
    '/games/{id}/start': {
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      post: { tags: ['Games'], summary: 'Start a game session', responses: { 201: { description: 'Created' } } }
    },
    '/games/{id}/score': {
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      post: {
        tags: ['Games'],
        summary: 'Submit and validate a game score',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/GameResultRequest' } } } },
        responses: { 200: { description: 'OK' }, 201: { description: 'Recorded' } }
      }
    },
    '/games/{id}/complete': {
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      post: { tags: ['Games'], summary: 'Complete a game session', responses: { 200: { description: 'OK' } } }
    },

    '/achievements': {
      get: { tags: ['Achievements'], security: [], summary: 'List available achievements', responses: { 200: { description: 'OK' } } }
    },
    '/achievements/check': {
      post: { tags: ['Achievements'], summary: 'Re-evaluate achievements for a child', responses: { 200: { description: 'OK' } } }
    },

    '/parent/dashboard': {
      get: { tags: ['Parent'], summary: 'Parent dashboard overview', responses: { 200: { description: 'OK' } } }
    },
    '/parent/children/{id}/progress': {
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      get: { tags: ['Parent'], summary: 'Child progress', responses: { 200: { description: 'OK' } } }
    },
    '/parent/children/{id}/activity': {
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      get: { tags: ['Parent'], summary: 'Child activity feed', responses: { 200: { description: 'OK' } } }
    },
    '/parent/children/{id}/report': {
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      get: { tags: ['Parent'], summary: 'Detailed child report', responses: { 200: { description: 'OK' } } }
    },

    '/admin/overview': {
      get: { tags: ['Admin'], summary: 'Platform overview counters', responses: { 200: { description: 'OK' } } }
    },

    '/ai/coloring-page': {
      post: {
        tags: ['AI'],
        summary: 'Generate a child-safe AI coloring page (SVG line art via Groq free model)',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/GenerateColoringRequest' } } } },
        responses: {
          201: { description: 'Created' },
          400: { description: 'Unsafe or invalid prompt' },
          429: { description: 'Rate limited' },
          503: { description: 'AI provider not configured' }
        }
      }
    }
  }
};

import swaggerJsdoc from 'swagger-jsdoc';
import { env } from './env';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Vijaya Lakshmi General Stores API',
      version: '1.0.0',
      description: 'Production-ready REST API for Vijaya Lakshmi General Stores e-commerce platform',
      contact: { name: 'Vijaya Lakshmi General Stores Team', email: 'api@Vijaya Lakshmi General Stores.in' },
    },
    servers: [
      { url: `http://localhost:${env.PORT}/api/${env.API_VERSION}`, description: 'Development' },
      { url: `https://api.Vijaya Lakshmi General Stores.in/api/${env.API_VERSION}`, description: 'Production' },
    ],
    components: {
      securitySchemes: {
        BearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string' },
            code: { type: 'string' },
            errors: { type: 'array', items: { type: 'object' } },
          },
        },
        Pagination: {
          type: 'object',
          properties: {
            page: { type: 'integer' },
            limit: { type: 'integer' },
            total: { type: 'integer' },
            totalPages: { type: 'integer' },
            hasNext: { type: 'boolean' },
            hasPrev: { type: 'boolean' },
          },
        },
      },
    },
    security: [{ BearerAuth: [] }],
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);

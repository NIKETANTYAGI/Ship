import swaggerJsDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'SwiftRoute P2P Shipping API',
      version: '1.0.0',
      description: 'Unified Logistics API for P2P Shipping, Wallet, and Financial Reconciliation',
      contact: {
        name: 'SwiftRoute Dev Team',
        email: 'support@swiftroute.io',
      },
    },
    servers: [
      {
        url: 'http://localhost:3001',
        description: 'Development Server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/api/**/*.routes.ts', './src/api/**/*.controller.ts'], // Path to the API docs
};

const specs = swaggerJsDoc(options);

export const setupSwagger = (app: Express) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
  console.log('📖 Swagger Interactive API Docs available at http://localhost:3001/api-docs');
};

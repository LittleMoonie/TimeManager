import swaggerJSDoc from 'swagger-jsdoc';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'GoGoTime API',
    version: '1.0.0',
    description: 'API documentation for GoGoTime project',
    contact: {
      name: 'GoGoTime Team',
      email: 'team@gogotime.com',
    },
  },
  servers: [
    {
      url: 'http://localhost:4000',
      description: 'Development server',
    },
  ],
  components: {
    securitySchemes: {
      jwt: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT Authorization header using the Bearer scheme.',
      },
    },
  },
  security: [
    {
      jwt: [],
    },
  ],
};

const options = {
  swaggerDefinition,
  apis: ['./Controllers/**/*.ts', './Dtos/**/*.ts'], // Path to the API docs
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;

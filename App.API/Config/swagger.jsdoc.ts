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
    schemas: {
      AuthResponse: {
        type: 'object',
        properties: {
          token: {
            type: 'string',
            description: 'JWT authentication token',
          },
          user: {
            $ref: '#/components/schemas/UserResponseDto',
          },
        },
        required: ['token', 'user'],
      },
      UserResponseDto: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
          },
          email: {
            type: 'string',
            format: 'email',
          },
          firstName: {
            type: 'string',
          },
          lastName: {
            type: 'string',
          },
          companyId: {
            type: 'string',
            format: 'uuid',
          },
          roleId: {
            type: 'string',
            format: 'uuid',
          },
          statusId: {
            type: 'string',
            format: 'uuid',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
          },
          phone: {
            type: 'string',
          },
          lastLogin: {
            type: 'string',
            format: 'date-time',
          },
        },
        required: ['id', 'email', 'firstName', 'lastName', 'companyId', 'roleId', 'statusId', 'createdAt'],
      },
      RegisterDto: {
        type: 'object',
        properties: {
          email: {
            type: 'string',
            format: 'email',
          },
          password: {
            type: 'string',
            format: 'password',
          },
          firstName: {
            type: 'string',
          },
          lastName: {
            type: 'string',
          },
          companyId: {
            type: 'string',
            format: 'uuid',
          },
          roleId: {
            type: 'string',
            format: 'uuid',
          },
          statusId: {
            type: 'string',
            format: 'uuid',
          },
          phoneNumber: {
            type: 'string',
          },
        },
        required: ['email', 'password', 'firstName', 'lastName', 'companyId', 'roleId', 'statusId', 'phoneNumber'],
      },
      LoginDto: {
        type: 'object',
        properties: {
          email: {
            type: 'string',
            format: 'email',
          },
          password: {
            type: 'string',
            format: 'password',
          },
        },
        required: ['email', 'password'],
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

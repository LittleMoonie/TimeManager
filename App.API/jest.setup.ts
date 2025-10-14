import { Server } from 'http';

import { createTestApp, startTestServer, closeTestServer } from './Tests/TestHelper';

declare global {
  var testServer: Server;
}

jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mock-uuid'),
}));

jest.mock('./Server/Database', () => ({
  connectDB: jest.fn(),
  AppDataSource: {
    initialize: jest.fn().mockResolvedValue(undefined),
    destroy: jest.fn().mockResolvedValue(undefined),
    getRepository: jest.fn((entity) => ({
      target: entity,
      manager: {},
      metadata: {},
      createQueryBuilder: jest.fn(() => ({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        getOne: jest.fn(),
        getMany: jest.fn(),
      })),
      find: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      create: jest.fn(),
      merge: jest.fn(),
      // Add other necessary mocks for repository methods if needed
    })),
  },
}));

beforeAll(async () => {
  const app = createTestApp();
  global.testServer = await startTestServer(app, 4001);
});

afterAll(async () => {
  await closeTestServer(global.testServer);
});

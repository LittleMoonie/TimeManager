import request from 'supertest';
import { beforeAll, afterAll, describe, test, expect } from 'jest';
import { AppDataSource, connectDB } from '../src/server/database';
import app from '../src/server';
import { User } from '../src/models/user';
import { Organization } from '../src/models/organization';
import { TimesheetEntry } from '../src/models/timesheetEntry';
import { ActionCode } from '../src/models/actionCode';
import { TimesheetHistory, TimesheetHistoryAction, TimesheetHistoryEntityType } from '../src/models/timesheetHistory';
import { Repository } from 'typeorm';
import { sign } from 'jsonwebtoken';
import { TimesheetEntryDto } from '../src/dto/TimesheetDto';
import { CreateActionCodeDto, UpdateActionCodeDto } from '../src/dto/ActionCodeDto';

// Helper to generate JWT tokens
const generateToken = (user: User, orgId: string, roles: string[]) => {
  return sign({ sub: user.id, orgId, roles }, process.env.JWT_SECRET!, { expiresIn: '1h' });
};

describe('TimesheetHistory Module', () => {
  let organization: Organization;
  let employeeUser: User;
  let managerUser: User;
  let adminUser: User;
  let actionCode: ActionCode;
  let timesheetEntry: TimesheetEntry;
  let timesheetHistoryRepository: Repository<TimesheetHistory>;
  let userRepository: Repository<User>;
  let organizationRepository: Repository<Organization>;
  let actionCodeRepository: Repository<ActionCode>;
  let timesheetEntryRepository: Repository<TimesheetEntry>;

  beforeAll(async () => {
    await connectDB();
    timesheetHistoryRepository = AppDataSource.getRepository(TimesheetHistory);
    userRepository = AppDataSource.getRepository(User);
    organizationRepository = AppDataSource.getRepository(Organization);
    actionCodeRepository = AppDataSource.getRepository(ActionCode);
    timesheetEntryRepository = AppDataSource.getRepository(TimesheetEntry);

    // Clear history table before tests
    await timesheetHistoryRepository.query('TRUNCATE TABLE timesheet_history RESTART IDENTITY CASCADE;');
    await timesheetEntryRepository.query('TRUNCATE TABLE timesheet_entry RESTART IDENTITY CASCADE;');
    await actionCodeRepository.query('TRUNCATE TABLE action_code RESTART IDENTITY CASCADE;');
    await userRepository.query('TRUNCATE TABLE "user" RESTART IDENTITY CASCADE;');
    await organizationRepository.query('TRUNCATE TABLE organization RESTART IDENTITY CASCADE;');

    // Setup test data
    organization = organizationRepository.create({ name: 'Test Org' });
    await organizationRepository.save(organization);

    employeeUser = userRepository.create({
      email: 'employee@test.com',
      name: 'Test Employee',
      password: 'password',
      role: 'employee',
      status: 'active',
      orgId: organization.id,
      organization: organization,
    });
    await userRepository.save(employeeUser);

    managerUser = userRepository.create({
      email: 'manager@test.com',
      name: 'Test Manager',
      password: 'password',
      role: 'manager',
      status: 'active',
      orgId: organization.id,
      organization: organization,
    });
    await userRepository.save(managerUser);

    adminUser = userRepository.create({
      email: 'admin@test.com',
      name: 'Test Admin',
      password: 'password',
      role: 'admin',
      status: 'active',
      orgId: organization.id,
      organization: organization,
    });
    await userRepository.save(adminUser);

    actionCode = actionCodeRepository.create({
      name: 'Work',
      code: 'WRK',
      organization: organization,
    });
    await actionCodeRepository.save(actionCode);

    timesheetEntry = timesheetEntryRepository.create({
      day: new Date('2025-10-06'),
      startedAt: '09:00',
      endedAt: '17:00',
      durationMin: 480,
      user: employeeUser,
      organization: organization,
      actionCode: actionCode,
    });
    await timesheetEntryRepository.save(timesheetEntry);
  });

  afterAll(async () => {
    await AppDataSource?.close();
  });

  test('should record a created event when a timesheet entry is created', async () => {
    const employeeToken = generateToken(employeeUser, organization.id, ['employee']);
    const newEntryDto: TimesheetEntryDto = {
      day: '2025-10-07',
      startedAt: '09:00',
      endedAt: '17:00',
      durationMin: 480,
      actionCodeId: actionCode.id,
    };

    const response = await request(app)
      .post('/api/v1/timesheet')
      .set('Authorization', `Bearer ${employeeToken}`)
      .send(newEntryDto);

    expect(response.statusCode).toBe(201);
    const createdEntryId = response.body.id;

    const history = await timesheetHistoryRepository.findOne({
      where: {
        entityId: createdEntryId,
        action: TimesheetHistoryAction.created,
        entityType: TimesheetHistoryEntityType.TimesheetEntry,
      },
    });

    expect(history).toBeDefined();
    expect(history?.userId).toBe(employeeUser.id);
    expect(history?.actorUserId).toBe(employeeUser.id);
    expect(history?.orgId).toBe(organization.id);
  });

  test('should record an updated event when a timesheet entry is updated', async () => {
    const employeeToken = generateToken(employeeUser, organization.id, ['employee']);
    const updatedEntryDto: Partial<TimesheetEntryDto> = {
      durationMin: 450,
    };

    const response = await request(app)
      .put(`/api/v1/timesheet/${timesheetEntry.id}`)
      .set('Authorization', `Bearer ${employeeToken}`)
      .send(updatedEntryDto);

    expect(response.statusCode).toBe(200);

    const history = await timesheetHistoryRepository.findOne({
      where: {
        entityId: timesheetEntry.id,
        action: TimesheetHistoryAction.updated,
        entityType: TimesheetHistoryEntityType.TimesheetEntry,
      },
      order: { occurredAt: 'DESC' },
    });

    expect(history).toBeDefined();
    expect(history?.userId).toBe(employeeUser.id);
    expect(history?.actorUserId).toBe(employeeUser.id);
    expect(history?.orgId).toBe(organization.id);
    expect(history?.diff).toBeDefined();
    // Add more specific diff checks if needed
  });

  test('should record a deleted event when a timesheet entry is deleted', async () => {
    const employeeToken = generateToken(employeeUser, organization.id, ['employee']);
    const entryToDelete = timesheetEntryRepository.create({
      day: new Date('2025-10-08'),
      startedAt: '09:00',
      endedAt: '17:00',
      durationMin: 480,
      user: employeeUser,
      organization: organization,
      actionCode: actionCode,
    });
    await timesheetEntryRepository.save(entryToDelete);

    const response = await request(app)
      .delete(`/api/v1/timesheet/${entryToDelete.id}`)
      .set('Authorization', `Bearer ${employeeToken}`);

    expect(response.statusCode).toBe(204);

    const history = await timesheetHistoryRepository.findOne({
      where: {
        entityId: entryToDelete.id,
        action: TimesheetHistoryAction.deleted,
        entityType: TimesheetHistoryEntityType.TimesheetEntry,
      },
    });

    expect(history).toBeDefined();
    expect(history?.userId).toBe(employeeUser.id);
    expect(history?.actorUserId).toBe(employeeUser.id);
    expect(history?.orgId).toBe(organization.id);
  });

  test('should record an approved event when a timesheet entry is approved', async () => {
    const managerToken = generateToken(managerUser, organization.id, ['manager']);

    const response = await request(app)
      .post(`/api/v1/timesheet/${timesheetEntry.id}/approve`)
      .set('Authorization', `Bearer ${managerToken}`);

    expect(response.statusCode).toBe(200);

    const history = await timesheetHistoryRepository.findOne({
      where: {
        entityId: response.body.id, // Approval ID
        action: TimesheetHistoryAction.approved,
        entityType: TimesheetHistoryEntityType.Approval,
      },
    });

    expect(history).toBeDefined();
    expect(history?.userId).toBe(employeeUser.id);
    expect(history?.actorUserId).toBe(managerUser.id);
    expect(history?.orgId).toBe(organization.id);
  });

  test('should record a rejected event when a timesheet entry is rejected', async () => {
    const managerToken = generateToken(managerUser, organization.id, ['manager']);
    const entryToReject = timesheetEntryRepository.create({
      day: new Date('2025-10-09'),
      startedAt: '09:00',
      endedAt: '17:00',
      durationMin: 480,
      user: employeeUser,
      organization: organization,
      actionCode: actionCode,
    });
    await timesheetEntryRepository.save(entryToReject);

    const response = await request(app)
      .post(`/api/v1/timesheet/${entryToReject.id}/reject`)
      .set('Authorization', `Bearer ${managerToken}`)
      .send({ reason: 'Incorrect hours' });

    expect(response.statusCode).toBe(200);

    const history = await timesheetHistoryRepository.findOne({
      where: {
        entityId: response.body.id, // Approval ID
        action: TimesheetHistoryAction.rejected,
        entityType: TimesheetHistoryEntityType.Approval,
      },
    });

    expect(history).toBeDefined();
    expect(history?.userId).toBe(employeeUser.id);
    expect(history?.actorUserId).toBe(managerUser.id);
    expect(history?.orgId).toBe(organization.id);
    expect(history?.reason).toBe('Incorrect hours');
  });

  test('employee should only be able to read their own timesheet history', async () => {
    const employeeToken = generateToken(employeeUser, organization.id, ['employee']);

    const response = await request(app)
      .get('/api/v1/timesheet-history')
      .set('Authorization', `Bearer ${employeeToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.data).toBeInstanceOf(Array);
    response.body.data.forEach((history: TimesheetHistory) => {
      expect(history.userId).toBe(employeeUser.id);
    });
  });

  test('manager should be able to read organization-wide timesheet history', async () => {
    const managerToken = generateToken(managerUser, organization.id, ['manager']);

    const response = await request(app)
      .get('/api/v1/timesheet-history')
      .set('Authorization', `Bearer ${managerToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.data).toBeInstanceOf(Array);
    response.body.data.forEach((history: TimesheetHistory) => {
      expect(history.orgId).toBe(organization.id);
    });
  });

  test('manager should be able to filter timesheet history by userId', async () => {
    const managerToken = generateToken(managerUser, organization.id, ['manager']);

    const response = await request(app)
      .get(`/api/v1/timesheet-history?userId=${employeeUser.id}`)
      .set('Authorization', `Bearer ${managerToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.data).toBeInstanceOf(Array);
    response.body.data.forEach((history: TimesheetHistory) => {
      expect(history.userId).toBe(employeeUser.id);
      expect(history.orgId).toBe(organization.id);
    });
  });

  test('should handle cursor pagination correctly', async () => {
    const managerToken = generateToken(managerUser, organization.id, ['manager']);

    // Create many entries to test pagination
    for (let i = 0; i < 10; i++) {
      const newEntry = timesheetEntryRepository.create({
        day: new Date(`2025-11-${10 + i}`),
        startedAt: '09:00',
        endedAt: '17:00',
        durationMin: 480,
        user: employeeUser,
        organization: organization,
        actionCode: actionCode,
      });
      await timesheetEntryRepository.save(newEntry);
      // This will trigger history events
      await request(app)
        .post('/api/v1/timesheet')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send({
          day: `2025-11-${10 + i}`,
          startedAt: '09:00',
          endedAt: '17:00',
          durationMin: 480,
          actionCodeId: actionCode.id,
        });
    }

    const firstPageResponse = await request(app)
      .get('/api/v1/timesheet-history?limit=5')
      .set('Authorization', `Bearer ${managerToken}`);

    expect(firstPageResponse.statusCode).toBe(200);
    expect(firstPageResponse.body.data.length).toBe(5);
    expect(firstPageResponse.body.nextCursor).toBeDefined();

    const secondPageResponse = await request(app)
      .get(`/api/v1/timesheet-history?limit=5&cursor=${firstPageResponse.body.nextCursor}`)
      .set('Authorization', `Bearer ${managerToken}`);

    expect(secondPageResponse.statusCode).toBe(200);
    expect(secondPageResponse.body.data.length).toBe(5);
    // Ensure no overlap and correct ordering
    expect(secondPageResponse.body.data[0].id).not.toBe(firstPageResponse.body.data[0].id);
    expect(new Date(secondPageResponse.body.data[0].occurredAt).getTime())
      .toBeLessThanOrEqual(new Date(firstPageResponse.body.data[firstPageResponse.body.data.length - 1].occurredAt).getTime());
  });

  test('should not duplicate history events for the same hash (idempotency)', async () => {
    const employeeToken = generateToken(employeeUser, organization.id, ['employee']);
    const entryId = timesheetEntry.id;

    // Manually record an event with a specific hash
    const manualEvent = await timesheetHistoryRepository.save(timesheetHistoryRepository.create({
      orgId: organization.id,
      userId: employeeUser.id,
      actorUserId: employeeUser.id,
      entityType: TimesheetHistoryEntityType.TimesheetEntry,
      entityId: entryId,
      action: TimesheetHistoryAction.retro_edit_enabled,
      hash: 'test-idempotency-hash-123',
      metadata: { source: 'test' },
    }));

    // Try to record the same event again via the service (simulated)
    const service = app.get('TimesheetHistoryService'); // Assuming TypeDI container is accessible
    // This part is tricky without direct access to TypeDI container in tests
    // For now, we'll rely on the recordEvent logic to handle the hash check

    // Simulate a call that would generate the same hash
    const duplicateEventDto = {
      entityType: TimesheetHistoryEntityType.TimesheetEntry,
      entityId: entryId,
      action: TimesheetHistoryAction.retro_edit_enabled,
      userId: employeeUser.id,
      actorUserId: employeeUser.id,
      metadata: { source: 'test' },
      hash: 'test-idempotency-hash-123',
    };

    // Directly call the service method to test idempotency
    const historyService = new (require('../src/services/TimesheetHistoryService').TimesheetHistoryService)();
    // Mock dependencies for historyService if needed, or get from container
    // This requires a more robust test setup for TypeDI services

    // For now, we'll just check the count after a direct insert attempt (which should be prevented by unique index)
    // A proper integration test would call the API endpoint that triggers recordEvent

    // Attempt to save another event with the same hash directly (should fail or be ignored by unique index)
    try {
      await timesheetHistoryRepository.save(timesheetHistoryRepository.create({
        orgId: organization.id,
        userId: employeeUser.id,
        actorUserId: employeeUser.id,
        entityType: TimesheetHistoryEntityType.TimesheetEntry,
        entityId: entryId,
        action: TimesheetHistoryAction.retro_edit_enabled,
        hash: 'test-idempotency-hash-123',
        metadata: { source: 'test' },
      }));
    } catch (error) {
      // Expect a unique constraint error if hash is not null
      expect(error.message).toContain('duplicate key value violates unique constraint');
    }

    const count = await timesheetHistoryRepository.count({
      where: { hash: 'test-idempotency-hash-123' },
    });
    expect(count).toBe(1);
  });
});


import { AppDataSource } from './database';
import { Organization } from '../models/organization';
import User from '../models/user';
import { ActionCode, ActionCodeType } from '../models/actionCode';

import * as bcrypt from 'bcrypt';

const seedDatabase = async () => {
  await AppDataSource.initialize();

  const orgRepository = AppDataSource.getRepository(Organization);
  const userRepository = AppDataSource.getRepository(User);
  const actionCodeRepository = AppDataSource.getRepository(ActionCode);

  // Create organization
  const organization = orgRepository.create({ name: 'GoGoTime' });
  await orgRepository.save(organization);

  // Create users
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = userRepository.create({
    name: 'Admin User',
    email: 'admin@gogotime.com',
    password: adminPassword,
    role: 'admin',
    organization,
    orgId: organization.id,
  });

  const managerPassword = await bcrypt.hash('manager123', 10);
  const manager = userRepository.create({
    name: 'Manager User',
    email: 'manager@gogotime.com',
    password: managerPassword,
    role: 'manager',
    organization,
    orgId: organization.id,
  });

  const employeePassword = await bcrypt.hash('employee123', 10);
  const employee = userRepository.create({
    name: 'Employee User',
    email: 'employee@gogotime.com',
    password: employeePassword,
    role: 'employee',
    organization,
    orgId: organization.id,
  });

  await userRepository.save([admin, manager, employee]);

  // Create action codes
  const actionCodes = [
    { organization, code: 'DEV-101', name: 'Feature Development', type: ActionCodeType.BILLABLE },
    { organization, code: 'DEV-102', name: 'Bug Fixing', type: ActionCodeType.BILLABLE },
    { organization, code: 'MEETING', name: 'Internal Meeting', type: ActionCodeType.NON_BILLABLE },
    { organization, code: 'TRAINING', name: 'Training', type: ActionCodeType.NON_BILLABLE },
    { organization, code: 'PTO', name: 'Paid Time Off', type: ActionCodeType.NON_BILLABLE },
  ];

  const actionCodeEntities = actionCodeRepository.create(actionCodes);
  await actionCodeRepository.save(actionCodeEntities);

  console.log('Database seeded successfully');

  await AppDataSource.destroy();
};

seedDatabase().catch(error => console.error('Error seeding database:', error));

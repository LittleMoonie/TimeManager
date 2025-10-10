
import { AppDataSource } from './Database';
import { Organization } from '../Entity/Company/Company';
import User from '../Entity/Users/User';
import { ActionCode, ActionCodeType } from '../Entity/Timesheet/ActionCode';

import bcrypt from 'bcryptjs';

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
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@gogotime.com',
    password: adminPassword,
    organization,
    orgId: organization.id,
  });

  const managerPassword = await bcrypt.hash('manager123', 10);
  const manager = userRepository.create({
    firstName: 'Manager',
    lastName: 'User',
    email: 'manager@gogotime.com',
    password: managerPassword,
    organization,
    orgId: organization.id,
  });

  const employeePassword = await bcrypt.hash('employee123', 10);
  const employee = userRepository.create({
    firstName: 'Employee',
    lastName: 'User',
    email: 'employee@gogotime.com',
    password: employeePassword,
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

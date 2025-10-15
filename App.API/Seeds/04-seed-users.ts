import argon2 from 'argon2';
import { DataSource } from 'typeorm';

import { Company } from '../Entities/Companies/Company';
import { Role } from '../Entities/Roles/Role';
import User from '../Entities/Users/User';
import { UserStatus } from '../Entities/Users/UserStatus';

type RolesMap = Map<string, Role>;
type StatusMap = Map<string, UserStatus>;

export async function seedUsers(
  ds: DataSource,
  company: Company,
  roles: RolesMap,
  statuses: StatusMap,
) {
  const userRepo = ds.getRepository(User);

  const defaultPassword = 'ChangeMe123!'; // dev-only; rotate in CI if needed
  const passwordHash = await argon2.hash(defaultPassword);

  const makeUser = async (email: string, firstName: string, lastName: string, roleName: string) => {
    const role = roles.get(roleName)!;
    const status = statuses.get('ACTIVE')!;
    let user = await userRepo.findOne({
      where: { companyId: company.id, email },
    });
    if (!user) {
      user = userRepo.create({
        companyId: company.id,
        email,
        firstName,
        lastName,
        passwordHash,
        mustChangePasswordAtNextLogin: true, // force rotation on first login
        roleId: role.id,
        statusId: status.id,
      });
      await userRepo.save(user);
      console.warn(`👤 Created ${roleName}: ${email}`);
    } else {
      Object.assign(user, {
        firstName,
        lastName,
        roleId: role.id,
        statusId: status.id,
        passwordHash,
        mustChangePasswordAtNextLogin: true,
      });
      await userRepo.save(user);
      console.warn(`👤 Refreshed ${roleName}: ${email}`);
    }
    return user;
  };

  const companyAdmin = await makeUser('admin@demo.example.com', 'Admin', 'User', 'company_admin');
  const mgr = await makeUser('manager@demo.example.com', 'Mila', 'Manager', 'manager');
  const empl = await makeUser('employee@demo.example.com', 'Eli', 'Employee', 'employee');
  const hr = await makeUser('hr@demo.example.com', 'Harriet', 'HumanResources', 'hr');
  const payroll = await makeUser('payroll@demo.example.com', 'Pat', 'Payroll', 'payroll');
  const auditor = await makeUser('auditor@demo.example.com', 'Audrey', 'Auditor', 'auditor');

  // Print dev creds (optional)
  console.warn('🔑 Default dev password for seeded users:', defaultPassword);
  console.warn('   (They must change it on first login)');

  return { companyAdmin, mgr, empl, hr, payroll, auditor };
}

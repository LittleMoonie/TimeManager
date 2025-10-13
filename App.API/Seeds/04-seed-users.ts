import { DataSource } from 'typeorm';
import bcrypt from 'bcryptjs';
import User from '../Entities/Users/User';
import { Company } from '../Entities/Companies/Company';
import { Role } from '../Entities/Roles/Role';
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
  const passwordHash = await bcrypt.hash(defaultPassword, 12);

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
      console.log(`👤 Created ${roleName}: ${email}`);
    } else {
      console.log(`👤 User exists: ${email}`);
    }
    return user;
  };

  const ceo = await makeUser('ceo@demo.example.com', 'Ceo', 'Demo', 'Owner/CEO');
  const mgr = await makeUser('manager@demo.example.com', 'Mila', 'Manager', 'Manager');
  const empl = await makeUser('employee@demo.example.com', 'Eli', 'Employee', 'Employee');

  // Print dev creds (optional)
  console.log('🔑 Default dev password for seeded users:', defaultPassword);
  console.log('   (They must change it on first login)');

  return { ceo, mgr, empl };
}

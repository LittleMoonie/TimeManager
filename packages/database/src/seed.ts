const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const faker = require('faker');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.create({
    data: {
      email: 'admin@ncy-8.com',
      passwordHash: adminPassword,
      name: 'System Administrator',
      role: 'ADMIN',
      status: 'ACTIVE',
    },
  });

  console.log('✅ Created admin user:', admin.email);

  // Create test organization
  const organization = await prisma.organization.create({
    data: {
      name: 'Test Organization',
      slug: 'test-org',
      ownerId: admin.id,
      settings: {
        theme: 'light',
        notifications: true,
      },
    },
  });

  console.log('✅ Created organization:', organization.name);

  // Create test users
  const users = [];
  for (let i = 0; i < 10; i++) {
    const password = await bcrypt.hash('password123', 12);
    const user = await prisma.user.create({
      data: {
        email: faker.internet.email(),
        passwordHash: password,
        name: faker.name.findName(),
        role: faker.random.arrayElement(['MANAGER', 'EMPLOYEE']),
        status: 'ACTIVE',
      },
    });
    users.push(user);
  }

  console.log(`✅ Created ${users.length} test users`);

  // Add users to organization
  for (const user of users) {
    await prisma.organizationMember.create({
      data: {
        organizationId: organization.id,
        userId: user.id,
        role: user.role === 'MANAGER' ? 'MANAGER' : 'MEMBER',
      },
    });
  }

  console.log('✅ Added users to organization');

  // Create teams
  const teams = [];
  for (let i = 0; i < 3; i++) {
    const team = await prisma.team.create({
      data: {
        organizationId: organization.id,
        name: faker.company.teamName(),
        description: faker.lorem.sentence(),
      },
    });
    teams.push(team);
  }

  console.log(`✅ Created ${teams.length} teams`);

  // Add users to teams
  for (const team of teams) {
    const teamUsers = faker.random.arrayElements(users, faker.random.number({ min: 2, max: 5 }));
    for (const user of teamUsers) {
      await prisma.teamMember.create({
        data: {
          teamId: team.id,
          userId: user.id,
        },
      });
    }
  }

  console.log('✅ Added users to teams');

  // Create projects
  const projects = [];
  for (let i = 0; i < 5; i++) {
    const project = await prisma.project.create({
      data: {
        organizationId: organization.id,
        name: faker.company.catchPhrase(),
        description: faker.lorem.paragraph(),
        status: faker.random.arrayElement(['ACTIVE', 'INACTIVE']),
        settings: {
          visibility: 'private',
          notifications: true,
        },
      },
    });
    projects.push(project);
  }

  console.log(`✅ Created ${projects.length} projects`);

  // Create tasks
  for (const project of projects) {
    const taskCount = faker.random.number({ min: 3, max: 8 });
    for (let i = 0; i < taskCount; i++) {
      await prisma.task.create({
        data: {
          projectId: project.id,
          assigneeId: faker.random.arrayElement(users).id,
          title: faker.lorem.sentence(),
          description: faker.lorem.paragraph(),
          status: faker.random.arrayElement(['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE']),
          priority: faker.random.arrayElement(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
          dueDate: faker.date.future(),
          metadata: {
            estimatedHours: faker.random.number({ min: 1, max: 40 }),
            tags: faker.random.arrayElements(['frontend', 'backend', 'design', 'testing'], 2),
          },
        },
      });
    }
  }

  console.log('✅ Created tasks for projects');

  // Create roles and permissions
  const roles = [
    { name: 'Admin', description: 'Full system access' },
    { name: 'Manager', description: 'Team and project management' },
    { name: 'Employee', description: 'Basic user access' },
  ];

  const permissions = [
    { key: 'user:read', description: 'View users' },
    { key: 'user:write', description: 'Create and edit users' },
    { key: 'user:delete', description: 'Delete users' },
    { key: 'org:read', description: 'View organization' },
    { key: 'org:write', description: 'Edit organization' },
    { key: 'org:manage', description: 'Manage organization' },
    { key: 'project:read', description: 'View projects' },
    { key: 'project:write', description: 'Create and edit projects' },
    { key: 'project:delete', description: 'Delete projects' },
    { key: 'system:admin', description: 'System administration' },
  ];

  for (const roleData of roles) {
    await prisma.role.create({
      data: roleData,
    });
  }

  for (const permissionData of permissions) {
    await prisma.permission.create({
      data: permissionData,
    });
  }

  console.log('✅ Created roles and permissions');

  // Create feature flags
  const featureFlags = [
    { key: 'new-dashboard', description: 'New dashboard UI', enabled: true, rolloutPercentage: 50 },
    { key: 'beta-features', description: 'Beta features access', enabled: false, rolloutPercentage: 0 },
    { key: 'advanced-analytics', description: 'Advanced analytics', enabled: true, rolloutPercentage: 100 },
  ];

  for (const flag of featureFlags) {
    await prisma.featureFlag.create({
      data: flag,
    });
  }

  console.log('✅ Created feature flags');

  // Create notifications
  for (const user of users.slice(0, 5)) {
    await prisma.notification.create({
      data: {
        userId: user.id,
        type: 'SYSTEM_ALERT',
        message: 'Welcome to NCY-8! Your account has been set up successfully.',
        metadata: {
          priority: 'info',
          actionUrl: '/dashboard',
        },
      },
    });
  }

  console.log('✅ Created notifications');

  // Create audit log entries
  await prisma.auditLog.create({
    data: {
      userId: admin.id,
      action: 'SEED_DATABASE',
      targetTable: 'User',
      newValue: { count: users.length + 1 },
      ipAddress: '127.0.0.1',
      userAgent: 'Seeder/1.0',
    },
  });

  console.log('✅ Created audit log entries');

  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

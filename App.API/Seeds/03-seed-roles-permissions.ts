import { DataSource } from 'typeorm';

import { Company } from '../Entities/Companies/Company';
import { MenuCard } from '../Entities/Menu/MenuCard';
import { MenuCategory } from '../Entities/Menu/MenuCategory';
import { Permission } from '../Entities/Roles/Permission';
import { Role } from '../Entities/Roles/Role';
import { RolePermission } from '../Entities/Roles/RolePermission';

export async function seedRolesAndPermissions(ds: DataSource, company: Company) {
  const roleRepo = ds.getRepository(Role);
  const permRepo = ds.getRepository(Permission);
  const rpRepo = ds.getRepository(RolePermission);

  // 1) Permissions (company-scoped)
  const permissions = [
    // Timesheets
    'timesheet.view.self',
    'timesheet.create.self',
    'timesheet.update.self',
    'timesheet.submit.self',
    'timesheet.view.team',
    'timesheet.approve.team',
    'timesheet.reject.team',
    'timesheet.comment.team',
    'timesheet.view.org',
    'timesheet.correct.org',
    'timesheet.lock.period',
    'timesheet.export.org',

    // Codes/Schedules/Policies
    'actioncode.view',
    'actioncode.manage',
    'schedule.view',
    'schedule.manage',
    'policy.view',
    'policy.manage',

    // People & Teams
    'user.view.team',
    'user.view.org',
    'team.manage',
    'user.manage',

    // Reports
    'report.view.team',
    'report.view.org',

    // System (company-admin)
    'rbac.manage.company',
    'settings.manage.company',
    'menu.manage.company',
    'audit.view.company',
  ];

  await permRepo.upsert(
    permissions.map((name) => ({ companyId: company.id, name })),
    { conflictPaths: ['companyId', 'name'] },
  );

  const permMap = new Map<string, Permission>();
  for (const name of permissions) {
    permMap.set(name, await permRepo.findOneByOrFail({ companyId: company.id, name }));
  }

  // 2) Roles (company-scoped)
  const roleDefs = [
    { name: 'employee', description: 'Standard user, manages own timesheets' },
    { name: 'manager', description: "Manages a team's timesheets and related activities" },
    { name: 'hr', description: 'Manages HR-related timesheet operations across the organization' },
    { name: 'payroll', description: 'Focuses on payroll-specific timesheet tasks' },
    { name: 'auditor', description: 'Read-only access for auditing purposes' },
    {
      name: 'company_admin',
      description: 'Full administrative control over company settings and RBAC',
    },
  ];

  await roleRepo.upsert(
    roleDefs.map((r) => ({
      companyId: company.id,
      name: r.name,
      description: r.description,
    })),
    { conflictPaths: ['companyId', 'name'] },
  );

  const roleMap = new Map<string, Role>();
  for (const r of roleDefs) {
    roleMap.set(r.name, await roleRepo.findOneByOrFail({ companyId: company.id, name: r.name }));
  }

  // 3) Role → Permission mapping (unique on companyId,roleId,permissionId)
  const grant = async (roleName: string, perms: string[]) => {
    const role = roleMap.get(roleName)!;
    for (const pName of perms) {
      const perm = permMap.get(pName)!;
      await rpRepo.upsert(
        { companyId: company.id, roleId: role.id, permissionId: perm.id },
        { conflictPaths: ['companyId', 'roleId', 'permissionId'] },
      );
    }
  };

  // employee: self timesheet (view/create/update/submit) + view codes/schedules/policies
  await grant('employee', [
    'timesheet.view.self',
    'timesheet.create.self',
    'timesheet.update.self',
    'timesheet.submit.self',
    'actioncode.view',
    'schedule.view',
    'policy.view',
  ]);

  // employee permissions
  const employeePermissions = [
    'timesheet.view.self',
    'timesheet.create.self',
    'timesheet.update.self',
    'timesheet.submit.self',
    'actioncode.view',
    'schedule.view',
    'policy.view',
  ];
  await grant('employee', employeePermissions);

  // manager: employee + team view/approve/reject/comment + team reports + view team members
  const managerPermissions = [
    ...employeePermissions,
    'timesheet.view.team',
    'timesheet.approve.team',
    'timesheet.reject.team',
    'timesheet.comment.team',
    'report.view.team',
    'user.view.team',
  ];
  await grant('manager', managerPermissions);

  // hr: manager + org view/correct/lock + manage schedules/action codes + org reports
  const hrPermissions = [
    ...managerPermissions,
    'timesheet.view.org',
    'timesheet.correct.org',
    'timesheet.lock.period',
    'schedule.manage',
    'actioncode.manage',
    'report.view.org',
    'user.view.org',
    'team.manage',
    'user.manage',
  ];
  await grant('hr', hrPermissions);

  // payroll: org view + lock period + export + org reports
  const payrollPermissions = [
    'timesheet.view.org',
    'timesheet.lock.period',
    'timesheet.export.org',
    'report.view.org',
  ];
  await grant('payroll', payrollPermissions);

  // auditor: org view + org reports (read-only)
  const auditorPermissions = [
    'timesheet.view.org',
    'actioncode.view',
    'schedule.view',
    'policy.view',
    'user.view.org',
    'report.view.org',
    'audit.view.company',
  ];
  await grant('auditor', auditorPermissions);

  // company_admin: all above + company RBAC/settings/menu/audit management
  const companyAdminPermissions = [
    ...hrPermissions, // Inherits all HR permissions
    ...payrollPermissions, // Inherits all Payroll permissions
    ...auditorPermissions, // Inherits all Auditor permissions
    'rbac.manage.company',
    'settings.manage.company',
    'menu.manage.company',
    'user.manage', // Explicitly added as per spec
    'team.manage', // Explicitly added as per spec
  ];
  await grant('company_admin', companyAdminPermissions);

  console.warn('🔐 Seeded Roles & Permissions for company:', company.name);

  // 4) Seed Menu Categories and Cards
  const menuCategoryRepo = ds.getRepository(MenuCategory);
  const menuCardRepo = ds.getRepository(MenuCard);

  const defaultCategories = [
    { key: 'my-time', title: 'My Time', icon: 'PersonRounded', sortOrder: 10 },
    { key: 'team', title: 'Team', icon: 'GroupsRounded', sortOrder: 20 },
    { key: 'hr-payroll', title: 'HR / Payroll', icon: 'AccountBalanceRounded', sortOrder: 30 },
    { key: 'analytics', title: 'Reports & KPIs', icon: 'BarChartRounded', sortOrder: 40 },
    { key: 'company-admin', title: 'Company Admin', icon: 'SettingsRounded', sortOrder: 50 },
  ];

  for (const catDef of defaultCategories) {
    let category = await menuCategoryRepo.findOne({
      where: { companyId: company.id, key: catDef.key },
    });
    if (!category) {
      category = menuCategoryRepo.create({ ...catDef, companyId: company.id });
      await menuCategoryRepo.save(category);
      console.warn(`➕ Created Menu Category: ${category.title} for company ${company.name}`);
    }
  }

  const myTimeCategory = await menuCategoryRepo.findOneByOrFail({
    companyId: company.id,
    key: 'my-time',
  });
  const teamCategory = await menuCategoryRepo.findOneByOrFail({
    companyId: company.id,
    key: 'team',
  });
  const hrPayrollCategory = await menuCategoryRepo.findOneByOrFail({
    companyId: company.id,
    key: 'hr-payroll',
  });
  const analyticsCategory = await menuCategoryRepo.findOneByOrFail({
    companyId: company.id,
    key: 'analytics',
  });
  const companyAdminCategory = await menuCategoryRepo.findOneByOrFail({
    companyId: company.id,
    key: 'company-admin',
  });

  const defaultCards = [
    // My Time
    {
      categoryKey: 'my-time',
      title: 'My Timesheet',
      subtitle: 'View and manage your timesheet',
      route: '/timesheet',
      icon: 'AssessmentRounded',
      requiredPermission: 'timesheet.view.self',
      isEnabled: true,
      sortOrder: 10,
      category: myTimeCategory,
    },
    {
      categoryKey: 'my-time',
      title: 'Daily Log',
      subtitle: 'Log your daily activities',
      route: '/timesheet/daily',
      icon: 'TaskAltRounded',
      requiredPermission: 'timesheet.create.self',
      isEnabled: true,
      sortOrder: 20,
      category: myTimeCategory,
    },
    {
      categoryKey: 'my-time',
      title: 'Requests',
      subtitle: 'Manage your leave requests',
      route: '/requests',
      icon: 'PersonRounded',
      requiredPermission: 'timesheet.view.self',
      isEnabled: true,
      sortOrder: 30,
      category: myTimeCategory,
    },
    {
      categoryKey: 'my-time',
      title: 'Submission',
      subtitle: 'Submit your timesheet',
      route: '/timesheet/submit',
      icon: 'TaskAltRounded',
      requiredPermission: 'timesheet.submit.self',
      isEnabled: true,
      sortOrder: 40,
      category: myTimeCategory,
    },

    // Team
    {
      categoryKey: 'team',
      title: 'Team Timesheets',
      subtitle: "View team members' timesheets",
      route: '/team/timesheets',
      icon: 'AssessmentRounded',
      requiredPermission: 'timesheet.view.team',
      isEnabled: true,
      sortOrder: 10,
      category: teamCategory,
    },
    {
      categoryKey: 'team',
      title: 'Approvals',
      subtitle: 'Approve or reject team timesheets',
      route: '/team/approvals',
      icon: 'TaskAltRounded',
      requiredPermission: 'timesheet.approve.team',
      isEnabled: true,
      sortOrder: 20,
      category: teamCategory,
    },
    {
      categoryKey: 'team',
      title: 'Team KPIs',
      subtitle: 'Key performance indicators for your team',
      route: '/team/kpis',
      icon: 'BarChartRounded',
      requiredPermission: 'report.view.team',
      isEnabled: true,
      sortOrder: 30,
      category: teamCategory,
    },

    // HR / Payroll
    {
      categoryKey: 'hr-payroll',
      title: 'Corrections',
      subtitle: 'Correct timesheet entries',
      route: '/hr/corrections',
      icon: 'AssessmentRounded',
      requiredPermission: 'timesheet.correct.org',
      isEnabled: true,
      sortOrder: 10,
      category: hrPayrollCategory,
    },
    {
      categoryKey: 'hr-payroll',
      title: 'Schedules & Holidays',
      subtitle: 'Manage company schedules and holidays',
      route: '/hr/schedules',
      icon: 'AccountBalanceRounded',
      requiredPermission: 'schedule.manage',
      isEnabled: true,
      sortOrder: 20,
      category: hrPayrollCategory,
    },
    {
      categoryKey: 'hr-payroll',
      title: 'Action Codes',
      subtitle: 'Manage timesheet action codes',
      route: '/hr/action-codes',
      icon: 'TaskAltRounded',
      requiredPermission: 'actioncode.manage',
      isEnabled: true,
      sortOrder: 30,
      category: hrPayrollCategory,
    },
    {
      categoryKey: 'hr-payroll',
      title: 'Payroll Exports',
      subtitle: 'Export payroll data',
      route: '/payroll/exports',
      icon: 'BarChartRounded',
      requiredPermission: 'timesheet.export.org',
      isEnabled: true,
      sortOrder: 40,
      category: hrPayrollCategory,
    },

    // Analytics
    {
      categoryKey: 'analytics',
      title: 'Reports & KPIs',
      subtitle: 'Company-wide reports and KPIs',
      route: '/reports',
      icon: 'BarChartRounded',
      requiredPermission: 'report.view.org',
      isEnabled: true,
      sortOrder: 10,
      category: analyticsCategory,
    },

    // Company Admin
    {
      categoryKey: 'company-admin',
      title: 'RBAC & Company Settings',
      subtitle: 'Manage roles, permissions, and company settings',
      route: '/company/security',
      icon: 'SettingsRounded',
      requiredPermission: 'rbac.manage.company',
      isEnabled: true,
      sortOrder: 10,
      category: companyAdminCategory,
    },
    {
      categoryKey: 'company-admin',
      title: 'Menu Builder',
      subtitle: 'Configure the timesheet hub menu',
      route: '/company/menu',
      icon: 'SettingsRounded',
      requiredPermission: 'menu.manage.company',
      isEnabled: true,
      sortOrder: 20,
      category: companyAdminCategory,
    },
    {
      categoryKey: 'company-admin',
      title: 'Audit Log',
      subtitle: 'View company audit trails',
      route: '/company/audit',
      icon: 'AccountBalanceRounded',
      requiredPermission: 'audit.view.company',
      isEnabled: true,
      sortOrder: 30,
      category: companyAdminCategory,
    },
  ];

  for (const cardDef of defaultCards) {
    let card = await menuCardRepo.findOne({
      where: { companyId: company.id, route: cardDef.route },
    });
    if (!card) {
      card = menuCardRepo.create({ ...cardDef, companyId: company.id });
      await menuCardRepo.save(card);
      console.warn(`➕ Created Menu Card: ${card.title} for company ${company.name}`);
    }
  }

  return { roles: roleMap, permissions: permMap };
}

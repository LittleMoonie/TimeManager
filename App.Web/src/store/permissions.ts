import type { PermissionKey, Role } from '@/types';

export const rolePermissions: Record<Role, PermissionKey[]> = {
  CEO: ['org.view_all', 'org.manage', 'team.manage', 'team.view_all', 'time.approve', 'time.badge', 'user.read', 'user.manage', 'task.manage', 'admin.manage'],
  MANAGER: ['org.view_all', 'team.manage', 'team.view_all', 'time.approve', 'time.badge', 'user.read', 'task.manage'],
  USER: ['time.badge', 'user.read'],
};

export const orderedRoles: Role[] = ['CEO', 'MANAGER', 'USER'];

export const permissionsList: PermissionKey[] = [
  'org.view_all',
  'org.manage',
  'team.manage',
  'team.view_all',
  'time.approve',
  'time.badge',
  'user.read',
  'user.manage',
  'task.manage',
  'admin.manage',
];

export const permissionLabels: Record<PermissionKey, string> = {
  'org.view_all': 'View organization overview',
  'org.manage': 'Manage organization settings',
  'team.manage': 'Manage assigned teams',
  'team.view_all': 'View all teams',
  'time.approve': 'Approve timesheets',
  'time.badge': 'Badge (clock in/out)',
  'user.read': 'View user directory',
  'user.manage': 'Manage user accounts',
  'task.manage': 'Manage tasks',
  'admin.manage': 'Administer platform',
};

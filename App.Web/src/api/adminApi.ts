import { dataSource } from './dataSource';
import { delay } from './utils';
import type { AccessLog, AuditLog, Organization, PermissionKey, Role } from '@/types';

export const rolePermissionMatrix: Record<Role, PermissionKey[]> = {
  CEO: ['org.view_all', 'org.manage', 'team.manage', 'team.view_all', 'time.approve', 'time.badge', 'user.read', 'user.manage', 'task.manage', 'admin.manage'],
  MANAGER: ['org.view_all', 'team.manage', 'team.view_all', 'time.approve', 'time.badge', 'user.read', 'task.manage'],
  USER: ['time.badge', 'user.read'],
};

export async function getOrganization(): Promise<Organization> {
  await delay();
  return dataSource.getOrganization();
}

export async function updateOrganizationSettings(
  settings: Partial<Organization['settings']>,
): Promise<Organization> {
  await delay();
  return dataSource.updateOrgSettings(settings);
}

export async function listAuditLogs(): Promise<AuditLog[]> {
  await delay();
  return dataSource.listAuditLogs();
}

export async function listAccessLogs(): Promise<AccessLog[]> {
  await delay();
  return dataSource.listAccessLogs();
}

export async function listApiKeys() {
  await delay();
  return dataSource.listApiKeys();
}

export async function createApiKey(name: string) {
  await delay();
  return dataSource.createApiKey(name);
}

export async function revokeApiKey(id: string) {
  await delay();
  return dataSource.revokeApiKey(id);
}

export async function listWebhooks() {
  await delay();
  return dataSource.listWebhooks();
}

export async function toggleWebhook(id: string, enabled: boolean) {
  await delay();
  return dataSource.toggleWebhook(id, enabled);
}

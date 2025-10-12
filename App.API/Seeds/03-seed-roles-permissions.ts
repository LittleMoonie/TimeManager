import { DataSource } from "typeorm";
import { Role } from "../Entities/Users/Role";
import { Permission } from "../Entities/Users/Permission";
import { RolePermission } from "../Entities/Users/RolePermission";
import { Company } from "../Entities/Companies/Company";

export async function seedRolesAndPermissions(
  ds: DataSource,
  company: Company,
) {
  const roleRepo = ds.getRepository(Role);
  const permRepo = ds.getRepository(Permission);
  const rpRepo = ds.getRepository(RolePermission);

  // 1) Permissions (tenant-scoped)
  const permissions = [
    "users:read",
    "users:create",
    "users:update",
    "users:delete",
    "roles:read",
    "roles:write",
    "permissions:read",
    "timesheets:submit",
    "timesheets:approve",
    "sessions:revoke",
  ];

  await permRepo.upsert(
    permissions.map((name) => ({ companyId: company.id, name })),
    { conflictPaths: ["companyId", "name"] },
  );

  const permMap = new Map<string, Permission>();
  for (const name of permissions) {
    permMap.set(
      name,
      await permRepo.findOneByOrFail({ companyId: company.id, name }),
    );
  }

  // 2) Roles (tenant-scoped)
  const roleDefs = [
    { name: "Owner/CEO", description: "Full control" },
    { name: "Manager", description: "Manage teams and approvals" },
    { name: "Employee", description: "Standard user" },
  ];

  await roleRepo.upsert(
    roleDefs.map((r) => ({
      companyId: company.id,
      name: r.name,
      description: r.description,
    })),
    { conflictPaths: ["companyId", "name"] },
  );

  const roleMap = new Map<string, Role>();
  for (const r of roleDefs) {
    roleMap.set(
      r.name,
      await roleRepo.findOneByOrFail({ companyId: company.id, name: r.name }),
    );
  }

  // 3) Role → Permission mapping (unique on companyId,roleId,permissionId)
  const grant = async (roleName: string, perms: string[]) => {
    const role = roleMap.get(roleName)!;
    for (const pName of perms) {
      const perm = permMap.get(pName)!;
      await rpRepo.upsert(
        { companyId: company.id, roleId: role.id, permissionId: perm.id },
        { conflictPaths: ["companyId", "roleId", "permissionId"] },
      );
    }
  };

  // Owner: everything
  await grant("Owner/CEO", permissions);
  // Manager: everything except dangerous deletes/role writes (adjust as you like)
  await grant("Manager", [
    "users:read",
    "users:create",
    "users:update",
    "roles:read",
    "permissions:read",
    "timesheets:approve",
    "sessions:revoke",
  ]);
  // Employee: self-service minimal (example)
  await grant("Employee", [
    "users:read", // usually scoped to self in service layer
    "timesheets:submit",
  ]);

  console.log("🔐 Seeded Roles & Permissions for company:", company.name);
  return { roles: roleMap, permissions: permMap };
}

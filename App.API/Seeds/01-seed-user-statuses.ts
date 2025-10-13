import { DataSource } from 'typeorm';
import { UserStatus } from '../Entities/Users/UserStatus';

export async function seedUserStatuses(ds: DataSource) {
  const repo = ds.getRepository(UserStatus);

  const rows = [
    {
      code: 'INVITED',
      name: 'Invited',
      description: 'Pending first login',
      canLogin: false,
      isTerminal: false,
    },
    {
      code: 'ACTIVE',
      name: 'Active',
      description: 'Active user',
      canLogin: true,
      isTerminal: false,
    },
    {
      code: 'SUSPENDED',
      name: 'Suspended',
      description: 'Temporarily blocked',
      canLogin: false,
      isTerminal: false,
    },
    {
      code: 'TERMINATED',
      name: 'Terminated',
      description: 'Offboarded',
      canLogin: false,
      isTerminal: true,
    },
  ];

  await repo.upsert(rows, { conflictPaths: ['code'] });
  const map = new Map<string, UserStatus>();
  for (const r of rows) {
    map.set(r.code, await repo.findOneByOrFail({ code: r.code }));
  }

  console.log('✅ Seeded UserStatus:', rows.map((r) => r.code).join(', '));
  return { statuses: map };
}

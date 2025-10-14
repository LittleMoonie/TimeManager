import { DataSource } from 'typeorm';

import { Company } from '../Entities/Companies/Company';
import { ActionCode, ActionCodeType } from '../Entities/Timesheets/ActionCode';

export async function seedActionCodes(ds: DataSource, company: Company) {
  const repo = ds.getRepository(ActionCode);

  const rows = [
    {
      code: 'REGULAR',
      name: 'Regular Work',
      type: ActionCodeType.BILLABLE,
      active: true,
    },
    {
      code: 'VACATION',
      name: 'Vacation',
      type: ActionCodeType.NON_BILLABLE,
      active: true,
    },
    {
      code: 'SICK',
      name: 'Sick Leave',
      type: ActionCodeType.NON_BILLABLE,
      active: true,
    },
    {
      code: 'HOLIDAY',
      name: 'Holiday',
      type: ActionCodeType.NON_BILLABLE,
      active: true,
    },
  ];

  await repo.upsert(
    rows.map((r) => ({ companyId: company.id, ...r })),
    { conflictPaths: ['companyId', 'code'] },
  );

  const map = new Map<string, ActionCode>();
  for (const r of rows) {
    map.set(r.code, await repo.findOneByOrFail({ companyId: company.id, code: r.code }));
  }

  console.log('✅ Seeded ActionCodes:', rows.map((r) => r.code).join(', '));
  return { actionCodes: map };
}

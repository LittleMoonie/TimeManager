import { DataSource } from 'typeorm';

import { Company } from '../Entities/Companies/Company';
import {
  ActionCode,
  ActionCodeBillableDefault,
  ActionCodeLocationPolicy,
  ActionCodeType,
} from '../Entities/Timesheets/ActionCode';

export async function seedActionCodes(ds: DataSource, company: Company) {
  const repo = ds.getRepository(ActionCode);

  const rows = [
    {
      code: 'DEV',
      name: 'Product Development',
      type: ActionCodeType.BILLABLE,
      color: '#4F46E5',
      billableDefault: ActionCodeBillableDefault.BILLABLE,
      billableEditable: true,
      locationPolicy: ActionCodeLocationPolicy.ANY,
      active: true,
    },
    {
      code: 'MEETING',
      name: 'Client Meetings',
      type: ActionCodeType.BILLABLE,
      color: '#0EA5E9',
      billableDefault: ActionCodeBillableDefault.AUTO,
      billableEditable: true,
      locationPolicy: ActionCodeLocationPolicy.ANY,
      active: true,
    },
    {
      code: 'EMAIL',
      name: 'Inbox & Admin',
      type: ActionCodeType.NON_BILLABLE,
      color: '#475569',
      billableDefault: ActionCodeBillableDefault.NON_BILLABLE,
      billableEditable: false,
      locationPolicy: ActionCodeLocationPolicy.ANY,
      active: true,
    },
    {
      code: 'HOLIDAY',
      name: 'Holiday',
      type: ActionCodeType.NON_BILLABLE,
      color: '#F97316',
      billableDefault: ActionCodeBillableDefault.NON_BILLABLE,
      billableEditable: false,
      locationPolicy: ActionCodeLocationPolicy.ANY,
      active: true,
    },
    {
      code: 'SICK',
      name: 'Sick Leave',
      type: ActionCodeType.NON_BILLABLE,
      color: '#F43F5E',
      billableDefault: ActionCodeBillableDefault.NON_BILLABLE,
      billableEditable: false,
      locationPolicy: ActionCodeLocationPolicy.ANY,
      active: true,
    },
    {
      code: 'TRAINING',
      name: 'Training & Learning',
      type: ActionCodeType.NON_BILLABLE,
      color: '#22C55E',
      billableDefault: ActionCodeBillableDefault.AUTO,
      billableEditable: true,
      locationPolicy: ActionCodeLocationPolicy.ANY,
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

  console.warn('✅ Seeded ActionCodes:', rows.map((r) => r.code).join(', '));
  return { actionCodes: map };
}

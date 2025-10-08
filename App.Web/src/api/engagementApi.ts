import { dataSource } from './dataSource';
import { delay } from './utils';
import type { ActivityItem, Announcement } from '@/types';

export async function listAnnouncements(): Promise<Announcement[]> {
  await delay();
  return dataSource.listAnnouncements();
}

export async function listActivityFeed(): Promise<ActivityItem[]> {
  await delay();
  return dataSource.listActivity();
}

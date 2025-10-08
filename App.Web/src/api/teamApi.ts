import dayjs from 'dayjs';

import { dataSource } from './dataSource';
import { delay, matchSearch, normalizeSearch } from './utils';
import type { Team, User } from '@/types';

interface ListTeamsParams {
  search?: string;
}

export async function listTeams(params: ListTeamsParams = {}): Promise<Team[]> {
  await delay();
  const search = normalizeSearch(params.search);
  return dataSource
    .listTeams()
    .filter((team) => (search ? matchSearch(`${team.name} ${team.description ?? ''}`, search) : true))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function addUserToTeam(teamId: string, userId: string): Promise<Team | undefined> {
  await delay();
  const teams = dataSource.listTeams();
  const team = teams.find((t) => t.id === teamId);
  if (!team) return undefined;
  if (!team.memberIds.includes(userId)) {
    team.memberIds.push(userId);
  }
  return dataSource.updateTeam(teamId, {
    memberIds: team.memberIds,
    updatedAt: dayjs().toISOString(),
  });
}

export async function removeUserFromTeam(teamId: string, userId: string): Promise<Team | undefined> {
  await delay();
  const teams = dataSource.listTeams();
  const team = teams.find((t) => t.id === teamId);
  if (!team) return undefined;
  return dataSource.updateTeam(teamId, {
    memberIds: team.memberIds.filter((member) => member !== userId),
    updatedAt: dayjs().toISOString(),
  });
}

export async function listTeamMembers(teamId: string): Promise<User[]> {
  await delay();
  const team = dataSource.listTeams().find((t) => t.id === teamId);
  if (!team) return [];
  return dataSource
    .listUsers()
    .filter((user) => team.memberIds.includes(user.id))
    .sort((a, b) => a.firstName.localeCompare(b.firstName));
}

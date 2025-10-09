import type { Project, Task, Team, User } from '@/types';

export const mockUsers: User[] = [
  {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'admin@gogotime.com',
    role: 'CEO',
    status: 'ACTIVE',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    companyName: 'GoGoTime',
  },
  {
    id: '2',
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'manager@gogotime.com',
    role: 'MANAGER',
    teamId: '1',
    status: 'ACTIVE',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    companyName: 'GoGoTime',
  },
];

export const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Setup project infrastructure',
    description: 'Initialize the project with proper tooling and configuration',
    status: 'DONE',
    priority: 'HIGH',
    assigneeId: '1',
    projectId: '1',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    title: 'Implement user authentication',
    description: 'Create login/logout functionality with JWT tokens',
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    assigneeId: '1',
    projectId: '1',
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z',
  },
  {
    id: '3',
    title: 'Design dashboard layout',
    description: 'Create responsive dashboard with key metrics',
    status: 'TODO',
    priority: 'MEDIUM',
    assigneeId: '2',
    projectId: '1',
    createdAt: '2024-01-03T00:00:00Z',
    updatedAt: '2024-01-03T00:00:00Z',
  },
];

export const mockProjects: Project[] = [
  {
    id: '1',
    name: 'GoGoTime Platform',
    description: 'Time tracking and project management platform',
    ownerId: '1',
    teamId: '1',
    status: 'ACTIVE',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];

export const mockTeams: Team[] = [
  {
    id: '1',
    name: 'Development Team',
    managerId: '2',
    memberIds: ['1', '2'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];

export const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

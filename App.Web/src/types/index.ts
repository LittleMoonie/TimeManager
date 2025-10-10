// User and Authentication Types
export type Role = 'CEO' | 'MANAGER' | 'USER'

export interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  role: Role
  teamId?: string
  status: 'ACTIVE' | 'INACTIVE'
  createdAt: string
  updatedAt: string
  companyName: string
  roleTitle?: string
  avatarUrl?: string
  aboutMe?: string
  companyLocation?: string
  companyPhone?: string
  teams?: string[]
}

export interface Team {
  id: string
  name: string
  managerId: string
  memberIds: string[]
  createdAt: string
  updatedAt: string
}

export interface Organization {
  id: string
  name: string
  settings: {
    workingHours: {
      start: string
      end: string
    }
    timezone: string
  }
}

// Task Management Types
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE' | 'CANCELLED'
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'

export interface Task {
  id: string
  title: string
  description?: string
  status: TaskStatus
  priority: TaskPriority
  assigneeId?: string
  projectId?: string
  dueDate?: string
  createdAt: string
  updatedAt: string
}

export interface Project {
  id: string
  name: string
  description?: string
  ownerId: string
  teamId: string
  status: 'ACTIVE' | 'COMPLETED' | 'ON_HOLD'
  createdAt: string
  updatedAt: string
}

// Time Tracking Types
export interface ClockEvent {
  id: string
  userId: string
  type: 'CLOCK_IN' | 'CLOCK_OUT'
  timestamp: string
  note?: string
}

export interface TimesheetEntry {
  id: string;
  day: string;
  workMode: 'office' | 'remote' | 'hybrid';
  country: string;
  startedAt?: string;
  endedAt?: string;
  durationMin: number;
  note?: string;
}

export interface TimesheetEntryDto {
  actionCodeId: string;
  workMode: 'office' | 'remote' | 'hybrid';
  country: string;
  startedAt?: Date;
  endedAt?: Date;
  durationMin: number;
  note?: string;
  day: Date;
}

export interface ActionCode {
  id: string;
  name: string;
  code: string;
  type: 'billable' | 'non-billable';
}

// API Response Types
export interface ApiResponse<T> {
  data: T
  message?: string
  success: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
}

// Form Types
export interface LoginForm {
  email: string
  password: string
}

export interface TaskForm {
  title: string
  description?: string
  status: TaskStatus
  priority: TaskPriority
  assigneeId?: string
  projectId?: string
  dueDate?: string
}

// UI Types
export interface MenuItem {
  id: string
  title: string
  path: string
  icon?: React.ComponentType
  children?: MenuItem[]
}

export interface Theme {
  id: string
  mode: 'light' | 'dark'
  density: 'comfortable' | 'compact'
}

// Security Types
export interface RecognizedDevice {
  id: string
  name: string
  location: string
  lastActive: string
  deviceType: 'desktop' | 'mobile' | 'tablet'
}

export interface ActiveSession {
  id: string
  name: string
  location: string
  current: boolean
  deviceType: 'desktop' | 'mobile' | 'tablet'
}

export interface UserSecuritySettings {
  loginNotificationsEnabled: boolean
  loginApprovalsRequired: boolean
  recognizedDevices: RecognizedDevice[]
  activeSessions: ActiveSession[]
}

export type { Person, PersonStatus } from './people'
export * from './timesheet'

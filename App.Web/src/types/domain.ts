export type Role = 'CEO' | 'MANAGER' | 'USER'

export interface Organization {
  id: string
  name: string
  slug: string
  ownerId: string
  settings: {
    workdayHours: number
    latenessGraceMins: number
    timezone: string
    holidays: string[]
  }
  createdAt: string
  updatedAt: string
}

export interface Team {
  id: string
  organizationId: string
  name: string
  description?: string
  managerId: string
  memberIds: string[]
  createdAt: string
  updatedAt: string
}

export interface User {
  id: string
  orgId: string
  teamId?: string
  firstName: string
  lastName: string
  email: string
  role: Role
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING'
  createdAt: string
  updatedAt: string
  deletedAt?: string | null
}

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE' | 'CANCELLED'
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'

export interface Task {
  id: string
  projectId?: string
  orgId: string
  title: string
  description?: string
  status: TaskStatus
  priority: TaskPriority
  assigneeId?: string
  dueDate?: string
  createdAt: string
  updatedAt: string
  deletedAt?: string | null
}

export type ProjectStatus = 'ACTIVE' | 'INACTIVE' | 'ARCHIVED'

export interface Project {
  id: string
  orgId: string
  name: string
  description?: string
  status: ProjectStatus
  settings?: Record<string, unknown>
  createdAt: string
  updatedAt: string
  deletedAt?: string | null
}

export type ClockType = 'IN' | 'OUT' | 'BREAK_START' | 'BREAK_END'

export interface ClockEvent {
  id: string
  userId: string
  orgId: string
  type: ClockType
  timestamp: string
  note?: string
  geo?: { lat: number; lng: number; radiusM?: number }
}

export interface AuditLog {
  id: string
  userId?: string
  action: string
  targetTable: string
  targetId?: string
  oldValue?: unknown
  newValue?: unknown
  ip?: string
  userAgent?: string
  createdAt: string
}

export interface AccessLog {
  id: string
  userId?: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  endpoint: string
  statusCode: number
  latencyMs?: number
  timestamp: string
}

export interface TimesheetDay {
  date: string
  plannedHours: number
  workedHours: number
  late: boolean
  absent: boolean
}

export interface TimesheetWeek {
  weekOf: string
  days: TimesheetDay[]
  approved?: boolean
  approverId?: string
  approverNote?: string
}

export interface TimesheetResponse extends TimesheetWeek {
  totalWorkedHours: number
  totalPlannedHours: number
}

export interface KPIOverview {
  onTimeRate: number
  avgHoursPerDay: number
  lateCount: number
  absences: number
  overtimeHours: number
}

export interface PermissionMatrix {
  org: {
    viewAll: boolean
    manage: boolean
  }
  team: {
    manage: boolean
    viewAll: boolean
  }
  time: {
    approve: boolean
    badge: boolean
  }
  user: {
    read: boolean
    manage: boolean
  }
  task: {
    manage: boolean
  }
  admin: {
    manage: boolean
  }
}

export type PermissionKey =
  | 'org.view_all'
  | 'org.manage'
  | 'team.manage'
  | 'team.view_all'
  | 'time.approve'
  | 'time.badge'
  | 'user.read'
  | 'user.manage'
  | 'task.manage'
  | 'admin.manage'

export interface Announcement {
  id: string
  title: string
  body: string
  severity?: 'info' | 'warning' | 'error' | 'success'
  createdAt: string
}

export interface ActivityItem {
  id: string
  type: 'badge' | 'task' | 'approval'
  message: string
  timestamp: string
}

export interface ApiKey {
  id: string
  name: string
  createdAt: string
  lastUsedAt?: string
  scopes: string[]
  active: boolean
}

export interface Webhook {
  id: string
  name: string
  url: string
  enabled: boolean
  createdAt: string
}

// Database types and interfaces for JavaScript
// Note: In JavaScript, we use JSDoc comments for type information

/**
 * @typedef {Object} ApiResponse
 * @property {any} data
 * @property {string} [message]
 * @property {Object} [meta]
 * @property {number} [meta.total]
 * @property {number} [meta.page]
 * @property {number} [meta.limit]
 */

/**
 * @typedef {Object} ApiError
 * @property {string} error
 * @property {string} message
 * @property {any} [details]
 * @property {string} timestamp
 * @property {string} [requestId]
 */

/**
 * @typedef {Object} PaginationParams
 * @property {number} [page]
 * @property {number} [limit]
 * @property {string} [sortBy]
 * @property {'asc'|'desc'} [sortOrder]
 */

/**
 * @typedef {Object} PaginationMeta
 * @property {number} page
 * @property {number} limit
 * @property {number} total
 * @property {number} totalPages
 * @property {boolean} hasNext
 * @property {boolean} hasPrev
 */

/**
 * @typedef {Object} UserFilters
 * @property {string} [role]
 * @property {string} [status]
 * @property {string} [organizationId]
 * @property {string} [search]
 */

/**
 * @typedef {Object} ProjectFilters
 * @property {string} [status]
 * @property {string} [organizationId]
 * @property {string} [assigneeId]
 * @property {string} [search]
 */

/**
 * @typedef {Object} TaskFilters
 * @property {string} [status]
 * @property {string} [priority]
 * @property {string} [projectId]
 * @property {string} [assigneeId]
 * @property {Object} [dueDate]
 * @property {Date} [dueDate.from]
 * @property {Date} [dueDate.to]
 * @property {string} [search]
 */

module.exports = {
  // Enums
  UserRole: {
    ADMIN: 'ADMIN',
    MANAGER: 'MANAGER',
    EMPLOYEE: 'EMPLOYEE',
    SYSTEM: 'SYSTEM',
  },
  UserStatus: {
    ACTIVE: 'ACTIVE',
    INACTIVE: 'INACTIVE',
    SUSPENDED: 'SUSPENDED',
    PENDING: 'PENDING',
  },
  OrgRole: {
    OWNER: 'OWNER',
    ADMIN: 'ADMIN',
    MANAGER: 'MANAGER',
    MEMBER: 'MEMBER',
  },
  ProjectStatus: {
    ACTIVE: 'ACTIVE',
    INACTIVE: 'INACTIVE',
    ARCHIVED: 'ARCHIVED',
  },
  TaskStatus: {
    TODO: 'TODO',
    IN_PROGRESS: 'IN_PROGRESS',
    REVIEW: 'REVIEW',
    DONE: 'DONE',
    CANCELLED: 'CANCELLED',
  },
  TaskPriority: {
    LOW: 'LOW',
    MEDIUM: 'MEDIUM',
    HIGH: 'HIGH',
    URGENT: 'URGENT',
  },
  LogLevel: {
    DEBUG: 'DEBUG',
    INFO: 'INFO',
    WARN: 'WARN',
    ERROR: 'ERROR',
    FATAL: 'FATAL',
  },
  JobStatus: {
    PENDING: 'PENDING',
    PROCESSING: 'PROCESSING',
    COMPLETED: 'COMPLETED',
    FAILED: 'FAILED',
    CANCELLED: 'CANCELLED',
  },
  NotificationType: {
    INVITE: 'INVITE',
    SYSTEM_ALERT: 'SYSTEM_ALERT',
    TASK_ASSIGNED: 'TASK_ASSIGNED',
    TASK_COMPLETED: 'TASK_COMPLETED',
    PROJECT_UPDATE: 'PROJECT_UPDATE',
    ORGANIZATION_UPDATE: 'ORGANIZATION_UPDATE',
  },
};

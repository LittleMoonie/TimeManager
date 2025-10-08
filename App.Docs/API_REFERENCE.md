# GoGoTime API Reference

> [!SUMMARY] **Complete API Documentation**
> Comprehensive REST API documentation for GoGoTime including all endpoints, request/response schemas, authentication, error handling, and usage examples.

## 📋 Table of Contents

- [[#🌐 API Overview|API Overview]]
- [[#🔐 Authentication|Authentication]]
- [[#👤 User Management|User Management]]
- [[#⏱️ Time Tracking|Time Tracking]]
- [[#📁 Project Management|Project Management]]
- [[#📊 Analytics & Reporting|Analytics & Reporting]]

---

## 🌐 API Overview

### 🎯 Base Information

**Base URL:** `https://api.gogotime.com/api/v1`  
**Development URL:** `http://localhost:4000/api/v1`

**API Version:** v1  
**Content Type:** `application/json`  
**Authentication:** JWT Bearer Token

### 📊 HTTP Status Codes

| Code | Meaning | Description |
|------|---------|-------------|
| `200` | OK | Request successful |
| `201` | Created | Resource created successfully |
| `400` | Bad Request | Invalid request parameters |
| `401` | Unauthorized | Authentication required |
| `403` | Forbidden | Insufficient permissions |
| `404` | Not Found | Resource not found |
| `422` | Unprocessable Entity | Validation errors |
| `429` | Too Many Requests | Rate limit exceeded |
| `500` | Internal Server Error | Server error |

### 🎨 Response Format

**Success Response:**
```json
{
  "success": true,
  "data": {
    // Response data
  },
  "message": "Operation completed successfully",
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "pages": 5
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Error description",
  "errorCode": "VALIDATION_ERROR",
  "errors": [
    {
      "field": "email",
      "message": "Valid email address required"
    }
  ],
  "timestamp": "2024-01-15T10:30:00Z",
  "path": "/api/v1/users"
}
```

---

## 🔐 Authentication

### 🚪 Login

**POST** `/auth/login`

Authenticate user and receive JWT tokens.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "username": "johndoe",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "roles": ["employee"]
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "def50200a7b...",
      "expiresIn": "2024-01-16T10:30:00Z"
    }
  },
  "message": "Login successful"
}
```

**Error Response (401):**
```json
{
  "success": false,
  "message": "Invalid credentials",
  "errorCode": "INVALID_CREDENTIALS"
}
```

### 🔄 Refresh Token

**POST** `/auth/refresh`

Refresh expired access token using refresh token.

**Request Body:**
```json
{
  "refreshToken": "def50200a7b..."
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": "2024-01-16T10:30:00Z"
  }
}
```

### 🚪 Logout

**POST** `/auth/logout`

Invalidate current session and tokens.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### ✅ Verify Session

**POST** `/auth/verify`

Verify if current token is valid.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "username": "johndoe",
      "email": "user@example.com"
    },
    "permissions": ["users:read", "projects:create"]
  }
}
```

---

## 👤 User Management

### 📋 Get All Users

**GET** `/users`

Retrieve paginated list of users with filtering options.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**
```
page=1                    # Page number (default: 1)
limit=20                  # Items per page (default: 20, max: 100)
search=john               # Search by username or email
status=active             # Filter by status (active, inactive, suspended)
role=manager              # Filter by role
sortBy=createdAt          # Sort field (username, email, createdAt)
sortOrder=DESC            # Sort order (ASC, DESC)
```

**Example Request:**
```bash
curl -X GET "https://api.gogotime.com/api/v1/users?page=1&limit=10&search=john" \
  -H "Authorization: Bearer <access_token>"
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "username": "johndoe",
        "email": "john@example.com",
        "firstName": "John",
        "lastName": "Doe",
        "status": "active",
        "roles": ["employee"],
        "createdAt": "2024-01-01T00:00:00Z",
        "updatedAt": "2024-01-15T10:30:00Z",
        "lastLoginAt": "2024-01-15T09:15:00Z"
      }
    ]
  },
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "pages": 5
  }
}
```

### 👤 Get User by ID

**GET** `/users/{id}`

Retrieve specific user by ID.

**Path Parameters:**
- `id` (string, required): User UUID

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "username": "johndoe",
      "email": "john@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "status": "active",
      "roles": ["employee"],
      "organizations": [
        {
          "id": "org-123",
          "name": "Acme Corp",
          "role": "employee"
        }
      ],
      "preferences": {
        "theme": "dark",
        "timezone": "UTC"
      },
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  }
}
```

### ➕ Create User

**POST** `/users`

Create a new user (Admin/Manager only).

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "username": "newuser",
  "email": "newuser@example.com",
  "firstName": "New",
  "lastName": "User",
  "role": "employee",
  "organizationId": "org-123",
  "temporaryPassword": true
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "new-user-id",
      "username": "newuser",
      "email": "newuser@example.com",
      "firstName": "New",
      "lastName": "User",
      "status": "active",
      "roles": ["employee"]
    },
    "temporaryPassword": "QuickTiger42!",
    "loginUrl": "https://app.gogotime.com/login"
  },
  "message": "User created successfully. Welcome email sent."
}
```

### ✏️ Update User

**PUT** `/users/{id}`

Update user information.

**Path Parameters:**
- `id` (string, required): User UUID

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "firstName": "Updated",
  "lastName": "Name",
  "preferences": {
    "theme": "light",
    "timezone": "America/New_York"
  }
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "username": "johndoe",
      "email": "john@example.com",
      "firstName": "Updated",
      "lastName": "Name",
      "updatedAt": "2024-01-15T10:35:00Z"
    }
  },
  "message": "User updated successfully"
}
```

### 🗑️ Delete User

**DELETE** `/users/{id}`

Soft delete a user (Admin only).

**Path Parameters:**
- `id` (string, required): User UUID

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

---

## ⏱️ Time Tracking

### ▶️ Start Timer

**POST** `/time-tracking/start`

Start a new time tracking session.

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "projectId": "project-123",
  "taskId": "task-456",
  "description": "Working on user authentication"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "session": {
      "id": "session-789",
      "userId": "user-123",
      "projectId": "project-123",
      "taskId": "task-456",
      "description": "Working on user authentication",
      "startTime": "2024-01-15T10:30:00Z",
      "isActive": true
    }
  },
  "message": "Timer started successfully"
}
```

### ⏸️ Pause Timer

**POST** `/time-tracking/pause`

Pause the current active timer.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "session": {
      "id": "session-789",
      "isPaused": true,
      "pausedAt": "2024-01-15T11:00:00Z"
    }
  },
  "message": "Timer paused"
}
```

### ▶️ Resume Timer

**POST** `/time-tracking/resume`

Resume a paused timer.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "session": {
      "id": "session-789",
      "isPaused": false,
      "resumedAt": "2024-01-15T11:15:00Z"
    }
  },
  "message": "Timer resumed"
}
```

### ⏹️ Stop Timer

**POST** `/time-tracking/stop`

Stop the current timer and create time entry.

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body (Optional):**
```json
{
  "description": "Updated description for the time entry",
  "adjustments": {
    "endTime": "2024-01-15T12:00:00Z"
  }
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "timeEntry": {
      "id": "entry-123",
      "userId": "user-123",
      "projectId": "project-123",
      "taskId": "task-456",
      "startTime": "2024-01-15T10:30:00Z",
      "endTime": "2024-01-15T12:00:00Z",
      "duration": 5400,
      "formattedDuration": "1h 30m",
      "description": "Working on user authentication",
      "status": "draft"
    }
  },
  "message": "Timer stopped and time entry created"
}
```

### 📊 Get Active Session

**GET** `/time-tracking/active`

Get current active timer session.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "session": {
      "id": "session-789",
      "projectId": "project-123",
      "project": {
        "id": "project-123",
        "name": "GoGoTime Development",
        "color": "#3498db"
      },
      "taskId": "task-456",
      "task": {
        "id": "task-456",
        "name": "User Authentication"
      },
      "description": "Working on user authentication",
      "startTime": "2024-01-15T10:30:00Z",
      "currentDuration": 3600,
      "isPaused": false
    }
  }
}
```

### 📝 Get Time Entries

**GET** `/time-tracking/entries`

Retrieve user's time entries with filtering and pagination.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**
```
page=1                               # Page number
limit=20                             # Items per page
startDate=2024-01-01                 # Filter by start date (YYYY-MM-DD)
endDate=2024-01-31                   # Filter by end date (YYYY-MM-DD)
projectId=project-123                # Filter by project
taskId=task-456                      # Filter by task
status=draft                         # Filter by status (draft, submitted, approved)
sortBy=startTime                     # Sort field
sortOrder=DESC                       # Sort order
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "entries": [
      {
        "id": "entry-123",
        "startTime": "2024-01-15T10:30:00Z",
        "endTime": "2024-01-15T12:00:00Z",
        "duration": 5400,
        "formattedDuration": "1h 30m",
        "description": "Working on user authentication",
        "project": {
          "id": "project-123",
          "name": "GoGoTime Development",
          "color": "#3498db"
        },
        "task": {
          "id": "task-456", 
          "name": "User Authentication"
        },
        "status": "draft",
        "isBillable": true,
        "hourlyRate": 75.00,
        "totalCost": 112.50
      }
    ]
  },
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8
  }
}
```

### ➕ Create Manual Entry

**POST** `/time-tracking/entries`

Create a manual time entry.

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "startTime": "2024-01-15T09:00:00Z",
  "endTime": "2024-01-15T11:30:00Z",
  "projectId": "project-123",
  "taskId": "task-456",
  "description": "Morning development work",
  "isBillable": true,
  "category": "development",
  "tags": ["frontend", "react"]
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "timeEntry": {
      "id": "entry-456",
      "startTime": "2024-01-15T09:00:00Z",
      "endTime": "2024-01-15T11:30:00Z",
      "duration": 9000,
      "formattedDuration": "2h 30m",
      "description": "Morning development work",
      "projectId": "project-123",
      "taskId": "task-456",
      "isBillable": true,
      "category": "development",
      "tags": ["frontend", "react"],
      "status": "draft",
      "entryType": "manual"
    }
  },
  "message": "Time entry created successfully"
}
```

### ✏️ Update Time Entry

**PUT** `/time-tracking/entries/{id}`

Update an existing time entry.

**Path Parameters:**
- `id` (string, required): Time entry UUID

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "description": "Updated description",
  "startTime": "2024-01-15T09:15:00Z",
  "endTime": "2024-01-15T11:45:00Z",
  "isBillable": false
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "timeEntry": {
      "id": "entry-456",
      "description": "Updated description",
      "startTime": "2024-01-15T09:15:00Z",
      "endTime": "2024-01-15T11:45:00Z",
      "duration": 9000,
      "isBillable": false,
      "updatedAt": "2024-01-15T15:30:00Z"
    }
  },
  "message": "Time entry updated successfully"
}
```

---

## 📁 Project Management

### 📋 Get Projects

**GET** `/projects`

Retrieve user's accessible projects.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**
```
page=1                    # Page number
limit=20                  # Items per page
search=gogotime           # Search by project name
status=active             # Filter by status (active, completed, paused)
clientName=acme           # Filter by client name
sortBy=name               # Sort field
sortOrder=ASC             # Sort order
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "projects": [
      {
        "id": "project-123",
        "name": "GoGoTime Development",
        "description": "Main application development",
        "color": "#3498db",
        "category": "development",
        "clientName": "Internal",
        "status": "active",
        "isBillable": true,
        "defaultHourlyRate": 75.00,
        "startDate": "2024-01-01",
        "estimatedHours": 400,
        "trackedHours": 125.5,
        "progressPercentage": 31.4,
        "isOverBudget": false,
        "createdAt": "2024-01-01T00:00:00Z",
        "settings": {
          "requireTaskSelection": true,
          "allowManualTimeEntry": true
        }
      }
    ]
  },
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 5,
    "pages": 1
  }
}
```

### 📝 Get Project Details

**GET** `/projects/{id}`

Get detailed project information including tasks.

**Path Parameters:**
- `id` (string, required): Project UUID

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "project": {
      "id": "project-123",
      "name": "GoGoTime Development",
      "description": "Main application development",
      "color": "#3498db",
      "category": "development",
      "clientName": "Internal",
      "status": "active",
      "isBillable": true,
      "defaultHourlyRate": 75.00,
      "startDate": "2024-01-01",
      "endDate": "2024-06-30",
      "estimatedHours": 400,
      "trackedHours": 125.5,
      "tasks": [
        {
          "id": "task-456",
          "name": "User Authentication",
          "description": "Implement JWT-based authentication",
          "status": "in_progress",
          "priority": "high",
          "estimatedMinutes": 480,
          "trackedMinutes": 180,
          "assignedTo": "user-123",
          "dueDate": "2024-01-20"
        }
      ],
      "recentActivity": [
        {
          "type": "time_entry",
          "user": "John Doe",
          "description": "2h 30m logged on User Authentication",
          "timestamp": "2024-01-15T12:00:00Z"
        }
      ]
    }
  }
}
```

### ➕ Create Project

**POST** `/projects`

Create a new project (Manager/CEO only).

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "New Project",
  "description": "Project description",
  "color": "#e74c3c",
  "category": "development",
  "clientName": "Acme Corp",
  "isBillable": true,
  "defaultHourlyRate": 80.00,
  "startDate": "2024-02-01",
  "endDate": "2024-05-01",
  "estimatedHours": 200,
  "settings": {
    "requireTaskSelection": true,
    "allowManualTimeEntry": true,
    "autoStartNextTask": false
  }
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "project": {
      "id": "project-789",
      "name": "New Project",
      "description": "Project description",
      "color": "#e74c3c",
      "status": "active",
      "createdBy": "user-123",
      "createdAt": "2024-01-15T15:30:00Z"
    }
  },
  "message": "Project created successfully"
}
```

### 📋 Get Project Tasks

**GET** `/projects/{id}/tasks`

Get tasks for a specific project.

**Path Parameters:**
- `id` (string, required): Project UUID

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**
```
status=todo                # Filter by status (todo, in_progress, completed)
assignedTo=user-123        # Filter by assigned user
priority=high              # Filter by priority (low, medium, high, urgent)
sortBy=priority            # Sort field
sortOrder=DESC             # Sort order
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "tasks": [
      {
        "id": "task-456",
        "name": "User Authentication",
        "description": "Implement JWT-based authentication",
        "projectId": "project-123",
        "status": "in_progress",
        "priority": "high",
        "estimatedMinutes": 480,
        "trackedMinutes": 180,
        "completionPercentage": 37.5,
        "assignedTo": "user-123",
        "assignee": {
          "id": "user-123",
          "username": "johndoe",
          "firstName": "John",
          "lastName": "Doe"
        },
        "dueDate": "2024-01-20",
        "createdAt": "2024-01-10T00:00:00Z"
      }
    ]
  }
}
```

---

## 📊 Analytics & Reporting

### 📈 Get Time Statistics

**GET** `/analytics/time-stats`

Get time tracking statistics for the user.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**
```
startDate=2024-01-01         # Start date (YYYY-MM-DD)
endDate=2024-01-31           # End date (YYYY-MM-DD)
projectId=project-123        # Filter by project
groupBy=day                  # Group by (day, week, month, project, task)
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalHours": 125.5,
      "billableHours": 98.2,
      "billablePercentage": 78.3,
      "projectCount": 3,
      "entryCount": 45,
      "averageHoursPerDay": 4.2,
      "productivityScore": 85
    },
    "breakdown": {
      "byDay": [
        {
          "date": "2024-01-15",
          "duration": 14400,
          "hours": 4.0,
          "entryCount": 3,
          "billableDuration": 10800
        }
      ],
      "byProject": [
        {
          "projectId": "project-123",
          "projectName": "GoGoTime Development",
          "duration": 28800,
          "hours": 8.0,
          "percentage": 40.0,
          "billableAmount": 600.00
        }
      ],
      "byCategory": [
        {
          "category": "development",
          "duration": 36000,
          "hours": 10.0,
          "percentage": 55.6
        }
      ]
    },
    "trends": {
      "dailyAverage": 4.2,
      "weeklyTrend": "increasing",
      "peakHours": [
        {
          "hour": 10,
          "duration": 7200
        }
      ]
    }
  }
}
```

### 📊 Get Productivity Metrics

**GET** `/analytics/productivity`

Get detailed productivity analysis.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**
```
timeframe=month              # Timeframe (week, month, quarter, year)
compareWith=previous         # Compare with (previous, year_ago)
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "current": {
      "totalTime": 86400,
      "billableTime": 64800,
      "focusTime": 43200,
      "averageSessionLength": 3600,
      "productivityScore": 85,
      "peakProductivityHour": 10
    },
    "comparison": {
      "totalTime": {
        "value": 72000,
        "change": 20.0,
        "trend": "up"
      },
      "productivityScore": {
        "value": 78,
        "change": 8.97,
        "trend": "up"
      }
    },
    "insights": [
      "🎉 Excellent productivity! You're maintaining consistent focus and work patterns.",
      "🕐 Most productive hour: 10 AM. Schedule important work during peak hours.",
      "⚡ 65% of time spent on GoGoTime Development. Consider balancing project allocation."
    ],
    "recommendations": [
      "Try scheduling your most challenging tasks around 10 AM when you're most productive",
      "Consider taking short breaks between long sessions to maintain focus"
    ]
  }
}
```

### 📋 Generate Report

**POST** `/analytics/reports`

Generate a custom time tracking report.

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "reportType": "detailed",
  "startDate": "2024-01-01",
  "endDate": "2024-01-31",
  "groupBy": "project",
  "filters": {
    "projectIds": ["project-123", "project-456"],
    "includeNonBillable": false
  },
  "format": "json"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "report": {
      "id": "report-789",
      "type": "detailed",
      "period": {
        "startDate": "2024-01-01",
        "endDate": "2024-01-31",
        "totalDays": 31
      },
      "summary": {
        "totalHours": 125.5,
        "billableHours": 98.2,
        "billableAmount": 7365.00,
        "projectCount": 2,
        "entryCount": 45
      },
      "breakdown": {
        "byProject": [
          {
            "projectId": "project-123",
            "projectName": "GoGoTime Development",
            "duration": 72000,
            "hours": 20.0,
            "billableAmount": 1500.00,
            "percentage": 40.0
          }
        ]
      },
      "entries": [
        {
          "id": "entry-123",
          "date": "2024-01-15",
          "project": "GoGoTime Development",
          "task": "User Authentication",
          "duration": 9000,
          "formattedDuration": "2h 30m",
          "description": "Working on JWT implementation",
          "isBillable": true,
          "cost": 187.50
        }
      ]
    }
  },
  "message": "Report generated successfully"
}
```

### 👥 Get Team Analytics

**GET** `/analytics/team`

Get team productivity overview (Manager/CEO only).

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**
```
startDate=2024-01-01         # Start date
endDate=2024-01-31           # End date
userIds=user-123,user-456    # Filter specific users
organizationId=org-123       # Organization scope
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "teamSummary": {
      "totalMembers": 5,
      "activeMembers": 4,
      "totalHours": 600.0,
      "averageHoursPerMember": 120.0,
      "teamProductivityScore": 82
    },
    "memberStats": [
      {
        "userId": "user-123",
        "username": "johndoe",
        "totalTime": 86400,
        "hours": 24.0,
        "billableTime": 64800,
        "billableHours": 18.0,
        "projectCount": 3,
        "entryCount": 12,
        "productivityScore": 85,
        "trend": "up"
      }
    ],
    "projectBreakdown": [
      {
        "projectId": "project-123",
        "projectName": "GoGoTime Development",
        "totalHours": 150.0,
        "memberCount": 3,
        "progress": 35.5
      }
    ]
  }
}
```

---

## 🔧 Rate Limiting

The API implements rate limiting to ensure fair usage:

**Rate Limits:**
- **Authentication endpoints**: 5 requests per 15 minutes per IP
- **General API**: 1000 requests per hour per user
- **Analytics endpoints**: 100 requests per hour per user

**Rate Limit Headers:**
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1642248000
```

**Rate Limit Exceeded (429):**
```json
{
  "success": false,
  "message": "Too many requests. Please try again later.",
  "errorCode": "RATE_LIMIT_EXCEEDED",
  "retryAfter": 3600
}
```

---

## 🏷️ Tags

#api #rest #documentation #authentication #jwt #endpoints #swagger #openapi

**Related Documentation:**
- [[AUTHENTICATION_FLOW]] - Authentication system details
- [[TIME_TRACKING]] - Time tracking features
- [[USER_MANAGEMENT]] - User management system
- [[DATABASE_DESIGN]] - Data models and relationships

---

> [!NOTE] **Document Maintenance**
> **Last Updated:** {date}  
> **Version:** 1.0.0  
> **Maintainers:** API Team (Lazaro, Alexy, Massi, Lounis)

> [!TIP] **API Best Practices**
> - Always include the `Authorization` header for protected endpoints
> - Use appropriate HTTP methods (GET, POST, PUT, DELETE)
> - Handle error responses gracefully in your client applications
> - Implement proper pagination for large data sets
> - Cache responses when appropriate to improve performance
> - Use the provided SDKs and client libraries when available

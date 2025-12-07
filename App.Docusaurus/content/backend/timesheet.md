---
sidebar_position: 3
---

# Timesheet

The timesheet module is a core feature of GoGoTime, allowing users to log their work hours and track their activities. The new Timesheet Hub provides a modern, intuitive interface for managing timesheets on a weekly basis.

## Filling a Weekly Timesheet

Open **Top Menu → Timesheet** to log your hours and update task progress. The weekly grid is fast, keyboard-friendly, and supports per-day comments.

### Screen guide

A — **Acting for another user**
If you have the `timesheet.create.forUser` permission, use the **User** selector to fill time on someone else’s behalf.

B — **Week navigation**
Move to the previous or next week, or jump to a date. (Navigation is limited so you can’t go past the current week.)

C — **What you can see & select**
The Projects and Work Items shown are controlled by your organization’s settings.
Prefill options: If Auto or Same codes as last submitted is enabled, your grid opens with those Time Codes pre-added.

D — **Add rows**
Click **Add row** to insert a new project/non-project activity line.

E — **Per-day comments**
Each day supports a short comment. Use it to describe what you did.

F — **Enter time**
Click a cell to enter hours. Choose between duration, decimal hours, or start/end tabs in the popup (your preference is remembered). Use the comment icon to add or edit the per-day note.

### Save vs. Submit

Save keeps your changes as a draft.

Submit saves and sends your timesheet for approval.

(If your workspace uses auto-prefill, auto-save, or auto-submit policies, those will apply as configured by your company.)

### Tips & troubleshooting

- **Don’t see a time code?**
  - Check **Filter Codes** in the toolbar.
  - Confirm the task hasn’t disabled time logging.
  - Ensure you have the required privilege. If not, contact an admin.

## API Endpoints

The timesheet functionality is exposed through a set of RESTful API endpoints.

### Weekly Timesheet

These endpoints are used by the new weekly timesheet interface.

- `GET /timesheet/weeks/{weekStart}/timesheet`
  - Retrieves the timesheet for a specific week.
  - `weekStart`: The start date of the week in `YYYY-MM-DD` format.

- `PUT /timesheet/weeks/{weekStart}/timesheet`
  - Creates or updates the timesheet for a specific week.
  - `weekStart`: The start date of the week in `YYYY-MM-DD` format.

- `POST /timesheet/weeks/{weekStart}/submit`
  - Submits the timesheet for a specific week.
  - `weekStart`: The start date of the week in `YYYY-MM-DD` format.

### Timesheet Entries (Legacy)

These endpoints are likely part of a previous implementation and may be deprecated.

- `POST /timesheet-entries`: Creates a new timesheet entry.
- `GET /timesheet-entries/{id}`: Retrieves a single timesheet entry by its ID.
- `PUT /timesheet-entries/{id}`: Updates an existing timesheet entry.
- `DELETE /timesheet-entries/{id}`: Deletes a timesheet entry by its ID.
- `PUT /timesheet-entries/{id}/submit`: Submits a timesheet entry for approval.
- `PUT /timesheet-entries/{id}/approve`: Approves a pending timesheet entry.
- `PUT /timesheet-entries/{id}/reject`: Rejects a pending timesheet entry.
- `PUT /timesheet-entries/{id}/invoice`: Marks an approved timesheet entry as invoiced.

### Timesheets (Legacy)

These endpoints are also likely part of a previous implementation.

- `POST /timesheets`: Creates a new timesheet.
- `GET /timesheets`: Retrieves all timesheets for the authenticated user.
- `GET /timesheets/{id}`: Retrieves a single timesheet by its ID.
- `PUT /timesheets/{id}`: Updates an existing timesheet.
- `POST /timesheets/{id}/entries`: Adds a new entry to an existing timesheet.
- `PUT /timesheets/{id}/submit`: Submits a timesheet for approval.
- `PUT /timesheets/{id}/approve`: Approves a submitted timesheet.
- `PUT /timesheets/{id}/reject`: Rejects a submitted timesheet.
